const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const axios = require('axios');

// Load environment variables
dotenv.config();
console.log('OpenAI API Key configured:', !!process.env.OPENAI_API_KEY);

const app = express();
const port = 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

app.use(cors());
app.use(express.json({ limit: '0' }));
app.use(express.urlencoded({ limit: '0', extended: true }));

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: Infinity, // No file size limit
  }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Authentication routes
app.use('/api/auth', authRoutes);
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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    // Convert the buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    console.log('Image converted to base64');

    try {
      console.log('Calling OpenAI API...');
      console.log('Using model:', "gpt-4o");
      // Call OpenAI API to analyze the image
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a landmark identification system for Cluj-Napoca, Romania. You only respond with valid, structured JSON objects matching the exact format requested. Focus on identifying landmarks, monuments, buildings, and locations specifically from Cluj-Napoca."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Look at this image and identify the landmark or location. Respond ONLY with a single JSON object in this exact format: {\"name\": \"landmark name\", \"description\": \"brief factual description\", \"location\": \"city, country\"}. Keep description under 100 words. No other text, no explanations, just the JSON."
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
        response_format: { type: "json_object" },
        temperature: 0.3,
      });
      console.log('OpenAI API response received');

      // Parse the response
      let locationInfo;
      try {
        console.log('Raw OpenAI response:', response.choices[0].message.content);
        const content = response.choices[0].message.content;
        
        // Clean the response if necessary (remove any markdown or non-JSON content)
        let jsonContent = content;
        if (content.includes("```json")) {
          jsonContent = content.split("```json")[1].split("```")[0].trim();
        } else if (content.includes("```")) {
          jsonContent = content.split("```")[1].split("```")[0].trim();
        }
        
        locationInfo = JSON.parse(jsonContent);
        console.log('Parsed location info:', locationInfo);
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.error('Raw content:', response.choices[0].message.content);
        
        // Create a default location object
        locationInfo = {
          name: "Unidentified Landmark",
          description: "This appears to be an interesting location that couldn't be specifically identified.",
          location: "Unknown Location"
        };
        console.log('Created fallback location info:', locationInfo);
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
          role: "system",
          content: "You are a landmark identification system specializing in architectural and historical landmarks. Provide detailed, factual information in structured JSON format."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "This image is from Cluj-Napoca, Romania. Identify what landmark or location this might be and provide a detailed description of architectural details and historical significance. Response must be in JSON format: {\"name\": \"landmark name\", \"description\": \"detailed description\", \"historicalContext\": \"brief history\"}."
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
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    try {
      // Extract and clean the JSON
      const content = response.choices[0].message.content;
      let analysis = content;
      
      // Try to extract JSON if it's wrapped in markdown code blocks
      if (content.includes("```json")) {
        analysis = content.split("```json")[1].split("```")[0].trim();
      } else if (content.includes("```")) {
        analysis = content.split("```")[1].split("```")[0].trim();
      }
      
      // Try to parse it as JSON
      try {
        const jsonAnalysis = JSON.parse(analysis);
        res.json({ analysis: jsonAnalysis });
      } catch (parseError) {
        // If JSON parsing fails, return the raw content
        res.json({ analysis: content });
      }
    } catch (error) {
      console.error('Error processing analysis response:', error);
      res.json({ analysis: response.choices[0].message.content });
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Error analyzing image', details: error.message });
  }
});

// Add a test endpoint to verify OpenAI API key
app.get('/api/test-openai', async (req, res) => {
  try {
    console.log('Testing OpenAI API key...');
    const response = await openai.chat.completions.create({
      model: "gpt-4",
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

// Add a test endpoint to verify image processing capabilities
app.post('/api/test-vision', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert the buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    console.log('Test image converted to base64, size:', base64Image.length);

    // Call OpenAI API with a simple image description request
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a visual recognition system that only responds with valid structured JSON. Never include explanations or context around your answer."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What's in this image? Respond ONLY with this exact JSON format: {\"description\": \"your description here\"}. No markdown formatting, no explanations, just the JSON object."
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
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.3,
    });

    console.log('Test vision API response:', response.choices[0].message.content);
    
    // Parse the response to verify it's valid JSON
    try {
      const content = response.choices[0].message.content;
      
      // Clean the response if necessary
      let jsonContent = content;
      if (content.includes("```json")) {
        jsonContent = content.split("```json")[1].split("```")[0].trim();
      } else if (content.includes("```")) {
        jsonContent = content.split("```")[1].split("```")[0].trim();
      }
      
      const json = JSON.parse(jsonContent);
      res.json({ 
        status: 'success', 
        message: 'Image processing working correctly',
        result: json
      });
    } catch (parseError) {
      console.error('Error parsing test vision response:', parseError);
      res.status(200).json({ 
        status: 'warning', 
        message: 'OpenAI returned non-JSON response',
        raw: response.choices[0].message.content,
        fallback: {
          description: "Image content could not be parsed correctly"
        }
      });
    }
  } catch (error) {
    console.error('Test vision API error:', error);
    res.status(500).json({ 
      error: 'Error testing vision API',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 