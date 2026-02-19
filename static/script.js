// Global variables
let analysisResults = [];
let selectedFiles = [];

// ========================================
// ANIMATED COUNTER FOR HERO STATS
// ========================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Initialize counters when page loads
document.addEventListener('DOMContentLoaded', () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    // Intersection Observer for animation on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
    
    // Character counter for job description
    const jobDescTextarea = document.getElementById('job_description');
    const charCount = document.getElementById('charCount');
    
    if (jobDescTextarea && charCount) {
        jobDescTextarea.addEventListener('input', () => {
            const count = jobDescTextarea.value.length;
            charCount.textContent = count.toLocaleString();
            
            // Add color based on length
            if (count > 2000) {
                charCount.style.color = 'var(--success)';
            } else if (count > 1000) {
                charCount.style.color = 'var(--warning)';
            } else {
                charCount.style.color = 'var(--text-tertiary)';
            }
        });
    }
    
    // Add fade-in animation to elements
    const fadeElements = document.querySelectorAll('.fade-in-up');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        fadeObserver.observe(element);
    });
});

// ========================================
// Theme Toggle Functionality
// ========================================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to 'light'
const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', currentTheme);

// Toggle theme on button click
themeToggle.addEventListener('click', function() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add a subtle animation
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        themeToggle.style.transform = '';
    }, 300);
});

// Multi-File Input Handler
const fileInput = document.getElementById('resumes');
const fileDropZone = document.getElementById('fileDropZone');
const filePreviewList = document.getElementById('filePreviewList');
const browseFilesBtn = document.getElementById('browseFilesBtn');

// Click to upload - both drop zone and button
const openFileDialog = () => {
    fileInput.click();
};

fileDropZone.addEventListener('click', openFileDialog);
if (browseFilesBtn) {
    browseFilesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openFileDialog();
    });
}

// Drag and drop
fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.classList.add('drag-over');
});

fileDropZone.addEventListener('dragleave', () => {
    fileDropZone.classList.remove('drag-over');
});

fileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropZone.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
});

// File selection change - THIS IS THE MAIN EVENT
fileInput.addEventListener('change', function(e) {
    console.log('File input change event fired');
    const files = Array.from(this.files);
    console.log('Files from input:', files.length, files.map(f => f.name));
    
    if (files.length > 0) {
        handleFiles(files);
    }
});

function handleFiles(files) {
    console.log('handleFiles called with:', files.length, 'files');
    
    // Filter and validate files
    if (!files || files.length === 0) {
        console.warn('No files to handle');
        return;
    }
    
    // Limit to 10 files
    if (files.length > 10) {
        showToast('Maximum 10 files allowed. First 10 files will be used.', 'warning');
        files = Array.from(files).slice(0, 10);
    }
    
    // Store files in global variable
    selectedFiles = Array.from(files);
    console.log('Files stored in selectedFiles:', selectedFiles.length);
    
    // Display preview
    displayFilePreview(selectedFiles);
}

function displayFilePreview(files) {
    filePreviewList.innerHTML = '';
    
    if (files.length === 0) {
        filePreviewList.style.display = 'none';
        return;
    }
    
    filePreviewList.style.display = 'block';
    
    files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-preview-item';
        item.innerHTML = `
            <div class="file-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button type="button" class="file-remove" onclick="removeFile(${index})">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        filePreviewList.appendChild(item);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    
    // Update file input
    const dt = new DataTransfer();
    selectedFiles.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
    
    displayFilePreview(selectedFiles);
}

// Form submission
document.getElementById('analyzeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('errorMessage');
    
    // Validate files are selected
    if (!selectedFiles || selectedFiles.length === 0) {
        showToast('Please select at least one resume file', 'error');
        return;
    }
    
    // Show loader with modern loading state
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('loading');
    errorMessage.style.display = 'none';
    
    // Get form data
    const formData = new FormData();
    
    // Add all resume files
    console.log(`Adding ${selectedFiles.length} files to form data`);
    selectedFiles.forEach((file, index) => {
        console.log(`File ${index + 1}: ${file.name} (${file.size} bytes)`);
        formData.append('resumes', file);
    });
    
    const jobDesc = document.getElementById('job_description').value;
    if (!jobDesc || jobDesc.trim().length === 0) {
        showToast('Please enter a job description', 'error');
        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove('loading');
        return;
    }
    
    formData.append('job_description', jobDesc);
    console.log('Job description length:', jobDesc.length);
    
    try {
        console.log('Sending request to /analyze...');
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Analysis failed');
        }
        
        // Store results globally
        analysisResults = data.results || [];
        
        // Display results
        displayResults(data);
        
        // Hide upload section, show results
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
        
        // Scroll to results
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error during analysis:', error);
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove('loading');
    }
});

// ========================================
// TOAST NOTIFICATION FUNCTION
// ========================================
function showToast(message, type = 'error') {
    const toast = document.getElementById('errorMessage');
    const toastMessage = toast.querySelector('.toast-message');
    
    if (toastMessage) {
        toastMessage.textContent = message;
    } else {
        toast.textContent = message;
    }
    
    toast.style.display = 'flex';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

function displayResults(data) {
    // Display summary
    const summaryEl = document.getElementById('resultsSummary');
    summaryEl.innerHTML = `
        <div class="summary-stats">
            <div class="stat">
                <span class="stat-value">${data.total_resumes}</span>
                <span class="stat-label">Total Uploaded</span>
            </div>
            <div class="stat">
                <span class="stat-value">${data.successful}</span>
                <span class="stat-label">Analyzed</span>
            </div>
            <div class="stat">
                <span class="stat-value">${data.failed}</span>
                <span class="stat-label">Failed</span>
            </div>
        </div>
    `;
    
    // Display top 5 ranking
    displayRanking(data.top_5);
    
    // Display all candidates
    displayAllCandidates(data.results);
    
    // Setup comparison selectors
    setupComparisonSelectors(data.results);
    
    // Setup tabs
    setupTabs();
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs and content
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            btn.classList.add('active');
            
            // Show corresponding content
            const tabName = btn.getAttribute('data-tab');
            document.getElementById(tabName + 'Tab').classList.add('active');
        });
    });
}

function displayRanking(candidates) {
    const container = document.getElementById('rankingSection');
    
    if (!candidates || candidates.length === 0) {
        container.innerHTML = '<div class="no-results">No candidates to rank</div>';
        return;
    }
    
    let html = '<div class="ranking-cards">';
    
    candidates.forEach((candidate, index) => {
        const rankClass = index === 0 ? 'rank-gold' : index === 1 ? 'rank-silver' : index === 2 ? 'rank-bronze' : '';
        const fitClass = getFitClass(candidate.overall_fit_percentage);
        
        html += `
            <div class="ranking-card ${rankClass}" onclick="showDetailModal(${candidate.resume_id})">
                <div class="rank-badge">
                    <span class="rank-number">#${candidate.rank}</span>
                    ${index < 3 ? getRankIcon(index) : ''}
                </div>
                <div class="candidate-summary">
                    <h3>${candidate.candidate_name || 'Unknown Candidate'}</h3>
                    <p class="profile-type">${candidate.profile_type || 'No profile available'}</p>
                    <div class="fit-indicator ${fitClass}">
                        <span class="fit-percentage-large">${candidate.overall_fit_percentage}%</span>
                        <span class="fit-status-text">${candidate.fit_status || 'N/A'}</span>
                    </div>
                    <div class="score-bars">
                        ${generateScoreBar('Technical', candidate.scorecard?.technical_expertise || 0)}
                        ${generateScoreBar('Leadership', candidate.scorecard?.leadership_scope || 0)}
                        ${generateScoreBar('Experience', candidate.scorecard?.experience_match || 0)}
                    </div>
                    <div class="recommendation-badge ${getRecommendationClass(candidate.recommendation?.decision)}">
                        ${candidate.recommendation?.decision || 'PENDING'}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function displayAllCandidates(candidates) {
    const container = document.getElementById('allCandidatesSection');
    
    if (!candidates || candidates.length === 0) {
        container.innerHTML = '<div class="no-results">No candidates analyzed</div>';
        return;
    }
    
    // Show only top 5 candidates
    const topCandidates = candidates.slice(0, 5);
    
    let html = '';
    
    topCandidates.forEach((candidate, index) => {
        const fitClass = getFitClass(candidate.overall_fit_percentage);
        const statusText = candidate.overall_fit_percentage >= 75 ? 'Excellent Match' : 
                          candidate.overall_fit_percentage >= 60 ? 'Good Match' : 
                          candidate.overall_fit_percentage >= 40 ? 'Moderate Match' : 'Weak Match';
        
        // Determine progress bar color based on percentage
        const progressColor = candidate.overall_fit_percentage >= 50 ? '#10b981' : '#ef4444';
        
        // Get dimensions for quick overview
        const dimensions = candidate.dimension_analysis || {};
        const dimCount = Object.keys(dimensions).length;
        const avgRating = dimCount > 0 ? 
            Object.values(dimensions).reduce((sum, dim) => sum + (dim.rating || 0), 0) / dimCount : 0;
        
        html += `
            <div class="candidate-card-enhanced" style="animation-delay: ${index * 0.05}s">
                <div class="candidate-card-header">
                    <div class="candidate-avatar">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                    <div class="candidate-title-group">
                        <h4 class="candidate-name-enhanced">${candidate.candidate_name || 'Unknown'}</h4>
                        <p class="candidate-email-enhanced">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            ${candidate.contact_details?.email || 'No email'}
                        </p>
                    </div>
                    <div class="rank-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                        </svg>
                        <span>#${candidate.rank}</span>
                    </div>
                </div>
                
                <div class="fit-score-section">
                    <div class="fit-score-label">Overall Job Fit</div>
                    <div class="fit-score-bar-container">
                        <div class="fit-score-bar-bg">
                            <div class="fit-score-bar-fill" style="width: ${candidate.overall_fit_percentage}%; background-color: ${progressColor};">
                                <span class="fit-score-value-text">${candidate.overall_fit_percentage}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="fit-status-badge ${fitClass}">${statusText}</div>
                </div>
                
                <div class="candidate-highlights">
                    <div class="highlight-item">
                        <div class="highlight-icon rating">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </div>
                        <div class="highlight-content">
                            <div class="highlight-label">Average Rating</div>
                            <div class="highlight-value">${avgRating.toFixed(1)} / 5.0</div>
                        </div>
                    </div>
                </div>
                
                ${candidate.primary_gap ? `
                    <div class="gap-alert">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <div>
                            <strong>Key Gap:</strong>
                            <span>${(candidate.primary_gap || '').substring(0, 100)}${(candidate.primary_gap?.length > 100) ? '...' : ''}</span>
                        </div>
                    </div>
                ` : ''}
                
                <div class="candidate-card-footer">
                    <button class="btn-view-detailed" onclick="showDetailModal(${candidate.resume_id})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>View Full Analysis</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function setupComparisonSelectors(candidates) {
    const select1 = document.getElementById('compareSelect1');
    const select2 = document.getElementById('compareSelect2');
    
    // Show only top 5 candidates
    const topCandidates = candidates.slice(0, 5);
    
    let options = '<option value="">Select candidate...</option>';
    topCandidates.forEach(candidate => {
        options += `<option value="${candidate.resume_id}">
            #${candidate.rank} - ${candidate.candidate_name} (${candidate.overall_fit_percentage}%)
        </option>`;
    });
    
    select1.innerHTML = options;
    select2.innerHTML = options;
}

function compareSelected() {
    const id1 = parseInt(document.getElementById('compareSelect1').value);
    const id2 = parseInt(document.getElementById('compareSelect2').value);
    
    if (!id1 || !id2) {
        alert('Please select two candidates to compare');
        return;
    }
    
    if (id1 === id2) {
        alert('Please select two different candidates');
        return;
    }
    
    const candidate1 = analysisResults.find(c => c.resume_id === id1);
    const candidate2 = analysisResults.find(c => c.resume_id === id2);
    
    displayComparison(candidate1, candidate2);
}

function displayComparison(c1, c2) {
    const container = document.getElementById('comparisonResults');
    
    const html = `
        <div class="comparison-grid">
            <div class="comparison-column">
                <h3>${c1.candidate_name}</h3>
                <div class="comparison-fit ${getFitClass(c1.overall_fit_percentage)}">
                    ${c1.overall_fit_percentage}% Match
                </div>
                ${generateComparisonDetails(c1)}
            </div>
            <div class="comparison-column comparison-vs">
                <div class="vs-badge">VS</div>
            </div>
            <div class="comparison-column">
                <h3>${c2.candidate_name}</h3>
                <div class="comparison-fit ${getFitClass(c2.overall_fit_percentage)}">
                    ${c2.overall_fit_percentage}% Match
                </div>
                ${generateComparisonDetails(c2)}
            </div>
        </div>
        <div class="comparison-metrics">
            <h4>Side-by-Side Scorecard</h4>
            <table class="comparison-table">
                <tr>
                    <th>Metric</th>
                    <th>${c1.candidate_name}</th>
                    <th>${c2.candidate_name}</th>
                </tr>
                ${generateComparisonRow('Technical Expertise', c1.scorecard?.technical_expertise, c2.scorecard?.technical_expertise)}
                ${generateComparisonRow('Domain Knowledge', c1.scorecard?.domain_knowledge, c2.scorecard?.domain_knowledge)}
                ${generateComparisonRow('Leadership Scope', c1.scorecard?.leadership_scope, c2.scorecard?.leadership_scope)}
                ${generateComparisonRow('Experience Match', c1.scorecard?.experience_match, c2.scorecard?.experience_match)}
                ${generateComparisonRow('Cultural Fit', c1.scorecard?.cultural_fit, c2.scorecard?.cultural_fit)}
            </table>
        </div>
        ${generateRecommendationSection(c1, c2)}
    `;
    
    container.innerHTML = html;
}

function generateComparisonDetails(candidate) {
    const scorecard = candidate.scorecard || {};
    const totalScore = (scorecard.technical_expertise || 0) + 
                       (scorecard.domain_knowledge || 0) + 
                       (scorecard.leadership_scope || 0) + 
                       (scorecard.experience_match || 0) + 
                       (scorecard.cultural_fit || 0);
    
    return `
        <div class="comparison-card">
            <div class="card-header">
                <div class="rank-badge">Rank #${candidate.rank}</div>
                <span class="badge ${getRecommendationClass(candidate.recommendation?.decision)}">
                    ${candidate.recommendation?.decision || 'N/A'}
                </span>
            </div>
            
            <div class="card-metrics">
                <div class="metric-item">
                    <div class="metric-icon">📊</div>
                    <div class="metric-content">
                        <div class="metric-label">Total Score</div>
                        <div class="metric-value">${totalScore}/25</div>
                    </div>
                </div>
                <div class="metric-item">
                    <div class="metric-icon">⚠️</div>
                    <div class="metric-content">
                        <div class="metric-label">Risk Level</div>
                        <div class="metric-value ${getRiskClass(candidate.risk_level)}">${candidate.risk_level || 'N/A'}</div>
                    </div>
                </div>
            </div>
            
            <div class="card-section">
                <div class="section-title">📧 Contact</div>
                <div class="section-content">${candidate.contact_details?.email || 'Not available'}</div>
            </div>
            
            <div class="card-section">
                <div class="section-title">🎯 Primary Gap</div>
                <div class="section-content">${formatGap(candidate.primary_gap)}</div>
            </div>
            
            <div class="card-section">
                <div class="section-title">💡 Key Strengths</div>
                <ul class="strength-list">
                    ${generateStrengthsList(candidate)}
                </ul>
            </div>
        </div>
    `;
}

function formatGap(gap) {
    if (!gap) return 'No significant gaps identified';
    if (gap.length > 100) {
        return gap.substring(0, 100) + '...';
    }
    return gap;
}

function generateStrengthsList(candidate) {
    const strengths = [];
    const scorecard = candidate.scorecard || {};
    
    if (scorecard.technical_expertise >= 4) {
        strengths.push('<li>✅ Strong technical expertise</li>');
    }
    if (scorecard.domain_knowledge >= 4) {
        strengths.push('<li>✅ Excellent domain knowledge</li>');
    }
    if (scorecard.leadership_scope >= 4) {
        strengths.push('<li>✅ Proven leadership skills</li>');
    }
    if (scorecard.cultural_fit >= 4) {
        strengths.push('<li>✅ Great cultural fit</li>');
    }
    if (candidate.overall_fit_percentage >= 80) {
        strengths.push('<li>✅ High job match score</li>');
    }
    
    if (strengths.length === 0) {
        return '<li>Review detailed scorecard for assessment</li>';
    }
    
    return strengths.slice(0, 3).join('');
}

function getRiskClass(risk) {
    if (!risk) return '';
    if (risk.toLowerCase() === 'low') return 'risk-low';
    if (risk.toLowerCase() === 'medium') return 'risk-medium';
    return 'risk-high';
}

function generateComparisonRow(metric, val1, val2) {
    const score1 = val1 || 0;
    const score2 = val2 || 0;
    const winner1 = score1 > score2 ? 'winner' : '';
    const winner2 = score2 > score1 ? 'winner' : '';
    
    return `
        <tr>
            <td>${metric}</td>
            <td class="${winner1}">${getStars(score1)} (${score1}/5)</td>
            <td class="${winner2}">${getStars(score2)} (${score2}/5)</td>
        </tr>
    `;
}

function generateRecommendationSection(c1, c2) {
    // Calculate total scores
    const c1Scorecard = c1.scorecard || {};
    const c2Scorecard = c2.scorecard || {};
    
    const c1TotalScore = (c1Scorecard.technical_expertise || 0) + 
                         (c1Scorecard.domain_knowledge || 0) + 
                         (c1Scorecard.leadership_scope || 0) + 
                         (c1Scorecard.experience_match || 0) + 
                         (c1Scorecard.cultural_fit || 0);
    
    const c2TotalScore = (c2Scorecard.technical_expertise || 0) + 
                         (c2Scorecard.domain_knowledge || 0) + 
                         (c2Scorecard.leadership_scope || 0) + 
                         (c2Scorecard.experience_match || 0) + 
                         (c2Scorecard.cultural_fit || 0);
    
    // Get overall fit percentages
    const c1Fit = c1.overall_fit_percentage || 0;
    const c2Fit = c2.overall_fit_percentage || 0;
    
    // Get recommendation decisions
    const c1Rec = c1.recommendation?.decision || '';
    const c2Rec = c2.recommendation?.decision || '';
    
    // Calculate weighted score (50% fit percentage, 40% scorecard, 10% recommendation)
    const c1Weighted = (c1Fit * 0.5) + (c1TotalScore * 4 * 0.4) + (getRecScore(c1Rec) * 0.1);
    const c2Weighted = (c2Fit * 0.5) + (c2TotalScore * 4 * 0.4) + (getRecScore(c2Rec) * 0.1);
    
    // Determine better candidate
    let betterCandidate, otherCandidate, winMargin;
    if (c1Weighted > c2Weighted) {
        betterCandidate = c1;
        otherCandidate = c2;
        winMargin = c1Weighted - c2Weighted;
    } else if (c2Weighted > c1Weighted) {
        betterCandidate = c2;
        otherCandidate = c1;
        winMargin = c2Weighted - c1Weighted;
    } else {
        // Tie
        return `
            <div class="recommendation-panel tie">
                <div class="recommendation-header">
                    <h3>⚖️ Hiring Recommendation</h3>
                </div>
                <div class="recommendation-body">
                    <div class="recommendation-result">
                        <div class="recommendation-icon">🤝</div>
                        <div class="recommendation-title">Both Candidates Are Equal</div>
                        <p>Both candidates have identical weighted scores. Consider additional factors such as team fit, availability, salary expectations, or conduct further interviews to make the final decision.</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Generate reasons
    const reasons = [];
    
    if (betterCandidate.overall_fit_percentage > otherCandidate.overall_fit_percentage) {
        const diff = betterCandidate.overall_fit_percentage - otherCandidate.overall_fit_percentage;
        reasons.push(`Higher job fit (${betterCandidate.overall_fit_percentage}% vs ${otherCandidate.overall_fit_percentage}%)`);
    }
    
    if (c1 === betterCandidate ? c1TotalScore > c2TotalScore : c2TotalScore > c1TotalScore) {
        const betterScore = c1 === betterCandidate ? c1TotalScore : c2TotalScore;
        const otherScore = c1 === betterCandidate ? c2TotalScore : c1TotalScore;
        reasons.push(`Better overall scorecard (${betterScore}/25 vs ${otherScore}/25)`);
    }
    
    if (betterCandidate.recommendation?.decision === 'RECOMMENDED' && 
        otherCandidate.recommendation?.decision !== 'RECOMMENDED') {
        reasons.push('Recommended by the system');
    }
    
    if (betterCandidate.risk_level === 'Low' && otherCandidate.risk_level !== 'Low') {
        reasons.push('Lower risk profile');
    }
    
    // Determine recommendation strength
    let strength, strengthClass, icon;
    if (winMargin > 15) {
        strength = 'Strong Recommendation';
        strengthClass = 'strong';
        icon = '✅';
    } else if (winMargin > 8) {
        strength = 'Moderate Recommendation';
        strengthClass = 'moderate';
        icon = '👍';
    } else {
        strength = 'Slight Edge';
        strengthClass = 'slight';
        icon = '↗️';
    }
    
    return `
        <div class="recommendation-panel-modern ${strengthClass}">
            <div class="recommendation-header-modern">
                <div class="header-icon">${icon}</div>
                <div class="header-content">
                    <h3>Hiring Recommendation</h3>
                    <span class="strength-badge ${strengthClass}">${strength}</span>
                </div>
            </div>
            
            <div class="winner-card">
                <div class="winner-badge">✨ Best Candidate</div>
                <div class="winner-name">${betterCandidate.candidate_name}</div>
                <div class="winner-stats">
                    <div class="stat-chip">
                        <span class="chip-label">Match</span>
                        <span class="chip-value">${betterCandidate.overall_fit_percentage}%</span>
                    </div>
                    <div class="stat-chip">
                        <span class="chip-label">Rank</span>
                        <span class="chip-value">#${betterCandidate.rank}</span>
                    </div>
                    <div class="stat-chip">
                        <span class="chip-label">Score</span>
                        <span class="chip-value">${c1 === betterCandidate ? c1TotalScore : c2TotalScore}/25</span>
                    </div>
                </div>
            </div>
            
            ${reasons.length > 0 ? `
            <div class="advantages-section">
                <div class="advantages-title">💡 Key Advantages</div>
                <div class="advantages-grid">
                    ${reasons.slice(0, 4).map(r => `
                        <div class="advantage-card">
                            <div class="advantage-icon">✓</div>
                            <div class="advantage-text">${r}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="comparison-summary-modern">
                <div class="summary-card winner-highlight">
                    <div class="summary-name">${betterCandidate.candidate_name}</div>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span class="item-label">Job Fit</span>
                            <span class="item-value highlight">${betterCandidate.overall_fit_percentage}%</span>
                        </div>
                        <div class="summary-item">
                            <span class="item-label">Total Score</span>
                            <span class="item-value">${c1 === betterCandidate ? c1TotalScore : c2TotalScore}/25</span>
                        </div>
                        <div class="summary-item">
                            <span class="item-label">Risk</span>
                            <span class="item-value ${getRiskClass(betterCandidate.risk_level)}">${betterCandidate.risk_level || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="summary-divider">vs</div>
                
                <div class="summary-card">
                    <div class="summary-name">${otherCandidate.candidate_name}</div>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span class="item-label">Job Fit</span>
                            <span class="item-value">${otherCandidate.overall_fit_percentage}%</span>
                        </div>
                        <div class="summary-item">
                            <span class="item-label">Total Score</span>
                            <span class="item-value">${c1 === otherCandidate ? c1TotalScore : c2TotalScore}/25</span>
                        </div>
                        <div class="summary-item">
                            <span class="item-label">Risk</span>
                            <span class="item-value ${getRiskClass(otherCandidate.risk_level)}">${otherCandidate.risk_level || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getRecScore(recommendation) {
    if (!recommendation) return 0;
    if (recommendation.includes('RECOMMENDED') && !recommendation.includes('NOT')) return 100;
    if (recommendation.includes('CONDITIONAL')) return 50;
    if (recommendation.includes('NOT RECOMMENDED')) return 0;
    return 25;
}

function showDetailModal(resumeId) {
    const candidate = analysisResults.find(c => c.resume_id === resumeId);
    if (!candidate) return;
    
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    
    const html = generateDetailedAnalysis(candidate);
    modalBody.innerHTML = html;
    
    modal.style.display = 'flex';
}

function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        closeDetailModal();
    }
}

function generateDetailedAnalysis(candidate) {
    const fitClass = getFitClass(candidate.overall_fit_percentage);
    
    let html = `
        <div class="detail-header">
            <div class="detail-title">
                <h2>${candidate.candidate_name || 'Unknown Candidate'}</h2>
                <span class="detail-filename">${candidate.filename}</span>
            </div>
            <div class="detail-fit ${fitClass}">
                <span class="detail-percentage">${candidate.overall_fit_percentage}%</span>
                <span class="detail-status">${candidate.fit_status || 'N/A'}</span>
            </div>
        </div>
        
        <div class="modal-cards-container">
            <!-- Skills Assessment Card -->
            <div class="modal-card">
                <div class="modal-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                    <h3>Skills Assessment</h3>
                </div>
                <div class="modal-card-body">
                    <div class="skill-bars">
                        ${generateCompactSkillBar('Technical', candidate.scorecard?.technical_expertise)}
                        ${generateCompactSkillBar('Domain', candidate.scorecard?.domain_knowledge)}
                        ${generateCompactSkillBar('Leadership', candidate.scorecard?.leadership_scope)}
                        ${generateCompactSkillBar('Experience', candidate.scorecard?.experience_match)}
                        ${generateCompactSkillBar('Culture Fit', candidate.scorecard?.cultural_fit)}
                    </div>
                </div>
            </div>
            
            <!-- Strengths & Weaknesses Cards -->
            <div class="modal-card-row">
                <div class="modal-card modal-card-half">
                    <div class="modal-card-header success">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <h3>Key Strengths</h3>
                    </div>
                    <div class="modal-card-body">
                        <ul class="bullet-list">
                            ${(candidate.strengths || []).slice(0, 3).map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="modal-card modal-card-half">
                    <div class="modal-card-header warning">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <h3>Areas of Concern</h3>
                    </div>
                    <div class="modal-card-body">
                        <ul class="bullet-list">
                            ${(candidate.weaknesses || []).slice(0, 3).map(w => `<li>${w}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- Recommendation Card -->
            <div class="modal-card">
                <div class="modal-card-header primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <h3>Hiring Decision</h3>
                </div>
                <div class="modal-card-body">
                    <div class="decision-badge ${getRecommendationClass(candidate.recommendation?.decision)}">
                        ${candidate.recommendation?.decision || 'PENDING'}
                    </div>
                    <p class="decision-reason">${(candidate.recommendation?.reasoning || 'No reasoning provided').substring(0, 200)}${(candidate.recommendation?.reasoning?.length > 200) ? '...' : ''}</p>
                </div>
            </div>
            
            <!-- Contact Information Card -->
            <div class="modal-card">
                <div class="modal-card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <h3>Contact Information</h3>
                </div>
                <div class="modal-card-body">
                    <div class="contact-items">
                        <div class="contact-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <span>${candidate.contact_details?.email || 'N/A'}</span>
                        </div>
                        <div class="contact-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            <span>${candidate.contact_details?.phone || 'N/A'}</span>
                        </div>
                        <div class="contact-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>${candidate.contact_details?.location || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

function generateCompactSkillBar(label, rating) {
    const score = rating || 0;
    const percentage = (score / 5) * 100;
    const color = score >= 4 ? '#10b981' : score >= 3 ? '#3b82f6' : score >= 2 ? '#f59e0b' : '#ef4444';
    
    return `
        <div class="compact-skill-item">
            <div class="skill-label-row">
                <span class="skill-name">${label}</span>
                <span class="skill-score">${score}/5</span>
            </div>
            <div class="skill-bar-bg">
                <div class="skill-bar-fill" style="width: ${percentage}%; background-color: ${color};"></div>
            </div>
        </div>
    `;
}

function generateDimensionAnalysis(dimensions) {
    if (!dimensions || Object.keys(dimensions).length === 0) {
        return '<p>No dimension analysis available</p>';
    }
    
    let html = '';
    
    Object.values(dimensions).forEach((dim, index) => {
        html += `
            <div class="dimension-card">
                <div class="dimension-header">
                    <h4>${index + 1}. ${dim.title || 'Unknown Dimension'}</h4>
                    <div class="dimension-meta">
                        <span class="dimension-rating">${getStars(dim.rating || 0)}</span>
                        <span class="dimension-alignment ${getAlignmentClass(dim.alignment)}">
                            ${dim.alignment || 'N/A'}
                        </span>
                    </div>
                </div>
                <div class="dimension-details">
                    ${formatDetails(dim.details)}
                </div>
                ${dim.key_points && dim.key_points.length > 0 ? `
                    <div class="dimension-points">
                        <strong>Key Points:</strong>
                        <ul>${dim.key_points.map(p => `<li>${p}</li>`).join('')}</ul>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    return html;
}

function formatDetails(details) {
    if (!details) return '<p>No details available</p>';
    
    // Split by paragraphs and format
    const paragraphs = details.split('\n').filter(p => p.trim());
    return paragraphs.map(p => `<p>${p}</p>`).join('');
}

function generateScorecardItem(label, value) {
    const score = value || 0;
    return `
        <div class="scorecard-item">
            <div class="scorecard-label">${label}</div>
            <div class="scorecard-value">${getStars(score)}</div>
            <div class="scorecard-number">${score}/5</div>
        </div>
    `;
}

function generateScoreBar(label, value) {
    const score = value || 0;
    const percentage = (score / 5) * 100;
    return `
        <div class="score-bar-container">
            <span class="score-label">${label}</span>
            <div class="score-bar">
                <div class="score-bar-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="score-value">${score}/5</span>
        </div>
    `;
}

// Helper Functions
function getFitClass(percentage) {
    if (percentage >= 70) return 'fit-high';
    if (percentage >= 50) return 'fit-medium';
    return 'fit-low';
}

function getRecommendationClass(decision) {
    if (!decision) return 'rec-pending';
    if (decision.includes('RECOMMENDED') && !decision.includes('NOT')) return 'rec-recommended';
    if (decision.includes('NOT RECOMMENDED')) return 'rec-not-recommended';
    if (decision.includes('CONDITIONAL')) return 'rec-conditional';
    return 'rec-pending';
}

function getRiskClass(level) {
    if (!level) return 'risk-unknown';
    const l = level.toLowerCase();
    if (l === 'low') return 'risk-low';
    if (l === 'moderate' || l === 'medium') return 'risk-moderate';
    if (l === 'high') return 'risk-high';
    return 'risk-unknown';
}

function getAlignmentClass(alignment) {
    if (!alignment) return '';
    const a = alignment.toLowerCase();
    if (a === 'strong') return 'align-strong';
    if (a === 'moderate') return 'align-moderate';
    if (a === 'weak') return 'align-weak';
    if (a === 'low') return 'align-low';
    return '';
}

function getStars(rating) {
    const num = Math.round(rating || 0);
    return '⭐'.repeat(Math.min(num, 5));
}

function getRankIcon(index) {
    const icons = ['🥇', '🥈', '🥉'];
    return `<span class="rank-icon">${icons[index] || ''}</span>`;
}

function resetForm() {
    // Reset form
    document.getElementById('analyzeForm').reset();
    selectedFiles = [];
    filePreviewList.innerHTML = '';
    filePreviewList.style.display = 'none';
    analysisResults = [];
    
    // Hide results, show upload
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
