// Main server file for the proxy application
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Serve static files from the public directory
app.use(express.static('public'));

// Configure the proxy middleware
const wikiProxy = createProxyMiddleware({
  target: 'https://en.wikipedia.org',
  changeOrigin: true,
  pathRewrite: {
    '^/wiki': '', // Remove the /wiki prefix when forwarding
  },
  onProxyRes: function(proxyRes, req, res) {
    // Add headers to avoid caching issues
    proxyRes.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate';
    
    // Fix cookie issues
    delete proxyRes.headers['set-cookie'];
    
    // Modify CORS headers to allow the proxy to work
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  },
  // Handle proxy errors
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error occurred');
  }
});

// Apply the proxy middleware to all requests with /wiki path
app.use('/wiki', wikiProxy);

// Root route - serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Set up the port - Render will provide a PORT environment variable
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
