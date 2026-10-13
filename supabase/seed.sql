-- ========================================================
-- EVENTORA HIGH-FIDELITY SEED DATA
-- 10 Students, 2 Admins, 8 Venues, 8 Events,
-- 52 Registrations, 44 Attendance, 22 Certificates,
-- 32 Feedback Reviews, 22 Notifications
-- ========================================================

BEGIN;

-- 1. SEED AUTH USERS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Alexander Wright","role":"student","usn":"1MS22CS042","department":"Computer Science"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sarah.j@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Sarah Jenkins","role":"student","usn":"1MS22IS019","department":"Information Science"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marcus.b@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Marcus Brody","role":"student","usn":"1MS22EC088","department":"Electronics & Comm."}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya.s@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Priya Sharma","role":"student","usn":"1MS22CS112","department":"Computer Science"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'david.c@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"David Chen","role":"student","usn":"1MS22ME034","department":"Mechanical Eng."}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'elena.r@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Elena Rostova","role":"student","usn":"1MS22AI015","department":"Artificial Intelligence"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rohit.v@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Rohit Verma","role":"student","usn":"1MS22CS075","department":"Computer Science"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ananya.i@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Ananya Iyer","role":"student","usn":"1MS22BT022","department":"Biotechnology"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jason.m@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Jason Miller","role":"student","usn":"1MS22IS055","department":"Information Science"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tanya.s@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Tanya Sen","role":"student","usn":"1MS22EC041","department":"Electronics & Comm."}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-00000000005b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Dr. Eleanor Vance","role":"admin","title":"Chief Academic Officer & Event Director"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('a0000000-0000-0000-0000-00000000005c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'director@eventora.demo', crypt('demo123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Marcus Sterling","role":"admin","title":"Director of Student Activities & Campus Operations"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 2. SEED PROFILES (10 Students, 2 Admins)
INSERT INTO public.profiles (id, name, email, role, usn, department, semester, phone, avatar_url, interests)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Alexander Wright', 'student@eventora.demo', 'student', '1MS22CS042', 'Computer Science', 5, '+1 (555) 234-5678', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', '{"Artificial Intelligence","Web3","Cloud Computing","Hackathons"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  usn = EXCLUDED.usn,
  avatar_url = EXCLUDED.avatar_url;
INSERT INTO public.profiles (id, name, email, role, usn, department, semester, phone, avatar_url, interests)
VALUES ('a0000000-0000-0000-0000-000000000002', 'Sarah Jenkins', 'sarah.j@eventora.demo', 'student', '1MS22IS019', 'Information Science', 5, '+1 (555) 345-6789', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400', '{"UI/UX Design","Product Management","Cybersecurity"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  usn = EXCLUDED.usn,
  avatar_url = EXCLUDED.avatar_url;
INSERT INTO public.profiles (id, name, email, role, usn, department, semester, phone, avatar_url, interests)
VALUES ('a0000000-0000-0000-0000-000000000003', 'Marcus Brody', 'marcus.b@eventora.demo', 'student', '1MS22EC088', 'Electronics & Comm.', 5, '+1 (555) 456-7890', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', '{"IoT","Robotics","Embedded Systems"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  usn = EXCLUDED.usn,
  avatar_url = EXCLUDED.avatar_url;
INSERT INTO public.profiles (id, name, email, role, usn, department, semester, phone, avatar_url, interests)
VALUES ('a0000000-0000-0000-0000-000000000004', 'Priya Sharma', 'priya.s@eventora.demo', 'student', '1MS22CS112', 'Computer Science', 5, '+1 (555) 567-8901', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', '{"Deep Learning","NLP","Machine Learning"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  usn = EXCLUDED.usn,
  avatar_url = EXCLUDED.avatar_url;
INSERT INTO public.profiles (id, name, email, role, usn, department, semester, phone, avatar_url, interests)
VALUES ('a0000000-0000-0000-0000-000000000005', 'David Chen', 'david.c@eventora.demo', 'student', '1MS22ME034', 'Mechanical Eng.', 5, '+1 (555) 678-9012', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', '{"3D Printing","CAD","Automation"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  usn = EXCLUDED.usn,
  avatar_url = EXCLUDED.avatar_url;
INSERT INTO public.profiles (id, name, email, role, usn, department, semester, phone, avatar_url, interests)
VALUES ('a0000000-0000-0000-0000-000000000006', 'Elena Rostova', 'elena.r@eventora.demo', 'student', '1MS22AI015', 'Artificial Intelligence', 5, '+1 (555) 789-0123', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', '{"Computer Vision","Autonomous Systems"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  usn = EXCLUDED.usn,
  avatar_url = EXCLUDED.avatar_url;
INSERT INTO public.profiles (id, name, email, role, usn, department, semester, phone, avatar_url, interests)
VALUES ('a0000000-0000-0000-0000-000000000007', 'Rohit Verma', 'rohit.v@eventora.demo', 'student', '1MS22CS075', 'Computer Science', 5, '+1 (555) 890-1234', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400', '{"Fullstack Dev","DevOps","Kubernetes"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  usn = EXCLUDED.usn,
  avatar_url = EXCLUDED.avatar_url;
INSERT INTO public.profiles (id, name, email, role, usn, department, semester, phone, avatar_url, interests)
VALUES ('a0000000-0000-0000-0000-000000000008', 'Ananya Iyer', 'ananya.i@eventora.demo', 'student', '1MS22BT022', 'Biotechnology', 5, '+1 (555) 901-2345', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', '{"Bioinformatics","Genomics","HealthTech"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  usn = EXCLUDED.usn,
  avatar_url = EXCLUDED.avatar_url;
INSERT INTO public.profiles (id, name, email, role, usn, department, semester, phone, avatar_url, interests)
VALUES ('a0000000-0000-0000-0000-000000000009', 'Jason Miller', 'jason.m@eventora.demo', 'student', '1MS22IS055', 'Information Science', 5, '+1 (555) 012-3456', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400', '{"Ethical Hacking","Cryptography","Network Security"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  usn = EXCLUDED.usn,
  avatar_url = EXCLUDED.avatar_url;
INSERT INTO public.profiles (id, name, email, role, usn, department, semester, phone, avatar_url, interests)
VALUES ('a0000000-0000-0000-0000-00000000000a', 'Tanya Sen', 'tanya.s@eventora.demo', 'student', '1MS22EC041', 'Electronics & Comm.', 5, '+1 (555) 123-4560', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400', '{"Public Speaking","Cultural Events","Leadership"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  usn = EXCLUDED.usn,
  avatar_url = EXCLUDED.avatar_url;
INSERT INTO public.profiles (id, name, email, role, department, phone, avatar_url)
VALUES ('a0000000-0000-0000-0000-00000000005b', 'Dr. Eleanor Vance', 'admin@eventora.demo', 'admin', 'Eventora Global University', '+1 (555) 999-8888', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url;
INSERT INTO public.profiles (id, name, email, role, department, phone, avatar_url)
VALUES ('a0000000-0000-0000-0000-00000000005c', 'Marcus Sterling', 'director@eventora.demo', 'admin', 'Eventora Global University', '+1 (555) 888-7777', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url;

-- 3. SEED VENUES (8 Campus Venues)
INSERT INTO public.venues (id, name, building, room, latitude, longitude, capacity)
VALUES ('b0000000-0000-0000-0000-000000000001', 'Auditorium A', 'Tech Center', 'Auditorium Hall 1', 12.9716, 77.5946, 500)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.venues (id, name, building, room, latitude, longitude, capacity)
VALUES ('b0000000-0000-0000-0000-000000000002', 'Lab 4B', 'Innovation Hub', 'Advanced Computing Lab', 12.9724, 77.5958, 100)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.venues (id, name, building, room, latitude, longitude, capacity)
VALUES ('b0000000-0000-0000-0000-000000000003', 'Seminar Hall 3', 'Student Union', 'Multi-purpose Conference Hall', 12.9708, 77.5932, 200)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.venues (id, name, building, room, latitude, longitude, capacity)
VALUES ('b0000000-0000-0000-0000-000000000004', 'Science Atrium', 'Science & Research Block', 'Glass Pavilion', 12.973, 77.5965, 350)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.venues (id, name, building, room, latitude, longitude, capacity)
VALUES ('b0000000-0000-0000-0000-000000000005', 'Main Sports Arena', 'Athletics Complex', 'Indoor Stadium & Track', 12.9695, 77.592, 1200)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.venues (id, name, building, room, latitude, longitude, capacity)
VALUES ('b0000000-0000-0000-0000-000000000006', 'Media Center & Amphitheater', 'Arts & Culture Pavilion', 'Open Air Stage', 12.9742, 77.5912, 400)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.venues (id, name, building, room, latitude, longitude, capacity)
VALUES ('b0000000-0000-0000-0000-000000000007', 'Innovation Garage Lab 2', 'Engineering Core', 'Robotics Arena', 12.9702, 77.597, 80)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.venues (id, name, building, room, latitude, longitude, capacity)
VALUES ('b0000000-0000-0000-0000-000000000008', 'Executive Council Hall', 'Administration Block', 'Boardroom 301', 12.9688, 77.5938, 150)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED EVENTS (8 Core Events)
INSERT INTO public.events (id, title, description, category, date, start_time, end_time, venue, capacity, status, image_url, organizer_id)
VALUES ('e0000000-0000-0000-0000-000000000001', 'Annual Tech Fest 2026', 'The university''s flagship technical symposium showcasing student innovations, keynote lectures from industry titans, paper presentations, and robotic exhibits.', 'Technical', '2026-10-15', '09:00:00', '17:00:00', 'Auditorium A', 500, 'published', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000', 'a0000000-0000-0000-0000-00000000005b')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  venue = EXCLUDED.venue,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status;
INSERT INTO public.events (id, title, description, category, date, start_time, end_time, venue, capacity, status, image_url, organizer_id)
VALUES ('e0000000-0000-0000-0000-000000000002', 'AI & ML Workshop: LLMs in Production', 'Deep dive into designing, fine-tuning, and deploying enterprise Large Language Models and multi-agent workflows with real-time vector embeddings.', 'Workshop', '2026-10-18', '09:00:00', '17:00:00', 'Lab 4B', 100, 'published', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000', 'a0000000-0000-0000-0000-00000000005b')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  venue = EXCLUDED.venue,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status;
INSERT INTO public.events (id, title, description, category, date, start_time, end_time, venue, capacity, status, image_url, organizer_id)
VALUES ('e0000000-0000-0000-0000-000000000003', 'Global FinTech Hackathon 2026', '36-hour non-stop collegiate hackathon challenging developers to architect scalable financial primitives, fraud prevention AI, and decentralized payments.', 'Hackathon', '2026-10-22', '09:00:00', '17:00:00', 'Auditorium A', 350, 'published', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000', 'a0000000-0000-0000-0000-00000000005b')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  venue = EXCLUDED.venue,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status;
INSERT INTO public.events (id, title, description, category, date, start_time, end_time, venue, capacity, status, image_url, organizer_id)
VALUES ('e0000000-0000-0000-0000-000000000004', 'Web Development Bootcamp: React 19 & Next.js', 'Master modern full-stack web applications with React Server Components, Tailwind CSS, Turbopack, and high-performance serverless backends.', 'Bootcamp', '2026-10-25', '09:00:00', '17:00:00', 'Seminar Hall 3', 200, 'published', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000', 'a0000000-0000-0000-0000-00000000005b')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  venue = EXCLUDED.venue,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status;
INSERT INTO public.events (id, title, description, category, date, start_time, end_time, venue, capacity, status, image_url, organizer_id)
VALUES ('e0000000-0000-0000-0000-000000000005', 'Cyber Security Awareness & Ethical Hacking', 'An intensive live demonstration covering zero-day vulnerability discovery, network penetration testing, credential stuffing mitigations, and compliance.', 'Seminar', '2026-10-28', '09:00:00', '17:00:00', 'Science Atrium', 350, 'published', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000', 'a0000000-0000-0000-0000-00000000005b')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  venue = EXCLUDED.venue,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status;
INSERT INTO public.events (id, title, description, category, date, start_time, end_time, venue, capacity, status, image_url, organizer_id)
VALUES ('e0000000-0000-0000-0000-000000000006', 'Annual Inter-Collegiate Sports Meet 2026', 'Track and field events, basketball championships, badminton circuits, and football tourneys featuring over 40 participating regional universities.', 'Sports', '2026-11-02', '09:00:00', '17:00:00', 'Main Sports Arena', 1200, 'published', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1000', 'a0000000-0000-0000-0000-00000000005b')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  venue = EXCLUDED.venue,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status;
INSERT INTO public.events (id, title, description, category, date, start_time, end_time, venue, capacity, status, image_url, organizer_id)
VALUES ('e0000000-0000-0000-0000-000000000007', 'Vibrance 2026: Spring Cultural Festival', 'Celebrating arts, acoustic concerts, battle of the bands, classical dances, theater production, and street food carnivals across campus lawns.', 'Cultural', '2026-11-10', '09:00:00', '17:00:00', 'Auditorium A', 800, 'published', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000', 'a0000000-0000-0000-0000-00000000005b')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  venue = EXCLUDED.venue,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status;
INSERT INTO public.events (id, title, description, category, date, start_time, end_time, venue, capacity, status, image_url, organizer_id)
VALUES ('e0000000-0000-0000-0000-000000000008', 'Cloud Native & DevOps Masterclass', 'Hands-on architectural guidance covering Docker containerization, Kubernetes cluster orchestration, GitOps with ArgoCD, and automated cloud deployments.', 'Technical', '2026-11-15', '09:00:00', '17:00:00', 'Lab 4B', 120, 'published', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000', 'a0000000-0000-0000-0000-00000000005b')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  venue = EXCLUDED.venue,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status;

-- 5. SEED EVENT REGISTRATIONS (52 Registrations)
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-10-01T10:14:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2026-10-02T11:20:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2026-10-03T15:45:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', '2026-10-04T09:30:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2026-10-04T14:10:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '2026-10-05T12:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2026-10-01T10:15:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', '2026-10-01T11:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', '2026-10-02T14:10:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000000a', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '2026-10-03T10:10:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000000b', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', '2026-10-03T16:20:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000000c', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', '2026-10-04T09:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000000d', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', '2026-10-01T10:16:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000000e', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', '2026-10-02T12:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000000f', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', '2026-10-03T11:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', '2026-10-04T15:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', '2026-10-05T10:30:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', '2026-10-01T10:18:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', '2026-10-02T12:05:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', '2026-10-03T16:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', '2026-10-04T10:15:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', '2026-10-04T13:40:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000017', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', '2026-10-05T14:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000018', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', '2026-10-01T10:20:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000019', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', '2026-10-04T10:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000001a', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', '2026-10-04T11:20:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000001b', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', '2026-10-05T12:30:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000001c', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', '2026-10-05T15:45:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000001d', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', '2026-10-01T10:22:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000001e', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', '2026-10-02T12:10:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000001f', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', '2026-10-03T16:20:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000006', '2026-10-04T16:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000021', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006', '2026-10-05T09:30:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000022', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', '2026-10-01T10:25:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000023', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000007', '2026-10-04T09:40:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000024', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007', '2026-10-04T14:50:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000025', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007', '2026-10-05T10:10:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000026', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000007', '2026-10-05T11:40:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000027', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', '2026-10-01T10:30:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000028', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000008', '2026-10-02T13:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000029', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000008', '2026-10-04T15:20:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000002a', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000008', '2026-10-05T08:45:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000002b', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000008', '2026-10-05T13:10:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000002c', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000009', '2026-10-01T10:35:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000002d', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000009', '2026-10-02T14:20:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000002e', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000009', '2026-10-04T11:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-00000000002f', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009', '2026-10-05T14:20:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000030', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000009', '2026-10-05T16:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000031', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', '2026-10-01T10:40:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000032', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-00000000000a', '2026-10-04T12:00:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000033', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-00000000000a', '2026-10-04T12:15:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.event_registrations (id, event_id, student_id, registered_at, status)
VALUES ('d0000000-0000-0000-0000-000000000034', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-00000000000a', '2026-10-05T15:30:00Z', 'registered')
ON CONFLICT (event_id, student_id) DO NOTHING;

-- 6. SEED ATTENDANCE (44 Records)
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-10-15 09:12 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2026-10-15 09:14 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', '2026-10-15 09:38 AM'::timestamptz, 'late', 'manual')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', '2026-10-15 09:05 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', '2026-10-15 09:18 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', '2026-10-15 09:08 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', '2026-10-15 09:21 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', '2026-10-15 09:23 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000009', '2026-10-15 09:25 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000000a', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', '2026-10-15 08:58 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000000b', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2026-10-18 10:02 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000000c', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '2026-10-18 10:06 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000000d', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', '2026-10-18 10:01 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000000e', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', '2026-10-18 09:55 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000000f', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', '2026-10-18 10:11 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000008', '2026-10-18 10:14 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2026-10-22 08:15 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', '2026-10-22 08:10 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', '2026-10-22 08:22 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007', '2026-10-22 08:30 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009', '2026-10-22 08:35 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', '2026-10-22 08:40 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000017', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', '2026-10-25 11:05 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000018', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2026-10-25 11:10 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000019', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', '2026-10-25 11:02 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000001a', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007', '2026-10-25 11:15 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000001b', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-00000000000a', '2026-10-25 11:20 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000001c', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000009', '2026-10-28 02:05 PM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000001d', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', '2026-10-28 02:10 PM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000001e', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006', '2026-10-28 02:14 PM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000001f', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000007', '2026-10-28 02:22 PM'::timestamptz, 'late', 'manual')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', '2026-11-02 07:35 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000021', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-00000000000a', '2026-11-02 07:40 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000022', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', '2026-11-02 07:45 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000023', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000008', '2026-11-02 07:50 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000024', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', '2026-11-02 07:55 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000025', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-00000000000a', '2026-11-10 04:15 PM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000026', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '2026-11-10 04:20 PM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000027', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', '2026-11-10 04:25 PM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000028', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000008', '2026-11-10 04:30 PM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-000000000029', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', '2026-11-15 10:04 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000002a', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000007', '2026-11-15 10:08 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000002b', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', '2026-11-15 10:12 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.attendance (id, event_id, student_id, scanned_at, status, verification_method)
VALUES ('00000000-0000-0000-0000-00000000002c', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000006', '2026-11-15 10:15 AM'::timestamptz, 'present', 'qr')
ON CONFLICT (event_id, student_id) DO NOTHING;

-- 7. SEED CERTIFICATES (22 Records)
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'CERT-894201-ET25', '/certificates/CERT-894201-ET25', 'October 16, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'CERT-772109-ML26', '/certificates/CERT-772109-ML26', 'September 18, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'CERT-661204-FH26', '/certificates/CERT-661204-FH26', 'September 24, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'CERT-552011-CC26', '/certificates/CERT-552011-CC26', 'August 29, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'CERT-441092-WD26', '/certificates/CERT-441092-WD26', 'July 15, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'CERT-330911-VF26', '/certificates/CERT-330911-VF26', 'June 20, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'CERT-220199-SJ26', '/certificates/CERT-220199-SJ26', 'October 16, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'CERT-220200-SJ26', '/certificates/CERT-220200-SJ26', 'October 26, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'CERT-220201-SJ26', '/certificates/CERT-220201-SJ26', 'October 29, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-00000000000a', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'CERT-330101-PS26', '/certificates/CERT-330101-PS26', 'October 16, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-00000000000b', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'CERT-330102-PS26', '/certificates/CERT-330102-PS26', 'October 19, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-00000000000c', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'CERT-330103-PS26', '/certificates/CERT-330103-PS26', 'October 25, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-00000000000d', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'CERT-440101-ER26', '/certificates/CERT-440101-ER26', 'October 16, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-00000000000e', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', 'CERT-440102-ER26', '/certificates/CERT-440102-ER26', 'October 25, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-00000000000f', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000007', 'CERT-550101-RV26', '/certificates/CERT-550101-RV26', 'November 16, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007', 'CERT-550102-RV26', '/certificates/CERT-550102-RV26', 'October 26, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000009', 'CERT-660101-JM26', '/certificates/CERT-660101-JM26', 'October 29, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000009', 'CERT-660102-JM26', '/certificates/CERT-660102-JM26', 'October 16, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-00000000000a', 'CERT-770101-TS26', '/certificates/CERT-770101-TS26', 'November 13, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-00000000000a', 'CERT-770102-TS26', '/certificates/CERT-770102-TS26', 'November 06, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 'CERT-880101-DC26', '/certificates/CERT-880101-DC26', 'November 06, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;
INSERT INTO public.certificates (id, event_id, student_id, certificate_id, certificate_url, issued_at)
VALUES ('c0000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', 'CERT-990101-AI26', '/certificates/CERT-990101-AI26', 'October 16, 2026'::timestamptz)
ON CONFLICT (certificate_id) DO NOTHING;

-- 8. SEED FEEDBACK (32 Records)
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 4, 5, 'Exceptional symposium! The keynote by Sundar Raman was deeply insightful, and check-in via the dynamic QR scanner was instant with zero waiting lines.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 5, 5, 'The automated certificate vault issuing certificates right after the event was unbelievable. Truly professional SaaS experience.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 4, 4, 5, 4, 5, 'Great hardware robotics exhibits in the tech center lobby. Acoustics in Auditorium A were crystal clear.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 5, 5, 'Paper presentations provided rigorous technical feedback. Thoroughly organized from registration to awards.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 4, 4, 4, 5, 4, 'Lunch networking hour was very productive. Looking forward to next year''s edition.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 4, 5, 'Hands-on RAG pipeline setup directly in PyTorch was incredible. Clear step-by-step guidance.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 4, 4, 5, 4, 5, 'High quality hands-on code examples for RAG pipelines. Would love a 2-day extended session next semester!', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 5, 5, 'Quantization and LoRA labs were explained with deep mathematical clarity.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 4, 4, 4, 4, 5, 'Lab workstations handled GPUs without lag. Very well managed by the club.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000000a', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 5, 5, 4, 5, 5, 'Best collegiate hackathon organization I have seen. Mentorship support was responsive 24/7.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000000b', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 5, 5, '36-hour sprint with great snacks, wifi reliability, and real enterprise judging criteria.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000000c', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 5, 5, 'Mentors from leading payment gateways helped refine our risk scoring architecture.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000000d', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 4, 4, 4, 5, 5, 'Awesome pitch stage and transparent grading criteria from the judging panel.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000000e', 'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 4, 5, 'Real-time leaderboard updates during judging kept the excitement high.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000000f', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 4, 4, 5, 4, 5, 'Sarah explained React 19 Actions and optimistic updates brilliantly.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 4, 4, 5, 4, 4, 'Clean boilerplate provided before class allowed us to dive straight into coding.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 5, 5, 'As someone branching into tech from electronics, this was wonderfully accessible.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 4, 4, 4, 4, 5, 'Super practical live coding. Learned new CSS subgrid techniques too.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 5, 5, 'The live packet sniffing demo opened everyone''s eyes to public WiFi vulnerabilities.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 4, 4, 5, 4, 5, 'CTF problems had progressive difficulty that encouraged teamwork.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 4, 4, 4, 4, 4, 'Great focus on container escape mitigations and kernel security patches.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 5, 5, 'Phenomenal student engagement and enthusiastic questions throughout the session.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000017', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 5, 5, 4, 5, 4, 'Track facilities and digital photo-finish timers made the races professional.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000018', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 4, 4, 4, 5, 4, 'Cheering squad support and sports arena amenities were top notch.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000019', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 4, 4, 4, 4, 4, 'Very energetic atmosphere across all three days.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000001a', 'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 4, 4, 4, 4, 4, 'Good refereeing and fair play across tournament brackets.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000001b', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 5, 5, 'Battle of the Bands in the evening was electrifying. Best lighting and sound setup yet.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000001c', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 5, 5, 'Street food carnival and student dance troupes made the campus feel alive.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000001d', 'e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 5, 4, 5, 5, 5, 'Celebrity headliner concert ended the semester on the highest note possible.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000001e', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 5, 5, 5, 4, 5, 'Hands-on blue/green deployments and ArgoCD syncing gave enterprise-grade knowledge.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-00000000001f', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 4, 4, 5, 4, 5, 'Docker compose to K8s manifest migration exercise was extremely well prepared.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;
INSERT INTO public.feedback (id, event_id, student_id, rating, organization_rating, speaker_rating, venue_rating, content_rating, comment, created_at)
VALUES ('f0000000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 4, 4, 4, 5, 4, 'Good session on microservices telemetry using Prometheus and Grafana.', NOW())
ON CONFLICT (event_id, student_id) DO NOTHING;

-- 9. SEED NOTIFICATIONS (22 Records)
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Registration Confirmed', 'You are registered for ''Annual Tech Fest 2026''. Your dynamic QR pass is ready in your dashboard.', 'registration', FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Event Starts Soon', '''Annual Tech Fest 2026'' starts in 14 hours at Auditorium A. Check in early to reserve priority front seating.', 'event', FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Certificate Generated', 'Your verified credential for ''Global FinTech Hackathon'' has been cryptographically signed and stored in your vault.', 'certificate', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'New AI Recommendation', '''AI & ML Workshop: LLMs in Production'' matches 98% of your computer science interest profile.', 'recommendation', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Feedback Request', 'How was ''Web Development Bootcamp''? Submit your 5-criterion review to unlock your digital badge.', 'event', FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Attendance Verified', 'Your attendance was confirmed at 09:12 AM for Annual Tech Fest 2026.', 'registration', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Campus Venue Update', 'Auditorium A seating capacity expanded to 500 seats due to overwhelming registration demand.', 'alert', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Hackathon Blueprint Ready', 'Problem statements and dataset repositories for Global FinTech Hackathon are now accessible.', 'event', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', 'Certificate Issued', 'Certificate of Distinction in React 19 Frontend Architecture is now available in your vault.', 'certificate', FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000002', 'Registration Confirmed', 'Confirmed seat for ''Cyber Security Awareness & Ethical Hacking'' at Science Atrium.', 'registration', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-00000000000b', 'a0000000-0000-0000-0000-000000000003', 'Workshop Reminder', 'Robotics Hardware Lab session starts in 45 minutes in Innovation Hub Lab 4B.', 'event', FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-00000000000c', 'a0000000-0000-0000-0000-000000000003', 'Attendance Logged', 'Late check-in override approved by Admin Desk for Annual Tech Fest at 09:38 AM.', 'registration', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-00000000000d', 'a0000000-0000-0000-0000-000000000004', 'Top 3 Podium Award', 'Congratulations on winning 2nd Runner Up in Global FinTech Hackathon 2026!', 'certificate', FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-00000000000e', 'a0000000-0000-0000-0000-000000000004', 'Co-Instructor Access Granted', 'You have been granted evaluator permissions for AI & ML Workshop attendee reviews.', 'system', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-00000000000f', 'a0000000-0000-0000-0000-000000000005', 'Gold Medal Verification', 'Official sports certificate for Men''s 400m Relay has been cryptographically signed.', 'certificate', FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000006', 'New AI Recommendation', '''Cloud Native & DevOps Masterclass'' matches your distributed systems research profile.', 'recommendation', FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000007', 'DevOps Badge Awarded', 'Earned badge: Kubernetes Deployment Master for successfully demonstrating multi-cluster failover.', 'certificate', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000008', 'Paper Presentation Award', 'Honored with Best Computational Genomics Paper Certificate at Annual Tech Fest 2026.', 'certificate', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000009', 'Security Threat Acknowledged', 'Thank you for reporting spoofing attack pattern during anti-fraud dynamic QR testing.', 'alert', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-00000000000a', 'Cultural Fest Headliner Briefing', 'Final acoustic sound checks scheduled at 02:00 PM today in Media Center & Amphitheater.', 'event', FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'System Maintenance Notice', 'Eventora Platform database snapshot completed successfully. All records persisted.', 'system', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ('10000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'Campus Security Alert', 'Anti-fraud rate limit enforcement active on all rotating dynamic QR attendance kiosks.', 'alert', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;