// Simple script to test OpenAI API key
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Starting OpenAI API key test...');
console.log('API Key defined:', !!process.env.OPENAI_API_KEY);

if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: No OpenAI API key found in environment variables');
  
  // Create a template .env file if it doesn't exist
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, 'OPENAI_API_KEY=your_api_key_here\n');
    console.log('Created template .env file at', envPath);
    console.log('Please edit this file and add your actual API key');
  } else {
    console.log('.env file exists but OPENAI_API_KEY is not defined or is empty');
  }
  
  process.exit(1);
}

// Initialize OpenAI with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test the API with a simple text request
async function testOpenAI() {
  try {
    console.log('Testing OpenAI API with text completion...');
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello, please respond with 'OpenAI API is working!'"
        }
      ],
    });
    
    console.log('SUCCESS! API responded:');
    console.log(response.choices[0].message.content);
    
    // List available models
    console.log('\nChecking available models...');
    const models = await openai.models.list();
    console.log('Available models:');
    models.data.forEach(model => {
      console.log(` - ${model.id}`);
    });
    
    return true;
  } catch (error) {
    console.error('ERROR testing OpenAI API:');
    console.error(error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return false;
  }
}

// Run the test
testOpenAI().then(async success => {
  if (success) {
    console.log('\nYour OpenAI API key is valid and working!');
    
    // Now test the vision model
    try {
      console.log('\nTesting vision model access...');
      // Create a simple test image (1x1 pixel transparent PNG in base64)
      const testBase64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What's in this image? Just respond with 'Vision API is working!'"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${testBase64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 50
      });
      
      console.log('SUCCESS! Vision API responded:');
      console.log(response.choices[0].message.content);
      console.log('\nYour API key has access to the Vision model!');
    } catch (error) {
      console.error('ERROR testing Vision API:');
      console.error(error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      console.log('\nYour API key does NOT have access to the Vision model.');
    }
  } else {
    console.log('\nThere was a problem with your OpenAI API key or access.');
  }
}); 