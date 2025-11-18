// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const fileInfo = document.getElementById('fileInfo');
const convertBtn = document.getElementById('convertBtn');
const progressContainer = document.getElementById('progressContainer');
const resultContainer = document.getElementById('resultContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const downloadBtn = document.getElementById('downloadBtn');
const conversionsList = document.getElementById('conversionsList');
const fromFormat = document.getElementById('fromFormat');
const toFormat = document.getElementById('toFormat');

// State
let selectedFile = null;
let convertedBlob = null;
let convertedFilename = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadAvailableConversions();
  setupEventListeners();
});

/**
 * Load available conversions from the server
 */
async function loadAvailableConversions() {
  try {
    const response = await fetch('/api/conversions');
    const data = await response.json();

    if (data.success && data.conversions.length > 0) {
      displayConversions(data.conversions);
    }
  } catch (error) {
    console.error('Failed to load conversions:', error);
    conversionsList.innerHTML = '<p>Failed to load available conversions</p>';
  }
}

/**
 * Display available conversions in the UI
 */
function displayConversions(conversions) {
  conversionsList.innerHTML = conversions.map(conv => `
    <div class="conversion-item">
      <span class="conversion-badge">${conv.from}</span>
      <span>→</span>
      <span class="conversion-badge">${conv.to}</span>
      <span style="margin-left: auto; color: var(--text-muted); font-size: 0.875rem;">
        ${conv.description || ''}
      </span>
    </div>
  `).join('');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Browse button click
  browseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
  });

  // Upload area click
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  });

  // Convert button click
  convertBtn.addEventListener('click', handleConvert);

  // Download button click
  downloadBtn.addEventListener('click', handleDownload);
}

/**
 * Handle file selection
 */
function handleFileSelect(file) {
  if (!file) return;

  selectedFile = file;
  fileInfo.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
  convertBtn.disabled = false;

  // Reset previous results
  resultContainer.style.display = 'none';
  errorContainer.style.display = 'none';
  convertedBlob = null;
  convertedFilename = null;
}

/**
 * Handle file conversion
 */
async function handleConvert() {
  if (!selectedFile) return;

  // Reset UI
  resultContainer.style.display = 'none';
  errorContainer.style.display = 'none';
  progressContainer.style.display = 'block';
  convertBtn.disabled = true;

  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('from', fromFormat.value);
    formData.append('to', toFormat.value);

    // Send conversion request
    const response = await fetch('/api/convert', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Conversion failed');
    }

    // Get the converted file
    convertedBlob = await response.blob();

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    convertedFilename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `converted.${toFormat.value}`;

    // Show success
    progressContainer.style.display = 'none';
    resultContainer.style.display = 'block';

  } catch (error) {
    console.error('Conversion error:', error);
    progressContainer.style.display = 'none';
    errorContainer.style.display = 'block';
    errorMessage.textContent = error.message;
    convertBtn.disabled = false;
  }
}

/**
 * Handle file download
 */
function handleDownload() {
  if (!convertedBlob) return;

  const url = URL.createObjectURL(convertedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = convertedFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
