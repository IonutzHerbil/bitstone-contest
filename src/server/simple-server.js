const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint to handle image upload and analysis
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  console.log('Received analyze-image request');
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
    
    console.log('Using model: gpt-4o');

    // Convert the buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    console.log('Image converted to base64');

    try {
      console.log('Calling OpenAI API...');
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
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.0,
        frequency_penalty: 0.0,
      });
      console.log('OpenAI API response received');

      res.json({
        analysis: response.choices[0].message.content
      });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      console.error('Full error details:', JSON.stringify(openaiError, null, 2));
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
    res.status(500).json({
      error: 'Error analyzing image',
      details: error.message,
      stack: error.stack
    });
  }
});

// Add a detect-location endpoint similar to analyze-image
app.post('/api/detect-location', upload.single('image'), async (req, res) => {
  console.log('Received detect-location request');
  try {
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json({ error: 'No image file provided' });
    }
    console.log('File received for location detection:', req.file.mimetype, req.file.size, 'bytes');
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }
    
    console.log('Using model: gpt-4o');

    // Convert the buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    console.log('Image converted to base64');

    try {
      console.log('Calling OpenAI API...');
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
                  url: `data:image/jpeg;base64,${base64Image}`
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
        locationInfo = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.error('Raw content:', response.choices[0].message.content);
        
        // If parsing fails, create a manually formatted object instead of failing
        locationInfo = {
          name: "Unknown Landmark",
          description: response.choices[0].message.content.substring(0, 100) + "...",
          location: "Unknown Location"
        };
        console.log('Created fallback location info:', locationInfo);
      }
      
      // Generate a unique ID for the location
      const locationId = Math.random().toString(36).substr(2, 9);

      // Create temporary URL for the uploaded image
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      const responseData = {
        id: locationId,
        name: locationInfo.name || "Unknown Landmark",
        description: locationInfo.description || "No description available",
        location: locationInfo.location || "Unknown Location",
        coordinates: null, // Simplified version without coordinates
        imageUrl: imageUrl,
        difficulty: 'medium',
      };
      console.log('Sending response:', { ...responseData, imageUrl: '[Base64 image truncated]' });

      res.json(responseData);
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      console.error('Full error details:', JSON.stringify(openaiError, null, 2));
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
    res.status(500).json({
      error: 'Error detecting location',
      details: error.message,
      stack: error.stack
    });
  }
});

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'Server is running!' });
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
      details: error.message,
      stack: error.stack
    });
  }
});

app.listen(port, () => {
  console.log(`Simple server is running on port ${port}`);
}); 