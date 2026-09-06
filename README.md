# GeoAttend — QR-Based Geo-Tagged Attendance Management System

GeoAttend is a full-stack web application designed to simplify and secure event attendance using QR code scanning and geolocation verification.

Organizers can create events, configure a geofence radius, and generate unique QR codes for attendance. Attendees scan the event QR code using their device, allow location access, and can mark attendance only when they are within the configured geographical boundary of the event.

The application uses React for the frontend and Supabase for authentication, PostgreSQL database storage, and Row Level Security. The production application is deployed on Vercel and can be accessed through the live demo below.

---

## Live Demo

**Production Application:** https://geo-attend-beta.vercel.app

The production version of GeoAttend is deployed on Vercel and can be accessed directly without installing the project locally.

### Source Code

**GitHub Repository:** https://github.com/Pratham180910/GeoAttend

---

## Objective

The objective of GeoAttend is to provide a simple and secure attendance management system that reduces manual attendance work and helps prevent attendance from being marked by users who are not physically present at the event location.

The system combines:

- QR code-based attendance
- Geolocation verification
- Configurable geofencing
- Secure authentication
- PostgreSQL database storage
- Row Level Security
- Organizer dashboards
- Attendance analytics
- Attendance reports

---

## Key Features

### Attendee Features

- Secure user authentication
- View available and upcoming events
- View event name, venue, date, and time
- Scan event-specific QR codes using the device camera
- Request the attendee's location using the browser Geolocation API
- Verify the attendee's location against the event geofence
- Mark attendance after successful location verification
- Prevent duplicate attendance for the same event
- Display attendance confirmation after successful submission

### Organizer Features

- Organizer dashboard
- Create events
- Edit events
- Delete events
- Configure event venue, date, time, and geofence radius
- Generate unique QR codes for individual events
- View event attendance
- Search and filter attendance records
- View attendance statistics
- Generate attendance reports
- Monitor attendance information

### Security and Validation

- Supabase authentication
- Protected application routes
- QR-based event identification
- Geolocation-based attendance verification
- Configurable geofence radius
- Duplicate attendance prevention
- PostgreSQL constraints
- Supabase Row Level Security (RLS)
- Organizer-only access to organizer functionality

---

## How the Attendance System Works

The attendance workflow is:

```text
Organizer creates an event
          ↓
Organizer configures venue and geofence radius
          ↓
GeoAttend generates a unique QR code
          ↓
Attendee scans the QR code
          ↓
Attendee grants location permission
          ↓
GeoAttend obtains the attendee's location
          ↓
Location is compared with the event location
          ↓
Distance is within the configured geofence
          ↓
Attendance is recorded in Supabase
          ↓
Organizer can view the attendance record
Step-by-Step
An organizer creates an event.
The organizer specifies the event venue, date, time, and geofence radius.
GeoAttend generates a QR code associated with the event.
The attendee scans the QR code using their device.
The application identifies the corresponding event.
The attendee grants location permission through the browser.
GeoAttend obtains the attendee's current latitude and longitude.
The application calculates the distance between the attendee and the event location.
If the attendee is within the configured geofence, attendance can be submitted.
The attendance record is stored in the Supabase database.
Duplicate attendance for the same event is prevented.
The organizer can view the updated attendance information.
Geolocation and Geofencing

GeoAttend uses the browser's Geolocation API to obtain the attendee's current geographical coordinates.

The system compares:

The configured event location
The attendee's reported location

The distance between the two locations is calculated and compared with the event's configured geofence radius.

Attendance is accepted only when the attendee is within the allowed radius.

Advanced anti-GPS-spoofing mechanisms are outside the scope of this project, as they are not required for the intended use case.

Technology Stack
Frontend
React
Vite
JavaScript
React Router
Tailwind CSS
Lucide React
Recharts
Backend and Database
Supabase
PostgreSQL
Supabase Authentication
Supabase Row Level Security (RLS)
QR Code
qrcode
jsqr
Browser Camera API
Location
Browser Geolocation API
Geofence distance calculation
Data Export
SheetJS (xlsx)
Deployment and Version Control
Git
GitHub
Vercel
Application Architecture
                    ┌──────────────────────┐
                    │       Attendee       │
                    │                      │
                    │  Authentication      │
                    │  View Events         │
                    │  Scan QR             │
                    │  Share Location      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    React + Vite      │
                    │      Frontend        │
                    │                      │
                    │  Routing             │
                    │  QR Validation       │
                    │  Location Check      │
                    │  Attendance UI       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Supabase       │
                    │                      │
                    │  Authentication      │
                    │  PostgreSQL          │
                    │  Row Level Security  │
                    │  Attendance Data     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Organizer       │
                    │      Dashboard       │
                    │                      │
                    │  Event Management    │
                    │  Attendance          │
                    │  Reports             │
                    └──────────────────────┘
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

GeoAttend uses Supabase PostgreSQL for storing application data.

The database manages information related to:

Users
Events
Event registrations
Attendance records

Supabase Row Level Security policies are used to control access to database records.

Examples include:

Attendees can create attendance records for themselves.
Attendees can access their own attendance information.
Organizers can access attendance associated with their events.
Organizer actions are protected through authentication and database policies.

Database migrations are located in:

supabase/migrations/
Authentication

Authentication is handled using Supabase Auth.

Authenticated users can access protected parts of the application according to their role.

Protected routes are implemented on the frontend, while database access is additionally controlled through Supabase Row Level Security policies.

This provides both application-level and database-level access control.

Environment Variables

For local development, create a .env.local file in the project root.

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

Replace the placeholder values with the credentials from your own Supabase project.

Important

The .env.local file must not be committed to GitHub.

The repository's .gitignore excludes local environment files.

The Supabase publishable key can be used in frontend applications when appropriate Row Level Security policies are configured. Secret or service-role keys must never be exposed in frontend code.

For the production deployment, the required environment variables are configured in the Vercel project settings.

Running Locally

The production application is already available through Vercel, so local setup is only required if you want to develop or run the source code yourself.

1. Clone the repository

The source code is available in the GitHub repository:

https://github.com/Pratham180910/GeoAttend

git clone https://github.com/Pratham180910/GeoAttend.git
cd GeoAttend
2. Install dependencies
npm install
3. Configure environment variables

Create a .env.local file in the project root:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
4. Start the development server
npm run dev

The local development server will normally be available at:

http://localhost:5173
5. Build the application

To create a production build locally:

npm run build
Production Deployment

GeoAttend is deployed on Vercel.

Production Application

https://geo-attend-beta.vercel.app

Source Repository

https://github.com/Pratham180910/GeoAttend

The Vercel project is connected to the GitHub repository and tracks the main branch.

Changes pushed to the main branch can trigger a new production deployment.

Vercel Configuration

The application uses:

Framework: Vite
Build Command: npm run build
Output Directory: dist

A vercel.json file is included to support client-side React Router routes in the production deployment.

This ensures that directly opening or refreshing application routes does not result in a Vercel 404 error.

Backend Operations

GeoAttend communicates with Supabase using the Supabase JavaScript client.

Authentication

Used for:

User authentication
Session management
Authentication state
Protected routes
Events

Used for:

Creating events
Retrieving events
Updating events
Deleting events
Attendance

Used for:

Recording attendance
Checking existing attendance
Retrieving attendance records
Preventing duplicate attendance
Database Security

Supabase Row Level Security policies determine which authenticated users can access or modify database records.

Attendance Validation

Attendance is validated using multiple checks.

QR Validation

The QR code identifies the event for which attendance is being recorded.

Location Validation

The attendee's current location is compared with the configured event location.

Geofence Validation

The calculated distance must be within the event's configured radius.

Duplicate Validation

A database-level uniqueness constraint prevents the same attendee from recording attendance more than once for the same event.

Data Export

The application supports attendance data export for organizer use.

Attendance reports can contain information such as:

Name
Registration ID
Email
Attendance Status
Timestamp

The project uses the xlsx library for spreadsheet-related data export.

Testing

The application has been tested in the deployed production environment.

The main attendance workflow was tested using a mobile device, including:

User authentication
Event access
QR code scanning
Camera permission
Location permission
Geofence verification
Attendance submission
Duplicate attendance handling
Organizer attendance viewing

The deployed environment also supports direct navigation and page refreshes on React Router routes through the Vercel SPA configuration.

Important Implementation Decisions
QR Codes

Each event has an associated QR code. Scanning the QR code provides a convenient way for attendees to access the attendance flow for that event.

Geofencing

QR scanning alone does not verify physical presence. GeoAttend therefore adds location verification before attendance is accepted.

Browser APIs

The application uses browser capabilities for:

Camera access
QR code scanning
Geolocation

This allows the attendance workflow to work directly from supported mobile browsers without requiring a separate mobile application.

Row Level Security

Supabase Row Level Security is used to protect database records at the database level instead of relying only on frontend restrictions.

Duplicate Attendance Prevention

Duplicate attendance is prevented using both application-level checks and a database uniqueness constraint.

Client-Side Routing

React Router is used for navigation between application pages. Vercel is configured with a rewrite to ensure client-side routes continue to work when directly accessed or refreshed.

Concepts Learned

During the development of GeoAttend, the following concepts were implemented and explored:

React component architecture
React hooks
React Router
Authentication
Supabase
PostgreSQL
Row Level Security
CRUD operations
QR code generation
QR code scanning
Browser Camera API
Browser Geolocation API
Geofencing
Distance calculation
Protected routes
Database constraints
Attendance validation
Data export
Vite production builds
Git and GitHub
Vercel deployment
Client-side routing in production
Future Improvements

Possible future improvements include:

Advanced anti-GPS-spoofing mechanisms
More detailed attendance analytics
Improved real-time attendance updates
Push notifications
Attendance history for attendees
More advanced organizer reports
Better offline handling
Additional authentication options
Native mobile application support
Demo Flow

The complete production workflow can be demonstrated as:

Organizer Login
      ↓
Create Event
      ↓
Configure Venue and Geofence
      ↓
Generate Event QR Code
      ↓
Attendee Scans QR Code
      ↓
Allow Location Access
      ↓
Geofence Verification
      ↓
Attendance Recorded
      ↓
Organizer Views Attendance
Project Links

Live Application: https://geo-attend-beta.vercel.app

GitHub Repository: https://github.com/Pratham180910/GeoAttend

License

This project was developed as a student project for educational and demonstration purposes.