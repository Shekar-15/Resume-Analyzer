# 🎯 Resume Analyzer - ATS System

An AI-powered Applicant Tracking System (ATS) that analyzes resumes against job descriptions using Google's Gemini AI. Features a modern, responsive UI with light/dark theme support.

## ✨ Features

- 📄 **Multi-format Support**: Upload resumes in PDF or image formats (PNG, JPG, JPEG, GIF, BMP)
- 🤖 **AI-Powered Analysis**: Uses Google Gemini 2.5 Flash for intelligent resume evaluation
- 📊 **Comprehensive Metrics**: 
  - Contact information extraction
  - Fit percentage calculation
  - Technical depth assessment
  - Leadership evaluation
  - Experience analysis
- 💡 **Smart Insights**: 
  - Key responsibilities identification
  - Technical skills evaluation
  - Advantages and disadvantages analysis
  - Missing qualifications detection
- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- 🌓 **Theme Toggle**: Switch between light and dark modes (preference saved)
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume_analyzer
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure API Key**
   
   Update the `GOOGLE_API_KEY` in `views.py`:
   ```python
   GOOGLE_API_KEY = 'your-api-key-here'
   ```

4. **Run the application**
   
   Using Python:
   ```bash
   python manage.py
   ```
   
   Or using the batch file (Windows):
   ```bash
   run.bat
   ```

5. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://127.0.0.1:8000
   ```

## 📁 Project Structure

```
resume_analyzer/
├── manage.py           # Main application entry point
├── views.py            # Request handlers and AI logic
├── urls.py             # URL routing
├── settings.py         # Application settings
├── wsgi.py             # WSGI configuration
├── requirements.txt    # Python dependencies
├── run.bat             # Windows batch file to start server
├── test_models.py      # Testing script for Gemini models
├── templates/
│   └── index.html      # Main HTML template
├── static/
│   ├── style.css       # Styles with theme support
│   └── script.js       # Client-side functionality
└── uploads/            # Temporary file storage
```

## 🛠️ Technologies Used

- **Backend**: Python, WSGI
- **AI**: Google Generative AI (Gemini 2.5 Flash)
- **Frontend**: HTML5, CSS3, JavaScript
- **File Processing**: PyMuPDF (fitz), PIL
- **Other Libraries**: python-magic-bin, pathlib

## 🎨 Themes

The application supports both light and dark themes:
- **Default**: Light theme
- **Toggle**: Click the sun/moon icon in the top-right corner
- **Persistence**: Theme preference is saved in browser localStorage

## 📊 Analysis Output

The system provides:
- **Contact Details**: Name, email, phone, location
- **Fit Assessment**: Overall percentage match with role requirements
- **Metrics Dashboard**: Visual representation of technical depth, leadership, and experience
- **Experience Summary**: Work history and accomplishments
- **Skills Analysis**: Technical and soft skills evaluation
- **Key Responsibilities**: Main duties from previous roles
- **Advantages**: Strengths matching the job description
- **Disadvantages**: Areas needing improvement or missing qualifications

## 🔒 Security Notes

⚠️ **Important**: The Google API key is currently hardcoded in the source files. For production use:
- Use environment variables
- Implement secure secret management
- Never commit API keys to version control

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🐛 Known Issues

- API key needs to be moved to environment variables
- File cleanup in `uploads/` directory needs implementation

## 📧 Support

For issues, questions, or contributions, please open an issue in the repository.

---

Made with ❤️ using Google Gemini AI
