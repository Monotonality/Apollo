# Apollo - UGDC Internal Website

Apollo is the internal website for the Undergraduate Dean's Council, providing a comprehensive platform for committee reports, committee fund requests, and other organizational functions. Built with React and Firebase, Apollo streamlines council operations and facilitates efficient communication and resource management.

## Features

## Tech Stack

- **Frontend**: React 18, React Router, CSS3
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Development**: Firebase Emulator Suite
- **Build Tool**: Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth.js         # Authentication component
│   └── SampleDataButton.js  # Button to add sample data
├── pages/              # Main application pages
├── services/           # Firebase service functions
│   ├── authService.js  # Authentication operations
│   └── firestoreService.js  # Firestore operations
├── utils/              # Utility functions
│   └── sampleData.js   # Sample data for testing
├── firebase.js         # Firebase configuration
└── App.js             # Main application component
```

## Local Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase CLI

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Install Firebase CLI globally:**
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase (optional for emulator-only development):**
   ```bash
   firebase login
   ```


## Firebase Configuration

The application is configured to use Firebase emulators for local development. The configuration is in `src/firebase.js`:

- **Firestore**: Port 8080
- **Auth**: Port 9099  
- **Storage**: Port 9199

For production deployment, you'll need to:
1. Create a Firebase project
2. Update the configuration in `src/firebase.js`
3. Deploy the application

## Available Scripts

- `npm start`: Start the React development server
- `npm run build`: Build the app for production
- `npm test`: Run tests
- `firebase emulators:start`: Start Firebase emulators
- `firebase emulators:start --only firestore,auth,storage`: Start specific emulators

## Deployment

### Firebase Hosting

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Initialize Firebase Hosting:**
   ```bash
   firebase init hosting
   ```

3. **Deploy:**
   ```bash
   firebase deploy
   ```

### Other Hosting Options

The built app in the `build/` folder can be deployed to any static hosting service like:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## Troubleshooting

### Common Issues

1. **Emulator connection errors**: Make sure Firebase emulators are running
2. **Port conflicts**: Check if ports 3000, 4000, 8080, 9099, 9199 are available
3. **Firebase CLI not found**: Install Firebase CLI globally with `npm install -g firebase-tools`

### Reset Emulator Data

To clear all emulator data:
```bash
firebase emulators:start --import=./emulator-data --export-on-exit
```

## License

This project is licensed under the MIT License.

---

**Apollo** - The internal website for UGDC committee reports, fund requests, and organizational functions.