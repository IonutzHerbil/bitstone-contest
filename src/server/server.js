const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require('openai');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from the root directory
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Read API key directly from .env file
let apiKey;
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiKeyMatch = envContent.match(/OPENAI_API_KEY=(.+)/);
  if (apiKeyMatch) {
    apiKey = apiKeyMatch[1].trim();
    console.log('API Key loaded successfully');
  }
} catch (error) {
  console.error('Error reading .env file:', error);
}

if (!apiKey) {
  console.error('Error: OPENAI_API_KEY not found in .env file');
  process.exit(1);
}

const app = express();
const port = 5000;

// Use CORS for cross-origin requests
app.use(cors());
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize OpenAI with the API key
const openai = new OpenAI({
  apiKey: apiKey
});

// Helper function to get coordinates from location name
async function getCoordinates(locationName) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`);
    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error.message);
    return null;
  }
}

// Endpoint to handle image upload and location detection
app.post('/api/detect-location', upload.single('image'), async (req, res) => {
  console.log('Received detect-location request');
  try {
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json({ error: 'No image file provided' });
    }
    console.log('File received:', req.file.mimetype, req.file.size, 'bytes');

    // Get user location if provided
    const userLocation = {
      lat: req.body.userLatitude,
      lon: req.body.userLongitude
    };
    
    if (userLocation.lat && userLocation.lon) {
      console.log('User location provided:', userLocation);
    }

    // Convert the buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    console.log('Image converted to base64');

    try {
      console.log('Calling OpenAI API...');
      
      // Construct the prompt with location hint if available
      let promptText = "Please identify what landmark or location this might be. Return the response in this exact JSON format: {\"name\": \"full name of the landmark\", \"description\": \"detailed description about its history and significance\", \"location\": \"city, country\"}. For the description, please include: historical background, architectural features, cultural importance, interesting facts, and visitor information when possible. Be as detailed and comprehensive as possible.";
      
      if (userLocation.lat && userLocation.lon) {
        promptText += ` The photo was taken near latitude ${userLocation.lat} and longitude ${userLocation.lon}, but this is just a hint - if you recognize a famous landmark from elsewhere, trust your identification over the location data.`;
      }
      
      // Call OpenAI API to analyze the image
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${req.file.mimetype};base64,${base64Image}`
                }
              },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.5,
      });
      console.log('OpenAI API response received');

      // Parse the response
      let locationInfo;
      try {
        console.log('Raw OpenAI response:', response.choices[0].message.content);
        const content = response.choices[0].message.content;
        
        // Extract JSON from markdown code blocks if present
        let jsonContent = content;
        const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1];
        }
        
        locationInfo = JSON.parse(jsonContent);
        console.log('Parsed location info:', locationInfo);
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.error('Raw content:', response.choices[0].message.content);
        
        // Attempt to extract information even if JSON parsing fails
        const rawContent = response.choices[0].message.content;
        return res.json({ 
          id: Math.random().toString(36).substring(2, 11),
          name: "Unknown Landmark",
          description: rawContent,
          location: "Unknown Location",
          coordinates: null,
          imageUrl: `data:${req.file.mimetype};base64,${base64Image}`,
          difficulty: 'medium',
        });
      }
      
      // Get coordinates
      console.log('Getting coordinates for:', locationInfo.name, locationInfo.location);
      const coordinates = await getCoordinates(locationInfo.name + " " + locationInfo.location);
      console.log('Coordinates:', coordinates);
      
      // Generate a unique ID for the location
      const locationId = Math.random().toString(36).substring(2, 11);

      // Create temporary URL for the uploaded image
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

      // Create response data
      const responseData = {
        id: locationId,
        name: locationInfo.name,
        description: locationInfo.description,
        enhancedDescription: locationInfo.enhancedDescription || locationInfo.description,
        location: locationInfo.location,
        coordinates: coordinates,
        imageUrl: imageUrl,
        difficulty: 'medium',
        // Additional information if available
        history: locationInfo.history,
        architecture: locationInfo.architecture,
        visitorInfo: locationInfo.visitorInfo,
        facts: locationInfo.facts
      };
      console.log('Sending response:', { ...responseData, imageUrl: '[truncated]' });

      res.json(responseData);
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      console.error('Error details:', openaiError.message);
      
      // Return a fallback response instead of an error
      return res.json({ 
        id: Math.random().toString(36).substring(2, 11),
        name: "Landmark Detection Failed",
        description: "We couldn't identify this landmark. Please try uploading a clearer image or a more recognizable landmark.",
        location: "Unknown Location",
        coordinates: null,
        imageUrl: `data:${req.file.mimetype};base64,${base64Image}`,
        difficulty: 'easy',
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    // Return a user-friendly response even on server error
    return res.json({ 
      id: Math.random().toString(36).substring(2, 11),
      name: "Landmark Detection Failed",
      description: "We couldn't process this image. Please try again with a different photo.",
      location: "Unknown Location",
      coordinates: null,
      imageUrl: `data:${req.file.mimetype};base64,${base64Image}`,
      difficulty: 'easy',
    });
  }
});

// Endpoint to handle image upload and analysis
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert the buffer to base64
    const base64Image = req.file.buffer.toString('base64');

    // Call OpenAI API to analyze the image
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please identify what landmark or location this might be and provide a detailed description of what you see in the image. Focus on architectural details, historical significance, and any other notable features.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${req.file.mimetype};base64,${base64Image}`
              }
            },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.5,
    });

    res.json({
      analysis: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.json({ 
      analysis: "We couldn't analyze this image. Please try again with a different photo." 
    });
  }
});

// Add a test endpoint to verify OpenAI API key
app.get('/api/test-openai', async (req, res) => {
  try {
    console.log('Testing OpenAI API key...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: "Hello, this is a test message. Please respond with 'API key is working!'"
        }
      ],
    });
    console.log('OpenAI test response:', response.choices[0].message);
    res.json({ status: 'success', message: response.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API Key test error:', error);
    res.status(500).json({ 
      error: 'Error testing OpenAI API key',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 