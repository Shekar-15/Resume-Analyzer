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
GOOGLE_API_KEY = 'AIzaSyCFhwIWXdnBt5Gsh3iXiHnFlM75he8JDQQ'
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
    """Analyze resume using Google AI - Detailed Analysis"""
    try:
        print("Starting AI analysis...")
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        prompt = """You are an expert ATS (Applicant Tracking System) and Hiring Manager. Analyze the following resume against the job description with extreme detail.

RESUME:
""" + resume_text + """

JOB DESCRIPTION:
""" + job_description + """

Provide a COMPREHENSIVE analysis in JSON format with the following structure:
{
    "candidate_name": "Full Name",
    "contact_details": {
        "email": "email address",
        "phone": "phone number",
        "location": "location"
    },
    "overall_fit_percentage": 0-100,
    "fit_status": "STRONG MATCH / PARTIAL MATCH / WEAK MATCH",
    "profile_type": "Professional title/description",
    "primary_background": "Main background summary",
    "primary_gap": "Biggest gap or weakness",
    
    "dimension_analysis": {
        "dimension_1": {
            "title": "Industry/Domain Experience",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Weak/Low",
            "details": "3-4 paragraph detailed analysis",
            "key_points": ["point1", "point2", "point3"]
        },
        "dimension_2": {
            "title": "Supply Chain/Core Function Scope",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Weak/Low",
            "details": "3-4 paragraph detailed analysis",
            "key_points": ["point1", "point2", "point3"]
        },
        "dimension_3": {
            "title": "Leadership & Organizational Scope",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Weak/Low",
            "details": "3-4 paragraph detailed analysis",
            "key_points": ["point1", "point2", "point3"]
        },
        "dimension_4": {
            "title": "Technical/Regulatory Knowledge",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Weak/Low",
            "details": "3-4 paragraph detailed analysis",
            "key_points": ["point1", "point2", "point3"]
        },
        "dimension_5": {
            "title": "Systems & Tools Experience",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Weak/Low",
            "details": "3-4 paragraph detailed analysis",
            "key_points": ["point1", "point2", "point3"]
        },
        "dimension_6": {
            "title": "Strategic Planning Capability",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Weak/Low",
            "details": "3-4 paragraph detailed analysis",
            "key_points": ["point1", "point2", "point3"]
        }
    },
    
    "scorecard": {
        "technical_expertise": 0-5,
        "domain_knowledge": 0-5,
        "leadership_scope": 0-5,
        "experience_match": 0-5,
        "cultural_fit": 0-5
    },
    
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "risks": ["risk1", "risk2"],
    "risk_level": "Low/Moderate/High",
    
    "recommendation": {
        "decision": "RECOMMENDED / NOT RECOMMENDED / CONDITIONAL",
        "reasoning": "2-3 sentence summary",
        "ideal_roles": ["Alternative role 1", "Alternative role 2"]
    }
}

Analyze comprehensively across ALL dimensions. Return ONLY valid JSON."""
        
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
    """Handle multiple resume analysis - Up to 10 resumes"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    
    try:
        print("\n=== New multi-resume analysis request ===")
        
        # Get job description from form
        job_description = request.POST.get('job_description', '')
        if not job_description:
            return JsonResponse({'error': 'Job description is required'}, status=400)
        
        print("Job description length:", len(job_description))
        
        # Get all resume files (support multiple files)
        resume_files = request.FILES.getlist('resumes')
        
        if not resume_files:
            return JsonResponse({'error': 'At least one resume file is required'}, status=400)
        
        if len(resume_files) > 10:
            return JsonResponse({'error': 'Maximum 10 resumes allowed'}, status=400)
        
        print(f"Processing {len(resume_files)} resumes...")
        
        results = []
        
        # Process each resume
        for idx, resume_file in enumerate(resume_files):
            print(f"\n--- Processing resume {idx + 1}/{len(resume_files)}: {resume_file.name} ---")
            
            try:
                # Get filename
                filename = resume_file.name.lower()
                resume_text = None
                
                # Check file type and extract text
                if filename.endswith('.pdf'):
                    print("Processing PDF file...")
                    resume_text = extract_pdf_text(resume_file)
                elif filename.endswith('.png') or filename.endswith('.jpg') or filename.endswith('.jpeg') or filename.endswith('.gif') or filename.endswith('.bmp'):
                    print("Processing image file...")
                    resume_text = extract_image_text(resume_file)
                else:
                    print(f"Skipping unsupported file: {resume_file.name}")
                    results.append({
                        'filename': resume_file.name,
                        'error': 'Unsupported file format',
                        'status': 'failed'
                    })
                    continue
                
                if not resume_text or len(resume_text) < 50:
                    print(f"Could not extract valid text from: {resume_file.name}")
                    results.append({
                        'filename': resume_file.name,
                        'error': 'Could not extract text or text too short',
                        'status': 'failed'
                    })
                    continue
                
                print(f"Resume text extracted, length: {len(resume_text)}")
                
                # Analyze resume with AI
                analysis = analyze_with_ai(resume_text, job_description)
                
                if not analysis:
                    print(f"AI analysis failed for: {resume_file.name}")
                    results.append({
                        'filename': resume_file.name,
                        'error': 'AI analysis failed',
                        'status': 'failed'
                    })
                    continue
                
                # Add metadata
                analysis['filename'] = resume_file.name
                analysis['status'] = 'success'
                analysis['resume_id'] = idx + 1
                results.append(analysis)
                print(f"Resume {idx + 1} analyzed successfully!")
                
            except Exception as e:
                print(f"Error processing {resume_file.name}: {str(e)}")
                results.append({
                    'filename': resume_file.name,
                    'error': str(e),
                    'status': 'failed'
                })
        
        # Rank results by overall_fit_percentage
        successful_results = [r for r in results if r.get('status') == 'success']
        failed_results = [r for r in results if r.get('status') == 'failed']
        
        # Sort by overall fit percentage (descending)
        successful_results.sort(key=lambda x: x.get('overall_fit_percentage', 0), reverse=True)
        
        # Add ranking
        for idx, result in enumerate(successful_results):
            result['rank'] = idx + 1
        
        print(f"\n=== Analysis complete: {len(successful_results)} successful, {len(failed_results)} failed ===")
        
        return JsonResponse({
            'total_resumes': len(resume_files),
            'successful': len(successful_results),
            'failed': len(failed_results),
            'results': successful_results,
            'failed_resumes': failed_results,
            'top_5': successful_results[:5]
        })
        
    except Exception as error:
        error_message = str(error)
        print("ERROR:", error_message)
        return JsonResponse({'error': 'Error: ' + error_message}, status=500)
