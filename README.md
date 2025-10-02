# Apollo
Organizational Management System

Built with React, TypeScript, and Firebase for the Undergraduate Dean's Council at UT Dallas.

## Overview

Apollo is a comprehensive organizational management system designed to streamline operations for the Undergraduate Dean's Council. The system provides user management, committee organization, volunteer tracking, attendance monitoring, and funding management capabilities.

## Tech Stack

- **Frontend**: React 18, TypeScript, React Router, CSS3
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Development**: Firebase Emulator Suite
- **Build Tool**: Create React App with TypeScript template
- **Authentication**: Firebase Authentication with role-based access control

## Features

### User Management
- Role-based access control (8 user roles)
- Automatic first user admin assignment
- User profile management with database schema integration
- LinkedIn profile integration

### Database Collections
- **USER**: User profiles and authentication data
- **SERVES**: User committee memberships
- **COMMITTEE**: Committee information and management
- **FUNDING**: Funding requests and financial tracking
- **VOLUNTEER**: Volunteer opportunities
- **VOLUNTEERED**: User volunteer participation records
- **ATTENDED**: User attendance tracking
- **ATTENDANCE**: Attendance events and codes

### Role-Based Access Control
- **Data & Systems Officer**: Full administrative access
- **Dean**: Highest level permissions
- **Program Manager**: Executive program management
- **President**: Executive level permissions
- **Vice President**: High-level management access
- **Internal Affairs Officer**: Administrative and record-keeping access
- **Finance Officer**: Financial management access
- **Member**: Standard member permissions
- **Inactive Member**: Dashboard view only, no other permissions (same priority as Pending User)
- **Pending User**: Limited access until approval

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
│   ├── Auth.tsx        # Authentication component
│   └── Dashboard.tsx   # Main dashboard
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

The system uses a comprehensive database schema with 8 main collections:

- **USER**: Core user information with role-based permissions
- **SERVES**: Many-to-many relationship between users and committees
- **COMMITTEE**: Committee management and organization
- **FUNDING**: Financial tracking and funding requests
- **VOLUNTEER**: Volunteer opportunity management
- **VOLUNTEERED**: User volunteer participation tracking
- **ATTENDED**: Attendance record management
- **ATTENDANCE**: Attendance event and code management

For detailed schema information, see `dev/DB_relational_diagram_explained`.

## Authentication Flow

1. User signs up with email, password, first name, and last name
2. Display name is automatically generated from first and last name
3. Role assignment:
   - First user: Automatically assigned "Data & Systems Officer" role
   - Subsequent users: Assigned "Pending User" role
4. User profile created in Firestore with all database schema fields
5. Default values set for volunteer hours, attendance, and other fields

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
