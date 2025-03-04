# TranslationFlow

An application to manage and streamline translation workflows.

## Features

- User authentication
- Project management
- Workflow phases tracking
- Multi-language support
- Dashboard with project statistics
- File management for video content

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication & Database**: Firebase (Authentication, Firestore)
- **Storage**: Firebase Storage
- **UI Component Library**: Custom components with Tailwind

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Firebase account

### Installation

```bash
# Clone the repository
git clone https://github.com/ElevanaAV/transflow2.git
cd transflow2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your Firebase configuration values in .env

# Run the development server
npm run dev
```

### Deployment

This project includes a deployment script:

```bash
# Deploy to Firebase
npm run deploy
```

The script:
1. Checks for the correct Node version
2. Builds the Next.js app
3. Deploys to Firebase

## Project Structure

- `/src/app`: Next.js app router pages
- `/src/components`: Reusable React components
- `/src/context`: React context providers
- `/src/lib`: Utilities, services, and types
- `/public`: Static assets

## Firebase Configuration

This application uses Firebase for:
- Authentication
- Firestore database
- Cloud Storage
- Hosting
- Server-side functions for dynamic routes

Make sure to set up your Firebase project with the necessary services enabled.

## License

This project is proprietary and confidential.