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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
    console.log('Searching for coordinates with query:', locationName);
    
    // Check for known landmarks first
    const knownLandmarks = {
      "St. Michael's Church": { lat: 46.7694, lon: 23.5909 },
      "Matthias Corvinus Statue": { lat: 46.7693, lon: 23.5900 },
      "Central Park Cluj-Napoca": { lat: 46.7689, lon: 23.5786 },
      "Botanical Garden": { lat: 46.7612, lon: 23.5882 },
      "Babeș-Bolyai University": { lat: 46.7667, lon: 23.5898 },
      "Orthodox Cathedral": { lat: 46.7713, lon: 23.5968 },
      "National Theatre": { lat: 46.7704, lon: 23.5966 },
      "Union Square": { lat: 46.7690, lon: 23.5907 },
      "Museum Square": { lat: 46.7705, lon: 23.5875 },
      "Tailors' Bastion": { lat: 46.7711, lon: 23.5870 },
      "Avram Iancu Square": { lat: 46.7716, lon: 23.5965 },
      "Cetatuia Hill": { lat: 46.7787, lon: 23.5863 },
      "Unirii Square": { lat: 46.7692, lon: 23.5891 },
      "Dormition Cathedral": { lat: 46.7714, lon: 23.5967 },
      "Alexandru Borza Botanical Garden": { lat: 46.7612, lon: 23.5882 },
      "Casino Cluj": { lat: 46.7688, lon: 23.5790 },
      "Piata Avram Iancu": { lat: 46.7716, lon: 23.5965 },
      "Piata Unirii": { lat: 46.7692, lon: 23.5891 },
      "Bánffy Palace": { lat: 46.7696, lon: 23.5898 },
      "Reformed Church": { lat: 46.7702, lon: 23.5881 },
      "Romanian National Opera": { lat: 46.7703, lon: 23.5966 },
      "Cluj Arena": { lat: 46.7661, lon: 23.5701 },
    };
    
    // Check if the location name or part of it matches a known landmark
    for (const [landmark, coords] of Object.entries(knownLandmarks)) {
      if (locationName.toLowerCase().includes(landmark.toLowerCase()) || 
          landmark.toLowerCase().includes(locationName.toLowerCase())) {
        console.log(`Found coordinates for known landmark: ${landmark}`);
        return coords;
      }
    }
    
    // If it's an exact match for a known landmark
    if (knownLandmarks[locationName]) {
      console.log(`Found exact match for known landmark: ${locationName}`);
      return knownLandmarks[locationName];
    }
    
    // First try with the full location name and specify Cluj-Napoca, Romania
    let searchQuery = `${locationName}, Cluj-Napoca, Romania`;
    let response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: searchQuery,
        format: 'json',
        limit: 1,
        addressdetails: 1,
        'accept-language': 'en',
      },
      headers: {
        'User-Agent': 'ClujLandmarksApp/1.0'
      }
    });
    
    // If we got results, return them
    if (response.data && response.data.length > 0) {
      // Check if the result is actually in Cluj-Napoca
      const address = response.data[0].address || {};
      if (address.city === 'Cluj-Napoca' || 
          address.town === 'Cluj-Napoca' || 
          address.county === 'Cluj' ||
          (address.state && address.state.includes('Cluj'))) {
        console.log('Found coordinates with full query:', searchQuery);
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
        };
      } else {
        console.log('Coordinates found but not in Cluj-Napoca, ignoring:', response.data[0]);
      }
    }
    
    // Try just the landmark name without location qualifiers
    const simplifiedName = locationName.split(',')[0].trim();
    searchQuery = `${simplifiedName}, Cluj-Napoca`;
    response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: searchQuery,
        format: 'json',
        limit: 1,
        addressdetails: 1,
        countrycodes: 'ro',
        'accept-language': 'en',
      },
      headers: {
        'User-Agent': 'ClujLandmarksApp/1.0'
      }
    });
    
    if (response.data && response.data.length > 0) {
      // Check if the result is actually in Cluj-Napoca
      const address = response.data[0].address || {};
      if (address.city === 'Cluj-Napoca' || 
          address.town === 'Cluj-Napoca' || 
          address.county === 'Cluj' ||
          (address.state && address.state.includes('Cluj'))) {
        console.log('Found coordinates with simplified query:', searchQuery);
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
        };
      } else {
        console.log('Coordinates found but not in Cluj-Napoca, ignoring:', response.data[0]);
      }
    }
    
    console.log('No coordinates found for:', locationName);
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
            content: "You are a landmark identification system for Cluj-Napoca, Romania. You only respond with valid, structured JSON objects matching the exact format requested. Focus on identifying landmarks, monuments, buildings, and locations specifically from Cluj-Napoca. Provide detailed, accurate, and comprehensive information."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Look at this image and identify the landmark or location in Cluj-Napoca. Respond ONLY with a single JSON object with the following fields:\n\n- name: landmark name\n- description: brief overview (100-150 words)\n- location: specific area in Cluj-Napoca\n- historicalContext: brief history (50-100 words)\n- architecturalDetails: description of architectural elements (50-100 words)\n- culturalSignificance: importance to local culture (50-100 words)\n- visitorInfo: practical information for visitors\n- constructionYear: year or period of construction\n- architect: name of architect/builder if known\n- style: architectural style\n- openingHours: typical opening hours if applicable\n- entryFee: cost of entry if applicable\n- accessibility: accessibility information\n- nearbyAttractions: notable places nearby\n- transportLinks: how to get there\n\nKeep all text concise but informative. No other text, no explanations, just the JSON."
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
        max_tokens: 1000,
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
          location: "Cluj-Napoca, Romania",
          historicalContext: "Historical information is not available for this location.",
          architecturalDetails: "Architectural details could not be determined from the provided image.",
          culturalSignificance: "Cultural significance information is not available.",
          visitorInfo: "Contact local tourism office for visitor information.",
          constructionYear: "Unknown",
          architect: "Unknown",
          style: "Unknown architectural style",
          openingHours: "Not available",
          entryFee: "Not available",
          accessibility: "Information not available",
          nearbyAttractions: "Explore the historic center of Cluj-Napoca nearby",
          transportLinks: "Accessible via public transportation in Cluj-Napoca"
        };
        console.log('Created fallback location info:', locationInfo);
      }
      
      // Get coordinates
      console.log('Getting coordinates for:', locationInfo.name, locationInfo.location);
      let coordinates = await getCoordinates(locationInfo.name + " " + locationInfo.location);
      console.log('Coordinates:', coordinates);
      
      // If coordinates couldn't be found, use default coordinates for Cluj-Napoca central point
      if (!coordinates) {
        coordinates = {
          lat: 46.7692, // Union Square (Piața Unirii) coordinates
          lon: 23.5891
        };
        console.log('Using default Cluj-Napoca coordinates (Union Square):', coordinates);
      }
      
      // Add map-specific properties
      const mapProperties = {
        zoomLevel: determineZoomLevel(locationInfo),
        mapType: determineMapType(locationInfo),
        pointsOfInterest: nearbyPointsOfInterest(locationInfo.name, coordinates)
      };
      
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
        mapProperties: mapProperties,
        imageUrl: imageUrl,
        difficulty: 'medium',
        historicalContext: locationInfo.historicalContext || null,
        architecturalDetails: locationInfo.architecturalDetails || null,
        culturalSignificance: locationInfo.culturalSignificance || null,
        visitorInfo: locationInfo.visitorInfo || null,
        constructionYear: locationInfo.constructionYear || null,
        architect: locationInfo.architect || null,
        style: locationInfo.style || null,
        openingHours: locationInfo.openingHours || null,
        entryFee: locationInfo.entryFee || null,
        accessibility: locationInfo.accessibility || null,
        nearbyAttractions: locationInfo.nearbyAttractions || null,
        transportLinks: locationInfo.transportLinks || null
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

// Helper function to determine appropriate zoom level based on location type
function determineZoomLevel(locationInfo) {
  // Default zoom level for city landmarks
  let zoomLevel = 17;
  
  const name = locationInfo.name.toLowerCase();
  const description = locationInfo.description.toLowerCase();
  
  // Larger areas need a wider view
  if (
    name.includes('square') || 
    name.includes('park') || 
    name.includes('garden') ||
    description.includes('square') || 
    description.includes('park') || 
    description.includes('garden')
  ) {
    zoomLevel = 16;
  }
  
  // Buildings need a closer view
  if (
    name.includes('church') || 
    name.includes('cathedral') || 
    name.includes('building') ||
    name.includes('house') ||
    name.includes('museum') ||
    description.includes('church') || 
    description.includes('cathedral') || 
    description.includes('building') ||
    description.includes('house') ||
    description.includes('museum')
  ) {
    zoomLevel = 18;
  }
  
  return zoomLevel;
}

// Helper function to determine appropriate map type
function determineMapType(locationInfo) {
  // Default map type
  return 'standard';
}

// Helper function to suggest nearby points of interest
function nearbyPointsOfInterest(locationName, coordinates) {
  // This would typically involve a database query, but for now we'll return some defaults
  const clujLandmarks = {
    "St. Michael's Church": ["Matthias Corvinus Statue", "National Museum of Art"],
    "Matthias Corvinus Statue": ["St. Michael's Church", "Central Park Cluj-Napoca"],
    "Central Park Cluj-Napoca": ["Casino", "Art Museum"],
    "Botanical Garden": ["Alexandru Borza Botanical Garden Museum", "USAMV Cluj-Napoca"],
    "Babeș-Bolyai University": ["National Theatre", "Central Park Cluj-Napoca"],
    "Orthodox Cathedral": ["Avram Iancu Square", "National Theatre"],
    "National Theatre": ["Orthodox Cathedral", "Avram Iancu Square"],
    "Union Square": ["St. Michael's Church", "Museum Square"],
    "Museum Square": ["Union Square", "Pharmacy Museum"],
    "Tailors' Bastion": ["Museum Square", "Potaissa Street"]
  };
  
  // Return nearby landmarks if we know them, otherwise return generic suggestions
  if (clujLandmarks[locationName]) {
    return clujLandmarks[locationName];
  } else {
    return ["Union Square", "St. Michael's Church", "Central Park Cluj-Napoca"];
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 