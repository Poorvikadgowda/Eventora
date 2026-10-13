"""
SQLAlchemy Engine & Session Management for GenericSwap SQLite Database.
Enforces foreign key pragmas, session lifecycles, and auto-seeding.
"""

import os
import sqlite3
from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session

from backend.models.sql_models import Base

DB_PATH = Path(__file__).resolve().parent.parent / "genericswap.db"
SQLITE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# Create engine with thread-safe settings for SQLite
engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False} if SQLITE_URL.startswith("sqlite") else {},
    echo=False
)

# Enforce foreign key constraints in SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ensure all relational tables exist
Base.metadata.create_all(bind=engine)

# Auto-apply schema migrations on startup
try:
    with engine.connect() as _conn:
        _res = _conn.exec_driver_sql("PRAGMA table_info(prescriptions)")
        _cols = [row[1] for row in _res.fetchall()]
        if _cols and "preprocessed_image_path" not in _cols:
            _conn.exec_driver_sql("ALTER TABLE prescriptions ADD COLUMN preprocessed_image_path VARCHAR(256) DEFAULT ''")
            _conn.commit()

        _res2 = _conn.exec_driver_sql("PRAGMA table_info(extracted_medicines)")
        _cols2 = [row[1] for row in _res2.fetchall()]
        if _cols2 and "duration" not in _cols2:
            _conn.exec_driver_sql("ALTER TABLE extracted_medicines ADD COLUMN duration VARCHAR(64) DEFAULT ''")
            _conn.commit()
except Exception:
    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a thread-safe database session.
    Automatically commits or rolls back and closes session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_sqlalchemy_db():
    """
    Initialize all relational tables, run column migrations, and execute verified demo seeding.
    """
    Base.metadata.create_all(bind=engine)

    # Safe migration for existing SQLite DBs: ensure preprocessed_image_path exists on prescriptions
    try:
        with engine.connect() as conn:
            result = conn.exec_driver_sql("PRAGMA table_info(prescriptions)")
            col_names = [row[1] for row in result.fetchall()]
            if "preprocessed_image_path" not in col_names:
                conn.exec_driver_sql("ALTER TABLE prescriptions ADD COLUMN preprocessed_image_path VARCHAR(256) DEFAULT ''")
                conn.commit()
    except Exception:
        pass

    # Run seed data
    from backend.seed_data import seed_verified_demo_data
    db = SessionLocal()
    try:
        seed_verified_demo_data(db)
    finally:
        db.close()
