const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Express
const app = express();
const port = 5002; // Explicitly use port 5002 to avoid conflicts

app.use(cors());
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to encode image to base64
function encodeImage(imageBuffer) {
  return imageBuffer.toString('base64');
}

// Endpoint to handle image upload and analysis
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Analyze: File received:', req.file.mimetype, req.file.size, 'bytes');
    
    // Convert the buffer to base64
    const base64Image = encodeImage(req.file.buffer);
    
    try {
      // Call OpenAI API using GPT-4 Vision
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
        max_tokens: 500
      });

      res.json({
        analysis: response.choices[0].message.content
      });
    } catch (error) {
      console.error('OpenAI API Error:', error);
      res.status(500).json({ 
        error: 'Error calling OpenAI API', 
        details: error.message 
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'Error analyzing image', 
      details: error.message 
    });
  }
});

// Endpoint to handle image upload and location detection
app.post('/api/detect-location', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Detect: File received:', req.file.mimetype, req.file.size, 'bytes', req.file.originalname);

    // Convert the buffer to base64
    const base64Image = encodeImage(req.file.buffer);
    
    try {
      // Call OpenAI API using GPT-4 Vision
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please identify what landmark or location this might be. Return the response in this exact JSON format with no additional text: {\"name\": \"full name of the landmark\", \"description\": \"brief description\", \"location\": \"city, country\"}. Keep the description under 100 words.",
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
        max_tokens: 500
      });

      console.log('Raw OpenAI response:', response.choices[0].message.content);
      
      // Parse the response
      let locationInfo;
      try {
        locationInfo = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.error('Raw content:', response.choices[0].message.content);
        
        // If parsing fails, create a manually formatted object
        locationInfo = {
          name: "Parsing Error",
          description: "Received a response but couldn't parse it as JSON. Raw response: " + response.choices[0].message.content.substring(0, 100) + "...",
          location: "Unknown Location"
        };
      }
      
      // Generate a unique ID for the location
      const locationId = Math.random().toString(36).substr(2, 9);

      // Temporary image URL for response
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      
      const responseData = {
        id: locationId,
        name: locationInfo.name || "Unknown Landmark",
        description: locationInfo.description || "No description available",
        location: locationInfo.location || "Unknown Location",
        coordinates: null,
        imageUrl: imageUrl,
        difficulty: 'medium',
      };
      
      console.log('Sending location info:', responseData.name);
      res.json(responseData);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      console.error('Error details:', error.message);
      
      // Fall back to basic recognition if OpenAI fails
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      const fileName = req.file.originalname.toLowerCase();
      
      let fallbackResponse = {
        id: Math.random().toString(36).substr(2, 9),
        name: "API Error",
        description: "Could not analyze the image due to an API error: " + error.message,
        location: "Unknown Location",
        coordinates: null,
        imageUrl: imageUrl,
        difficulty: 'medium',
      };
      
      // Simple rule-based detection for common landmarks as fallback
      if (fileName.includes('eiffel') || fileName.includes('tower') || fileName.includes('paris')) {
        fallbackResponse = {
          ...fallbackResponse,
          name: "Eiffel Tower",
          description: "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France.",
          location: "Paris, France",
        };
      }
      
      res.json(fallbackResponse);
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'Error detecting location', 
      details: error.message 
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`OpenAI API Key configured: ${!!process.env.OPENAI_API_KEY}`);
}); 