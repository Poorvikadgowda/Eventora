import React, { useState, useMemo } from 'react';

/**
 * CampusInteriorMap
 * Ultra-realistic architectural multi-floor interior blueprint of Eventora University campus.
 * Features:
 * - Multi-floor selector (Ground Floor / Level 1 / Level 2)
 * - Architectural CAD & Modern Plan themes
 * - Detailed room interiors: furniture, stage, courts, lab workstations, structural pillars, door swings
 * - Interactive room selection with real-time occupancy & live sensor badges
 * - Animated turn-by-turn indoor wayfinding path from Main Entrance to destination
 * - Amenities indicators: Restrooms, Elevators, Cafe, Emergency Exits, Info Desks
 * - Zoom & pan controls with scale bar
 */
export const CampusInteriorMap = ({
  venues = [],
  selectedVenue = null,
  onSelectVenue = () => {},
  isNavigating = false,
  onToggleNavigation = () => {}
}) => {
  const [activeFloor, setActiveFloor] = useState('Ground Floor'); // 'Ground Floor' | 'Level 1' | 'Level 2'
  const [mapTheme, setMapTheme] = useState('blueprint'); // 'blueprint' (CAD Dark) | 'architectural' (Clean Light)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAmenities, setShowAmenities] = useState(true);
  const [showWayfinding, setShowWayfinding] = useState(true);

  // Sync active floor when selected venue changes
  React.useEffect(() => {
    if (selectedVenue?.floor) {
      if (selectedVenue.floor.toLowerCase().includes('ground')) {
        setActiveFloor('Ground Floor');
      } else if (selectedVenue.floor.toLowerCase().includes('1')) {
        setActiveFloor('Level 1');
      } else if (selectedVenue.floor.toLowerCase().includes('2') || selectedVenue.floor.toLowerCase().includes('3')) {
        setActiveFloor('Level 2');
      }
    }
  }, [selectedVenue]);

  // Theme palettes
  const theme = useMemo(() => {
    if (mapTheme === 'blueprint') {
      return {
        bg: '#0B192C',
        gridLine: 'rgba(56, 189, 248, 0.08)',
        outerWall: '#1E3E62',
        innerWall: '#0051D5',
        wallFill: '#0E2238',
        corridorFill: '#0D2137',
        corridorTexture: 'rgba(56, 189, 248, 0.04)',
        roomBg: '#102A43',
        roomBorder: '#2563EB',
        roomHover: '#1D4ED8',
        selectedBorder: '#38BDF8',
        selectedGlow: 'rgba(56, 189, 248, 0.45)',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
        accentPill: '#0051D5',
        doorArc: '#38BDF8',
        pillar: '#475569',
        wayfindingPath: '#38BDF8',
        wayfindingGlow: '#0284C7',
        amenityBg: 'rgba(15, 23, 42, 0.85)',
        amenityBorder: 'rgba(56, 189, 248, 0.4)'
      };
    }
    // Clean Architectural Modern Light
    return {
      bg: '#F8FAFC',
      gridLine: 'rgba(148, 163, 184, 0.15)',
      outerWall: '#334155',
      innerWall: '#64748B',
      wallFill: '#E2E8F0',
      corridorFill: '#FFFFFF',
      corridorTexture: 'rgba(226, 232, 240, 0.6)',
      roomBg: '#F1F5F9',
      roomBorder: '#94A3B8',
      roomHover: '#E2E8F0',
      selectedBorder: '#0051D5',
      selectedGlow: 'rgba(0, 81, 213, 0.3)',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      accentPill: '#0051D5',
      doorArc: '#0051D5',
      pillar: '#1E293B',
      wayfindingPath: '#0051D5',
      wayfindingGlow: '#2563EB',
      amenityBg: '#FFFFFF',
      amenityBorder: '#CBD5E1'
    };
  }, [mapTheme]);

  // Venue mappings for each floor
  // Venue mappings for each floor of Dr. Ambedkar Institute of Technology (Dr. AIT)
  const floorVenues = useMemo(() => {
    return {
      'Ground Floor': [
        {
          id: 'ven_jpn_auditorium',
          name: 'JPN Auditorium',
          code: 'JPN-AUD',
          building: 'JPN Auditorium Complex',
          floor: 'Ground Floor',
          capacity: 750,
          occupancy: 685,
          occupancyPercent: 91.3,
          status: 'Live',
          currentEvent: 'Sanskriti 2026 - Dr. AIT Annual Fest',
          category: 'Main Auditorium & Cultural Stage',
          x: 60,
          y: 70,
          w: 320,
          h: 270,
          doorX: 380,
          doorY: 200,
          pathTarget: { x: 340, y: 200 }
        },
        {
          id: 'ven_admin_ground',
          name: 'Student Affairs & Registry',
          code: 'ADM-SEC-01',
          building: 'Main Administrative Block',
          floor: 'Ground Floor',
          capacity: 200,
          occupancy: 145,
          occupancyPercent: 72.5,
          status: 'Available',
          currentEvent: 'Admissions & Scholarships Counter',
          category: 'Administrative Services',
          x: 60,
          y: 380,
          w: 320,
          h: 190,
          doorX: 380,
          doorY: 460,
          pathTarget: { x: 340, y: 460 }
        },
        {
          id: 'ven_centenary_library',
          name: 'Centenary Bhavan Library',
          code: 'CENT-LIB-01',
          building: 'Centenary Bhavan',
          floor: 'Ground Floor',
          capacity: 450,
          occupancy: 290,
          occupancyPercent: 64.4,
          status: 'Live',
          currentEvent: 'National Research Symposium & Book Exhibition',
          category: 'Central Library & Periodicals',
          x: 620,
          y: 70,
          w: 320,
          h: 250,
          doorX: 620,
          doorY: 180,
          pathTarget: { x: 660, y: 180 }
        },
        {
          id: 'ven_sports_complex',
          name: 'Indoor Sports Arena',
          code: 'SPT-ARN-01',
          building: 'Sports & Amenities Complex',
          floor: 'Ground Floor',
          capacity: 800,
          occupancy: 520,
          occupancyPercent: 65.0,
          status: 'Scheduled',
          currentEvent: 'VTU Inter-Collegiate Badminton Circuit',
          category: 'Badminton Courts & Gymnasium',
          x: 620,
          y: 360,
          w: 320,
          h: 210,
          doorX: 620,
          doorY: 460,
          pathTarget: { x: 660, y: 460 }
        }
      ],
      'Level 1': [
        {
          id: 'ven_sjb_lab',
          name: 'Advanced AI & Cloud Lab',
          code: 'SJB-LAB-101',
          building: 'Silver Jubilee Building (SJB)',
          floor: 'Level 1',
          capacity: 120,
          occupancy: 104,
          occupancyPercent: 86.6,
          status: 'Live',
          currentEvent: 'AI & Autonomous Agents Hackathon',
          category: 'CSE / ISE High-Tech Lab',
          x: 60,
          y: 70,
          w: 320,
          h: 250,
          doorX: 380,
          doorY: 190,
          pathTarget: { x: 340, y: 190 }
        },
        {
          id: 'ven_d_block_ece',
          name: 'VLSI & Embedded Systems Lab',
          code: 'DBLK-VLSI-103',
          building: 'D Block (ECE & EEE)',
          floor: 'Level 1',
          capacity: 150,
          occupancy: 110,
          occupancyPercent: 73.3,
          status: 'Upcoming',
          currentEvent: 'IoT Sensors & Robotics Prototyping',
          category: 'ECE & EEE Innovation Bay',
          x: 60,
          y: 360,
          w: 320,
          h: 210,
          doorX: 380,
          doorY: 450,
          pathTarget: { x: 340, y: 450 }
        },
        {
          id: 'ven_centenary_digilib',
          name: 'Digital Library & IEEE Vault',
          code: 'CENT-DIG-102',
          building: 'Centenary Bhavan',
          floor: 'Level 1',
          capacity: 250,
          occupancy: 180,
          occupancyPercent: 72.0,
          status: 'Live',
          currentEvent: 'IEEE Xplore & Digital Thesis Access',
          category: 'E-Resources & Multimedia Hub',
          x: 620,
          y: 70,
          w: 320,
          h: 250,
          doorX: 620,
          doorY: 190,
          pathTarget: { x: 660, y: 190 }
        },
        {
          id: 'ven_c_block_mech',
          name: 'Robotics & CAD/CAM Simulation',
          code: 'CBLK-ROB-104',
          building: 'C Block (Mech & Civil)',
          floor: 'Level 1',
          capacity: 110,
          occupancy: 85,
          occupancyPercent: 77.2,
          status: 'Available',
          currentEvent: 'Additive Manufacturing & 3D Prototyping',
          category: 'Mechanical Engineering Labs',
          x: 620,
          y: 360,
          w: 320,
          h: 210,
          doorX: 620,
          doorY: 450,
          pathTarget: { x: 660, y: 450 }
        }
      ],
      'Level 2': [
        {
          id: 'ven_admin_syndicate',
          name: 'Syndicate Hall & Boardroom',
          code: 'ADM-SYN-201',
          building: 'Main Administrative Block',
          floor: 'Level 2',
          capacity: 100,
          occupancy: 78,
          occupancyPercent: 78.0,
          status: 'Upcoming',
          currentEvent: 'Governing Council Academic Senate',
          category: 'Principal & Executive Senate',
          x: 60,
          y: 70,
          w: 340,
          h: 260,
          doorX: 400,
          doorY: 200,
          pathTarget: { x: 360, y: 200 }
        },
        {
          id: 'ven_b_block_ml',
          name: 'Biomedical Sensors Lab',
          code: 'BBLK-MED-204',
          building: 'B Block (Medical Electronics)',
          floor: 'Level 2',
          capacity: 80,
          occupancy: 55,
          occupancyPercent: 68.7,
          status: 'Available',
          currentEvent: 'Clinical Bio-Telemetry Workshop',
          category: 'Medical Electronics & Bio-Signals',
          x: 60,
          y: 370,
          w: 340,
          h: 200,
          doorX: 400,
          doorY: 460,
          pathTarget: { x: 360, y: 460 }
        },
        {
          id: 'ven_sjb_pg',
          name: 'ACTS Incubation & IDEA Lab',
          code: 'SJB-ACTS-202',
          building: 'Silver Jubilee Building (SJB)',
          floor: 'Level 2',
          capacity: 120,
          occupancy: 88,
          occupancyPercent: 73.3,
          status: 'Live',
          currentEvent: 'Ambedkar Centre for Tech Startup (ACTS) Pitch',
          category: 'ACTS Incubation & AICTE IDEA Lab',
          x: 600,
          y: 70,
          w: 340,
          h: 260,
          doorX: 600,
          doorY: 200,
          pathTarget: { x: 640, y: 200 }
        },
        {
          id: 'ven_centenary_ref',
          name: 'Reference Archives & Quiet Stacks',
          code: 'CENT-REF-203',
          building: 'Centenary Bhavan',
          floor: 'Level 2',
          capacity: 200,
          occupancy: 95,
          occupancyPercent: 47.5,
          status: 'Available',
          currentEvent: 'PhD Research Scholar Silent Commons',
          category: 'Central Archives & Reading Stacks',
          x: 600,
          y: 370,
          w: 340,
          h: 200,
          doorX: 600,
          doorY: 460,
          pathTarget: { x: 640, y: 460 }
        }
      ]
    };
  }, []);

  const currentRooms = floorVenues[activeFloor] || [];

  // Find destination target room on current floor
  const activeDestination = useMemo(() => {
    if (!selectedVenue) return currentRooms[0];
    const match = currentRooms.find(r => r.id === selectedVenue.id || r.name.toLowerCase() === selectedVenue.name?.toLowerCase());
    return match || currentRooms[0];
  }, [currentRooms, selectedVenue]);

  // Compute SVG navigation path from Entrance Turnstiles (x: 500, y: 620)
  const wayfindingRoute = useMemo(() => {
    if (!activeDestination) return null;
    const startX = 500;
    const startY = 620;

    // Route travels up Central Galleria corridor
    const junctionY = activeDestination.doorY;
    const doorX = activeDestination.doorX;
    const targetX = activeDestination.pathTarget.x;
    const targetY = activeDestination.pathTarget.y;

    // SVG path string: Start -> Up central spine -> Turn into corridor -> Enter room
    const d = `M ${startX} ${startY} L ${startX} ${junctionY} L ${doorX} ${junctionY} L ${targetX} ${targetY}`;

    // Estimated distance calculation
    const distMeters = Math.round((Math.abs(startY - junctionY) + Math.abs(startX - doorX) + 40) * 0.25);
    const timeMinutes = Math.max(1, Math.round(distMeters / 60 * 10) / 10);

    return { d, distMeters, timeMinutes };
  }, [activeDestination]);

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Interactive Floor Plan Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-surface-container-low rounded-2xl border border-surface-container-high/60">
        {/* Floor Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-lowest rounded-xl border border-surface-container-high shadow-xs">
          <span className="text-[11px] font-bold text-outline uppercase px-2">Floor:</span>
          {['Ground Floor', 'Level 1', 'Level 2'].map((fl) => {
            const isActive = activeFloor === fl;
            return (
              <button
                key={fl}
                onClick={() => setActiveFloor(fl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high/40'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {fl === 'Ground Floor' ? 'layers' : fl === 'Level 1' ? 'looks_one' : 'looks_two'}
                </span>
                <span>{fl === 'Ground Floor' ? 'Ground (L0)' : fl}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode & Amenities Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Theme Switcher */}
          <div className="flex p-1 bg-surface-container-lowest rounded-xl border border-surface-container-high shadow-xs">
            <button
              onClick={() => setMapTheme('blueprint')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                mapTheme === 'blueprint' ? 'bg-[#0B192C] text-teal-300 shadow-xs' : 'text-outline hover:text-primary'
              }`}
              title="CAD Blueprint Dark Mode"
            >
              <span className="material-symbols-outlined text-[15px]">architecture</span>
              <span>CAD Blueprint</span>
            </button>
            <button
              onClick={() => setMapTheme('architectural')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                mapTheme === 'architectural' ? 'bg-white text-primary shadow-xs' : 'text-outline hover:text-primary'
              }`}
              title="Architectural Light Mode"
            >
              <span className="material-symbols-outlined text-[15px]">wb_sunny</span>
              <span>Light CAD</span>
            </button>
          </div>

          {/* Toggle Amenities */}
          <button
            onClick={() => setShowAmenities(!showAmenities)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              showAmenities
                ? 'bg-secondary/10 text-secondary border-secondary/30'
                : 'bg-surface-container-lowest text-outline border-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">local_convenience_store</span>
            <span>Amenities</span>
          </button>

          {/* Toggle Wayfinding Route */}
          <button
            onClick={() => setShowWayfinding(!showWayfinding)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              showWayfinding
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-surface-container-lowest text-outline border-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">directions_walk</span>
            <span>Walk Path</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-surface-container-lowest rounded-xl border border-surface-container-high overflow-hidden shadow-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
              className="p-1.5 hover:bg-surface-container text-primary border-r border-surface-container-high"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 text-[11px] font-mono font-bold text-outline hover:text-primary"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.75))}
              className="p-1.5 hover:bg-surface-container text-primary border-l border-surface-container-high"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
          </div>
        </div>
      </div>

      {/* SVG Blueprint Canvas Viewport */}
      <div
        className="relative w-full h-[520px] rounded-3xl overflow-hidden border-2 shadow-2xl transition-colors duration-300 select-none"
        style={{
          backgroundColor: theme.bg,
          borderColor: theme.outerWall
        }}
      >
        {/* Subtle Architectural Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${theme.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridLine} 1px, transparent 1px)`,
            backgroundSize: '25px 25px'
          }}
        ></div>

        {/* Compass & North Arrow (Top-Right) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none flex flex-col items-center opacity-85">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center border shadow-md backdrop-blur-md"
            style={{
              backgroundColor: theme.amenityBg,
              borderColor: theme.amenityBorder,
              color: theme.textPrimary
            }}
          >
            <span className="material-symbols-outlined text-[20px] text-teal-400">navigation</span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase mt-1 tracking-wider" style={{ color: theme.textSecondary }}>N</span>
        </div>

        {/* Level Indicator Watermark (Top-Left) */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-md border"
            style={{
              backgroundColor: theme.amenityBg,
              borderColor: theme.amenityBorder,
              color: theme.textPrimary
            }}
          >
            🏛️ Dr. Ambedkar Institute of Technology • {activeFloor.toUpperCase()}
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Real-time Sensors
          </span>
        </div>

        {/* Scale Bar (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 opacity-80">
          <div className="flex flex-col">
            <div className="w-28 h-1.5 border-b-2 border-l-2 border-r-2" style={{ borderColor: theme.textSecondary }}></div>
            <div className="flex justify-between text-[9px] font-mono font-bold mt-0.5" style={{ color: theme.textSecondary }}>
              <span>0m</span>
              <span>25m</span>
              <span>50m</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold" style={{ color: theme.textSecondary }}>Scale: 1:500</span>
        </div>

        {/* Zoom Scalable SVG Container */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 1000 660"
            className="w-full h-full max-w-[1000px] max-h-[660px]"
            style={{ filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.3))' }}
          >
            <defs>
              {/* Pulsing Glow for Active Room */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Theater Stage Gradient */}
              <linearGradient id="stageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.1" />
              </linearGradient>

              {/* Court Floor Gradient */}
              <linearGradient id="courtGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#EA580C" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0.15" />
              </linearGradient>

              {/* Atrium Glass Gradient */}
              <linearGradient id="atriumGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0D9488" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* 1. OUTER BUILDING SHELL & MAIN STRUCTURAL BOUNDARY */}
            <rect
              x="30"
              y="40"
              width="940"
              height="580"
              rx="18"
              fill={theme.wallFill}
              stroke={theme.outerWall}
              strokeWidth="6"
            />

            {/* 2. CENTRAL GALLERIA & MAIN HALLWAYS (FLOOR SURFACE) */}
            {/* Central Grand Spine Corridor */}
            <rect
              x="380"
              y="50"
              width="240"
              height="560"
              fill={theme.corridorFill}
            />

            {/* Galleria Subtle Marble Tile Grid */}
            <g stroke={theme.corridorTexture} strokeWidth="1">
              {[80, 140, 200, 260, 320, 380, 440, 500, 560].map(y => (
                <line key={`spine-y-${y}`} x1="380" y1={y} x2="620" y2={y} strokeDasharray="4 6" />
              ))}
              {[420, 460, 500, 540, 580].map(x => (
                <line key={`spine-x-${x}`} x1={x} y1="50" x2={x} y2="610" strokeDasharray="4 6" />
              ))}
            </g>

            {/* West Corridor Access */}
            <rect x="340" y="170" width="50" height="70" fill={theme.corridorFill} />
            <rect x="340" y="430" width="50" height="70" fill={theme.corridorFill} />

            {/* East Corridor Access */}
            <rect x="610" y="170" width="50" height="70" fill={theme.corridorFill} />
            <rect x="610" y="430" width="50" height="70" fill={theme.corridorFill} />

            {/* 3. STRUCTURAL CONCRETE PILLARS (Columns across the building) */}
            {[
              [380, 110], [500, 110], [620, 110],
              [380, 250], [500, 250], [620, 250],
              [380, 390], [500, 390], [620, 390],
              [380, 530], [500, 530], [620, 530]
            ].map(([cx, cy], idx) => (
              <rect
                key={`pillar-${idx}`}
                x={cx - 7}
                y={cy - 7}
                width="14"
                height="14"
                rx="2"
                fill={theme.pillar}
                stroke={theme.outerWall}
                strokeWidth="1.5"
              />
            ))}

            {/* 4. CENTRAL ATRIUM FEATURES (GROUND FLOOR GALLERIA) */}
            {activeFloor === 'Ground Floor' && (
              <g>
                {/* Dr. AIT Central Cafeteria & Nescafe Hub */}
                <rect
                  x="420"
                  y="80"
                  width="160"
                  height="100"
                  rx="10"
                  fill="rgba(245, 158, 11, 0.12)"
                  stroke="rgba(245, 158, 11, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text x="500" y="125" textAnchor="middle" fill={theme.textPrimary} fontSize="11" fontWeight="800">
                  DR. AIT CAFETERIA & COMMONS
                </text>
                <text x="500" y="142" textAnchor="middle" fill={theme.textSecondary} fontSize="10">
                  Student Food Court & Nescafe Hub
                </text>

                {/* Dr. B.R. Ambedkar Commemorative Foyer & Info Rotunda */}
                <circle cx="500" cy="355" r="38" fill="rgba(0, 81, 213, 0.15)" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" />
                <rect
                  x="440"
                  y="336"
                  width="120"
                  height="38"
                  rx="8"
                  fill="#0051D5"
                  stroke="#38BDF8"
                  strokeWidth="2"
                />
                <text x="500" y="353" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">
                  DR. B.R. AMBEDKAR FOYER
                </text>
                <text x="500" y="366" textAnchor="middle" fill="#7DD3FC" fontSize="9" fontWeight="700">
                  Central Helpdesk & Info Kiosk
                </text>

                {/* Dr. AIT Main Entrance Turnstiles & Security (Gate 1 - Ring Road) */}
                <rect x="420" y="585" width="160" height="28" rx="6" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
                <text x="500" y="603" textAnchor="middle" fill="#10B981" fontSize="10" fontWeight="800">
                  DR. AIT GATE 1 MAIN TURNSTILES
                </text>
              </g>
            )}

            {/* 5. INTERACTIVE VENUE ROOMS */}
            {currentRooms.map((room) => {
              const isSelected = activeDestination?.id === room.id;
              const isLive = room.status === 'Live';

              return (
                <g
                  key={room.id}
                  onClick={() => onSelectVenue(room)}
                  className="cursor-pointer group"
                >
                  {/* Room Base Polygon */}
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    rx="12"
                    fill={isSelected ? (mapTheme === 'blueprint' ? '#143861' : '#E0E7FF') : theme.roomBg}
                    stroke={isSelected ? theme.selectedBorder : theme.roomBorder}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    filter={isSelected ? 'url(#neonGlow)' : undefined}
                    className="transition-all duration-200"
                  />

                  {/* Room Code Badge (Top-Left) */}
                  <rect
                    x={room.x + 12}
                    y={room.y + 12}
                    width="68"
                    height="20"
                    rx="5"
                    fill={isSelected ? '#0051D5' : 'rgba(0,0,0,0.3)'}
                  />
                  <text
                    x={room.x + 46}
                    y={room.y + 26}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {room.code}
                  </text>

                  {/* Status Indicator (Top-Right) */}
                  <rect
                    x={room.x + room.w - 75}
                    y={room.y + 12}
                    width="62"
                    height="20"
                    rx="999"
                    fill={isLive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(100, 116, 139, 0.25)'}
                    stroke={isLive ? '#10B981' : '#64748B'}
                    strokeWidth="1"
                  />
                  <text
                    x={room.x + room.w - 44}
                    y={room.y + 26}
                    textAnchor="middle"
                    fill={isLive ? '#34D399' : theme.textSecondary}
                    fontSize="9"
                    fontWeight="800"
                  >
                    {isLive ? '● LIVE' : room.status}
                  </text>

                  {/* Room Name */}
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + (room.h > 240 ? 65 : 55)}
                    textAnchor="middle"
                    fill={theme.textPrimary}
                    fontSize="16"
                    fontWeight="800"
                  >
                    {room.name}
                  </text>

                  {/* Room Category */}
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + (room.h > 240 ? 84 : 74)}
                    textAnchor="middle"
                    fill={theme.textSecondary}
                    fontSize="11"
                    fontWeight="600"
                  >
                    {room.category}
                  </text>

                  {/* SPECIFIC INTERIOR ARCHITECTURAL GRAPHICS PER DR. AIT VENUE */}
                  {/* JPN AUDITORIUM: Stage + Curved Tiered Theater Seating */}
                  {room.id === 'ven_jpn_auditorium' && (
                    <g>
                      {/* Main Proscenium Stage */}
                      <rect x={room.x + 25} y={room.y + 100} width={room.w - 50} height="42" rx="6" fill="url(#stageGradient)" stroke="#0284C7" strokeWidth="1.5" />
                      <text x={room.x + room.w / 2} y={room.y + 126} textAnchor="middle" fill="#38BDF8" fontSize="11" fontWeight="800">
                        JPN MAIN STAGE & AV PROJECTION
                      </text>

                      {/* Tiered Seating Rows (750 Capacity) */}
                      {[155, 180, 205, 230].map((sy, rowIdx) => (
                        <path
                          key={`aud-row-${rowIdx}`}
                          d={`M ${room.x + 40} ${room.y + sy} Q ${room.x + room.w / 2} ${room.y + sy + 15} ${room.x + room.w - 40} ${room.y + sy}`}
                          fill="none"
                          stroke={isSelected ? '#38BDF8' : '#334155'}
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                        />
                      ))}
                    </g>
                  )}

                  {/* DR. AMBEDKAR CENTENARY BHAVAN: Central Library Stacks & Digital OPAC Terminals */}
                  {(room.id === 'ven_centenary_library' || room.id === 'ven_centenary_digilib' || room.id === 'ven_centenary_ref') && (
                    <g>
                      {/* Library Book Aisles & Stacks */}
                      {[100, 135, 170, 205].map((sy, bIdx) => (
                        <g key={`lib-stack-${bIdx}`}>
                          <rect x={room.x + 35} y={room.y + sy} width={room.w - 70} height="16" rx="3" fill="rgba(13, 148, 136, 0.18)" stroke="#0D9488" strokeWidth="1" />
                          <line x1={room.x + 50} y1={room.y + sy + 8} x2={room.x + room.w - 50} y2={room.y + sy + 8} stroke="#14B8A6" strokeWidth="1.5" strokeDasharray="6 3" />
                        </g>
                      ))}
                      <text x={room.x + room.w / 2} y={room.y + 112} textAnchor="middle" fill="#2DD4BF" fontSize="9" fontWeight="800">
                        {room.id === 'ven_centenary_digilib' ? 'IEEE DIGITAL VAULT & THESIS TERMINALS' : 'OPEN ACCESS BOOK STACKS & OPAC'}
                      </text>
                    </g>
                  )}

                  {/* DR. AIT INDOOR SPORTS COMPLEX: Badminton Court Markings */}
                  {room.id === 'ven_sports_complex' && (
                    <g>
                      {/* Hardwood Badminton Court */}
                      <rect x={room.x + 35} y={room.y + 90} width={room.w - 70} height="95" rx="4" fill="url(#courtGradient)" stroke="#F97316" strokeWidth="1.5" />
                      {/* Center Court Net Line */}
                      <line x1={room.x + 35} y1={room.y + 137} x2={room.x + room.w - 35} y2={room.y + 137} stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 2" />
                      {/* Service Courts */}
                      <line x1={room.x + room.w / 2} y1={room.y + 90} x2={room.x + room.w / 2} y2={room.y + 185} stroke="#F97316" strokeWidth="1.5" />
                      {/* Bleacher Rows */}
                      <line x1={room.x + 35} y1={room.y + 195} x2={room.x + room.w - 35} y2={room.y + 195} stroke="#64748B" strokeWidth="3" strokeDasharray="8 4" />
                    </g>
                  )}

                  {/* SILVER JUBILEE BUILDING (SJB): Advanced AI Workstations & Server Racks */}
                  {(room.id === 'ven_sjb_lab' || room.id === 'ven_sjb_pg') && (
                    <g>
                      {/* Workstation Pods */}
                      {[0, 1].map(col => (
                        <g key={`col-${col}`}>
                          {[100, 135, 170].map(rowY => (
                            <rect
                              key={`pod-${col}-${rowY}`}
                              x={room.x + 40 + col * 135}
                              y={room.y + rowY}
                              width="105"
                              height="22"
                              rx="4"
                              fill="rgba(56, 189, 248, 0.15)"
                              stroke="#0284C7"
                              strokeWidth="1"
                            />
                          ))}
                        </g>
                      ))}
                      {/* Server Rack Cage */}
                      <rect x={room.x + room.w - 45} y={room.y + 100} width="25" height="90" rx="3" fill="#1E293B" stroke="#38BDF8" strokeWidth="1" />
                    </g>
                  )}

                  {/* D BLOCK: VLSI Design & Embedded Test Benches */}
                  {room.id === 'ven_d_block_ece' && (
                    <g>
                      {/* Electronics Test Benches */}
                      {[100, 140, 180].map(sy => (
                        <g key={`vlsi-bench-${sy}`}>
                          <rect x={room.x + 40} y={room.y + sy} width={room.w - 80} height="20" rx="4" fill="rgba(99, 102, 241, 0.15)" stroke="#6366F1" strokeWidth="1" />
                          <circle cx={room.x + 60} cy={room.y + sy + 10} r="4" fill="#818CF8" />
                          <circle cx={room.x + 85} cy={room.y + sy + 10} r="4" fill="#A5B4FC" />
                        </g>
                      ))}
                    </g>
                  )}

                  {/* C BLOCK: Robotics Arm & CAD/CAM Simulation */}
                  {room.id === 'ven_c_block_mech' && (
                    <g>
                      {/* Robotic Arm Mount Circle */}
                      <circle cx={room.x + room.w / 2} cy={room.y + 145} r="28" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="1.5" />
                      <circle cx={room.x + room.w / 2} cy={room.y + 145} r="10" fill="#F59E0B" />
                      <line x1={room.x + room.w / 2} y1={room.y + 145} x2={room.x + room.w / 2 + 35} y2={room.y + 125} stroke="#F59E0B" strokeWidth="3" />
                      {/* CNC Simulation Stations */}
                      <rect x={room.x + 40} y={room.y + 185} width={room.w - 80} height="15" rx="3" fill="rgba(245, 158, 11, 0.1)" stroke="#F59E0B" strokeWidth="1" />
                    </g>
                  )}

                  {/* B BLOCK: Biomedical Sensors & Clinical Telemetry */}
                  {room.id === 'ven_b_block_ml' && (
                    <g>
                      {/* Biosensor Benches */}
                      {[105, 150].map(sy => (
                        <g key={`bio-bench-${sy}`}>
                          <rect x={room.x + 45} y={room.y + sy} width={room.w - 90} height="24" rx="4" fill="rgba(236, 72, 153, 0.15)" stroke="#EC4899" strokeWidth="1" />
                          <path d={`M ${room.x + 60} ${room.y + sy + 12} l 10 -6 l 10 12 l 10 -6`} fill="none" stroke="#F472B6" strokeWidth="2" />
                        </g>
                      ))}
                    </g>
                  )}

                  {/* MAIN ADMIN BLOCK: Syndicate Hall & Principal Boardroom */}
                  {room.id === 'ven_admin_syndicate' && (
                    <g>
                      <ellipse cx={room.x + room.w / 2} cy={room.y + 160} rx="90" ry="42" fill="rgba(147, 51, 234, 0.2)" stroke="#9333EA" strokeWidth="2" />
                      <text x={room.x + room.w / 2} y={room.y + 165} textAnchor="middle" fill="#C084FC" fontSize="11" fontWeight="800">
                        SYNDICATE BOARD TABLE
                      </text>
                    </g>
                  )}

                  {/* ADMIN BLOCK GROUND: Student Affairs Registry Pods */}
                  {room.id === 'ven_admin_ground' && (
                    <g>
                      {[105, 145].map(sy => (
                        <rect key={`reg-pod-${sy}`} x={room.x + 40} y={room.y + sy} width={room.w - 80} height="22" rx="4" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="1" />
                      ))}
                    </g>
                  )}

                  {/* Real-Time Live Event Pill (Bottom of Room) */}
                  <rect
                    x={room.x + 20}
                    y={room.y + room.h - 38}
                    width={room.w - 40}
                    height="26"
                    rx="6"
                    fill={isSelected ? '#0051D5' : 'rgba(0, 21, 42, 0.5)'}
                    stroke={isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.1)'}
                    strokeWidth="1"
                  />
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h - 21}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {room.currentEvent ? `📅 ${room.currentEvent.slice(0, 26)}...` : 'Available for Booking'}
                  </text>

                  {/* Architectural Door Swing Arc */}
                  <g>
                    <path
                      d={`M ${room.doorX} ${room.doorY - 18} A 18 18 0 0 1 ${room.doorX + (room.doorX > 500 ? -18 : 18)} ${room.doorY}`}
                      fill="none"
                      stroke={theme.doorArc}
                      strokeWidth="2"
                      strokeDasharray="2 2"
                    />
                    <circle cx={room.doorX} cy={room.doorY - 18} r="3" fill={theme.doorArc} />
                  </g>
                </g>
              );
            })}

            {/* 6. AMENITIES BADGES & ICONS */}
            {showAmenities && (
              <g>
                {/* West Restrooms (Men, Women, Accessible) */}
                <g transform="translate(385, 75)">
                  <rect width="32" height="45" rx="6" fill={theme.amenityBg} stroke={theme.amenityBorder} strokeWidth="1" />
                  <text x="16" y="22" textAnchor="middle" fontSize="16">🚻</text>
                  <text x="16" y="38" textAnchor="middle" fill={theme.textSecondary} fontSize="8" fontWeight="800">WC</text>
                </g>

                {/* East Restrooms */}
                <g transform="translate(585, 75)">
                  <rect width="32" height="45" rx="6" fill={theme.amenityBg} stroke={theme.amenityBorder} strokeWidth="1" />
                  <text x="16" y="22" textAnchor="middle" fontSize="16">🚻</text>
                  <text x="16" y="38" textAnchor="middle" fill={theme.textSecondary} fontSize="8" fontWeight="800">WC</text>
                </g>

                {/* West Elevators */}
                <g transform="translate(385, 270)">
                  <rect width="32" height="45" rx="6" fill={theme.amenityBg} stroke={theme.amenityBorder} strokeWidth="1" />
                  <text x="16" y="22" textAnchor="middle" fontSize="16">🛗</text>
                  <text x="16" y="38" textAnchor="middle" fill="#0284C7" fontSize="8" fontWeight="800">ELEV</text>
                </g>

                {/* East Elevators */}
                <g transform="translate(585, 270)">
                  <rect width="32" height="45" rx="6" fill={theme.amenityBg} stroke={theme.amenityBorder} strokeWidth="1" />
                  <text x="16" y="22" textAnchor="middle" fontSize="16">🛗</text>
                  <text x="16" y="38" textAnchor="middle" fill="#0284C7" fontSize="8" fontWeight="800">ELEV</text>
                </g>

                {/* Stairwell North-West */}
                <g transform="translate(35, 45)">
                  <rect width="24" height="24" rx="4" fill="#E2E8F0" fillOpacity="0.15" stroke="#94A3B8" strokeWidth="1" />
                  <text x="12" y="17" textAnchor="middle" fontSize="12">🪜</text>
                </g>

                {/* Stairwell North-East */}
                <g transform="translate(940, 45)">
                  <rect width="24" height="24" rx="4" fill="#E2E8F0" fillOpacity="0.15" stroke="#94A3B8" strokeWidth="1" />
                  <text x="12" y="17" textAnchor="middle" fontSize="12">🪜</text>
                </g>

                {/* Emergency Exits (North, South, East, West) */}
                {[
                  [500, 42, 'NORTH EXIT'],
                  [32, 330, 'WEST EXIT'],
                  [968, 330, 'EAST EXIT']
                ].map(([ex, ey, label], eIdx) => (
                  <g key={`exit-${eIdx}`} transform={`translate(${ex}, ${ey})`}>
                    <rect x="-35" y="-10" width="70" height="20" rx="4" fill="#166534" stroke="#4ADE80" strokeWidth="1.5" />
                    <text x="0" y="4" textAnchor="middle" fill="#4ADE80" fontSize="9" fontWeight="800" fontFamily="monospace">
                      🚪 {label}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* 7. ANIMATED INDOOR WAYFINDING PATH (FROM MAIN ENTRANCE TURNSTILES) */}
            {showWayfinding && wayfindingRoute && (
              <g>
                {/* Glowing Background Stroke */}
                <path
                  d={wayfindingRoute.d}
                  fill="none"
                  stroke={theme.wayfindingGlow}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.5"
                  filter="url(#neonGlow)"
                />

                {/* Animated Neon Dashed Walking Trail */}
                <path
                  d={wayfindingRoute.d}
                  fill="none"
                  stroke={theme.wayfindingPath}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="100"
                    to="0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* Starting Waypoint: Dr. AIT Main Entrance Turnstiles */}
                <g transform="translate(500, 620)">
                  <circle r="10" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle r="18" fill="none" stroke="#10B981" strokeWidth="2" strokeOpacity="0.6">
                    <animate attributeName="r" values="10;24;10" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x="0" y="24" textAnchor="middle" fill="#10B981" fontSize="10" fontWeight="800">
                    YOU ARE HERE (DR. AIT GATE 1)
                  </text>
                </g>

                {/* Destination Target Marker inside Room */}
                <g transform={`translate(${activeDestination.pathTarget.x}, ${activeDestination.pathTarget.y})`}>
                  <circle r="9" fill="#0051D5" stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle r="16" fill="none" stroke="#38BDF8" strokeWidth="2">
                    <animate attributeName="r" values="9;22;9" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <text x="0" y="-14" textAnchor="middle" fill="#38BDF8" fontSize="11" fontWeight="800">
                    TARGET: {activeDestination.name}
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Turn-by-Turn Indoor Walking Instructions Banner */}
      {showWayfinding && wayfindingRoute && activeDestination && (
        <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-white shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[24px]">directions_walk</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Dr. AIT Indoor Turn-by-Turn Wayfinding
                </span>
                <span className="text-xs text-outline">• {wayfindingRoute.distMeters} meters (~{wayfindingRoute.timeMinutes} min walk)</span>
              </div>
              <p className="text-body-md font-bold text-primary">
                Route to {activeDestination.name} ({activeFloor})
              </p>
              <p className="text-xs text-outline">
                Start at Dr. AIT Gate 1 Turnstiles &rarr; Walk past Dr. B.R. Ambedkar Foyer &rarr; Enter via corridor door {activeDestination.code}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={() => onToggleNavigation(!isNavigating)}
              className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-container text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">navigation</span>
              <span>{isNavigating ? 'End Navigation' : 'Start Live Walking Guide'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusInteriorMap;
