# Apollo
Organizational Management System

Built with React, TypeScript, and Firebase for the Undergraduate Dean's Council at UT Dallas.

## Overview

Apollo is a comprehensive organizational management system designed to streamline operations for the Undergraduate Dean's Council. The system provides user management, committee organization, volunteer tracking, attendance monitoring, and funding management capabilities.

## Tech Stack

- **Frontend**: React 19, TypeScript, React Router, CSS3
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Development**: Firebase Emulator Suite
- **Build Tool**: Create React App with TypeScript template
- **Authentication**: Firebase Authentication with role-based access control
- **Security**: Input validation, injection attack protection, secure authentication

## Features

### 🏠 Landing Page
- Animated hero section with orbital effects
- Public information about the Undergraduate Dean's Council
- Login and signup buttons with responsive design
- Mobile-optimized interface

### 👤 User Management
- **Role-based access control** (9 user roles with hierarchical permissions)
- **Automatic first user admin assignment** (Data & Systems Officer)
- **User profile management** with comprehensive database schema integration
- **LinkedIn profile integration**
- **Member approval system** with pending, active, inactive, and rejected states
- **Role change management** with permission updates
- **Account resignation** functionality

### 🏛️ Committee Management
- **Committee creation** with chair and vice chair selection
- **Committee membership** - members can join/leave committees
- **Active/Inactive committee management** with automatic SERVES record cleanup
- **Committee deletion** with proper data cleanup
- **Real-time committee information** display
- **Collapsible sections** with smooth animations

### 📊 Member Directory
- **Comprehensive member profiles** with contact information and organizational roles
- **Search functionality** with real-time filtering
- **Active/Inactive member separation** with visual indicators
- **Mobile-responsive design** with optimized layouts
- **Role-based filtering** (excludes pending and rejected users)

### 👤 Profile Management
- **Account information display** with volunteer credits and attendance tracking
- **Name change functionality** with proper capitalization enforcement
- **Password change** with old password verification and strength indicator
- **Account resignation** with confirmation requirements
- **Security features** including input validation and injection protection

### 🔐 Authentication & Security
- **Secure signup/signin** with email validation and password strength requirements
- **Input sanitization** and injection attack protection
- **Password visibility toggles** with eye/eye-slash icons
- **Role-based routing** with automatic redirects for unauthorized users
- **Session management** with proper sign-out functionality

### 📱 Responsive Design
- **Mobile-first approach** with hamburger menu navigation
- **Responsive layouts** for all screen sizes
- **Touch-friendly interfaces** with proper button sizing
- **Optimized mobile navigation** with collapsible sections

### Database Collections
- **USER**: User profiles and authentication data
- **SERVES**: User committee memberships with role tracking
- **COMMITTEE**: Committee information and management
- **FUNDING**: Funding requests and financial tracking
- **VOLUNTEER**: Volunteer opportunities
- **VOLUNTEERED**: User volunteer participation records
- **ATTENDED**: User attendance tracking
- **ATTENDANCE**: Attendance events and codes
- **REPORT**: Committee reports and documentation

### Role-Based Access Control
- **Data & Systems Officer**: Full administrative access, can see all navigation items
- **Dean**: Highest level permissions, can manage members and committees
- **Program Manager**: Executive program management, can manage members and committees
- **President**: Executive level permissions, can manage members and committees
- **Vice President**: High-level management access, can manage members and committees
- **Internal Affairs Officer**: Administrative and record-keeping access, can manage members
- **Finance Officer**: Financial management access, can manage members
- **Member**: Standard member permissions, can access Committee page
- **Inactive Member**: Dashboard view only, no other permissions (same priority as Pending User)
- **Pending User**: Limited access until approval, redirected to landing page

### Navigation & Permissions
- **Dashboard**: Available to all authenticated users
- **Committee**: Available to Members and Data & Systems Officer
- **Directory**: Available to all authenticated users
- **Profile**: Available to all authenticated users
- **About**: Available to all authenticated users
- **Members**: Available to users with `approve_members` permission
- **Committees**: Available to users with `manage_committees` permission

## Available Scripts

- `npm start`: Start the React development server
- `npm run build`: Build the app for production
- `npm test`: Run tests
- `npm run emulators`: Start Firebase emulators
- `npm run dev`: Start both React and Firebase emulators concurrently

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Monotonality/Apollo.git
   cd Apollo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development environment**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - App: [http://localhost:3000](http://localhost:3000)
   - Firebase Emulator UI: [http://localhost:4000](http://localhost:4000)

## Project Structure

```
src/
├── components/          # React components
│   ├── About.tsx       # About page with Apollo information
│   ├── Auth.tsx        # Authentication component (signup/signin)
│   ├── Committee.tsx   # Committee page for members
│   ├── Committees.tsx  # Committee management for admins
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Directory.tsx   # Member directory
│   ├── Landing.tsx     # Landing page for unauthenticated users
│   ├── Members.tsx     # Member management for admins
│   ├── Profile.tsx     # User profile management
│   └── common/         # Reusable components
│       ├── Button.tsx  # Custom button component
│       ├── Card.tsx    # Card container component
│       ├── Header.tsx  # Navigation header
│       ├── LoadingSpinner.tsx # Loading animation
│       ├── Logo.tsx    # Apollo logo component
│       ├── PageContainer.tsx # Page layout wrapper
│       ├── RoleBadge.tsx # Role display component
│       ├── SearchBar.tsx # Search input component
│       ├── Select.tsx  # Dropdown select component
│       ├── UserCard.tsx # User display component
│       └── UserInfo.tsx # User info with dropdown
├── services/           # Firebase services
│   ├── authService.ts  # Authentication operations
│   └── firestoreService.ts # Firestore operations
├── types/              # TypeScript type definitions
│   ├── auth.ts         # Authentication types
│   ├── user.ts         # User profile types
│   └── firebase.ts     # Firebase collection types
├── utils/              # Utility functions
│   └── roles.ts        # Role definitions and permissions
└── firebase.ts         # Firebase configuration
```

## Database Schema

The system uses a comprehensive database schema with 9 main collections:

- **USER**: Core user information with role-based permissions and profile data
- **SERVES**: Many-to-many relationship between users and committees with role tracking
- **COMMITTEE**: Committee management and organization with chair/vice chair assignments
- **FUNDING**: Financial tracking and funding requests
- **VOLUNTEER**: Volunteer opportunity management
- **VOLUNTEERED**: User volunteer participation tracking
- **ATTENDED**: Attendance record management
- **ATTENDANCE**: Attendance event and code management
- **REPORT**: Committee reports and documentation

### Key Relationships
- **USER ↔ SERVES**: Users can be members of multiple committees
- **COMMITTEE ↔ SERVES**: Committees can have multiple members with different roles
- **USER ↔ COMMITTEE**: Direct relationship for chair and vice chair assignments
- **SERVES records** track: Chair, Vice Chair, and Member roles within committees

For detailed schema information, see `dev/DB_relational_diagram_explained`.

## Authentication Flow

1. User signs up with email, password, first name, and last name
2. Display name is automatically generated from first and last name
3. Role assignment:
   - First user: Automatically assigned "Data & Systems Officer" role
   - Subsequent users: Assigned "Pending User" role
4. User profile created in Firestore with all database schema fields
5. Default values set for volunteer credits, attendance, and other fields

## Current Development Status

### ✅ Completed Features
- **Landing Page**: Animated hero section with orbital effects and responsive design
- **Authentication System**: Complete signup/signin with security features
- **User Management**: Full member approval system with role management
- **Committee Management**: Complete CRUD operations with chair/vice chair support
- **Member Directory**: Searchable directory with role-based filtering
- **Profile Management**: Account information, password changes, and resignation
- **Responsive Design**: Mobile-first approach with optimized navigation
- **Security**: Input validation, injection protection, and secure authentication
- **Database Integration**: Complete Firestore integration with proper data relationships

### 🔄 Recent Updates
- **Committee Join/Leave**: Members can join and leave committees with proper SERVES record management
- **Vice Chair Support**: Added vice chair functionality to committee management
- **Collapsible Sections**: Smooth animations for member and committee sections
- **Mobile Navigation**: Fixed mobile dropdown height issues and navigation cutoff
- **Security Rules**: Updated Firestore security rules for proper access control
- **Reusable Components**: Created common Select component for consistent dropdowns

### 🚧 Future Enhancements
- Volunteer opportunity management
- Attendance tracking system
- Funding request management
- Committee report system
- Advanced analytics and reporting

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions or support, please contact the development team or create an issue in the repository.
