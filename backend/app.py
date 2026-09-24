"""
Arya College of Engineering (Main Campus, Jaipur)
College Event Management System - Python Flask Backend
Tech Stack: Python 3, Flask, SQLite3, QR Code (qrcode, Pillow)
Affiliation: Rajasthan Technical University (RTU), Kota
"""

import sqlite3
import os
import csv
import io
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_file, Response
import qrcode

app = Flask(__name__)
app.secret_key = "arya_college_main_campus_secret_2026"
DB_NAME = "arya_college_events.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 1. Users Table (Roles: student, organizer, admin)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'organizer', 'admin')),
        roll_number TEXT,
        department TEXT,
        phone TEXT,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ''')

    # 2. Events Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Hackathon')),
        event_date DATE NOT NULL,
        event_time TEXT NOT NULL,
        venue TEXT NOT NULL,
        capacity INTEGER NOT NULL CHECK(capacity > 0),
        registration_deadline DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Draft', 'Open', 'Full', 'Closed', 'Completed')),
        banner_url TEXT,
        organizer_id INTEGER NOT NULL,
        allow_waitlist INTEGER DEFAULT 1,
        max_waitlist INTEGER DEFAULT 20,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
    );
    ''')

    # 3. Registrations Table (Prevents double registration via UNIQUE constraint)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'waitlisted', 'cancelled')),
        ticket_code TEXT UNIQUE NOT NULL,
        attended INTEGER DEFAULT 0 CHECK(attended IN (0, 1)),
        attended_at TIMESTAMP,
        certificate_id TEXT UNIQUE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(event_id, student_id)
    );
    ''')

    # 4. Volunteer Roles Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS volunteer_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        role_name TEXT NOT NULL,
        slot_limit INTEGER NOT NULL CHECK(slot_limit > 0),
        description TEXT,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
    ''')

    # 5. Volunteer Assignments Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS volunteer_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'assigned' CHECK(status IN ('assigned', 'completed', 'withdrawn')),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES volunteer_roles(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(event_id, student_id)
    );
    ''')

    # Seed initial demo accounts if empty
    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()['count'] == 0:
        cursor.execute('''
        INSERT INTO users (name, email, password, role, roll_number, department, phone) VALUES
        ('Rahul Sharma', 'rahul.23earcs042@aryacollege.in', 'pass123', 'student', '23EARCS042', 'Computer Science & Engineering', '+91 98765 43210'),
        ('Priya Rathore', 'priya.23earit108@aryacollege.in', 'pass123', 'student', '23EARIT108', 'Information Technology', '+91 98765 43211'),
        ('Rananjay Rathore', 'rananjay.rathore@aryacollege.in', 'pass123', 'organizer', NULL, 'Event Operations Head & Technical Convener', '+91 98444 55667'),
        ('Prof. Akhil Pandey', 'akhil.pandey@aryacollege.in', 'pass123', 'organizer', NULL, 'CSE Faculty & Tech Convener', '+91 98111 22334'),
        ('Dr. Himanshu Arora', 'himanshu.sir@aryacollege.in', 'admin123', 'admin', NULL, 'Principal & Main Head, Arya College of Engineering Main Campus, Jaipur', '+91 98333 44556');
        ''')

        cursor.execute('''
        INSERT INTO events (title, description, category, event_date, event_time, venue, capacity, registration_deadline, status, banner_url, organizer_id, allow_waitlist) VALUES
        ('Arya Hackathon 4.0: 24-Hour Codefest', 'Collaborative programming and building solutions in AI & Cyber Security.', 'Hackathon', '2026-10-15', '09:00 AM', 'Arya Innovation Lab, Block A, Kukas', 60, '2026-10-10', 'Open', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', 3, 1),
        ('Shrinkhla 2026: Arya Annual Tech-Cultural Fest', 'Flagship cultural and technical mega-fest with War of the Bands and Robo-Wars.', 'Cultural', '2026-10-24', '04:00 PM', 'Open Air Theater, Arya Main Campus, Kukas', 250, '2026-10-20', 'Open', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', 3, 1);
        ''')

    conn.commit()
    conn.close()

# ----------------- AUTHENTICATION -----------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role, roll_number, department, status FROM users WHERE email=? AND password=?", (email, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        if user['status'] == 'suspended':
            return jsonify({"success": False, "message": "Your account has been suspended by campus administration."}), 403
        return jsonify({"success": True, "user": dict(user)})
    return jsonify({"success": False, "message": "Invalid email or password"}), 401

# ----------------- EVENTS API -----------------
@app.route('/api/events', methods=['GET'])
def list_events():
    conn = get_db()
    cursor = conn.cursor()
    query = '''
    SELECT e.*, u.name as organizer_name,
    (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'confirmed') as confirmed_count,
    (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted') as waitlist_count
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    ORDER BY e.event_date ASC
    '''
    cursor.execute(query)
    events = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(events)

@app.route('/api/events', methods=['POST'])
def create_event():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO events (title, description, category, event_date, event_time, venue, capacity, registration_deadline, status, banner_url, organizer_id, allow_waitlist)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['title'], data['description'], data['category'], data['date'], data['time'],
        data['venue'], data['capacity'], data['registration_deadline'], 'Open',
        data.get('banner_url', ''), data['organizer_id'], 1 if data.get('allow_waitlist', True) else 0
    ))
    event_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({"success": True, "eventId": event_id})

# ----------------- REGISTRATION WITH CONSTRAINTS -----------------
@app.route('/api/register-event', methods=['POST'])
def register_event():
    data = request.json
    event_id = data.get('event_id')
    student_id = data.get('student_id')

    conn = get_db()
    cursor = conn.cursor()

    # Rule 1: No duplicate registrations
    cursor.execute("SELECT id FROM registrations WHERE event_id = ? AND student_id = ? AND status != 'cancelled'", (event_id, student_id))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Student already registered for this event."}), 400

    # Rule 2: Deadline check
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    event = cursor.fetchone()
    if not event:
        conn.close()
        return jsonify({"success": False, "message": "Event not found"}), 404

    today = datetime.now().strftime('%Y-%m-%d')
    if event['registration_deadline'] < today:
        conn.close()
        return jsonify({"success": False, "message": "Registration deadline has expired."}), 400

    # Rule 3: Capacity & Waitlist check
    cursor.execute("SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status = 'confirmed'", (event_id,))
    confirmed = cursor.fetchone()['count']

    status = 'confirmed'
    if confirmed >= event['capacity']:
        if not event['allow_waitlist']:
            conn.close()
            return jsonify({"success": False, "message": "Event capacity full and waitlist is disabled."}), 400
        status = 'waitlisted'

    ticket_code = f"TK-EVT{event_id}-STU{student_id}-{int(datetime.now().timestamp())}"
    cursor.execute('''
        INSERT INTO registrations (event_id, student_id, status, ticket_code)
        VALUES (?, ?, ?, ?)
    ''', (event_id, student_id, status, ticket_code))

    conn.commit()
    conn.close()

    msg = "Registration confirmed! QR ticket generated." if status == 'confirmed' else "Added to priority waitlist!"
    return jsonify({"success": True, "message": msg, "ticket_code": ticket_code, "status": status})

# ----------------- QR CODE IMAGE GENERATION -----------------
@app.route('/api/ticket-qr/<ticket_code>')
def generate_qr(ticket_code):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(f"COLLEGE-CHECKIN:{ticket_code}")
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")

    buf = io.BytesIO()
    img.save(buf, 'PNG')
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

# ----------------- ATTENDANCE CHECK-IN -----------------
@app.route('/api/verify-checkin', methods=['POST'])
def verify_checkin():
    data = request.json
    ticket_code = data.get('ticket_code', '').strip()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT r.id, r.status, r.attended, u.name as student_name, e.title as event_title
        FROM registrations r
        JOIN users u ON r.student_id = u.id
        JOIN events e ON r.event_id = e.id
        WHERE r.ticket_code = ?
    ''', (ticket_code,))
    reg = cursor.fetchone()

    if not reg:
        conn.close()
        return jsonify({"success": False, "message": "Invalid QR Ticket Code"}), 404

    if reg['attended'] == 1:
        conn.close()
        return jsonify({"success": False, "message": f"{reg['student_name']} is already checked in!"}), 400

    cert_id = f"CERT-{int(datetime.now().timestamp())}"
    cursor.execute('''
        UPDATE registrations
        SET attended = 1, attended_at = CURRENT_TIMESTAMP, certificate_id = ?
        WHERE id = ?
    ''', (cert_id, reg['id']))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Successfully verified check-in for {reg['student_name']}!"
    })

# ----------------- MAIN COLLEGE AUTHORITY: MULTIPLE STUDENT ENROLLMENT -----------------
@app.route('/api/admin/bulk-students', methods=['POST'])
def bulk_add_students():
    """Exclusive to Main Authority of the College (Himanshu Sir): Enroll multiple students at once."""
    data = request.json or {}
    requester_role = data.get('requester_role')
    if requester_role != 'admin':
        return jsonify({"success": False, "message": "Access Denied: Only Main College Authority (Himanshu Sir) is authorized to enroll students."}), 403

    students = data.get('students', [])
    if not students:
        return jsonify({"success": False, "message": "No student records provided"}), 400

    conn = get_db()
    cursor = conn.cursor()
    added_count = 0
    errors = []

    for idx, s in enumerate(students):
        name = s.get('name', '').strip()
        email = s.get('email', '').strip().lower()
        roll = s.get('roll_number', '').strip().upper()
        dept = s.get('department', 'Computer Science & Engineering')
        phone = s.get('phone', '+91 98765 00000')

        if not name or not email or not roll:
            errors.append(f"Row {idx+1}: Name, Roll Number, and Email are required.")
            continue

        try:
            cursor.execute('''
                INSERT INTO users (name, email, password, role, roll_number, department, phone)
                VALUES (?, ?, 'pass123', 'student', ?, ?, ?)
            ''', (name, email, roll, dept, phone))
            added_count += 1
        except sqlite3.IntegrityError:
            errors.append(f"Row {idx+1} ({name}): Roll '{roll}' or email '{email}' already registered.")

    conn.commit()
    conn.close()
    return jsonify({
        "success": True,
        "added_count": added_count,
        "errors": errors,
        "message": f"Main Authority enrolled {added_count} student(s) into Arya College records."
    })

# ----------------- CSV ATTENDEE EXPORT -----------------
@app.route('/api/export-attendees/<int:event_id>')
def export_attendees(event_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT r.id, u.name, u.roll_number, u.email, u.department, r.status, r.ticket_code, r.attended, r.attended_at
        FROM registrations r
        JOIN users u ON r.student_id = u.id
        WHERE r.event_id = ?
    ''', (event_id,))
    rows = cursor.fetchall()
    conn.close()

    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['Registration ID', 'Student Name', 'Roll Number', 'Email', 'Department', 'Status', 'Ticket Code', 'Attended', 'Check-in Time'])
    for row in rows:
        cw.writerow([row['id'], row['name'], row['roll_number'], row['email'], row['department'], row['status'], row['ticket_code'], 'Yes' if row['attended'] else 'No', row['attended_at'] or 'N/A'])

    output = si.getvalue()
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename=event_{event_id}_attendees.csv"}
    )

if __name__ == '__main__':
    init_db()
    print("College Event Management System Flask Backend running at http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
