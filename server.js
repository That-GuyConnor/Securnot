// Basic YouTube proxy implementation for educational purposes
// NOTE: This has significant technical limitations on free hosting tiers

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Serve static files
app.use(express.static('public'));

// Helper function to determine if a request is for a video
function isVideoRequest(path) {
  return path.includes('/videoplayback') || 
         path.includes('.mp4') || 
         path.includes('mime=video') ||
         path.includes('/api/timedtext');
}

// YouTube API and main content proxy
const youtubeProxy = createProxyMiddleware({
  target: 'https://www.youtube.com',
  changeOrigin: true,
  followRedirects: true,
  secure: true,
  pathRewrite: {
    '^/youtube': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add user-agent to appear as a regular browser
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    // Delete accept-encoding to avoid compressed responses that need additional processing
    proxyReq.removeHeader('accept-encoding');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Set CORS headers
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    // Remove YouTube's restrictive content security policy
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['content-security-policy-report-only'];
    
    // Remove frame protections
    delete proxyRes.headers['x-frame-options'];
    
    // Set caching policy
    proxyRes.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error occurred');
  }
});

// YouTube video content proxy (separate to handle larger data streams)
const youtubeVideoProxy = createProxyMiddleware({
  target: 'https://www.youtube.com',
  changeOrigin: true,
  followRedirects: true,
  secure: true,
  selfHandleResponse: false, // Stream video data directly
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Ensure CORS for video content too
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    
    // Remove range requirements that might limit video loading
    delete proxyRes.headers['content-range'];
    delete proxyRes.headers['content-length'];
  }
});

// YouTube Image proxy (for thumbnails)
const youtubeImgProxy = createProxyMiddleware({
  target: 'https://i.ytimg.com',
  changeOrigin: true,
  pathRewrite: {
    '^/ytimg': ''
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    // Cache images to reduce bandwidth usage
    proxyRes.headers['Cache-Control'] = 'public, max-age=86400';
  }
});

// Google APIs proxy (needed for some YouTube functionality)
const googleAPIProxy = createProxyMiddleware({
  target: 'https://www.googleapis.com',
  changeOrigin: true,
  pathRewrite: {
    '^/googleapis': ''
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
});

// Apply the proxies to different routes
app.use('/youtube', youtubeProxy);
app.use('/ytimg', youtubeImgProxy);
app.use('/googleapis', googleAPIProxy);

// Route all video content through the video-optimized proxy
app.use('/youtube/*', (req, res, next) => {
  if (isVideoRequest(req.path)) {
    return youtubeVideoProxy(req, res, next);
  }
  next();
});

// Home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle errors
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('An error occurred');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`YouTube proxy running on port ${PORT}`);
  console.log(`Note: This is an educational demonstration and has significant technical limitations`);
});
