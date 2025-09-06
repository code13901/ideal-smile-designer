// Global variables
let uploadedImage = null;
let analysisResult = null;

// DOM elements
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const analysisSection = document.getElementById('analysisSection');
const loadingState = document.getElementById('loadingState');
const resultsState = document.getElementById('resultsState');
const originalImage = document.getElementById('originalImage');
const designedImage = document.getElementById('designedImage');
const analysisText = document.getElementById('analysisText');
const downloadBtn = document.getElementById('downloadBtn');

// Event listeners
fileInput.addEventListener('change', handleFileUpload);
downloadBtn.addEventListener('click', downloadDesign);

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB.');
        return;
    }

    // Read and display the image
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage = {
            data: e.target.result,
            file: file
        };
        
        // Show the original image and start analysis
        originalImage.src = e.target.result;
        startAnalysis();
    };
    reader.readAsDataURL(file);
}

// Start smile analysis
async function startAnalysis() {
    // Hide upload section and show analysis section
    uploadSection.style.display = 'none';
    analysisSection.style.display = 'block';
    loadingState.style.display = 'block';
    resultsState.style.display = 'none';

    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('image', uploadedImage.file);

        // Make API call to analyze smile
        const response = await fetch('/analyze-smile', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            analysisResult = result;
            displayResults();
        } else {
            throw new Error(result.error || 'Analysis failed');
        }

    } catch (error) {
        console.error('Error analyzing smile:', error);
        showError('Failed to analyze your smile. Please try again.');
    }
}

// Display analysis results
function displayResults() {
    loadingState.style.display = 'none';
    resultsState.style.display = 'block';

    // Display the ideal smile design
    if (analysisResult.idealSmileImage) {
        designedImage.src = `data:image/png;base64,${analysisResult.idealSmileImage}`;
    }

    // Display analysis text
    if (analysisResult.analysis) {
        analysisText.innerHTML = formatAnalysisText(analysisResult.analysis);
    }
}

// Format analysis text with proper markdown support
function formatAnalysisText(text) {
    if (!text) return '';
    
    let formattedText = text;
    
    // Convert markdown headers
    formattedText = formattedText.replace(/### (.+)/g, '<h3 class="analysis-section-title">$1</h3>');
    formattedText = formattedText.replace(/## (.+)/g, '<h2 class="analysis-main-title">$1</h2>');
    
    // Convert bold text
    formattedText = formattedText.replace(/\*\*(.+?)\*\*/g, '<strong class="analysis-highlight">$1</strong>');
    
    // Convert numbered lists
    formattedText = formattedText.replace(/^(\d+)\. (.+)/gm, '<div class="analysis-point"><span class="point-number">$1.</span> <strong>$2</strong></div>');
    
    // Convert regular paragraphs (lines that don't start with numbers or special chars)
    const lines = formattedText.split('\n');
    let finalText = '';
    let inList = false;
    
    for (let line of lines) {
        line = line.trim();
        if (line === '') {
            if (inList) {
                finalText += '</div>';
                inList = false;
            }
            continue;
        }
        
        if (line.includes('<h3') || line.includes('<h2')) {
            if (inList) {
                finalText += '</div>';
                inList = false;
            }
            finalText += line;
        } else if (line.includes('<div class="analysis-point"')) {
            if (!inList) {
                finalText += '<div class="analysis-list">';
                inList = true;
            }
            finalText += line;
        } else if (line && !line.includes('<')) {
            if (inList) {
                finalText += '</div>';
                inList = false;
            }
            finalText += `<p class="analysis-paragraph">${line}</p>`;
        } else {
            finalText += line;
        }
    }
    
    if (inList) {
        finalText += '</div>';
    }
    
    return finalText;
}

// Download the designed smile image
function downloadDesign() {
    if (!analysisResult || !analysisResult.idealSmileImage) {
        alert('No design available to download.');
        return;
    }

    // Create download link
    const link = document.createElement('a');
    link.download = 'ideal-smile-design.png';
    link.href = `data:image/png;base64,${analysisResult.idealSmileImage}`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Share results (opens sharing options)
function shareResults() {
    if (!analysisResult) {
        alert('No results to share.');
        return;
    }

    // Create a shareable message
    const shareText = `I just got my ideal smile design using AI! 🦷✨ Check out the Ideal Smile Designer app powered by Gemini 2.5 Flash.`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'My Ideal Smile Design',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${shareText} ${window.location.href}`).then(() => {
            alert('Results copied to clipboard! You can now paste and share.');
        }).catch(() => {
            // Final fallback: show share text
            prompt('Copy this text to share your results:', `${shareText} ${window.location.href}`);
        });
    }
}

// Start over with a new image
function startOver() {
    // Reset all states
    uploadedImage = null;
    analysisResult = null;
    
    // Reset file input
    fileInput.value = '';
    
    // Show upload section and hide analysis section
    uploadSection.style.display = 'block';
    analysisSection.style.display = 'none';
    
    // Clear images
    originalImage.src = '';
    designedImage.src = '';
    analysisText.innerHTML = '';
}

// Show error message
function showError(message) {
    loadingState.style.display = 'none';
    
    // Create error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <h3>😕 Something went wrong</h3>
        <p>${message}</p>
        <button onclick="startOver()" class="secondary-btn">Try Again</button>
    `;
    
    analysisSection.innerHTML = '';
    analysisSection.appendChild(errorDiv);
}

// Drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadBox = document.getElementById('uploadBox');
    
    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadBox.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, unhighlight, false);
    });
    
    uploadBox.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        uploadBox.classList.add('drag-over');
    }
    
    function unhighlight() {
        uploadBox.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            handleFileUpload({ target: { files: files } });
        }
    }
});

// Drag over styles are now in CSS file
