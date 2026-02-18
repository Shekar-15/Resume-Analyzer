// File input handler - Make span clickable to open file picker
const fileInput = document.getElementById('resume');
const fileNameDisplay = document.getElementById('fileName');

// When span is clicked, trigger file input click
fileNameDisplay.addEventListener('click', function() {
    fileInput.click();
});

// When file is selected, update the display
fileInput.addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || 'Choose file...';
    fileNameDisplay.textContent = fileName;
});

// Form submission
document.getElementById('analyzeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('errorMessage');
    
    // Show loader
    analyzeBtn.disabled = true;
    loader.style.display = 'block';
    errorMessage.style.display = 'none';
    
    // Get form data
    const formData = new FormData();
    formData.append('resume', document.getElementById('resume').files[0]);
    formData.append('job_description', document.getElementById('job_description').value);
    
    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Analysis failed');
        }
        
        // Display results
        displayResults(data);
        
        // Hide upload section, show results
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
        
        // Scroll to results
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    } finally {
        analyzeBtn.disabled = false;
        loader.style.display = 'none';
    }
});

function displayResults(data) {
    // Contact Details
    displayContactDetails(data.contact_details);
    
    // Fit Assessment
    displayFitAssessment(data.fit_for_role, data.fit_percentage);
    
    // Metrics
    displayMetrics(data.metrics);
    
    // Experience
    displayExperience(data.experience);
    
    // Skills
    displaySkills(data.skills);
    
    // Key Responsibilities
    displayResponsibilities(data.key_responsibilities);
    
    // Technical Skills
    displayTechnicalSkills(data.technical_skills);
    
    // Advantages & Disadvantages
    displayAdvantages(data.advantages);
    displayDisadvantages(data.disadvantages);
}

function displayContactDetails(contact) {
    const container = document.getElementById('contactDetails');
    container.innerHTML = `
        <div class="contact-item">
            <span class="contact-label">Name</span>
            <span class="contact-value">${contact.name || 'N/A'}</span>
        </div>
        <div class="contact-item">
            <span class="contact-label">Email</span>
            <span class="contact-value">${contact.email || 'N/A'}</span>
        </div>
        <div class="contact-item">
            <span class="contact-label">Phone</span>
            <span class="contact-value">${contact.phone || 'N/A'}</span>
        </div>
        <div class="contact-item">
            <span class="contact-label">Location</span>
            <span class="contact-value">${contact.location || 'N/A'}</span>
        </div>
    `;
}

function displayFitAssessment(fit, percentage) {
    const fitCard = document.getElementById('fitCard');
    const fitPercentage = document.getElementById('fitPercentage');
    const fitStatus = document.getElementById('fitStatus');
    
    fitPercentage.textContent = `${percentage || 0}%`;
    
    if (fit) {
        fitCard.classList.add('fit-yes');
        fitCard.classList.remove('fit-no');
        fitStatus.textContent = 'Good Fit';
    } else {
        fitCard.classList.add('fit-no');
        fitCard.classList.remove('fit-yes');
        fitStatus.textContent = 'Not a Strong Fit';
    }
}

function displayMetrics(metrics) {
    // Technical Depth
    updateCircularProgress('techDepthCircle', 'techDepthText', metrics.technical_depth || 0);
    
    // Leadership
    updateCircularProgress('leadershipCircle', 'leadershipText', metrics.leadership || 0);
    
    // Experience
    updateCircularProgress('experienceCircle', 'experienceText', metrics.experience_match || 0);
    
    // Skills Match
    updateCircularProgress('skillsMatchCircle', 'skillsMatchText', metrics.skills_match || 0);
}

function updateCircularProgress(circleId, textId, percentage) {
    const circle = document.getElementById(circleId);
    const text = document.getElementById(textId);
    
    const circumference = 314; // 2 * PI * 50
    const offset = circumference - (percentage / 100 * circumference);
    
    // Animate
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
        text.textContent = `${percentage}%`;
        
        // Professional color scheme based on percentage
        if (percentage >= 70) {
            circle.style.stroke = '#10b981'; // Green for excellent
            text.style.color = '#10b981';
        } else if (percentage >= 40) {
            circle.style.stroke = '#2563eb'; // Blue for good
            text.style.color = '#2563eb';
        } else {
            circle.style.stroke = '#f59e0b'; // Orange for needs improvement
            text.style.color = '#f59e0b';
        }
    }, 100);
}

function displayExperience(experience) {
    const container = document.getElementById('experienceDetails');
    
    let rolesHtml = '';
    if (experience.key_roles && experience.key_roles.length > 0) {
        rolesHtml = '<ul class="tech-skills-list">' + 
            experience.key_roles.map(role => `<li>${role}</li>`).join('') +
            '</ul>';
    }
    
    container.innerHTML = `
        <div class="experience-summary">
            <div class="experience-years">${experience.total_years || 'N/A'} Experience</div>
            <p>${experience.summary || 'No summary available'}</p>
        </div>
        ${rolesHtml}
    `;
}

function displaySkills(skills) {
    const container = document.getElementById('skillsDetails');
    
    if (!skills || skills.length === 0) {
        container.innerHTML = '<p>No skills identified</p>';
        return;
    }
    
    const skillsHtml = skills.map(skill => 
        `<span class="skill-tag">${skill}</span>`
    ).join('');
    
    container.innerHTML = `<div class="skills-container">${skillsHtml}</div>`;
}

function displayResponsibilities(responsibilities) {
    const container = document.getElementById('responsibilities');
    
    if (!responsibilities || responsibilities.length === 0) {
        container.innerHTML = '<li>No responsibilities identified</li>';
        return;
    }
    
    container.innerHTML = responsibilities.map(resp => `<li>${resp}</li>`).join('');
}

function displayTechnicalSkills(technicalSkills) {
    const container = document.getElementById('technicalSkills');
    
    if (!technicalSkills || Object.keys(technicalSkills).length === 0) {
        container.innerHTML = '<p>No technical skills categorized</p>';
        return;
    }
    
    let html = '';
    for (const [category, skills] of Object.entries(technicalSkills)) {
        if (skills && skills.length > 0) {
            html += `
                <div class="tech-category">
                    <div class="tech-category-title">${category}</div>
                    <ul class="tech-skills-list">
                        ${skills.map(skill => `<li>${skill}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    }
    
    container.innerHTML = html || '<p>No technical skills categorized</p>';
}

function displayAdvantages(advantages) {
    const container = document.getElementById('advantages');
    
    if (!advantages || advantages.length === 0) {
        container.innerHTML = '<li>No advantages identified</li>';
        return;
    }
    
    container.innerHTML = advantages.map(adv => `<li>${adv}</li>`).join('');
}

function displayDisadvantages(disadvantages) {
    const container = document.getElementById('disadvantages');
    
    if (!disadvantages || disadvantages.length === 0) {
        container.innerHTML = '<li>No disadvantages identified</li>';
        return;
    }
    
    container.innerHTML = disadvantages.map(dis => `<li>${dis}</li>`).join('');
}

function resetForm() {
    // Reset form
    document.getElementById('analyzeForm').reset();
    document.getElementById('fileName').textContent = 'Choose file...';
    
    // Hide results, show upload
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
