# NGO Nabarun Frontend

This repository contains the frontend codebase for the Nabarun NGO platform. It is built using Angular and Ionic, with integrations for Firebase and Capacitor for mobile support.

## Features
- Member management
- Donation tracking
- Social event management
- Admin dashboard
- Notifications
- Progressive Web App (PWA) support
- Mobile app build scripts (Android)

## Tech Stack
- Angular
- Ionic
- Capacitor
- Firebase
- Tailwind CSS
- Playwright (for testing)

## Getting Started

### Prerequisites
- Node.js (v16 or above recommended)
- npm
- Angular CLI
- Ionic CLI

### Installation
```bash
npm install
```

### Running the App
```bash
npm start
```

### Building for Android
1. Configure Capacitor and Android Studio.
2. Run:
```bash
ionic build
npx cap sync android
npx cap open android
```

### Running Tests
```bash
npm test
```

## Project Structure
- `src/` - Main application source code
- `android/` - Android build scripts and configuration
- `assets/` - Images, icons, and other static assets
- `tests/` - End-to-end and unit tests

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.
