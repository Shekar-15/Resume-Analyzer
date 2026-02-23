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
import time  # For Gemini API rate limiting

# Configure Google AI
# Get your free API key from: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY = 'AIzaSyClWFAQEpcWxaQyix3UJFHumOLEZPjNcCo'
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
        
        prompt = """ROLE: Act as a senior technical recruiter and hiring manager.

OBJECTIVE: Analyze the candidate resume and generate a concise, enterprise-grade recruiter evaluation report in structured executive hiring assessment format.

CRITICAL OUTPUT RULES (MANDATORY):
• The report must be concise and executive-level
• Maintain strict professional recruiter tone
• Do NOT use placeholders (e.g., dimension_1)
• Do NOT copy supply-chain wording unless the resume truly matches that domain
• Automatically adapt section wording to match the candidate's target role/domain
• Every numbered section must contain 2-4 crisp bullets only
• Ensure score and narrative are logically consistent
• Avoid leadership score inflation for freshers
• Output must be submission-ready for hiring managers

SCORING GUIDELINES (VERY IMPORTANT):
• Freshers typically: 60-80%
• Strong junior: 75-88%
• Senior strong match: 85-95%
• Major mismatch: ≤60%
Never inflate scores.

RESUME:
""" + resume_text + """

JOB DESCRIPTION:
""" + job_description + """

Generate role-relevant section headings automatically based on the candidate's domain.

Examples:
IF Cloud/DevOps → use: Cloud/Infrastructure Experience, DevOps & Automation, CI/CD & Containers, Monitoring & Observability
IF Supply Chain → use: Industry/Domain Experience, Supply Chain Scope, ERP/SAP, Supplier Management
IF Software Developer → use: Programming Expertise, System Design, Backend/Frontend Depth, DevOps Exposure

Headings must be domain-appropriate, not generic.

Return ONLY valid JSON in this EXACT structure:
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
    "primary_background": "Main background summary paragraph",
    "primary_gap": "Biggest gap or weakness paragraph",
    
    "dimension_analysis": {
        "Domain-Appropriate Heading 1": {
            "title": "Domain-Appropriate Heading 1",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Low",
            "key_points": ["bullet 1", "bullet 2", "bullet 3"],
            "verdict": "One line arrow assessment"
        },
        "Domain-Appropriate Heading 2": {
            "title": "Domain-Appropriate Heading 2",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Low",
            "key_points": ["bullet 1", "bullet 2"],
            "verdict": "One line arrow assessment"
        },
        "Domain-Appropriate Heading 3": {
            "title": "Domain-Appropriate Heading 3",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Low",
            "key_points": ["bullet 1", "bullet 2", "bullet 3"],
            "verdict": "One line arrow assessment"
        },
        "Domain-Appropriate Heading 4": {
            "title": "Domain-Appropriate Heading 4",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Low",
            "key_points": ["bullet 1", "bullet 2"],
            "verdict": "One line arrow assessment"
        },
        "Domain-Appropriate Heading 5": {
            "title": "Domain-Appropriate Heading 5",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Low",
            "key_points": ["bullet 1", "bullet 2", "bullet 3"],
            "verdict": "One line arrow assessment"
        },
        "Domain-Appropriate Heading 6": {
            "title": "Domain-Appropriate Heading 6",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Low",
            "key_points": ["bullet 1", "bullet 2"],
            "verdict": "One line arrow assessment"
        },
        "Domain-Appropriate Heading 7": {
            "title": "Domain-Appropriate Heading 7",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Low",
            "key_points": ["bullet 1", "bullet 2"],
            "verdict": "One line arrow assessment"
        },
        "Domain-Appropriate Heading 8": {
            "title": "Domain-Appropriate Heading 8",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Low",
            "key_points": ["bullet 1", "bullet 2"],
            "verdict": "One line arrow assessment"
        },
        "Role Fit": {
            "title": "Role Fit",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Low",
            "strength_areas": ["strength 1", "strength 2"],
            "watch_areas": ["concern 1", "concern 2"],
            "verdict": "Overall role fit statement"
        },
        "Risks / Considerations": {
            "title": "Risks / Considerations",
            "rating": 0-5,
            "alignment": "Strong/Moderate/Low",
            "key_points": ["ramp-up risk", "skill gap", "other consideration"],
            "risk_level": "Low/Moderate/High",
            "verdict": "Overall risk assessment"
        }
    },
    
    "scorecard": {
        "technical_functional_expertise": 0-5,
        "domain_knowledge": 0-5,
        "tools_systems": 0-5,
        "execution_capability": 0-5,
        "leadership_scope": 0-5,
        "overall_fit": 0-5
    },
    
    "hiring_manager_assessment": "Short executive paragraph summarizing true readiness for the role",
    
    "recommendation": {
        "decision": "RECOMMENDED / CONDITIONAL / NOT RECOMMENDED",
        "reasoning": "2-3 sentence summary matching the score"
    }
}

Return ONLY valid JSON. No markdown, no code blocks, just pure JSON."""
        
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
    """Handle multiple resume analysis - Up to 50 resumes with 5MB per file limit"""
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
        
        # FAANG-LEVEL BACKEND VALIDATION
        MAX_FILES = 500
        MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes
        ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp']
        
        # Validate file count
        if len(resume_files) > MAX_FILES:
            return JsonResponse({
                'error': f'Too many files. Maximum {MAX_FILES} files allowed. Received {len(resume_files)} files.'
            }, status=400)
        
        # Validate each file size and type
        for resume_file in resume_files:
            # Check file size
            if resume_file.size > MAX_FILE_SIZE:
                file_size_mb = round(resume_file.size / (1024 * 1024), 2)
                return JsonResponse({
                    'error': f'File too large: {resume_file.name} ({file_size_mb}MB). Maximum 5MB per file allowed.'
                }, status=400)
            
            # Check file type
            file_extension = resume_file.name.lower().split('.')[-1]
            if file_extension not in ALLOWED_EXTENSIONS:
                return JsonResponse({
                    'error': f'Invalid file type: {resume_file.name}. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
                }, status=400)
        
        print(f"Validation passed: Processing {len(resume_files)} resumes...")
        
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
                
                # CRITICAL: Rate limiting for Gemini API
                # Sleep 0.8 seconds to prevent API throttling during bulk uploads
                time.sleep(0.8)
                
            except Exception as e:
                print(f"Error processing {resume_file.name}: {str(e)}")
                results.append({
                    'filename': resume_file.name,
                    'error': str(e),
                    'status': 'failed'
                })
                # Rate limiting even on failures
                time.sleep(0.5)
        
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
