# Arya College of Engineering (Main Campus, Jaipur)
## College Event Management System (CEMS)

A comprehensive college web application built with **Python 3, Flask, SQLite3, and QR Code library**, with **Chart.js** analytics, tailored for **Arya College of Engineering (Main Campus, Kukas, Jaipur - RTU Kota Affiliated)**.

### Institution Details
* **College:** Arya College of Engineering (Main Campus / Arya 1st Old Campus)
* **Location:** SP-40, RIICO Industrial Area, Kukas, Jaipur, Rajasthan 302028
* **Affiliation:** Rajasthan Technical University (RTU), Kota
* **Approval:** AICTE, New Delhi | Established in 2000
* **Flagship Events:** Shrinkhla National Fest, Arya Hackathon 4.0, Arya Premier League (APL)

### Features
- **3 User Roles**: Student (RTU Roll No: `23EARCS042`), Faculty Organizer, and Principal / Administrator.
- **Registration Rules Enforced**:
  - No duplicate registrations per student per event (`UNIQUE(event_id, student_id)`).
  - Registration deadline enforcement.
  - Event capacity cap with automatic Priority Waitlist.
  - Automatic waitlist promotion when a confirmed student cancels.
- **QR Code Check-In**: Generates real QR tickets and allows organizers to scan or verify token codes.
- **Volunteer Coordination**: Create roles (e.g. Registration Desk, Lab Setup), set slot limits, and assign student volunteers.
- **Attendance & CSV Export**: Mark attendance in 1-click and download official attendee `.csv` files.
- **Participation Certificates**: Automatically unlocks official certificates upon verified check-in.
- **Analytics**: Chart.js charts for capacity fill rate and attendance turnout.

### How to Run Locally for Viva Demonstration
1. Open your terminal / command prompt:
```bash
cd backend
python3 -m venv env
# On Windows: env\Scripts\activate
# On Mac/Linux: source env/bin/activate
pip install -r requirements.txt
python app.py
```
2. The SQLite database `arya_college_events.db` will be initialized automatically on the first start.
3. Open `http://127.0.0.1:5000` in your web browser.
