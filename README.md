# Cluj-Napoca Landmark Detector

This web application has two main functionalities: a Location Explorer for landmark identification and a Photo Game for testing your knowledge of Cluj-Napoca landmarks. It uses ChatGPT's vision capabilities to identify locations and provides information about them. The app also uses geolocation to verify the user's current location.

## Features

- Two main modes: Location Explorer and Photo Game
- Image upload and preview
- Location detection
- AI-powered image analysis using ChatGPT
- Real-time location verification
- Modern UI with Chakra UI
- User authentication and progress tracking

## Application Modes

### Location Explorer
This mode allows users to identify landmarks in Cluj-Napoca by uploading photos. The AI analyzes the image and provides information about the landmark, including its name, history, and significance.

### Photo Game
This interactive game challenges users to identify famous landmarks in Cluj-Napoca. Users are shown images of landmarks and must correctly identify them to earn points. The game includes:
- Multiple difficulty levels
- Score tracking
- Leaderboard functionality
- Educational information about each landmark

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   PORT=5000
   ```
   Replace `your_openai_api_key_here` with your actual OpenAI API key.
   Replace `your_mongodb_connection_string` with your MongoDB connection URI.
   Replace `your_secure_jwt_secret` with a secure random string for JWT token signing.

## Running the Application

1. Start the backend server:
   ```bash
   node server/server.js
   ```

2. In a new terminal, start the React frontend:
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

Alternatively, you can run both frontend and backend concurrently:
   ```bash
   npm run dev
   ```

## Usage

### Location Explorer
1. Allow location access when prompted by your browser
2. Select "Location Explorer" from the main menu
3. Click "Select Image" to choose a photo of a landmark in Cluj-Napoca
4. Click "Analyze Image" to upload and process the image
5. The app will display the AI's analysis of the landmark and verify your location

### Photo Game
1. Select "Photo Game" from the main menu
2. Choose a difficulty level
3. View the presented landmark image and select the correct name from the options
4. Track your score and compare with other users on the leaderboard

## Note

Make sure to enable location services in your browser for the best experience. The application works best with clear photos of well-known landmarks in Cluj-Napoca.
