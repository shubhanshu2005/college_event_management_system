import {
  CollegeEvent,
  User,
  Registration,
  VolunteerAssignment,
  AuditLog,
  VolunteerRole,
  EventStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_VOLUNTEER_ASSIGNMENTS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'arya_cems_users_v4',
  EVENTS: 'arya_cems_events_v4',
  REGISTRATIONS: 'arya_cems_registrations_v4',
  VOLUNTEERS: 'arya_cems_volunteers_v4',
  AUDIT_LOGS: 'arya_cems_audit_logs_v4',
  CURRENT_USER: 'arya_cems_current_user_v4'
};

class StorageService {
  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    } else {
      // Ensure Dr. Himanshu Arora's official image is synced in existing storage
      const users = this.getUsers();
      const admin = users.find((u) => u.id === 'usr_admin_1');
      if (admin) {
        admin.name = 'Dr. Himanshu Arora (Himanshu Sir)';
        admin.avatarUrl = '/images.jpg';
        admin.department = 'Principal & Main Head, Arya College of Engineering Main Campus, Jaipur';
        this.set(STORAGE_KEYS.USERS, users);
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      this.set(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
      this.set(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VOLUNTEERS)) {
      this.set(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEER_ASSIGNMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.set(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to Rahul Sharma (Student) for initial view
      this.set(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    } else {
      const cur = this.get<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
      if (cur.id === 'usr_admin_1') {
        cur.name = 'Dr. Himanshu Arora (Himanshu Sir)';
        cur.avatarUrl = '/images.jpg';
        cur.department = 'Principal & Main Head, Arya College of Engineering Main Campus, Jaipur';
        this.set(STORAGE_KEYS.CURRENT_USER, cur);
      }
    }
  }

  resetToDefaults(): void {
    this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.set(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    this.set(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    this.set(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEER_ASSIGNMENTS);
    this.set(STORAGE_KEYS.AUDIT_LOGS, [
      ...INITIAL_AUDIT_LOGS,
      {
        id: 'log_' + Date.now(),
        action: 'System Reset',
        performedBy: 'System Administrator',
        details: 'Database restored to viva demonstration defaults',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        category: 'admin'
      }
    ]);
    this.set(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  // --- Auth & Users ---
  getCurrentUser(): User {
    this.init();
    return this.get<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  setCurrentUser(user: User): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
    this.logAction('User Switched/Login', user.name, `Active session set to ${user.name} (${user.role})`, 'auth');
  }

  getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: 'usr_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    this.set(STORAGE_KEYS.USERS, users);
    this.logAction('User Registered', newUser.name, `New ${newUser.role} account created for ${newUser.email}`, 'admin');
    return newUser;
  }

  bulkAddStudents(
    students: Array<{
      name: string;
      email: string;
      rollNumber: string;
      department: string;
      phone?: string;
    }>,
    authorizedBy: string
  ): { addedCount: number; errors: string[] } {
    const users = this.getUsers();
    const existingEmails = new Set(users.map((u) => u.email.toLowerCase()));
    const existingRolls = new Set(
      users.filter((u) => u.rollNumber).map((u) => u.rollNumber!.toUpperCase())
    );

    let addedCount = 0;
    const errors: string[] = [];

    students.forEach((s, idx) => {
      const trimmedName = s.name.trim();
      const trimmedEmail = s.email.trim().toLowerCase();
      const trimmedRoll = s.rollNumber.trim().toUpperCase();

      if (!trimmedName || !trimmedEmail || !trimmedRoll) {
        errors.push(`Row ${idx + 1}: Name, Roll Number, and Email are required.`);
        return;
      }

      if (existingEmails.has(trimmedEmail)) {
        errors.push(`Row ${idx + 1} (${trimmedName}): Email "${trimmedEmail}" already exists.`);
        return;
      }

      if (existingRolls.has(trimmedRoll)) {
        errors.push(`Row ${idx + 1} (${trimmedName}): Roll Number "${trimmedRoll}" already registered.`);
        return;
      }

      const newUser: User = {
        id: 'usr_stu_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '_' + idx,
        name: trimmedName,
        email: trimmedEmail,
        rollNumber: trimmedRoll,
        department: s.department.trim() || 'Computer Science & Engineering',
        phone: s.phone?.trim() || '+91 98765 00000',
        role: 'student',
        status: 'active',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
        createdAt: new Date().toISOString().split('T')[0]
      };

      users.push(newUser);
      existingEmails.add(trimmedEmail);
      existingRolls.add(trimmedRoll);
      addedCount++;
    });

    if (addedCount > 0) {
      this.set(STORAGE_KEYS.USERS, users);
      this.logAction(
        'Bulk Student Enrollment',
        authorizedBy,
        `Main Authority successfully enrolled ${addedCount} student(s) into college directory`,
        'admin'
      );
    }

    return { addedCount, errors };
  }

  updateUserStatus(userId: string, status: 'active' | 'suspended'): void {
    const users = this.getUsers().map(u => u.id === userId ? { ...u, status } : u);
    this.set(STORAGE_KEYS.USERS, users);
    this.logAction('User Status Changed', 'Admin', `User ${userId} status updated to ${status}`, 'admin');
  }

  deleteUser(userId: string): void {
    const users = this.getUsers().filter(u => u.id !== userId);
    this.set(STORAGE_KEYS.USERS, users);
    this.logAction('User Deleted', 'Admin', `User ${userId} permanently removed`, 'admin');
  }

  // --- Events ---
  getEvents(): CollegeEvent[] {
    return this.get<CollegeEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }

  getEventById(eventId: string): CollegeEvent | undefined {
    return this.getEvents().find(e => e.id === eventId);
  }

  createEvent(eventData: Omit<CollegeEvent, 'id' | 'createdAt' | 'volunteerRoles'>): CollegeEvent {
    const events = this.getEvents();
    const newEvent: CollegeEvent = {
      ...eventData,
      id: 'evt_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      volunteerRoles: [
        {
          id: 'v_role_' + Date.now() + '_1',
          title: 'Registration & Check-in Desk',
          slots: 4,
          filled: 0,
          description: 'Assist with attendee check-ins and pass scanning'
        },
        {
          id: 'v_role_' + Date.now() + '_2',
          title: 'Technical Support & Venue Help',
          slots: 2,
          filled: 0,
          description: 'Assist audio/visual, stage setup, and coordination'
        }
      ]
    };

    events.unshift(newEvent);
    this.set(STORAGE_KEYS.EVENTS, events);
    this.logAction('Event Created', eventData.organizerName, `Created event "${newEvent.title}"`, 'event');
    return newEvent;
  }

  updateEvent(eventId: string, updates: Partial<CollegeEvent>): CollegeEvent {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === eventId);
    if (index === -1) throw new Error('Event not found');

    const updated = { ...events[index], ...updates };
    events[index] = updated;
    this.set(STORAGE_KEYS.EVENTS, events);
    this.logAction('Event Updated', updated.organizerName, `Updated event "${updated.title}"`, 'event');
    return updated;
  }

  deleteEvent(eventId: string): void {
    const events = this.getEvents().filter(e => e.id !== eventId);
    this.set(STORAGE_KEYS.EVENTS, events);
    this.logAction('Event Deleted', 'Organizer/Admin', `Event ID ${eventId} deleted`, 'event');
  }

  updateEventStatus(eventId: string, newStatus: EventStatus): void {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (event) {
      event.status = newStatus;
      this.set(STORAGE_KEYS.EVENTS, events);
      this.logAction('Event Status Change', event.organizerName, `Event "${event.title}" marked as ${newStatus}`, 'event');
    }
  }

  // --- Registrations ---
  getRegistrations(): Registration[] {
    return this.get<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
  }

  getStudentRegistrations(studentId: string): Registration[] {
    return this.getRegistrations().filter(r => r.studentId === studentId);
  }

  getEventRegistrations(eventId: string): Registration[] {
    return this.getRegistrations().filter(r => r.eventId === eventId);
  }

  registerForEvent(
    event: CollegeEvent,
    student: User
  ): { success: boolean; message: string; registration?: Registration } {
    const registrations = this.getRegistrations();

    // 1. Rule: Student cannot register twice for same event
    const existing = registrations.find(
      r => r.eventId === event.id && r.studentId === student.id && r.status !== 'cancelled'
    );
    if (existing) {
      return {
        success: false,
        message: 'You have already registered for this event!'
      };
    }

    // 2. Rule: Deadline enforcement
    const today = new Date().toISOString().split('T')[0];
    if (event.registrationDeadline < today) {
      return {
        success: false,
        message: `Registration deadline (${event.registrationDeadline}) has already passed.`
      };
    }

    // 3. Rule: Check event status
    if (event.status === 'Closed' || event.status === 'Completed') {
      return {
        success: false,
        message: `This event is currently marked as ${event.status}. Registrations are closed.`
      };
    }

    // 4. Rule: Capacity & Waitlist check
    const confirmedCount = registrations.filter(
      r => r.eventId === event.id && r.status === 'confirmed'
    ).length;

    let status: 'confirmed' | 'waitlisted' = 'confirmed';
    if (confirmedCount >= event.capacity) {
      if (!event.allowWaitlist) {
        return {
          success: false,
          message: 'Sorry, this event has reached maximum capacity and waitlisting is not enabled.'
        };
      }

      const waitlistCount = registrations.filter(
        r => r.eventId === event.id && r.status === 'waitlisted'
      ).length;

      const maxWait = event.maxWaitlist || 20;
      if (waitlistCount >= maxWait) {
        return {
          success: false,
          message: 'The waitlist for this event is also completely full.'
        };
      }

      status = 'waitlisted';
    }

    // Generate unique verification ticket token
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const shortEvent = event.title.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'EVT');
    const rollShort = (student.rollNumber || 'STU').replace(/[^a-zA-Z0-9]/g, '').slice(-4);
    const ticketCode = `TK-${shortEvent}-${rollShort}-${randomSuffix}`;

    const newReg: Registration = {
      id: 'reg_' + Date.now(),
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentRoll: student.rollNumber || 'N/A',
      studentDept: student.department || 'General',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status,
      ticketCode,
      attended: false,
      certificateIssued: false
    };

    registrations.push(newReg);
    this.set(STORAGE_KEYS.REGISTRATIONS, registrations);

    // Auto update event status to 'Full' if capacity reached and no waitlist
    if (status === 'confirmed' && confirmedCount + 1 >= event.capacity && !event.allowWaitlist) {
      this.updateEventStatus(event.id, 'Full');
    }

    const msg = status === 'confirmed'
      ? 'Registration confirmed! Your QR ticket is ready.'
      : 'Event is currently full. You have been added to the Priority Waitlist!';

    this.logAction(
      status === 'confirmed' ? 'Registration Confirmed' : 'Waitlist Joined',
      student.name,
      `${student.name} (${student.rollNumber || 'N/A'}) registered for "${event.title}" [${status.toUpperCase()}]`,
      'registration'
    );

    return {
      success: true,
      message: msg,
      registration: newReg
    };
  }

  cancelRegistration(registrationId: string): { success: boolean; message: string } {
    const registrations = this.getRegistrations();
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return { success: false, message: 'Registration not found' };

    const wasConfirmed = reg.status === 'confirmed';
    reg.status = 'cancelled';
    this.set(STORAGE_KEYS.REGISTRATIONS, registrations);

    // If a confirmed student cancelled, auto-promote first waitlisted student!
    if (wasConfirmed) {
      const waitlisted = registrations.find(
        r => r.eventId === reg.eventId && r.status === 'waitlisted'
      );
      if (waitlisted) {
        waitlisted.status = 'confirmed';
        this.set(STORAGE_KEYS.REGISTRATIONS, registrations);
        this.logAction(
          'Waitlist Auto-Promoted',
          'System Automated',
          `Student ${waitlisted.studentName} automatically promoted from waitlist to confirmed for event ${waitlisted.eventTitle}`,
          'registration'
        );
      }
    }

    this.logAction('Registration Cancelled', reg.studentName, `Cancelled registration for "${reg.eventTitle}"`, 'registration');
    return { success: true, message: 'Registration successfully cancelled.' };
  }

  // --- Attendance Management ---
  markAttendance(
    registrationId: string,
    attended: boolean,
    markedBy: string
  ): { success: boolean; message: string; registration?: Registration } {
    const registrations = this.getRegistrations();
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return { success: false, message: 'Attendee record not found' };

    reg.attended = attended;
    if (attended) {
      reg.attendedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      reg.certificateIssued = true;
      reg.certificateId = `CERT-${reg.eventTitle.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
      reg.attendedAt = undefined;
      reg.certificateIssued = false;
      reg.certificateId = undefined;
    }

    this.set(STORAGE_KEYS.REGISTRATIONS, registrations);
    this.logAction(
      'Attendance Marked',
      markedBy,
      `${reg.studentName} marked as ${attended ? 'PRESENT' : 'ABSENT'} for "${reg.eventTitle}"`,
      'attendance'
    );

    return {
      success: true,
      message: `${reg.studentName} attendance updated to ${attended ? 'Present' : 'Absent'}!`,
      registration: reg
    };
  }

  verifyTicketCode(ticketCode: string, markedBy: string): { success: boolean; message: string; registration?: Registration } {
    const registrations = this.getRegistrations();
    const reg = registrations.find(
      r => r.ticketCode.trim().toUpperCase() === ticketCode.trim().toUpperCase()
    );

    if (!reg) {
      return {
        success: false,
        message: 'Invalid Ticket Code. No matching registration found in database.'
      };
    }

    if (reg.status !== 'confirmed') {
      return {
        success: false,
        message: `Cannot check-in. Ticket is marked as "${reg.status.toUpperCase()}".`
      };
    }

    if (reg.attended) {
      return {
        success: false,
        message: `Already Checked-In! ${reg.studentName} was checked in on ${reg.attendedAt}.`,
        registration: reg
      };
    }

    return this.markAttendance(reg.id, true, markedBy);
  }

  // --- Volunteer Management ---
  getVolunteerAssignments(eventId?: string): VolunteerAssignment[] {
    const list = this.get<VolunteerAssignment[]>(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEER_ASSIGNMENTS);
    if (eventId) {
      return list.filter(v => v.eventId === eventId);
    }
    return list;
  }

  addVolunteerRole(eventId: string, title: string, slots: number, description: string): CollegeEvent {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const newRole: VolunteerRole = {
      id: 'v_role_' + Date.now(),
      title,
      slots,
      filled: 0,
      description
    };

    event.volunteerRoles = [...(event.volunteerRoles || []), newRole];
    this.set(STORAGE_KEYS.EVENTS, events);
    this.logAction('Volunteer Role Created', event.organizerName, `Created volunteer role "${title}" for event "${event.title}"`, 'event');
    return event;
  }

  assignVolunteer(
    eventId: string,
    roleId: string,
    student: User,
    assignedBy: string
  ): { success: boolean; message: string; assignment?: VolunteerAssignment } {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Event not found' };

    const role = event.volunteerRoles?.find(r => r.id === roleId);
    if (!role) return { success: false, message: 'Volunteer role not found' };

    const existingAssignments = this.getVolunteerAssignments(eventId);
    if (existingAssignments.some(v => v.studentId === student.id && v.status === 'assigned')) {
      return { success: false, message: 'Student is already assigned to a volunteer role in this event.' };
    }

    if (role.filled >= role.slots) {
      return { success: false, message: `All ${role.slots} slots for this role are already filled.` };
    }

    const newAssignment: VolunteerAssignment = {
      id: 'vasg_' + Date.now(),
      eventId,
      roleId,
      roleTitle: role.title,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentRoll: student.rollNumber || 'N/A',
      assignedAt: new Date().toISOString().split('T')[0],
      status: 'assigned'
    };

    role.filled += 1;
    this.set(STORAGE_KEYS.EVENTS, events);

    const allAssignments = this.getVolunteerAssignments();
    allAssignments.push(newAssignment);
    this.set(STORAGE_KEYS.VOLUNTEERS, allAssignments);

    this.logAction('Volunteer Assigned', assignedBy, `Assigned ${student.name} to role "${role.title}" for "${event.title}"`, 'event');
    return { success: true, message: `Successfully assigned ${student.name} to ${role.title}!`, assignment: newAssignment };
  }

  removeVolunteer(assignmentId: string, removedBy: string): { success: boolean; message: string } {
    const assignments = this.getVolunteerAssignments();
    const target = assignments.find(a => a.id === assignmentId);
    if (!target) return { success: false, message: 'Assignment not found' };

    const updatedAssignments = assignments.filter(a => a.id !== assignmentId);
    this.set(STORAGE_KEYS.VOLUNTEERS, updatedAssignments);

    // Decrement filled count in event
    const events = this.getEvents();
    const event = events.find(e => e.id === target.eventId);
    if (event) {
      const role = event.volunteerRoles?.find(r => r.id === target.roleId);
      if (role && role.filled > 0) {
        role.filled -= 1;
        this.set(STORAGE_KEYS.EVENTS, events);
      }
    }

    this.logAction('Volunteer Removed', removedBy, `Unassigned ${target.studentName} from "${target.roleTitle}"`, 'event');
    return { success: true, message: 'Volunteer removed successfully.' };
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  private logAction(
    action: string,
    performedBy: string,
    details: string,
    category: AuditLog['category']
  ): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + Math.floor(Math.random() * 100),
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      category
    };
    logs.unshift(newLog);
    // Keep last 150 logs
    if (logs.length > 150) logs.pop();
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs);
  }
}

export const storage = new StorageService();
