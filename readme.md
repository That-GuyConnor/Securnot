# Educational Knowledge Proxy

This is a simple educational proxy application built with Node.js and Express. It demonstrates proxy concepts for academic learning purposes.

## Project Structure

```
.
├── server.js         # Main server file with proxy configuration
├── package.json      # Project dependencies and configuration
├── .gitignore        # Git ignore file
└── public/           # Static files
    └── index.html    # Frontend interface
```

## Local Development

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Deployment

This application is designed to be deployed to Render or similar platforms.

### Deploying to Render

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect to your GitHub repository
4. Use the following settings:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`

## License

MIT
