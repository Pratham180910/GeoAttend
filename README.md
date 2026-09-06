# GeoAttend — QR-Based Geo-Tagged Attendance Management System

GeoAttend is a full-stack web application for managing event attendance using QR code scanning and geolocation verification.

The system allows organizers to create events and generate unique QR codes for attendance sessions. Attendees scan the QR code using their device, provide their location through the browser's Geolocation API, and can submit attendance only when they are within the configured geofence radius of the event venue.

The application uses React for the frontend and Supabase for authentication, database storage, and Row Level Security. The production application is deployed on Vercel.

## Live Demo

**Live Application:** https://geo-attend-beta.vercel.app

The live deployment can be used to test the complete GeoAttend workflow, including authentication, event management, QR scanning, location verification, and attendance recording.

---

## Objective

The objective of GeoAttend is to provide a simple and secure attendance management system that reduces manual attendance work and helps prevent attendance from being marked by users who are not physically present at the event location.

The system combines:

- QR code-based attendance
- Browser-based geolocation
- Configurable geofencing
- Authentication
- Supabase database storage
- Row Level Security
- Organizer dashboards
- Attendance reports

---

## Features

### Attendee Features

- User authentication
- View available and upcoming events
- View event name, venue, date, and time
- Scan event-specific QR codes using the device camera
- Request the attendee's current location using the browser Geolocation API
- Verify whether the attendee is within the configured event geofence
- Submit attendance after successful verification
- Prevent duplicate attendance for the same event
- Display attendance confirmation after successful submission

### Organizer Features

- Organizer dashboard
- Create events
- Edit events
- Delete events
- Configure event venue, date, time, and geofence radius
- Generate unique QR codes for events
- View attendance records
- Search and filter attendees
- View attendance statistics
- Monitor attendance information
- Generate attendance reports

### Security and Validation

- Authentication through Supabase Auth
- Protected application routes
- QR validation
- Location-based geofence verification
- Duplicate attendance prevention
- Supabase Row Level Security (RLS)
- Attendance records associated with authenticated users
- Organizer-only access to organizer functionality

### Testing

The application has been tested in the deployed environment using a mobile device, including:

- QR code scanning
- Camera access
- Browser geolocation
- Geofence verification
- Attendance submission
- Duplicate attendance handling
- Organizer attendance updates

---

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- JavaScript
- Lucide React
- Recharts

### Backend and Database

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Row Level Security (RLS)

### QR and Location

- `qrcode`
- `jsqr`
- Browser Camera API
- Browser Geolocation API

### Deployment

- Vercel
- GitHub

### Data Export

- SheetJS / `xlsx`

---

## Application Architecture

```text
                    ┌─────────────────────┐
                    │      Attendee       │
                    │                     │
                    │  Login              │
                    │  View Events        │
                    │  Scan QR            │
                    │  Share Location     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     React + Vite    │
                    │      Frontend       │
                    │                     │
                    │  QR Validation      │
                    │  Location Check     │
                    │  UI / Routing      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Supabase      │
                    │                     │
                    │  Authentication     │
                    │  PostgreSQL         │
                    │  Row Level Security │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Organizer      │
                    │      Dashboard      │
                    │                     │
                    │ Events              │
                    │ Attendance          │
                    │ Reports             │
                    └─────────────────────┘
How Attendance Works

The attendance process follows these steps:

The organizer creates an event.
The organizer configures the event venue and geofence radius.
GeoAttend generates a unique QR code for the event.
The attendee scans the QR code using their device.
The QR code identifies the attendance event.
The attendee grants location permission through the browser.
GeoAttend obtains the device's current latitude and longitude.
The application compares the attendee's location with the event location.
If the attendee is within the configured geofence, attendance can be submitted.
The attendance record is stored in Supabase.
Duplicate attendance for the same event is prevented.
The organizer can view the updated attendance record from the dashboard.
Geolocation Verification

GeoAttend uses the browser's Geolocation API to obtain the attendee's current coordinates.

The application then calculates the distance between:

The event's configured location
The attendee's reported location

The attendance request is accepted only when the calculated distance is within the event's configured geofence radius.

Advanced anti-GPS-spoofing mechanisms are outside the scope of this project.

Project Structure
GeoAttend/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── charts/
│   │   │   ├── ArrivalPatternChart.jsx
│   │   │   ├── AttendanceTrendsChart.jsx
│   │   │   └── DepartmentBreakdownChart.jsx
│   │   │
│   │   └── common/
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── EmptyState.jsx
│   │       ├── Modal.jsx
│   │       ├── ProtectedRoute.jsx
│   │       ├── QRCodeDisplay.jsx
│   │       ├── SearchInput.jsx
│   │       └── StatCard.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── data/
│   │   └── mockData.js
│   │
│   ├── hooks/
│   │   ├── useAttendance.js
│   │   ├── useAuth.js
│   │   ├── useEvents.js
│   │   ├── useGeolocation.js
│   │   └── useMockAuth.js
│   │
│   ├── layouts/
│   │   ├── AttendeeLayout.jsx
│   │   └── OrganizerLayout.jsx
│   │
│   ├── lib/
│   │   └── supabaseClient.js
│   │
│   ├── pages/
│   │   ├── attendee/
│   │   │   ├── LocationVerification.jsx
│   │   │   ├── Scan.jsx
│   │   │   └── Success.jsx
│   │   │
│   │   ├── auth/
│   │   │   └── Login.jsx
│   │   │
│   │   └── organizer/
│   │       ├── Dashboard.jsx
│   │       ├── EventAttendance.jsx
│   │       ├── EventDetails.jsx
│   │       ├── Events.jsx
│   │       └── Reports.jsx
│   │
│   ├── utils/
│   │   ├── formatters.js
│   │   └── geoUtils.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── supabase/
│   └── migrations/
│
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
└── vite.config.js
Database

GeoAttend uses Supabase PostgreSQL as its backend database.

The database stores information related to:

Users
Events
Event registrations
Attendance records

Row Level Security policies are used to control access to the stored data.

Examples include:

Attendees can create attendance records for themselves.
Attendees can view their own attendance.
Organizers can view attendance associated with their events.
Organizer actions are protected through authentication and database policies.
Environment Variables

Create a .env.local file in the project root for local development.

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

The production deployment uses the same environment variables configured securely in the Vercel project settings.

Important

Do not commit .env.local to GitHub.

The project uses a .gitignore rule to prevent local environment files from being committed.

The Supabase publishable key is intended for use in frontend applications with appropriate Row Level Security policies. Secret/service-role keys must never be exposed in frontend code.

Running the Project Locally
1. Clone the repository
git clone https://github.com/Pratham180910/GeoAttend.git
cd GeoAttend
2. Install dependencies
npm install
3. Configure environment variables

Create .env.local:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
4. Start the development server
npm run dev

The application will normally be available at:

http://localhost:5173
5. Build for production
npm run build
Deployment

The production version of GeoAttend is deployed using Vercel.

The project is connected to the GitHub repository:

Pratham180910/GeoAttend

The production deployment automatically builds the React/Vite application from the main branch.

Production URL
https://geo-attend-beta.vercel.app
Vercel Configuration

The project uses:

Framework: Vite
Build Command: npm run build
Output Directory: dist

A vercel.json configuration is included to support client-side React Router routes when pages are refreshed directly.

API / Backend Operations

GeoAttend primarily communicates with Supabase using the Supabase JavaScript client.

Major backend operations include:

Authentication

Used for:

User login
User sessions
User authentication state
Protected routes
Events

Used for:

Creating events
Updating events
Deleting events
Retrieving event information
Attendance

Used for:

Recording attendance
Checking existing attendance
Retrieving attendee records
Preventing duplicate attendance
Security

Supabase Row Level Security policies control which authenticated users can access and modify database records.

Important Implementation Decisions
QR-Based Attendance

QR codes provide a quick way to associate an attendee with a specific event.

Each event has its own QR code containing information required to identify the attendance session.

Geofencing

Location verification adds an additional layer to attendance validation.

Instead of relying only on the QR code, GeoAttend checks whether the attendee's reported location is within the configured event radius.

Row Level Security

Supabase RLS is used instead of relying only on frontend access control.

This provides database-level protection for attendance and event records.

Duplicate Attendance Prevention

Attendance records use database constraints and application checks to prevent the same attendee from marking attendance multiple times for the same event.

Client-Side Routing

React Router provides navigation between attendee and organizer pages. Vercel is configured to serve the application entry point for client-side routes so that direct URL navigation and page refreshes work correctly.

Concepts Learned

During development, the following concepts were implemented and explored:

React component architecture
React hooks
React Router
Authentication
Supabase
PostgreSQL
Row Level Security
QR code generation
QR code scanning
Browser Camera API
Browser Geolocation API
Geofencing
Distance calculation
Protected routes
CRUD operations
Database constraints
Attendance validation
Data export
Vite production builds
Git and GitHub
Vercel deployment
Client-side routing in production
Future Improvements

Possible future improvements include:

More advanced anti-GPS-spoofing mechanisms
Push notifications
Real-time attendance updates
Improved analytics
Attendance history for attendees
More detailed organizer reports
Improved offline handling
Additional authentication options
Native mobile application support
Demo

The production application can be accessed here:

https://geo-attend-beta.vercel.app

The main demonstration flow is:

Organizer Login
      ↓
Create Event
      ↓
Generate QR Code
      ↓
Attendee Scans QR
      ↓
Location Permission
      ↓
Geofence Verification
      ↓
Attendance Recorded
      ↓
Organizer Views Attendance


License

This project was developed as a student project for educational and demonstration purposes.