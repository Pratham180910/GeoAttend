# GeoAttend — QR-Based Geo-Tagged Attendance Management System

GeoAttend is a full-stack web application for managing event attendance using QR code scanning and geolocation verification.

The system allows organizers to create events and generate unique QR codes for attendance sessions. Attendees scan the QR code using their device, provide their location through the browser's Geolocation API, and can submit attendance only when they are within the configured geofence radius of the event venue.

The application uses React for the frontend and Supabase for authentication, database storage, and Row Level Security.

---

## Objective

The main objective of GeoAttend is to provide a simple and secure attendance system that combines:

- QR-based event identification
- User authentication
- Device geolocation
- Geofence-based attendance verification
- Database-level duplicate prevention
- Role-based access through Supabase Row Level Security
- Organizer attendance monitoring and analytics

---

## Features

### Attendee Side

- User authentication using Supabase Authentication
- Access to event/session information
- QR code scanning using the device camera
- Client-side QR decoding using `jsQR`
- Automatic navigation to the attendance verification page after scanning
- Browser/device geolocation access
- Distance calculation between the attendee and event venue
- Configurable geofence radius for each event
- Inside/outside geofence verification
- Attendance submission after successful location verification
- Prevention of duplicate attendance submissions
- Clear feedback when the attendee is outside the allowed area
- Attendance confirmation after successful submission

### Organizer Side

- Organizer authentication
- Organizer dashboard
- Create events
- Edit events
- Delete events
- Configure event name, venue, date, time and geofence radius
- Generate a unique QR code for each event/session
- Display QR codes for attendees
- View attendance records
- Monitor attendance information
- Reports and analytics dashboard
- Attendance and geofence-related statistics
- Session performance information

### Testing Features

GeoAttend includes a GPS scenario simulator that allows different location conditions to be tested without physically changing location.

The simulator supports:

- Inside the geofence
- Boundary/near-boundary conditions
- Outside the geofence

This makes it easier to verify that attendance is correctly allowed or blocked.

---

## Technology Stack

### Frontend

- React 19
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Lucide React
- Recharts

### QR Code

- `qrcode` — QR code generation
- `jsqr` — QR code scanning and decoding

### Backend and Database

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Row Level Security (RLS)

### Additional Libraries

- `xlsx`
- `clsx`
- `tailwind-merge`
- `autoprefixer`
- PostCSS

---

## Application Architecture

```text
User / Attendee
       |
       v
React Frontend
       |
       +--------------------+
       |                    |
       v                    v
QR Scanner            Browser Geolocation
       |                    |
       +---------+----------+
                 |
                 v
        Geofence Verification
                 |
                 v
          Supabase Backend
                 |
        +--------+--------+
        |                 |
        v                 v
   PostgreSQL       Authentication
        |
        v
 Attendance Records

 ---

## Installation

### Prerequisites

- Node.js
- npm
- A Supabase project

### Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd GeoAttend

Install Dependencies
npm install
Environment Variables

Create a .env.local file in the project root:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

Replace the placeholder values with your own Supabase project credentials.

The .env.local file must not be committed to GitHub.

Supabase Database Configuration

GeoAttend uses Supabase PostgreSQL for storing event and attendance information.

The database migrations are located in:

supabase/migrations/

These migrations configure the required database structure, permissions and Row Level Security policies.

The attendance table uses Row Level Security to restrict access to attendance records.

Authenticated attendees can submit attendance only for their own account, while organizers can access attendance associated with their events.

Running Locally

Start the development server:

npm run dev

The application will normally be available at:

http://localhost:5173

For testing from another device on the same local network:

npm run dev -- --host
Production Deployment

GeoAttend can be deployed as a production web application using Vercel.

Deployment Steps
Push the project to a GitHub repository.
Import the repository into Vercel.
Add the following environment variables in the Vercel project settings:
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
Deploy the application.
Open the generated Vercel URL.

The deployed application can then be accessed through the internet without running the development server locally.

Production QR Codes

When GeoAttend is running on its deployed Vercel URL, generated QR codes use the deployed application URL.

For example:

https://your-project.vercel.app/attendee/location?eventId=...

This allows attendees to scan the QR code using their phones and access the attendance system.

Production Build

Create a production build using:

npm run build

Preview the production build locally:

npm run preview
API / Backend Operations

GeoAttend communicates with Supabase through the Supabase JavaScript client.

The main backend operations include:

User authentication
User session management
Event creation
Event retrieval
Event editing
Event deletion
Attendance submission
Attendance retrieval
Organizer attendance monitoring
Database access control through Row Level Security
Important Implementation Decisions
QR-Based Event Identification

Each event has a unique QR code containing the relevant attendance session URL.

This allows attendees to access the correct event without manually entering event information.

Geofence Verification

The attendee's device coordinates are compared with the event venue coordinates.

Attendance is allowed only when the calculated distance is within the configured geofence radius.

Database-Level Duplicate Prevention

A unique database constraint prevents the same attendee from creating multiple attendance records for the same event.

Row Level Security

Supabase Row Level Security is used to restrict database access according to the authenticated user's identity and role.

Client-Side Geofence Calculation

The current implementation performs the distance calculation on the frontend using the coordinates reported by the browser/device.

Advanced GPS-spoofing protection is outside the required scope of this task.

Additional Features

In addition to the core requirements, GeoAttend includes:

GPS scenario simulator
Attendance analytics dashboard
Geofence status visualization
Session performance information
Camera-based QR scanning
Automatic navigation after QR detection
Attendance status feedback
Responsive attendee interface
Testing
Inside Geofence

The simulated attendee location is placed inside the configured radius.

Attendance should be allowed.

Boundary

The simulated attendee location is placed near the configured radius.

The application's boundary behavior can be verified.

Outside Geofence

The simulated attendee location is placed outside the configured radius.

Attendance should be blocked.

Duplicate Attendance

After successfully submitting attendance for an event, attempting to submit attendance for the same event again should be rejected by the database's unique constraint.

QR Scanning

The attendee scanner can be used with a device camera to scan the event QR code and navigate to the corresponding attendance verification page.

Concepts Learned

This project involved learning and implementing:

React
React hooks
Client-side routing
Vite
Tailwind CSS
Supabase Authentication
PostgreSQL
Row Level Security
CRUD operations
Database constraints
QR code generation
QR code scanning
Browser Camera API
Browser Geolocation API
Geographic distance calculation
Environment variables
Frontend-backend integration
Application debugging
Git and GitHub workflow
Production deployment
Current Limitations

The current geofence distance calculation is performed on the client side using the coordinates reported by the browser/device.

A malicious client could potentially manipulate the coordinates reported by the browser.

Advanced GPS-spoofing protection is not implemented because it is outside the required scope of the task.

A production version could move geofence verification to a trusted backend environment using PostgreSQL/PostGIS or another server-side verification service.

Project Structure
GeoAttend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── supabase/
│   └── migrations/
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
Future Improvements

Possible future improvements include:

Server-side geofence verification
Advanced GPS-spoofing detection
Real-time attendance updates
More advanced attendance analytics
Improved mobile experience
Detailed audit logs
Additional reporting and export functionality
Conclusion

GeoAttend combines QR codes, authentication, geolocation and database security to provide a practical attendance management system.

The system allows organizers to manage events while attendees can quickly scan a QR code and verify their physical presence before submitting attendance.