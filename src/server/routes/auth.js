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

// Get all saved locations for the user
router.get('/locations', auth, async (req, res) => {
  try {
    // Return the user's saved locations
    res.json({ 
      locations: req.user.savedLocations || []
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch saved locations',
      details: error.message
    });
  }
});

// Save a new location for the user
router.post('/locations', auth, async (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location || !location.id || !location.name) {
      return res.status(400).json({ error: 'Invalid location data' });
    }
    
    // Check if the location already exists
    const existingLocationIndex = req.user.savedLocations.findIndex(loc => loc.id === location.id);
    
    // Update existing location or add new one
    if (existingLocationIndex !== -1) {
      // If location exists but has notes, keep the notes
      const existingNotes = req.user.savedLocations[existingLocationIndex].notes;
      if (existingNotes && !location.notes) {
        location.notes = existingNotes;
      }
      // Replace the existing location
      req.user.savedLocations[existingLocationIndex] = location;
    } else {
      // Add new location
      req.user.savedLocations.push(location);
    }
    
    await req.user.save();
    
    res.json({ 
      success: true,
      message: 'Location saved successfully',
      locations: req.user.savedLocations
    });
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({
      error: 'Failed to save location',
      details: error.message
    });
  }
});

// Update notes for a saved location
router.patch('/locations/:locationId', auth, async (req, res) => {
  try {
    const { locationId } = req.params;
    const { notes } = req.body;
    
    // Find the location in the user's collection
    const locationIndex = req.user.savedLocations.findIndex(loc => loc.id === locationId);
    
    if (locationIndex === -1) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Update the notes
    req.user.savedLocations[locationIndex].notes = notes;
    await req.user.save();
    
    res.json({ 
      success: true,
      message: 'Notes updated successfully',
      location: req.user.savedLocations[locationIndex]
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update location notes',
      details: error.message
    });
  }
});

// Delete a saved location
router.delete('/locations/:locationId', auth, async (req, res) => {
  try {
    const { locationId } = req.params;
    
    // Find and remove the location
    req.user.savedLocations = req.user.savedLocations.filter(loc => loc.id !== locationId);
    await req.user.save();
    
    res.json({ 
      success: true,
      message: 'Location deleted successfully',
      locations: req.user.savedLocations
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete location',
      details: error.message
    });
  }
});

module.exports = router; 