const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const port = 5000;

// CORS for cross-origin requests
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Mock users database
const users = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    password: 'password123',
    gameProgress: []
  }
];

// JWT secret key (in a real app, this would be in an environment variable)
const JWT_SECRET = 'your-secret-key-for-testing-only';

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password, // In a real app, you would hash this password
      gameProgress: []
    };
    
    users.push(newUser);
    
    // Create a JWT token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '24h' });
    
    // Return user info and token (excluding the password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    console.log(`Registered new user: ${username}`);
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user (in a real app, you would verify the hashed password)
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }
    
    // Create a JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    // Return user info and token (excluding the password)
    const { password: _, ...userWithoutPassword } = user;
    
    console.log(`User logged in: ${username}`);
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Get user profile endpoint
app.get('/api/auth/profile', authMiddleware, (req, res) => {
  // Return user info (excluding the password)
  const { password, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

// Update game progress endpoint
app.post('/api/auth/progress', authMiddleware, (req, res) => {
  try {
    const { gameId, completed, completedLocations } = req.body;
    
    let gameProgress = req.user.gameProgress.find(g => g.gameId === gameId);
    
    if (!gameProgress) {
      gameProgress = { 
        gameId, 
        completed: false, 
        completedLocations: [] 
      };
      req.user.gameProgress.push(gameProgress);
    }

    // Update completedLocations if provided
    if (completedLocations && Array.isArray(completedLocations)) {
      // Handle both object format and direct ID format
      gameProgress.completedLocations = completedLocations.map(loc => {
        const locationId = typeof loc === 'object' ? loc.locationId : loc;
        return {
          locationId: locationId,
          timestamp: new Date()
        };
      });
    }

    if (completed) {
      gameProgress.completed = true;
    }

    console.log(`Updated game progress for user ${req.user.username}, game ${gameId}`);
    res.json({ gameProgress: req.user.gameProgress });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get game progress endpoint
app.get('/api/auth/progress/:gameId', authMiddleware, (req, res) => {
  try {
    const { gameId } = req.params;
    const gameProgress = req.user.gameProgress.find(g => g.gameId === gameId);
    
    if (!gameProgress) {
      return res.json({
        gameId,
        completed: false,
        completedLocations: [],
        score: 0
      });
    }

    res.json(gameProgress);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch progress',
      details: error.message
    });
  }
});

// Mock landmark data
const landmarks = [
  {
    name: "Saint Michael's Church",
    description: "Gothic-style Roman Catholic church in the heart of Cluj-Napoca. Built primarily in the 14th-15th centuries, it's the second largest church in Transylvania. The church features a 76-meter-tall tower, intricate stone carvings, and houses numerous valuable artifacts including Gothic altars and Renaissance furnishings.",
    location: "Cluj-Napoca, Romania",
    coordinates: {
      lat: 46.7694,
      lon: 23.5894
    }
  },
  {
    name: "Matthias Corvinus Statue",
    description: "Equestrian statue of King Matthias Corvinus, who was born in Cluj in 1443. The bronze monument depicts the king on horseback surrounded by military commanders. Designed by János Fadrusz, it was unveiled in 1902 in Union Square and remains one of the city's most iconic landmarks.",
    location: "Cluj-Napoca, Romania",
    coordinates: {
      lat: 46.7695,
      lon: 23.5890
    }
  },
  {
    name: "Cluj-Napoca National Theatre",
    description: "Neo-baroque style theatre building completed in 1906, designed by famous Viennese architects Fellner and Helmer. The ornate facade features decorative elements and statues, while the interior boasts lavish decorations, including a ceiling painted by Károly Lotz and a large chandelier with 100 lights.",
    location: "Cluj-Napoca, Romania",
    coordinates: {
      lat: 46.7699,
      lon: 23.5914
    }
  },
  {
    name: "Banffy Palace",
    description: "Baroque palace built between 1774-1785, designed by German architect Johann Eberhard Blaumann. It served as the residence of the Bánffy family and now houses the Art Museum. The facade features statues representing Mars, Minerva, Apollo, Diana, and other mythological figures, symbolizing virtues of the aristocracy.",
    location: "Cluj-Napoca, Romania",
    coordinates: {
      lat: 46.7692,
      lon: 23.5901
    }
  },
  {
    name: "Eiffel Tower",
    description: "Iconic wrought-iron lattice tower located on the Champ de Mars in Paris. Named after engineer Gustave Eiffel, it was constructed from 1887-1889 as the entrance to the 1889 World's Fair. Standing at 330 meters tall, it was the tallest man-made structure in the world for 41 years until the completion of the Chrysler Building in New York City.",
    location: "Paris, France",
    coordinates: {
      lat: 48.8584,
      lon: 2.2945
    }
  },
  {
    name: "Statue of Liberty",
    description: "Colossal neoclassical sculpture on Liberty Island in New York Harbor. A gift from the people of France to the United States, it was designed by French sculptor Frédéric Auguste Bartholdi and built by Gustave Eiffel. The copper statue, dedicated in 1886, depicts Libertas, the Roman goddess of liberty, holding a torch and tablet inscribed with the date of American independence.",
    location: "New York City, USA",
    coordinates: {
      lat: 40.6892,
      lon: -74.0445
    }
  },
  {
    name: "Colosseum",
    description: "Ancient Roman amphitheater built of travertine limestone, tuff, and brick-faced concrete. Construction began under Emperor Vespasian in 72 AD and was completed in 80 AD under his successor Titus. The elliptical structure could hold between 50,000-80,000 spectators and was used for gladiatorial contests, public spectacles, executions, and dramas based on Classical mythology.",
    location: "Rome, Italy",
    coordinates: {
      lat: 41.8902,
      lon: 12.4922
    }
  },
  {
    name: "Great Wall of China",
    description: "Ancient defensive structure built to protect Chinese states and empires against raids and invasions. It consists of numerous walls built beginning in the 7th century BC, with the most famous sections built during the Ming Dynasty (1368-1644). Stretching approximately 13,171 miles from east to west, it's the world's longest wall and biggest ancient architecture.",
    location: "Northern China",
    coordinates: {
      lat: 40.4319,
      lon: 116.5704
    }
  }
];

// Endpoint to handle image upload and location detection
app.post('/api/detect-location', upload.single('image'), (req, res) => {
  console.log('Received detect-location request');
  
  try {
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json({ error: 'No image file provided' });
    }
    console.log('File received:', req.file.mimetype, req.file.size, 'bytes');

    // Create a base64 representation of the image
    const base64Image = req.file.buffer.toString('base64');
    
    // Randomly select a landmark (in a real app this would be AI-based)
    const landmark = landmarks[Math.floor(Math.random() * landmarks.length)];
    
    // Generate a unique ID
    const locationId = Math.random().toString(36).substr(2, 9);
    
    // Create temporary URL for the uploaded image
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    
    // Send response with landmark data
    const responseData = {
      id: locationId,
      name: landmark.name,
      description: landmark.description,
      location: landmark.location,
      coordinates: landmark.coordinates,
      imageUrl: imageUrl,
      difficulty: 'medium',
    };
    
    console.log('Detected location:', landmark.name);
    res.json(responseData);
    
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'Error detecting location',
      details: error.message 
    });
  }
});

// Endpoint for analyzing images (simplified version that returns pre-written content)
app.post('/api/analyze-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Pre-written analysis for demonstration
    const analyses = [
      "This appears to be a historical landmark in Cluj-Napoca, Romania. The architecture displays Gothic elements typical of medieval Central European buildings. The structure has impressive spires and ornate stone detailing around the windows and entrance portal.",
      
      "The image shows a central square in Cluj-Napoca, featuring baroque and neoclassical architecture. These buildings date back to the 18th and 19th centuries when the city was expanding as an important cultural and commercial center in Transylvania.",
      
      "This is a statue or monument in Cluj-Napoca. The sculptural work appears to commemorate an important historical figure connected to the city's past. The craftsmanship suggests it was created in the late 19th or early 20th century.",
      
      "The photograph depicts a cultural institution in Cluj-Napoca, likely a theater or museum. The building showcases neo-baroque architectural elements with ornate decorations on the facade and a symmetrical design that was popular during the Austro-Hungarian period."
    ];
    
    const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
    
    res.json({
      analysis: randomAnalysis
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Error analyzing image', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Mock server running on port ${port}`);
  console.log(`Pre-created demo user: username="demo", password="password123"`);
  console.log(`API endpoints ready: /api/auth/login, /api/auth/register, /api/detect-location, /api/analyze-image`);
}); 