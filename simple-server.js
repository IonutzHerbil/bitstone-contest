const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Custom function to load .env with space handling
function loadEnvVars() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envVars = {};
  
  try {
    // Try to read as UTF-16LE (Little Endian)
    const buffer = fs.readFileSync(envPath);
    
    // Check for UTF-16 BOM (Byte Order Mark)
    const isUtf16le = buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE;
    
    // Convert buffer to string with appropriate encoding
    const content = isUtf16le 
      ? buffer.toString('utf16le') 
      : buffer.toString('utf8');
    
    // Process the content line by line
    content.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      
      // Split by the first = sign
      const separatorIndex = line.indexOf('=');
      if (separatorIndex > 0) {
        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + 1).trim();
        envVars[key] = value;
      }
    });
    
    console.log('Environment variables loaded successfully');
    console.log('Found variables:', Object.keys(envVars));
    console.log('OPENAI_API_KEY found:', !!envVars.OPENAI_API_KEY);
    if (envVars.OPENAI_API_KEY) {
      console.log('API Key starts with:', envVars.OPENAI_API_KEY.substring(0, 10) + '...');
    }
    return envVars;
  } catch (error) {
    console.error('Error loading .env file:', error.message);
    return {};
  }
}

const envVars = loadEnvVars();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize OpenAI with API key from .env
const openai = new OpenAI({
  apiKey: envVars.OPENAI_API_KEY
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

    // Convert the buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    console.log('Image converted to base64');

    try {
      console.log('Calling OpenAI API...');
      console.log('Using model: gpt-4o');
      // Call OpenAI API to analyze the image
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please identify what landmark or location this might be. Return the response in this exact JSON format: {\"name\": \"full name of the landmark\", \"description\": \"brief description\", \"location\": \"city, country\"}. Keep the description under 100 words.",
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
        max_tokens: 500,
        temperature: 0.7,
      });
      console.log('OpenAI API response received');

      // Parse the response
      let locationInfo;
      try {
        console.log('Raw OpenAI response:', response.choices[0].message.content);
        // Clean up markdown formatting from the response
        let content = response.choices[0].message.content;
        
        // Remove markdown code blocks if present
        if (content.includes('```')) {
          content = content.replace(/```json\n/g, '').replace(/```/g, '');
        }
        
        // Trim any extra whitespace
        content = content.trim();
        
        locationInfo = JSON.parse(content);
        console.log('Parsed location info:', locationInfo);
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.error('Raw content:', response.choices[0].message.content);
        return res.status(500).json({ 
          error: 'Invalid response format from OpenAI',
          details: parseError.message
        });
      }
      
      // Get coordinates
      console.log('Getting coordinates for:', locationInfo.name, locationInfo.location);
      const coordinates = await getCoordinates(locationInfo.name + " " + locationInfo.location);
      console.log('Coordinates:', coordinates);
      
      // Generate a unique ID for the location
      const locationId = Math.random().toString(36).substr(2, 9);

      // Create temporary URL for the uploaded image
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

      const responseData = {
        id: locationId,
        name: locationInfo.name,
        description: locationInfo.description,
        location: locationInfo.location,
        coordinates: coordinates,
        imageUrl: imageUrl,
        difficulty: 'medium',
      };
      console.log('Sending response:', { ...responseData, imageUrl: '[truncated]' });

      res.json(responseData);
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      console.error('Error details:', openaiError.message);
      if (openaiError.response) {
        console.error('OpenAI response data:', openaiError.response.data);
      }
      return res.status(500).json({ 
        error: 'Error calling OpenAI API',
        details: openaiError.message 
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: 'Error detecting location',
      details: error.message 
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
              text: "This image is from Cluj-Napoca, Romania. Please identify what landmark or location this might be and provide a detailed description of what you see in the image. Focus on architectural details and historical significance if visible.",
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
      max_tokens: 500,
      temperature: 0.7,
    });

    res.json({
      analysis: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Error analyzing image', details: error.message });
  }
});

// Mock Authentication Endpoints
app.post('/api/auth/register', (req, res) => {
  console.log('Received register request:', req.body);
  // Return a mock successful registration response
  res.json({
    user: {
      id: 'mock-user-id',
      username: req.body.username,
      email: req.body.email
    },
    token: 'mock-jwt-token'
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Received login request:', req.body);
  // Return a mock successful login response
  res.json({
    user: {
      id: 'mock-user-id',
      username: req.body.username,
      email: 'user@example.com',
      gameProgress: []
    },
    token: 'mock-jwt-token'
  });
});

app.get('/api/auth/profile', (req, res) => {
  // Return a mock user profile
  res.json({
    user: {
      id: 'mock-user-id',
      username: 'mockuser',
      email: 'user@example.com',
      gameProgress: []
    }
  });
});

app.post('/api/auth/progress', (req, res) => {
  console.log('Received progress update:', req.body);
  // Return mock progress data
  res.json({
    gameProgress: [
      {
        gameId: req.body.gameId || 'default-game',
        completed: req.body.completed || false,
        completedLocations: req.body.completedLocations || []
      }
    ]
  });
});

app.get('/api/auth/progress/:gameId', (req, res) => {
  // Return mock game progress for the requested game
  res.json({
    gameId: req.params.gameId,
    completed: false,
    completedLocations: [],
    score: 0
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Location Explorer API available at http://localhost:${port}/api/detect-location`);
  console.log(`Image Analysis API available at http://localhost:${port}/api/analyze-image`);
  console.log(`Mock Auth API available at http://localhost:${port}/api/auth/*`);
}); 