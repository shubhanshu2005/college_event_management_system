import { CollegeEvent, User, Registration, VolunteerAssignment, AuditLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_student_1',
    name: 'Rahul Sharma',
    email: 'rahul.23earcs042@aryacollege.in',
    role: 'student',
    rollNumber: '23EARCS042',
    department: 'Computer Science & Engineering (CSE)',
    phone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-15'
  },
  {
    id: 'usr_student_2',
    name: 'Priya Rathore',
    email: 'priya.23earit108@aryacollege.in',
    role: 'student',
    rollNumber: '23EARIT108',
    department: 'Information Technology (IT)',
    phone: '+91 98765 43211',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-18'
  },
  {
    id: 'usr_student_3',
    name: 'Aman Meena',
    email: 'aman.23earec019@aryacollege.in',
    role: 'student',
    rollNumber: '23EAREC019',
    department: 'Electronics & Communication (ECE)',
    phone: '+91 98765 43212',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-01'
  },
  {
    id: 'usr_organizer_1',
    name: 'Rananjay Rathore',
    email: 'rananjay.rathore@aryacollege.in',
    role: 'organizer',
    department: 'Event Operations Head & Technical Convener, Arya Main Campus',
    phone: '+91 98444 55667',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2025-10-15'
  },
  {
    id: 'usr_organizer_2',
    name: 'Prof. Akhil Pandey',
    email: 'akhil.pandey@aryacollege.in',
    role: 'organizer',
    department: 'Convener, Tech Club & CSE Faculty, Arya Main Campus',
    phone: '+91 98111 22334',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2025-11-10'
  },
  {
    id: 'usr_organizer_3',
    name: 'Dr. Prabhat Parashar',
    email: 'prabhat.parashar@aryacollege.in',
    role: 'organizer',
    department: 'Head, Cultural Committee & Student Affairs, Arya Main Campus',
    phone: '+91 98222 33445',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2025-12-05'
  },
  {
    id: 'usr_admin_1',
    name: 'Dr. Himanshu Arora (Himanshu Sir)',
    email: 'himanshu.sir@aryacollege.in',
    role: 'admin',
    department: 'Principal & Main Head, Arya College of Engineering Main Campus, Jaipur',
    phone: '+91 98333 44556',
    avatarUrl: '/images.jpg',
    status: 'active',
    createdAt: '2025-08-01'
  }
];

export const INITIAL_EVENTS: CollegeEvent[] = [
  {
    id: 'evt_tech_01',
    title: 'Arya Hackathon 4.0: 24-Hour Codefest',
    description: 'The annual flagship hackathon of Arya College of Engineering Main Campus, Kukas, Jaipur. Collaborate with top minds from RTU affiliated colleges to build innovative software & hardware prototypes in AI, Green Energy, Smart Agriculture, and Cyber Defense. Mentorship from alumni working in top MNCs, free food, and cash prizes worth ₹1,00,000!',
    category: 'Hackathon',
    date: '2026-10-15',
    time: '09:00 AM',
    venue: 'Arya Center of Excellence & Innovation Lab, Block A, Main Campus, Kukas',
    capacity: 60,
    registrationDeadline: '2026-10-10',
    status: 'Open',
    bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    organizerId: 'usr_organizer_1',
    organizerName: 'Rananjay Rathore',
    allowWaitlist: true,
    maxWaitlist: 20,
    createdAt: '2026-09-01',
    volunteerRoles: [
      { id: 'v_role_1', title: 'Registration & QR Check-in Desk', slots: 4, filled: 2, description: 'Verify student RTU ID cards, scan QR entry passes, and issue hacker badges.' },
      { id: 'v_role_2', title: 'Technical Lab & Wi-Fi Support', slots: 3, filled: 1, description: 'Assist teams with high-speed campus LAN/Wi-Fi and power strips.' },
      { id: 'v_role_3', title: 'Hospitality & Midnight Refreshments', slots: 5, filled: 3, description: 'Coordinate snacks, midnight coffee, and guest mentor hospitality.' }
    ]
  },
  {
    id: 'evt_cult_02',
    title: 'Shrinkhla 2026: Arya Annual National Tech-Cultural Fest',
    description: 'Arya Main Campus\'s most celebrated annual mega-extravaganza! Featuring War of the Bands, Classical & Western Fusion Dance, Robo-War, Nukkad Natak, Fashion Show, Standup Comedy, and a sensational Celebrity Star Night at the Open Air Theater. Open to all branches and RTU universities.',
    category: 'Cultural',
    date: '2026-10-24',
    time: '04:00 PM',
    venue: 'Open Air Amphitheater (OAT), Arya Main Campus, Kukas, Jaipur',
    capacity: 250,
    registrationDeadline: '2026-10-20',
    status: 'Open',
    bannerImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    organizerId: 'usr_organizer_2',
    organizerName: 'Dr. Prabhat Parashar',
    allowWaitlist: true,
    maxWaitlist: 50,
    createdAt: '2026-08-28',
    volunteerRoles: [
      { id: 'v_role_6', title: 'Main Gate & Pass Verification', slots: 10, filled: 6, description: 'Scan entry QR passes and manage orderly student queues.' },
      { id: 'v_role_7', title: 'Backstage & Celebrity Coordination', slots: 4, filled: 2, description: 'Assist guest artists, stage lighting, and sound transitions.' }
    ]
  },
  {
    id: 'evt_work_03',
    title: 'RTU Sponsored Workshop on Generative AI & Edge Robotics',
    description: 'An intensive hands-on workshop organized by the Department of Computer Science & Engineering, Arya College of Engineering (Main Campus). Learn prompt engineering, autonomous robotics control with ROS, and edge AI deployment. Industry verified certificate awarded upon lab assignment completion.',
    category: 'Workshop',
    date: '2026-10-04',
    time: '10:30 AM',
    venue: 'Dr. S. Radhakrishnan Auditorium, Arya Main Campus, Jaipur',
    capacity: 45,
    registrationDeadline: '2026-10-02',
    status: 'Open',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    organizerId: 'usr_organizer_1',
    organizerName: 'Prof. Akhil Pandey',
    allowWaitlist: true,
    maxWaitlist: 15,
    createdAt: '2026-09-10',
    volunteerRoles: [
      { id: 'v_role_4', title: 'Computer Lab Coordinator', slots: 2, filled: 1, description: 'Ensure lab systems have Python, PyTorch & ROS pre-installed.' },
      { id: 'v_role_5', title: 'Q&A Mic Runner', slots: 2, filled: 1, description: 'Manage student question queue during expert keynote.' }
    ]
  },
  {
    id: 'evt_sport_04',
    title: 'Arya Premier League (APL 2026) Cricket Championship',
    description: 'The inter-departmental 10-over tennis ball cricket tournament between CSE, IT, ECE, Mechanical, Civil, and AI & DS branches of Arya Main Campus. Official trophies, medals, and Best Batsman/Bowler trophies sponsored by Arya Sports Council.',
    category: 'Sports',
    date: '2026-11-05',
    time: '08:30 AM',
    venue: 'Arya Sports Complex & Cricket Ground, Kukas, Jaipur',
    capacity: 120,
    registrationDeadline: '2026-10-30',
    status: 'Open',
    bannerImage: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3ce?w=800&auto=format&fit=crop&q=80',
    organizerId: 'usr_organizer_2',
    organizerName: 'Dr. Prabhat Parashar',
    allowWaitlist: false,
    createdAt: '2026-09-12',
    volunteerRoles: [
      { id: 'v_role_9', title: 'Scorekeeper & Ground Incharge', slots: 4, filled: 2, description: 'Digital scoreboard operation and match ball coordination.' },
      { id: 'v_role_10', title: 'First Aid & Hydration Station', slots: 4, filled: 2, description: 'Provide glucose drinks, ice packs, and first aid assistance.' }
    ]
  },
  {
    id: 'evt_sem_05',
    title: 'National Conference on Cyber Defense & Ethical Hacking (NCCD 2026)',
    description: 'Distinguished technical seminar featuring guest cybersecurity architects from CERT-In and top technology firms. Covers offensive vulnerability exploitation, zero-trust cloud architecture, and career paths in cyber forensics. Includes live Capture-The-Flag (CTF) tournament.',
    category: 'Seminar',
    date: '2026-10-18',
    time: '02:00 PM',
    venue: 'Arya Seminar Hall 1, Academic Block C, Main Campus',
    capacity: 80,
    registrationDeadline: '2026-10-16',
    status: 'Open',
    bannerImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    organizerId: 'usr_organizer_1',
    organizerName: 'Prof. Akhil Pandey',
    allowWaitlist: true,
    maxWaitlist: 20,
    createdAt: '2026-09-05',
    volunteerRoles: [
      { id: 'v_role_8', title: 'Delegate Registration Incharge', slots: 3, filled: 1, description: 'Verify registration IDs and distribute seminar delegate kits.' }
    ]
  },
  {
    id: 'evt_past_06',
    title: 'Freshers\' Orientation & Induction Ceremony 2026',
    description: 'Inaugural orientation for the 2026-2030 B.Tech batch at Arya College of Engineering Main Campus. Keynote by Main Head Himanshu Sir, departmental roadmaps, student club exhibits, and campus tour.',
    category: 'Seminar',
    date: '2026-09-02',
    time: '10:00 AM',
    venue: 'Dr. S. Radhakrishnan Auditorium, Arya Main Campus, Jaipur',
    capacity: 300,
    registrationDeadline: '2026-09-01',
    status: 'Completed',
    bannerImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
    organizerId: 'usr_organizer_1',
    organizerName: 'Prof. Akhil Pandey',
    allowWaitlist: false,
    createdAt: '2026-08-15',
    volunteerRoles: []
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg_001',
    eventId: 'evt_tech_01',
    eventTitle: 'Arya Hackathon 4.0: 24-Hour Codefest',
    eventDate: '2026-10-15',
    eventTime: '09:00 AM',
    eventVenue: 'Arya Center of Excellence & Innovation Lab, Block A',
    studentId: 'usr_student_1',
    studentName: 'Rahul Sharma',
    studentEmail: 'rahul.23earcs042@aryacollege.in',
    studentRoll: '23EARCS042',
    studentDept: 'Computer Science & Engineering (CSE)',
    registeredAt: '2026-09-15 14:20:00',
    status: 'confirmed',
    ticketCode: 'TK-ARYA-CS042-9841',
    attended: false,
    certificateIssued: false
  },
  {
    id: 'reg_002',
    eventId: 'evt_work_03',
    eventTitle: 'RTU Sponsored Workshop on Generative AI & Edge Robotics',
    eventDate: '2026-10-04',
    eventTime: '10:30 AM',
    eventVenue: 'Dr. S. Radhakrishnan Auditorium, Arya Main Campus',
    studentId: 'usr_student_1',
    studentName: 'Rahul Sharma',
    studentEmail: 'rahul.23earcs042@aryacollege.in',
    studentRoll: '23EARCS042',
    studentDept: 'Computer Science & Engineering (CSE)',
    registeredAt: '2026-09-18 10:15:00',
    status: 'confirmed',
    ticketCode: 'TK-ARYA-CS042-4421',
    attended: true,
    attendedAt: '2026-10-04 10:55:00',
    certificateIssued: true,
    certificateId: 'CERT-ARYA-AI26-042'
  },
  {
    id: 'reg_003',
    eventId: 'evt_past_06',
    eventTitle: 'Freshers\' Orientation & Induction Ceremony 2026',
    eventDate: '2026-09-02',
    eventTime: '10:00 AM',
    eventVenue: 'Dr. S. Radhakrishnan Auditorium, Arya Main Campus',
    studentId: 'usr_student_1',
    studentName: 'Rahul Sharma',
    studentEmail: 'rahul.23earcs042@aryacollege.in',
    studentRoll: '23EARCS042',
    studentDept: 'Computer Science & Engineering (CSE)',
    registeredAt: '2026-08-25 09:30:00',
    status: 'confirmed',
    ticketCode: 'TK-ARYA-CS042-1102',
    attended: true,
    attendedAt: '2026-09-02 09:45:00',
    certificateIssued: true,
    certificateId: 'CERT-ARYA-ORI26-904'
  },
  {
    id: 'reg_004',
    eventId: 'evt_tech_01',
    eventTitle: 'Arya Hackathon 4.0: 24-Hour Codefest',
    eventDate: '2026-10-15',
    eventTime: '09:00 AM',
    eventVenue: 'Arya Center of Excellence & Innovation Lab, Block A',
    studentId: 'usr_student_2',
    studentName: 'Priya Rathore',
    studentEmail: 'priya.23earit108@aryacollege.in',
    studentRoll: '23EARIT108',
    studentDept: 'Information Technology (IT)',
    registeredAt: '2026-09-16 11:45:00',
    status: 'confirmed',
    ticketCode: 'TK-ARYA-IT108-7732',
    attended: false,
    certificateIssued: false
  },
  {
    id: 'reg_005',
    eventId: 'evt_cult_02',
    eventTitle: 'Shrinkhla 2026: Arya Annual National Tech-Cultural Fest',
    eventDate: '2026-10-24',
    eventTime: '04:00 PM',
    eventVenue: 'Open Air Amphitheater (OAT), Arya Main Campus',
    studentId: 'usr_student_3',
    studentName: 'Aman Meena',
    studentEmail: 'aman.23earec019@aryacollege.in',
    studentRoll: '23EAREC019',
    studentDept: 'Electronics & Communication (ECE)',
    registeredAt: '2026-09-20 16:30:00',
    status: 'confirmed',
    ticketCode: 'TK-ARYA-EC019-5519',
    attended: false,
    certificateIssued: false
  }
];

export const INITIAL_VOLUNTEER_ASSIGNMENTS: VolunteerAssignment[] = [
  {
    id: 'vasg_01',
    eventId: 'evt_tech_01',
    roleId: 'v_role_1',
    roleTitle: 'Registration & QR Check-in Desk',
    studentId: 'usr_student_2',
    studentName: 'Priya Rathore',
    studentEmail: 'priya.23earit108@aryacollege.in',
    studentRoll: '23EARIT108',
    assignedAt: '2026-09-18',
    status: 'assigned'
  },
  {
    id: 'vasg_02',
    eventId: 'evt_work_03',
    roleId: 'v_role_4',
    roleTitle: 'Computer Lab Coordinator',
    studentId: 'usr_student_3',
    studentName: 'Aman Meena',
    studentEmail: 'aman.23earec019@aryacollege.in',
    studentRoll: '23EAREC019',
    assignedAt: '2026-09-21',
    status: 'assigned'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    action: 'Event Created',
    performedBy: 'Rananjay Rathore',
    details: 'Created event "Arya Hackathon 4.0: 24-Hour Codefest" with capacity 60',
    timestamp: '2026-09-01 10:00:00',
    category: 'event'
  },
  {
    id: 'log_02',
    action: 'Student Registered',
    performedBy: 'Rahul Sharma',
    details: 'Registered for "Arya Hackathon 4.0", Pass TK-ARYA-CS042-9841 generated',
    timestamp: '2026-09-15 14:20:00',
    category: 'registration'
  },
  {
    id: 'log_03',
    action: 'QR Check-in Verified',
    performedBy: 'Prof. Akhil Pandey',
    details: 'QR Check-in validated for Rahul Sharma (23EARCS042) in RTU Workshop',
    timestamp: '2026-10-04 10:55:00',
    category: 'attendance'
  }
];
