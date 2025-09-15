# Varnika Frontend - React UI

A modern, responsive React frontend for the Varnika AI-Powered Article Generation System.

## 🎨 Design Features

- **Clean Card Layout**: Centered 600px card with soft shadows and rounded corners
- **Gradient Background**: Beautiful indigo to purple gradient
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Fade-in effects and interactive hover states
- **Real-time Progress**: Live progress tracking during article generation

## 🚀 Getting Started

### Prerequisites

- Node.js 14+ and npm
- Varnika backend running on http://localhost:8000

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at http://localhost:3000

## 🏗️ Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── Header.js       # Navigation header
│   │   ├── Header.css      # Header styles
│   │   ├── ArticleGenerator.js  # Main generator component
│   │   └── ArticleGenerator.css # Generator styles
│   ├── App.js              # Main app component
│   ├── App.css             # Global app styles
│   ├── index.js            # React entry point
│   └── index.css           # Base styles
├── package.json            # Dependencies
└── README.md              # This file
```

## 🎯 Features

### Article Generation
- **Topic Input**: Enter any topic for article generation
- **Article Types**: Choose between Detailed, Summarized, or Bullet Points
- **Real-time Progress**: Watch as the AI researches, summarizes, and writes

### Output Management
- **Copy to Clipboard**: One-click copy of generated articles
- **Download**: Save articles as .txt files
- **Regenerate**: Generate new versions with the same parameters

### User Experience
- **Loading States**: Animated progress bars and status messages
- **Error Handling**: Clear error messages for troubleshooting
- **Responsive Design**: Optimized for all screen sizes

## 🔧 Configuration

The frontend is configured to proxy API requests to http://localhost:8000 (defined in package.json).

To change the backend URL for production:

1. Remove the proxy from package.json
2. Update API calls in `ArticleGenerator.js` to use full URLs:
```javascript
const response = await axios.post('https://your-api.com/api/generate', {...})
```

## 🎨 Customization

### Colors
The main color scheme uses:
- Primary: Indigo (#4F46E5)
- Gradient: Indigo to Purple (#667eea → #764ba2)
- Text: Gray shades (#1F2937, #4B5563, #6B7280)

To customize, update the color values in the CSS files.

### Fonts
The app uses Inter font from Google Fonts. To change:
1. Update the font link in `public/index.html`
2. Update font-family in CSS files

## 📱 Responsive Breakpoints

- Desktop: 1440px (design width)
- Tablet: 768px (breakpoint)
- Mobile: 375px (minimum)

## 🚀 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 🔗 API Integration

The frontend communicates with these backend endpoints:

- `POST /api/generate` - Start article generation
- `GET /api/jobs/{id}` - Check job status
- `GET /api/articles/{filename}` - Download article

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure the backend is running on port 8000
- Check CORS settings in the backend
- Verify the proxy setting in package.json

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

## 📄 License

Part of the Varnika project - MIT License
