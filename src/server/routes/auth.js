const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ user: { id: user._id, username, email }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        gameProgress: user.gameProgress 
      }, 
      token 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({ 
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        gameProgress: req.user.gameProgress
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update game progress
router.post('/progress', auth, async (req, res) => {
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
      // Replace the entire completedLocations array with properly formatted objects
      gameProgress.completedLocations = completedLocations.map(loc => {
        // Handle both object format and direct ID format
        const locationId = typeof loc === 'object' ? loc.locationId : loc;
        return {
          locationId: locationId,
          timestamp: (loc.timestamp ? new Date(loc.timestamp) : new Date())
        };
      });
    }

    if (completed) {
      gameProgress.completed = true;
    }

    await req.user.save();
    res.json({ gameProgress: req.user.gameProgress });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get game progress
router.get('/progress/:gameId', auth, async (req, res) => {
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

module.exports = router; 