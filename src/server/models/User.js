const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const gameProgressSchema = new mongoose.Schema({
  gameId: String,
  completed: Boolean,
  completedLocations: [{
    locationId: Number,
    timestamp: Date
  }]
});

const locationSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  location: String,
  coordinates: {
    lat: Number,
    lon: Number
  },
  imageUrl: String,
  difficulty: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  gameProgress: [gameProgressSchema],
  savedLocations: [locationSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 