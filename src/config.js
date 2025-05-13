const config = {
  // Make sure the URL doesn't include the path segment we add in the login component
  // If apiBaseUrl already has '/api', we don't want to duplicate it in the fetch calls
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000'
};

export default config; 