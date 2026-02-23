import google.generativeai as genai
import os

# Get your free API key from: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY = 'AIzaSyClWFAQEpcWxaQyix3UJFHumOLEZPjNcCo'
genai.configure(api_key=GOOGLE_API_KEY)

print("Checking available models...")
print("")

try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print("✓ Model:", model.name)
except Exception as e:
    print("Error listing models:", e)
    print("")
    print("Trying with basic gemini model...")
    
# Try a simple test
try:
    model = genai.GenerativeModel('models/gemini-pro')
    response = model.generate_content("Hello")
    print("✓ gemini-pro works!")
except Exception as e:
    print("✗ gemini-pro failed:", e)
