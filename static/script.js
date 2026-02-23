// ========================================
// FAANG-LEVEL FILE UPLOAD SYSTEM
// ========================================

console.log('🚀 ResumeAI Script v2.1 - LOADED ✅');
console.log('📅 Loaded at:', new Date().toLocaleTimeString());
console.log('✅ Comparison feature fixed!');

// Global upload management
let analysisResults = [];
let uploadQueue = new Map(); // fileId -> {file, hash, status, progress}
let fileHashCache = new Set(); // For O(1) duplicate detection
let activeUploads = 0;

// Configuration constants
const MAX_FILES = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const PARALLEL_UPLOADS = 3;
const ALLOWED_TYPES = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.bmp'];

// ========================================
// SHA-256 FILE HASHING FOR DEDUPLICATION
// ========================================
async function generateFileHash(file) {
    try {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (error) {
        console.error('Hash generation failed:', error);
        // Fallback to name+size for older browsers
        return `${file.name}_${file.size}`;
    }
}

// ========================================
// FILE VALIDATION
// ========================================
function validateFile(file) {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large: ${file.name} (max 5MB)`
        };
    }
    
    // Check file type
    const fileName = file.name.toLowerCase();
    const isValidType = ALLOWED_TYPES.some(type => fileName.endsWith(type));
    
    if (!isValidType) {
        return {
            valid: false,
            error: `Invalid file type: ${file.name}`
        };
    }
    
    return { valid: true };
}

// ========================================
// UPLOAD QUEUE MANAGEMENT
// ========================================
async function handleFiles(files) {
    console.log(`Processing ${files.length} files...`);
    
    const filesArray = Array.from(files);
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const file of filesArray) {
        // Check max files limit
        if (uploadQueue.size >= MAX_FILES) {
            showToast(`Maximum ${MAX_FILES} files allowed`, 'error');
            break;
        }
        
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            showToast(validation.error, 'error');
            errorCount++;
            continue;
        }
        
        // Generate hash for duplicate detection
        const hash = await generateFileHash(file);
        
        // Check if duplicate
        if (fileHashCache.has(hash)) {
            console.log(`Duplicate detected: ${file.name}`);
            skippedCount++;
            continue;
        }
        
        // Add to queue
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        uploadQueue.set(fileId, {
            id: fileId,
            file: file,
            hash: hash,
            status: 'queued', // queued, uploading, done, failed
            progress: 0,
            error: null
        });
        
        fileHashCache.add(hash);
        addedCount++;
        console.log(`Added: ${file.name} (${formatFileSize(file.size)})`);
    }
    
    // User feedback
    if (addedCount > 0) {
        showToast(`${addedCount} file${addedCount > 1 ? 's' : ''} added to queue`, 'success');
    }
    if (skippedCount > 0) {
        showToast(`${skippedCount} duplicate${skippedCount > 1 ? 's' : ''} skipped`, 'info');
    }
    
    // Render the queue
    renderUploadQueue();
}

function removeFromQueue(fileId) {
    const item = uploadQueue.get(fileId);
    if (item) {
        // Remove from hash cache
        fileHashCache.delete(item.hash);
        // Remove from queue
        uploadQueue.delete(fileId);
        console.log(`Removed from queue: ${item.file.name}`);
        renderUploadQueue();
        showToast('File removed', 'info');
    }
}

function clearQueue() {
    uploadQueue.clear();
    fileHashCache.clear();
    activeUploads = 0;
    renderUploadQueue();
}

// ========================================
// UI RENDERING
// ========================================
function renderUploadQueue() {
    const filePreviewList = document.getElementById('filePreviewList');
    filePreviewList.innerHTML = '';
    
    if (uploadQueue.size === 0) {
        filePreviewList.style.display = 'none';
        return;
    }
    
    filePreviewList.style.display = 'block';
    
    // Render each file in queue
    uploadQueue.forEach((item, fileId) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item';
        fileItem.dataset.fileId = fileId;
        
        // Status icon
        let statusIcon = '';
        if (item.status === 'done') {
            statusIcon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `;
        } else if (item.status === 'failed') {
            statusIcon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
        } else if (item.status === 'uploading') {
            statusIcon = `
                <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
            `;
        } else {
            statusIcon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            `;
        }
        
        fileItem.innerHTML = `
            <div class="file-icon ${item.status}">
                ${statusIcon}
            </div>
            <div class="file-info">
                <div class="file-name">${item.file.name}</div>
                <div class="file-meta">
                    <span class="file-size">${formatFileSize(item.file.size)}</span>
                    <span class="file-status">${item.status}</span>
                    ${item.error ? `<span class="file-error">${item.error}</span>` : ''}
                </div>
                ${item.status === 'uploading' || item.status === 'done' ? `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${item.progress}%"></div>
                    </div>
                ` : ''}
            </div>
            ${item.status === 'queued' || item.status === 'failed' ? `
                <button type="button" class="file-remove" onclick="removeFromQueue('${fileId}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            ` : ''}
        `;
        
        filePreviewList.appendChild(fileItem);
    });
    
    // Add summary footer
    const queuedCount = Array.from(uploadQueue.values()).filter(item => item.status === 'queued').length;
    
    if (queuedCount > 0) {
        const summaryFooter = document.createElement('div');
        summaryFooter.className = 'upload-queue-summary';
        summaryFooter.innerHTML = `
            <div class="summary-text">
                <strong>${uploadQueue.size}</strong> files in queue
                <span class="separator">•</span>
                <strong>${queuedCount}</strong> ready to upload
            </div>
            <button type="button" class="btn-clear-queue" onclick="clearQueue()">
                Clear Queue
            </button>
        `;
        filePreviewList.appendChild(summaryFooter);
    }
    
    // Add "Add More Files" button
    if (uploadQueue.size < MAX_FILES) {
        const addMoreContainer = document.createElement('div');
        addMoreContainer.className = 'add-more-container';
        addMoreContainer.innerHTML = `
            <button type="button" class="btn-add-more-files" onclick="openFileDialog('files')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add More Files
            </button>
            <button type="button" class="btn-add-folder" onclick="openFileDialog('folder')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                Add Folder
            </button>
        `;
        filePreviewList.appendChild(addMoreContainer);
    }
}

// ========================================
// PARALLEL UPLOAD PROCESSOR
// ========================================
async function processUploadQueue(formDataBase) {
    console.log('🚀 Starting upload queue processing...');
    
    const queuedItems = Array.from(uploadQueue.values()).filter(item => item.status === 'queued');
    
    console.log(`📋 Found ${queuedItems.length} queued items out of ${uploadQueue.size} total`);
    
    if (queuedItems.length === 0) {
        console.warn('⚠️ No queued items to upload');
        // Log all items and their statuses for debugging
        uploadQueue.forEach((item, id) => {
            console.log(`  File: ${item.file.name}, Status: ${item.status}`);
        });
        return;
    }
    
    for (const item of queuedItems) {
        // Wait if we've reached parallel upload limit
        while (activeUploads >= PARALLEL_UPLOADS) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Start upload
        uploadSingleFile(item, formDataBase);
    }
}

async function uploadSingleFile(item, formDataBase) {
    activeUploads++;
    item.status = 'uploading';
    item.progress = 0;
    renderUploadQueue();
    
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        
        // Copy base form data (job_description)
        for (let [key, value] of formDataBase.entries()) {
            formData.append(key, value);
        }
        
        // Add single file
        formData.append('resumes', item.file);
        
        // Progress tracking
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                item.progress = Math.round((e.loaded / e.total) * 100);
                updateFileProgress(item.id, item.progress);
            }
        });
        
        // Upload complete
        xhr.addEventListener('load', () => {
            activeUploads--;
            
            if (xhr.status === 200) {
                item.status = 'done';
                item.progress = 100;
                console.log(`Upload successful: ${item.file.name}`);
                
                // CRITICAL FIX: Capture and store the analysis result
                try {
                    const response = JSON.parse(xhr.responseText);
                    console.log('✅ Response received:', response);
                    if (response.results && response.results.length > 0) {
                        // Extract the first result (since we're uploading one file at a time)
                        const analysis = response.results[0];
                        analysis.resume_id = item.id; // Use item.id as unique identifier
                        analysisResults.push(analysis);
                        console.log(`✅ Analysis result captured for: ${item.file.name}`);
                        console.log(`📊 Total results captured so far: ${analysisResults.length}`);
                    } else {
                        console.warn('⚠️ No results in response:', response);
                    }
                } catch (e) {
                    console.error(`❌ Failed to parse response for ${item.file.name}:`, e);
                    console.error('Raw response:', xhr.responseText);
                }
            } else {
                item.status = 'failed';
                item.error = 'Upload failed';
                console.error(`Upload failed: ${item.file.name}`);
            }
            
            renderUploadQueue();
            resolve();
            
            // Continue processing queue
            processUploadQueue(formDataBase);
        });
        
        // Upload error
        xhr.addEventListener('error', () => {
            activeUploads--;
            item.status = 'failed';
            item.error = 'Network error';
            console.error(`Upload error: ${item.file.name}`);
            renderUploadQueue();
            resolve();
        });
        
        // Send request
        xhr.open('POST', '/analyze', true);
        xhr.send(formData);
    });
}

function updateFileProgress(fileId, progress) {
    const fileElement = document.querySelector(`[data-file-id="${fileId}"]`);
    if (fileElement) {
        const progressFill = fileElement.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }
}

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

// ========================================
// FILE INPUT HANDLERS
// ========================================

// Multi-File Input Handler
const fileInput = document.getElementById('resumes');
const fileInputFolder = document.getElementById('resumes-folder');
const fileDropZone = document.getElementById('fileDropZone');
const filePreviewList = document.getElementById('filePreviewList');
const browseFilesBtn = document.getElementById('browseFilesBtn');

// Open file dialog (folder or multi-file)
const openFileDialog = (type = 'files') => {
    if (type === 'folder') {
        // Reset and click folder input
        fileInputFolder.value = '';
        fileInputFolder.click();
    } else {
        // Reset and click multi-file input
        fileInput.value = '';
        fileInput.click();
    }
};

// Click handlers for drop zone and browse button
fileDropZone.addEventListener('click', () => openFileDialog('files'));
if (browseFilesBtn) {
    browseFilesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openFileDialog('files');
    });
}

// File selection - Regular file input
fileInput.addEventListener('change', async function(e) {
    console.log('File input change event');
    const files = Array.from(this.files);
    if (files.length > 0) {
        await handleFiles(files);
    }
});

// File selection - Folder input
fileInputFolder.addEventListener('change', async function(e) {
    console.log('Folder input change event');
    const files = Array.from(this.files);
    if (files.length > 0) {
        await handleFiles(files);
    }
});

// Drag and drop
fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.classList.add('drag-over');
});

fileDropZone.addEventListener('dragleave', () => {
    fileDropZone.classList.remove('drag-over');
});

fileDropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    fileDropZone.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
        await handleFiles(files);
    }
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// FORM SUBMISSION WITH PARALLEL UPLOADS
// ========================================

// Form submission
document.getElementById('analyzeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    // Validate upload queue
    if (uploadQueue.size === 0) {
        showToast('Please select at least one resume file', 'error');
        return;
    }
    
    // Validate job description
    const jobDesc = document.getElementById('job_description').value;
    if (!jobDesc || jobDesc.trim().length === 0) {
        showToast('Please enter a job description', 'error');
        return;
    }
    
    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('loading');
    errorMessage.style.display = 'none';
    
    // Clear previous results
    analysisResults = [];
    console.log('🔄 Starting new analysis, cleared previous results');
    
    // CRITICAL FIX: Reset all file statuses to 'queued' for re-analysis
    console.log('🔄 Resetting file statuses to queued...');
    uploadQueue.forEach((item, fileId) => {
        item.status = 'queued';
        item.progress = 0;
        item.error = null;
        console.log(`  ↪️ Reset ${item.file.name} to queued`);
    });
    renderUploadQueue();
    
    // Prepare base form data
    const formDataBase = new FormData();
    formDataBase.append('job_description', jobDesc);
    
    console.log(`Starting upload of ${uploadQueue.size} files...`);
    
    // Start parallel upload processing
    await processUploadQueue(formDataBase);
    
    // Wait for all uploads to complete
    while (activeUploads > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🏁 All uploads complete!');
    console.log(`📊 Total analysisResults captured: ${analysisResults.length}`);
    console.log('📋 analysisResults array:', analysisResults);
    
    // Check results
    const successCount = Array.from(uploadQueue.values()).filter(item => item.status === 'done').length;
    const failCount = Array.from(uploadQueue.values()).filter(item => item.status === 'failed').length;
    
    console.log(`✅ Success count: ${successCount}, ❌ Fail count: ${failCount}`);
    
    if (successCount > 0) {
        console.log('🎉 Displaying results...');
        showToast(`Analysis complete: ${successCount} successful, ${failCount} failed`, 'success');
        
        // CRITICAL FIX: Sort results by overall_fit_percentage and display them
        analysisResults.sort((a, b) => (b.overall_fit_percentage || 0) - (a.overall_fit_percentage || 0));
        
        // Add ranking
        analysisResults.forEach((result, index) => {
            result.rank = index + 1;
        });
        
        // Prepare data for displayResults function
        const resultsData = {
            total_resumes: uploadQueue.size,
            successful: successCount,
            failed: failCount,
            results: analysisResults,
            top_5: analysisResults.slice(0, 5)
        };
        
        console.log('📦 Results data prepared:', resultsData);
        
        // Display the results
        console.log('🖼️ Calling displayResults()...');
        displayResults(resultsData);
        
        // Show results section, hide upload section
        console.log('👁️ Showing results section...');
        const resultsSection = document.getElementById('resultsSection');
        const uploadSection = document.getElementById('uploadSection');
        
        if (resultsSection && uploadSection) {
            resultsSection.style.display = 'block';
            uploadSection.style.display = 'none';
            console.log('✅ Results section shown, upload section hidden');
        } else {
            console.error('❌ Could not find sections:', { resultsSection, uploadSection });
        }
        
        // Scroll to results
        setTimeout(() => {
            if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                console.log('📜 Scrolled to results section');
            }
        }, 300);
    } else {
        console.error('❌ No successful uploads');
        showToast('All uploads failed. Please try again.', 'error');
    }
    
    // Reset button state
    analyzeBtn.disabled = false;
    analyzeBtn.classList.remove('loading');
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
    
    // Remove any existing type classes
    toast.classList.remove('toast-error', 'toast-success', 'toast-info');
    
    // Add the appropriate type class
    toast.classList.add(`toast-${type}`);
    
    toast.style.display = 'flex';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

function displayResults(data) {
    console.log('🎨 displayResults() called with data:', data);
    
    // Display summary
    const summaryEl = document.getElementById('resultsSummary');
    if (!summaryEl) {
        console.error('❌ resultsSummary element not found!');
        return;
    }
    
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
    console.log('✅ Summary displayed');
    
    // Display top 5 ranking
    console.log('📊 Calling displayRanking()...');
    displayRanking(data.top_5);
    
    // Display all candidates
    console.log('👥 Calling displayAllCandidates()...');
    displayAllCandidates(data.results);
    
    // Setup comparison selectors
    console.log('🔄 Setting up comparison selectors...');
    setupComparisonSelectors(data.results);
    
    // Setup tabs
    console.log('📑 Setting up tabs...');
    setupTabs();
    
    console.log('✅ displayResults() completed');
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
    console.log('📊 displayRanking() called with', candidates?.length, 'candidates');
    const container = document.getElementById('rankingSection');
    
    if (!container) {
        console.error('❌ rankingSection element not found!');
        return;
    }
    
    if (!candidates || candidates.length === 0) {
        console.warn('⚠️ No candidates to rank');
        container.innerHTML = '<div class="no-results">No candidates to rank</div>';
        return;
    }
    
    let html = '<div class="ranking-cards-grid">';
    
    candidates.forEach((candidate, index) => {
        const rankClass = index === 0 ? 'rank-gold' : index === 1 ? 'rank-silver' : index === 2 ? 'rank-bronze' : '';
        const fitClass = getFitClass(candidate.overall_fit_percentage);
        const fitStatus = candidate.overall_fit_percentage >= 75 ? 'Excellent' : 
                         candidate.overall_fit_percentage >= 60 ? 'Good' : 
                         candidate.overall_fit_percentage >= 40 ? 'Moderate' : 'Weak';
        
        // Calculate average scorecard rating
        const scorecard = candidate.scorecard || {};
        const scores = [
            scorecard.technical_expertise || 0,
            scorecard.domain_knowledge || 0,
            scorecard.leadership_scope || 0,
            scorecard.experience_match || 0,
            scorecard.execution_capability || 0
        ];
        const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
        
        html += `
            <div class="ranking-card-pro ${rankClass}" onclick="showDetailModal('${candidate.resume_id}')" style="animation-delay: ${index * 0.1}s">
                <div class="ranking-card-header-pro">
                    <div class="rank-badge-pro">
                        <span class="rank-number-pro">${candidate.rank}</span>
                        ${index < 3 ? `<span class="rank-medal-pro">${getRankIcon(index)}</span>` : ''}
                    </div>
                    <div class="fit-score-mini ${fitClass}">
                        <span class="fit-score-mini-value">${candidate.overall_fit_percentage}%</span>
                        <span class="fit-score-mini-label">Match</span>
                    </div>
                </div>
                
                <div class="ranking-card-body-pro">
                    <div class="candidate-info-pro">
                        <div class="candidate-avatar-pro">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </div>
                        <div class="candidate-details-pro">
                            <h3 class="candidate-name-pro">${candidate.candidate_name || 'Unknown Candidate'}</h3>
                            <p class="candidate-profile-pro">${candidate.profile_type || 'No profile available'}</p>
                            <p class="candidate-email-pro">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                ${candidate.contact_details?.email || 'No email'}
                            </p>
                        </div>
                    </div>
                    
                    <div class="ranking-scorecard-pro">
                        <div class="scorecard-header-pro">
                            <span class="scorecard-label-pro">Key Competencies</span>
                            <span class="scorecard-avg-pro">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                                ${avgScore} avg
                            </span>
                        </div>
                        <div class="scorecard-items-pro">
                            <!-- Updated labels for better clarity (backend fields unchanged) -->
                            <div class="scorecard-item-pro">
                                <span class="scorecard-item-label">Technical Depth</span>
                                <div class="scorecard-item-bar">
                                    <div class="scorecard-item-fill" style="width: ${(scorecard.technical_expertise || 0) * 20}%"></div>
                                </div>
                                <span class="scorecard-item-value">${scorecard.technical_expertise || 0}</span>
                            </div>
                            <div class="scorecard-item-pro">
                                <span class="scorecard-item-label">Domain Understanding</span>
                                <div class="scorecard-item-bar">
                                    <div class="scorecard-item-fill" style="width: ${(scorecard.domain_knowledge || 0) * 20}%"></div>
                                </div>
                                <span class="scorecard-item-value">${scorecard.domain_knowledge || 0}</span>
                            </div>
                            <div class="scorecard-item-pro">
                                <span class="scorecard-item-label">Problem Solving</span>
                                <div class="scorecard-item-bar">
                                    <div class="scorecard-item-fill" style="width: ${(scorecard.leadership_scope || 0) * 20}%"></div>
                                </div>
                                <span class="scorecard-item-value">${scorecard.leadership_scope || 0}</span>
                            </div>
                            <div class="scorecard-item-pro">
                                <span class="scorecard-item-label">Hands-on Experience</span>
                                <div class="scorecard-item-bar">
                                    <div class="scorecard-item-fill" style="width: ${(scorecard.experience_match || 0) * 20}%"></div>
                                </div>
                                <span class="scorecard-item-value">${scorecard.experience_match || 0}</span>
                            </div>
                            <div class="scorecard-item-pro">
                                <span class="scorecard-item-label">Execution Capability</span>
                                <div class="scorecard-item-bar">
                                    <div class="scorecard-item-fill" style="width: ${(scorecard.execution_capability || 0) * 20}%"></div>
                                </div>
                                <span class="scorecard-item-value">${scorecard.execution_capability || 0}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${candidate.primary_gap ? `
                        <div class="ranking-gap-alert">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>${candidate.primary_gap || ''}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="ranking-card-footer-pro">
                    <div class="recommendation-status-pro ${getRecommendationClass(candidate.recommendation?.decision)}">
                        ${candidate.recommendation?.decision || 'PENDING'}
                    </div>
                    <div class="view-details-arrow-pro">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    console.log('✅ displayRanking() completed, rendered', candidates.length, 'candidates');
}

function displayAllCandidates(candidates) {
    console.log('👥 displayAllCandidates() called with', candidates?.length, 'candidates');
    const container = document.getElementById('allCandidatesSection');
    
    if (!container) {
        console.error('❌ allCandidatesSection element not found!');
        return;
    }
    
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
                            <span>${candidate.primary_gap || ''}</span>
                        </div>
                    </div>
                ` : ''}
                
                <div class="candidate-card-footer">
                    <button class="btn-view-detailed" onclick="showDetailModal('${candidate.resume_id}')">
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
    console.log('✅ displayAllCandidates() completed, rendered', topCandidates.length, 'candidates');
}

function setupComparisonSelectors(candidates) {
    console.log('🔄 setupComparisonSelectors() called with', candidates?.length, 'candidates');
    const select1 = document.getElementById('compareSelect1');
    
    // Initially show only top 5 candidates
    window.allCandidatesForComparison = candidates;
    window.currentComparisonFilter = 'top5'; // Initialize filter
    filterComparisonCandidates('top5');
}

function filterComparisonCandidates(filter) {
    const select1 = document.getElementById('compareSelect1');
    const filterTop5Btn = document.getElementById('filterTop5');
    const filterAllBtn = document.getElementById('filterAll');
    
    // Store current filter globally
    window.currentComparisonFilter = filter;
    
    // Update button states
    if (filter === 'top5') {
        filterTop5Btn.classList.add('active');
        filterAllBtn.classList.remove('active');
    } else {
        filterTop5Btn.classList.remove('active');
        filterAllBtn.classList.add('active');
    }
    
    // Get candidates based on filter
    const candidates = filter === 'top5' 
        ? window.allCandidatesForComparison.slice(0, 5)
        : window.allCandidatesForComparison;
    
    // Generate options
    let options = '<option value="">Select candidate...</option>';
    candidates.forEach(candidate => {
        options += `<option value="${candidate.resume_id}">
            #${candidate.rank} - ${candidate.candidate_name} (${candidate.overall_fit_percentage}%)
        </option>`;
    });
    
    select1.innerHTML = options;
    
    // Update compare button text based on filter
    updateCompareButtonText();
}

function updateCompareButtonText() {
    const compareBtn = document.querySelector('.comparison-controls .btn-primary');
    if (compareBtn) {
        const btnText = window.currentComparisonFilter === 'top5' ? 'Compare with Top 5' : 'Compare with All';
        compareBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            ${btnText}
        `;
    }
}

function compareSelected() {
    const selectedId = document.getElementById('compareSelect1').value;
    
    console.log('🔄 compareSelected() called with ID:', selectedId);
    
    if (!selectedId || selectedId === '') {
        alert('Please select a candidate to compare');
        return;
    }
    
    const selectedCandidate = analysisResults.find(c => c.resume_id === selectedId);
    
    if (!selectedCandidate) {
        console.error('❌ Could not find candidate with ID:', selectedId);
        alert('Error: Selected candidate not found');
        return;
    }
    
    console.log('✅ Found candidate:', selectedCandidate.candidate_name);
    
    // Filter other candidates based on current filter mode
    let otherCandidates;
    if (window.currentComparisonFilter === 'top5') {
        // Only compare with other candidates in top 5
        const top5 = analysisResults.slice(0, 5);
        otherCandidates = top5.filter(c => c.resume_id !== selectedId);
        console.log(`📊 Comparing with ${otherCandidates.length} other top 5 candidates`);
    } else {
        // Compare with all other candidates
        otherCandidates = analysisResults.filter(c => c.resume_id !== selectedId);
        console.log(`📊 Comparing with ${otherCandidates.length} other candidates`);
    }
    
    displayComparisonWithAll(selectedCandidate, otherCandidates);
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
                ${generateComparisonRow('Execution Capability', c1.scorecard?.execution_capability || 3, c2.scorecard?.execution_capability || 3)}
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
                       (scorecard.execution_capability || 3);
    
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
    // Return full text without truncation
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
    if ((scorecard.execution_capability || 3) >= 4) {
        strengths.push('<li>✅ Strong execution capability</li>');
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
                         (c1Scorecard.execution_capability || 3);
    
    const c2TotalScore = (c2Scorecard.technical_expertise || 0) + 
                         (c2Scorecard.domain_knowledge || 0) + 
                         (c2Scorecard.leadership_scope || 0) + 
                         (c2Scorecard.experience_match || 0) + 
                         (c2Scorecard.execution_capability || 3);
    
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

function displayComparisonWithAll(selectedCandidate, otherCandidates) {
    const container = document.getElementById('comparisonResults');
    
    if (!otherCandidates || otherCandidates.length === 0) {
        container.innerHTML = '<div class="no-results">No other candidates to compare</div>';
        return;
    }
    
    // Calculate scorecard total for selected candidate
    const selectedScorecard = selectedCandidate.scorecard || {};
    const selectedTotalScore = (selectedScorecard.technical_expertise || 0) + 
                              (selectedScorecard.domain_knowledge || 0) + 
                              (selectedScorecard.leadership_scope || 0) + 
                              (selectedScorecard.experience_match || 0) + 
                              (selectedScorecard.execution_capability || 3);
    
    let html = `
        <div class="comparison-selected-header">
            <div class="selected-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                Selected Candidate
            </div>
            <div class="selected-candidate-card">
                <div class="selected-header">
                    <div class="selected-avatar">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                    <div class="selected-info">
                        <h2>${selectedCandidate.candidate_name || 'Unknown'}</h2>
                        <p class="selected-rank">Rank #${selectedCandidate.rank}</p>
                        <p class="selected-email">${selectedCandidate.contact_details?.email || 'No email'}</p>
                    </div>
                    <div class="selected-fit ${getFitClass(selectedCandidate.overall_fit_percentage)}">
                        <span class="selected-fit-value">${selectedCandidate.overall_fit_percentage}%</span>
                        <span class="selected-fit-label">Match</span>
                    </div>
                </div>
                <div class="selected-metrics">
                    <div class="selected-metric">
                        <span class="metric-label-small">Total Score</span>
                        <span class="metric-value-small">${selectedTotalScore}/25</span>
                    </div>
                    <div class="selected-metric">
                        <span class="metric-label-small">Recommendation</span>
                        <span class="metric-value-small ${getRecommendationClass(selectedCandidate.recommendation?.decision)}">${selectedCandidate.recommendation?.decision || 'PENDING'}</span>
                    </div>
                    <div class="selected-metric">
                        <span class="metric-label-small">Risk Level</span>
                        <span class="metric-value-small ${getRiskClass(selectedCandidate.risk_level)}">${selectedCandidate.risk_level || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="comparison-list-header">
            <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                ${window.currentComparisonFilter === 'top5' ? 'Comparison with Top 5 Candidates' : 'Comparison with All Candidates'}
            </h3>
            <p class="comparison-count">${otherCandidates.length} candidate${otherCandidates.length !== 1 ? 's' : ''} to compare</p>
        </div>
        
        <div class="comparison-list-grid">
    `;
    
    // Sort other candidates by overall fit percentage (descending)
    const sortedCandidates = [...otherCandidates].sort((a, b) => b.overall_fit_percentage - a.overall_fit_percentage);
    
    sortedCandidates.forEach((candidate, index) => {
        const scorecard = candidate.scorecard || {};
        const totalScore = (scorecard.technical_expertise || 0) + 
                          (scorecard.domain_knowledge || 0) + 
                          (scorecard.leadership_scope || 0) + 
                          (scorecard.experience_match || 0) + 
                          (scorecard.execution_capability || 3);
        
        // Determine who is better
        const selectedFit = selectedCandidate.overall_fit_percentage || 0;
        const candidateFit = candidate.overall_fit_percentage || 0;
        const isBetter = candidateFit > selectedFit;
        const isEqual = candidateFit === selectedFit;
        
        // Calculate differences
        const fitDiff = Math.abs(candidateFit - selectedFit);
        const scoreDiff = Math.abs(totalScore - selectedTotalScore);
        
        html += `
            <div class="comparison-list-card ${isBetter ? 'better-candidate' : ''}" style="animation-delay: ${index * 0.05}s">
                <div class="comparison-card-header">
                    <div class="comparison-rank-badge">
                        <span class="rank-num">#${candidate.rank}</span>
                    </div>
                    <div class="comparison-name-info">
                        <h4>${candidate.candidate_name || 'Unknown'}</h4>
                        <p class="comparison-email">${candidate.contact_details?.email || 'No email'}</p>
                    </div>
                    ${isBetter ? '<div class="better-badge">📈 Higher Match</div>' : isEqual ? '<div class="equal-badge">⚖️ Equal Match</div>' : '<div class="lower-badge">📉 Lower Match</div>'}
                </div>
                
                <div class="comparison-stats-grid">
                    <div class="comparison-stat-item">
                        <div class="stat-label-comp">Job Fit</div>
                        <div class="stat-comparison">
                            <span class="stat-value-comp ${isBetter ? 'higher' : isEqual ? 'equal' : 'lower'}">${candidateFit}%</span>
                            <span class="stat-diff">${isBetter ? '+' : isEqual ? '' : '-'}${fitDiff}%</span>
                        </div>
                    </div>
                    <div class="comparison-stat-item">
                        <div class="stat-label-comp">Total Score</div>
                        <div class="stat-comparison">
                            <span class="stat-value-comp">${totalScore}/25</span>
                            <span class="stat-diff">${totalScore > selectedTotalScore ? '+' : totalScore === selectedTotalScore ? '' : '-'}${scoreDiff}</span>
                        </div>
                    </div>
                    <div class="comparison-stat-item">
                        <div class="stat-label-comp">Recommendation</div>
                        <div class="stat-value-comp ${getRecommendationClass(candidate.recommendation?.decision)}">${candidate.recommendation?.decision || 'PENDING'}</div>
                    </div>
                </div>
                
                <div class="comparison-scorecard-compact">
                    <div class="scorecard-compact-title">Scorecard Comparison</div>
                    <div class="scorecard-comparison-bars">
                        <!-- Updated labels for consistency -->
                        ${generateComparisonBar('Technical Depth', selectedScorecard.technical_expertise || 0, scorecard.technical_expertise || 0)}
                        ${generateComparisonBar('Domain Understanding', selectedScorecard.domain_knowledge || 0, scorecard.domain_knowledge || 0)}
                        ${generateComparisonBar('Problem Solving', selectedScorecard.leadership_scope || 0, scorecard.leadership_scope || 0)}
                        ${generateComparisonBar('Hands-on Experience', selectedScorecard.experience_match || 0, scorecard.experience_match || 0)}
                        ${generateComparisonBar('Execution Capability', selectedScorecard.execution_capability || 3, scorecard.execution_capability || 3)}
                    </div>
                </div>
                
                <div class="comparison-card-footer">
                    <button class="btn-view-comparison" onclick="showDetailModal('${candidate.resume_id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View Full Details
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function generateComparisonBar(label, selectedValue, otherValue) {
    const isBetter = otherValue > selectedValue;
    const isEqual = otherValue === selectedValue;
    const maxValue = Math.max(selectedValue, otherValue, 5);
    
    return `
        <div class="comparison-bar-row">
            <span class="comparison-bar-label">${label}</span>
            <div class="comparison-bar-dual">
                <div class="bar-segment selected-bar">
                    <div class="bar-fill" style="width: ${(selectedValue / 5) * 100}%"></div>
                    <span class="bar-value">${selectedValue}</span>
                </div>
                <div class="bar-segment other-bar ${isBetter ? 'better' : isEqual ? 'equal' : 'lower'}">
                    <div class="bar-fill" style="width: ${(otherValue / 5) * 100}%"></div>
                    <span class="bar-value">${otherValue}</span>
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
    const scorecard = candidate.scorecard || {};
    const dimensions = candidate.dimension_analysis || {};
    
    // Determine fit status text with role context
    const fitStatusText = candidate.overall_fit_percentage >= 80 ? 'STRONG MATCH' : 
                         candidate.overall_fit_percentage >= 60 ? 'GOOD MATCH' : 
                         candidate.overall_fit_percentage >= 40 ? 'MODERATE MATCH' : 'WEAK MATCH';
    
    let html = `
        <div class="recruiter-eval-header">
            <h1 class="eval-candidate-name">${candidate.candidate_name || 'Unknown Candidate'}</h1>
            <div class="eval-subtitle">— Recruiter Evaluation</div>
        </div>

        <div class="eval-fit-banner ${fitClass}">
            <div class="eval-fit-main">
                <span class="eval-fit-label">Overall JD Fit:</span>
                <span class="eval-fit-percentage">${candidate.overall_fit_percentage}%</span>
                <span class="eval-fit-status">(${fitStatusText})</span>
            </div>
        </div>

        <div class="eval-summary-block">
            <div class="eval-summary-row">
                <span class="eval-summary-label">Profile Type:</span>
                <span class="eval-summary-value">${candidate.profile_type || 'Professional Candidate'}</span>
            </div>
            <div class="eval-summary-row">
                <span class="eval-summary-label">Primary Background:</span>
                <span class="eval-summary-value">${candidate.primary_background || 'Technical Professional'}</span>
            </div>
            <div class="eval-summary-row highlight-gap-row">
                <span class="eval-summary-label">Primary Gap:</span>
                <span class="eval-summary-value">${candidate.primary_gap || 'No significant gaps identified'}</span>
            </div>
        </div>

        <div class="eval-dimensions-container">
            ${generateDimensionSections(candidate, dimensions, scorecard)}
        </div>

        <div class="eval-scorecard-section">
            <h3 class="eval-section-title">📊 Final Scorecard Summary</h3>
            <div class="eval-scorecard-table">
                <div class="scorecard-table-row header-row">
                    <div class="scorecard-cell">Dimension</div>
                    <div class="scorecard-cell">Assessment</div>
                </div>
                <div class="scorecard-table-row">
                    <div class="scorecard-cell">Technical/Functional Expertise</div>
                    <div class="scorecard-cell">${getStars(scorecard.technical_functional_expertise || scorecard.technical_expertise || 0)}</div>
                </div>
                <div class="scorecard-table-row">
                    <div class="scorecard-cell">Domain Knowledge</div>
                    <div class="scorecard-cell">${getStars(scorecard.domain_knowledge || 0)}</div>
                </div>
                <div class="scorecard-table-row">
                    <div class="scorecard-cell">Tools & Systems</div>
                    <div class="scorecard-cell">${getStars(scorecard.tools_systems || 0)}</div>
                </div>
                <div class="scorecard-table-row">
                    <div class="scorecard-cell">Execution Capability</div>
                    <div class="scorecard-cell">${getStars(scorecard.execution_capability || 0)}</div>
                </div>
                <div class="scorecard-table-row">
                    <div class="scorecard-cell">Leadership Scope</div>
                    <div class="scorecard-cell">${getStars(scorecard.leadership_scope || 0)}</div>
                </div>
                <div class="scorecard-table-row total-row">
                    <div class="scorecard-cell">Overall Fit</div>
                    <div class="scorecard-cell">${getStars(scorecard.overall_fit || 0)} (${candidate.overall_fit_percentage}%)</div>
                </div>
            </div>
        </div>

        <div class="eval-manager-assessment">
            <h3 class="eval-manager-title">📌 Overall Hiring Manager Assessment</h3>
            <div class="eval-manager-content">
                <p>${candidate.hiring_manager_assessment || candidate.recommendation?.reasoning || 
                    `${candidate.candidate_name || 'The candidate'} demonstrates relevant technical fundamentals and shows promise for the role. The profile exhibits strong foundational skills with areas identified for growth and development. With appropriate guidance and structured onboarding, expected to contribute effectively to the team.`}</p>
            </div>
        </div>

        <div class="eval-final-recommendation ${getRecommendationClass(candidate.recommendation?.decision)}">
            <div class="eval-rec-icon">
                ${candidate.recommendation?.decision?.includes('RECOMMENDED') && !candidate.recommendation?.decision?.includes('NOT') ? '✅' : 
                  candidate.recommendation?.decision?.includes('CONDITIONAL') ? '⚠️' : '❌'}
            </div>
            <h3 class="eval-rec-title">Final Recruiter Recommendation</h3>
            <div class="eval-rec-decision">
                ${candidate.recommendation?.decision || 'PENDING REVIEW'}
            </div>
            <p class="eval-rec-reasoning">
                ${candidate.recommendation?.reasoning || 'Comprehensive evaluation completed. Candidate demonstrates relevant skills and experience for the position with noted areas for consideration.'}
            </p>
        </div>

        <div class="eval-contact-footer">
            <div class="eval-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>${candidate.contact_details?.email || 'Email not available'}</span>
            </div>
            <div class="eval-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>${candidate.contact_details?.phone || 'Phone not available'}</span>
            </div>
        </div>
    `;
    
    return html;
}

function generateDimensionSections(candidate, dimensions, scorecard) {
    // Get dimension data from dimension_analysis
    const dimensionList = Object.keys(dimensions).length > 0 ? Object.entries(dimensions) : [];
    
    let sectionsHtml = '';
    
    if (dimensionList.length > 0) {
        dimensionList.forEach(([dimName, dimData], index) => {
            const dimNumber = index + 1;
            const rating = dimData.rating || 0;
            const alignment = dimData.alignment || 'Moderate';
            const keyPoints = dimData.key_points || dimData.evidence || [];
            const strengthAreas = dimData.strength_areas || dimData.strengths || [];
            const watchAreas = dimData.watch_areas || dimData.concerns || [];
            const verdict = dimData.verdict || dimData.insight || (dimData.gaps && dimData.gaps[0]) || '';
            const riskLevel = dimData.risk_level || '';
            
            sectionsHtml += `
                <div class="eval-dimension-section">
                    <div class="eval-dim-header">
                        <span class="eval-dim-number">${dimNumber}.</span>
                        <h4 class="eval-dim-title">${dimData.title || dimName}</h4>
                    </div>
                    
                    <div class="eval-dim-content">
                        ${keyPoints.length > 0 ? `
                            <ul class="eval-bullet-list">
                                ${keyPoints.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        ` : ''}
                        
                        ${strengthAreas.length > 0 ? `
                            <div class="eval-subsection">
                                <h5 class="eval-subsection-title">Strength Areas</h5>
                                <ul class="eval-bullet-list">
                                    ${strengthAreas.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${watchAreas.length > 0 ? `
                            <div class="eval-subsection">
                                <h5 class="eval-subsection-title">Watch Areas</h5>
                                <ul class="eval-bullet-list">
                                    ${watchAreas.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${riskLevel ? `
                            <div class="eval-risk-badge">
                                <span class="eval-risk-label">Risk Level:</span>
                                <span class="eval-risk-value">${riskLevel}</span>
                            </div>
                        ` : ''}
                        
                        <div class="eval-alignment-box">
                            <span class="eval-alignment-label">JD Alignment:</span>
                            <span class="eval-alignment-value ${getAlignmentClass(alignment)}">${alignment}</span>
                        </div>
                        
                        ${verdict ? `
                            <div class="eval-insight-arrow">
                                ➡️ ${verdict}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
    } else {
        // Fallback: Create generic sections based on scorecard
        const genericDimensions = [
            { name: 'Technical Expertise & Skills', rating: scorecard.technical_expertise || 0 },
            { name: 'Domain Knowledge & Experience', rating: scorecard.domain_knowledge || 0 },
            { name: 'Leadership & Ownership Scope', rating: scorecard.leadership_scope || 0 },
            { name: 'Experience Match & Background', rating: scorecard.experience_match || 0 },
            { name: 'Execution Capability & Delivery', rating: scorecard.execution_capability || 3 }
        ];
        
        genericDimensions.forEach((dim, index) => {
            const dimNumber = index + 1;
            const alignmentText = dim.rating >= 4 ? 'Strong' : dim.rating >= 3 ? 'Moderate' : 'Low';
            
            sectionsHtml += `
                <div class="eval-dimension-section">
                    <div class="eval-dim-header">
                        <span class="eval-dim-number">${dimNumber}.</span>
                        <h4 class="eval-dim-title">${dim.name}</h4>
                    </div>
                    
                    <div class="eval-dim-content">
                        <ul class="eval-bullet-list">
                            <li>Rating: ${dim.rating}/5 (${getStars(dim.rating)})</li>
                            <li>Demonstrates ${alignmentText.toLowerCase()} proficiency in this area</li>
                            <li>Evaluation based on resume review and job requirements</li>
                        </ul>
                        
                        <div class="eval-alignment-box">
                            <span class="eval-alignment-label">JD Alignment:</span>
                            <span class="eval-alignment-value ${getAlignmentClass(alignmentText)}">${alignmentText}</span>
                        </div>
                        
                        <div class="eval-insight-arrow">
                            ➡️ ${dim.rating >= 4 ? 'Strong capability demonstrated' : dim.rating >= 3 ? 'Meets core requirements' : 'Development area identified'}
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    return sectionsHtml;
}

function generateAssessmentSections(candidate) {
    // Generate concise assessment sections with key points
    const strengths = candidate.strengths || [];
    const weaknesses = candidate.weaknesses || [];
    
    let sections = '';
    
    // Create assessment sections if data exists
    if (strengths.length > 0 || weaknesses.length > 0) {
        sections = `
            <div class="assessment-section">
                <h4 class="assessment-heading">✅ Key Strengths</h4>
                <ul class="assessment-points">
                    ${strengths.slice(0, 3).map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
            
            <div class="assessment-section">
                <h4 class="assessment-heading">⚠️ Areas of Concern</h4>
                <ul class="assessment-points">
                    ${weaknesses.slice(0, 3).map(w => `<li>${w}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    return sections;
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
    
    // Clear analysis results and upload queue
    analysisResults = [];
    uploadQueue.clear();
    fileHashCache.clear();
    activeUploads = 0;
    
    // Hide results, show upload
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
