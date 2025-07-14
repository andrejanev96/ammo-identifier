# AI Ammunition Identifier

> An AI-powered tool for identifying ammunition from photos, providing detailed ballistics data, safety information, and historical context.

## 🎯 Overview

This tool leverages OpenAI's GPT-4 Vision API to automatically identify ammunition from uploaded photos and provide comprehensive analysis including:

- **Caliber Identification** - Precise ammunition type recognition
- **Ballistics Data** - Velocity, energy, and performance metrics
- **Safety Information** - Pressure ratings and compatibility warnings
- **Historical Context** - Development timeline and military/civilian usage

## ✨ Features

- 📸 **Smart Image Upload** - Drag & drop or click to upload ammunition photos
- 🤖 **AI Validation** - Automatically verifies if images contain ammunition
- 🔍 **Detailed Analysis** - Comprehensive ammunition identification and data
- 📧 **Lead Generation** - Email capture for ballistics newsletter signup
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Professional Branding** - Clean, modern styling

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **AI**: OpenAI GPT-4 Vision API
- **Deployment**: Railway (Backend) + GitHub Pages (Static assets)
- **Styling**: Custom CSS with professional design

## 📋 Prerequisites

- Node.js 16+ installed
- OpenAI API key
- Git for version control

## 🔧 Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/andrejanev96/ammo-identifier.git
cd ammo-identifier
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Create .env file
cp .env.example .env

# Add your OpenAI API key to .env:
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### 4. Run Development Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

### 5. Open Application

Visit `http://localhost:3000` in your browser

## 📁 Project Structure

```
ammo-identifier/
├── server.js              # Express server & API routes
├── public/                 # Frontend assets
│   ├── index.html         # Main application page
│   ├── style.css          # Ammo.com brand styling
│   └── script.js          # Frontend JavaScript logic
├── .env                   # Environment variables (not in repo)
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── package.json          # Node.js dependencies
└── README.md             # Project documentation
```

## 🔌 API Endpoints

| Endpoint             | Method | Description                            |
| -------------------- | ------ | -------------------------------------- |
| `/`                  | GET    | Serve main application                 |
| `/api/health`        | GET    | Health check & API status              |
| `/api/validate-ammo` | POST   | Validate if image contains ammunition  |
| `/api/identify-ammo` | POST   | Analyze and identify ammunition        |
| `/api/subscribe`     | POST   | Email subscription for lead generation |

## 🎨 UI/UX Features

- **Professional Design** - Clean, modern interface with professional branding
- **Real-time Feedback** - Status indicators and loading states
- **Error Handling** - Graceful error messages and fallbacks
- **Image Controls** - Remove/reupload functionality for better UX
- **Responsive Layout** - Optimized for all device sizes

## 🔒 Security & Privacy

- **API Key Protection** - OpenAI key stored securely in environment variables
- **Input Validation** - Proper file type and size validation
- **Error Handling** - Secure error messages without exposing internals
- **CORS Configuration** - Properly configured cross-origin requests

## 🚀 Deployment

### Railway Deployment

1. Connect GitHub repository to Railway
2. Add `OPENAI_API_KEY` environment variable
3. Deploy automatically from main branch

### Manual Deployment

```bash
# Set environment variables
export OPENAI_API_KEY=your_key_here

# Install dependencies
npm install --production

# Start production server
npm start
```

## 📈 Business Value

### Lead Generation

- **Email Capture** - Collects user emails for marketing campaigns
- **Engagement Tool** - Interactive experience drives user engagement
- **Brand Authority** - Demonstrates technical expertise and innovation

### User Experience

- **Instant Results** - Fast AI-powered ammunition identification
- **Educational Value** - Comprehensive ballistics and safety information
- **Mobile Friendly** - Accessible across all devices

### Technical Benefits

- **Scalable Architecture** - Easy to extend with additional features
- **Modern Stack** - Built with current web technologies
- **API-First Design** - Backend can support multiple frontends

## 🔧 Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Optional
PORT=3000
NODE_ENV=production
```

## 📝 Usage Examples

### Supported Ammunition Types

- **Pistol Cartridges**: 9mm, .45 ACP, .40 S&W, .38 Special
- **Rifle Cartridges**: .223/5.56, .308/7.62 NATO, 7.62x39, .30-06
- **Shotgun Shells**: 12 gauge, 20 gauge, .410 bore
- **Rimfire Cartridges**: .22 LR, .22 WMR, .17 HMR

### Image Requirements

- **Format**: JPG, PNG supported
- **Quality**: Clear, well-lit photos work best
- **Angle**: Multiple angles acceptable
- **Background**: Contrasting backgrounds improve accuracy

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For technical support or business inquiries:

- **Email**: andrejanev96@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/andrejanev96/ammo-identifier/issues)

## 🎯 Future Enhancements

- [ ] Advanced ballistics calculator integration
- [ ] Multiple ammunition comparison feature
- [ ] Reloading data and specifications
- [ ] Mobile app version (React Native)
- [ ] Batch processing for multiple images
- [ ] Integration with product catalog
- [ ] User accounts and favorites system

---

**Built with ❤️ by Andrej Janev**
