# Cluj-Napoca Landmark Detector

This web application allows users to upload photos of landmarks in Cluj-Napoca and uses ChatGPT's vision capabilities to identify the location and provide information about it. The app also uses geolocation to verify the user's current location.

## Features

- Image upload and preview
- Location detection
- AI-powered image analysis using ChatGPT
- Real-time location verification
- Modern UI with Chakra UI

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
   PORT=5000
   ```
   Replace `your_openai_api_key_here` with your actual OpenAI API key.

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

## Usage

1. Allow location access when prompted by your browser
2. Click "Select Image" to choose a photo of a landmark in Cluj-Napoca
3. Click "Analyze Image" to upload and process the image
4. The app will display the AI's analysis of the landmark and verify your location

## Note

Make sure to enable location services in your browser for the best experience. The application works best with clear photos of well-known landmarks in Cluj-Napoca.
