export type Role = 'student' | 'organizer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  rollNumber?: string;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export type EventCategory = 'Technical' | 'Cultural' | 'Sports' | 'Workshop' | 'Seminar' | 'Hackathon';

export type EventStatus = 'Draft' | 'Open' | 'Full' | 'Closed' | 'Completed';

export interface VolunteerRole {
  id: string;
  title: string;
  slots: number;
  filled: number;
  description: string;
}

export interface VolunteerAssignment {
  id: string;
  eventId: string;
  roleId: string;
  roleTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRoll: string;
  assignedAt: string;
  status: 'assigned' | 'completed' | 'withdrawn';
}

export interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  venue: string;
  capacity: number;
  registrationDeadline: string; // YYYY-MM-DD
  status: EventStatus;
  bannerImage: string;
  organizerId: string;
  organizerName: string;
  allowWaitlist: boolean;
  maxWaitlist?: number;
  createdAt: string;
  volunteerRoles: VolunteerRole[];
}

export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled';

export interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRoll: string;
  studentDept: string;
  registeredAt: string;
  status: RegistrationStatus;
  ticketCode: string; // QR code payload
  attended: boolean;
  attendedAt?: string;
  certificateIssued: boolean;
  certificateId?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
  category: 'auth' | 'event' | 'registration' | 'attendance' | 'admin';
}
