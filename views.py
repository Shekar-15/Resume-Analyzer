# Django Views - Basic Python Implementation
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import google.generativeai as genai
import os
from PIL import Image
import io
import PyPDF2
import json

# Configure Google AI
# Get your free API key from: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY = 'AIzaSyDoiOzVAyUIvW_tlQF18s1tRC00m-oiNl0'
genai.configure(api_key=GOOGLE_API_KEY)

# Create uploads folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def index(request):
    """Render main page"""
    return render(request, 'index.html')

def extract_pdf_text(pdf_file):
    """Extract text from PDF - Basic Python"""
    text = ""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            text = text + page_text
        print("PDF extracted successfully, length:", len(text))
        return text
    except Exception as e:
        print("PDF extraction error:", str(e))
        return None

def extract_image_text(image_file):
    """Extract text from image using AI - Basic Python"""
    try:
        image = Image.open(image_file)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        prompt = "Extract all text from this resume image. Return the complete text content."
        response = model.generate_content([prompt, image])
        print("Image text extracted successfully")
        return response.text
    except Exception as e:
        print("Image extraction error:", str(e))
        return None

def analyze_with_ai(resume_text, job_description):
    """Analyze resume using Google AI - Basic Python"""
    try:
        print("Starting AI analysis...")
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        prompt = """You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume against the job description.

RESUME:
""" + resume_text + """

JOB DESCRIPTION:
""" + job_description + """

Return a JSON response with this structure:
{
    "contact_details": {
        "name": "candidate name",
        "email": "email address",
        "phone": "phone number",
        "location": "location"
    },
    "skills": ["skill1", "skill2", "skill3"],
    "experience": {
        "total_years": "number of years",
        "summary": "brief experience summary",
        "key_roles": ["role1", "role2"]
    },
    "key_responsibilities": ["responsibility1", "responsibility2"],
    "technical_skills": {
        "category1": ["skill1", "skill2"],
        "category2": ["skill3", "skill4"]
    },
    "metrics": {
        "technical_depth": 0-100,
        "leadership": 0-100,
        "experience_match": 0-100,
        "skills_match": 0-100
    },
    "fit_for_role": true/false,
    "fit_percentage": 0-100,
    "advantages": ["advantage1", "advantage2"],
    "disadvantages": ["disadvantage1", "disadvantage2"]
}

Calculate metrics based on:
- technical_depth: How deep the technical expertise is
- leadership: Leadership experience and qualities
- experience_match: How well experience aligns with job requirements
- skills_match: Percentage of required skills that match

Return ONLY valid JSON, no markdown formatting."""
        
        print("Sending request to AI...")
        response = model.generate_content(prompt)
        result_text = response.text
        print("AI response received, length:", len(result_text))
        
        # Clean text - Basic Python
        result_text = result_text.strip()
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        print("Parsing JSON response...")
        # Convert to Python dict
        analysis = json.loads(result_text)
        print("Analysis complete!")
        return analysis
        
    except Exception as e:
        print("AI Analysis error:", str(e))
        print("Error type:", type(e).__name__)
        return None

@csrf_exempt
def analyze(request):
    """Handle resume analysis - Basic Python"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    
    try:
        print("\n=== New analysis request ===")
        # Get job description from form
        job_description = request.POST.get('job_description', '')
        if not job_description:
            return JsonResponse({'error': 'Job description is required'}, status=400)
        
        print("Job description length:", len(job_description))
        
        # Get resume file
        resume_file = request.FILES.get('resume')
        if not resume_file:
            return JsonResponse({'error': 'Resume file is required'}, status=400)
        
        print("Resume file:", resume_file.name)
        
        # Get filename
        filename = resume_file.name.lower()
        resume_text = None
        
        # Check file type and extract text - Basic Python
        if filename.endswith('.pdf'):
            print("Processing PDF file...")
            resume_text = extract_pdf_text(resume_file)
        elif filename.endswith('.png') or filename.endswith('.jpg') or filename.endswith('.jpeg') or filename.endswith('.gif') or filename.endswith('.bmp'):
            print("Processing image file...")
            resume_text = extract_image_text(resume_file)
        else:
            return JsonResponse({'error': 'Unsupported file format. Please use PDF or Image.'}, status=400)
        
        if not resume_text:
            return JsonResponse({'error': 'Could not extract text from resume. Please check if the file is readable.'}, status=400)
        
        if len(resume_text) < 50:
            return JsonResponse({'error': 'Resume text too short. Please upload a valid resume.'}, status=400)
        
        print("Resume text extracted, length:", len(resume_text))
        
        # Analyze resume with AI
        analysis = analyze_with_ai(resume_text, job_description)
        
        if not analysis:
            return JsonResponse({'error': 'AI analysis failed. Please check the terminal for details or try again.'}, status=500)
        
        print("Analysis completed successfully!")
        return JsonResponse(analysis)
        
    except Exception as error:
        error_message = str(error)
        print("ERROR:", error_message)
        return JsonResponse({'error': 'Error: ' + error_message}, status=500)
