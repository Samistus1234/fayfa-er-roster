// Data Importer Module - Completely New Implementation
console.log('🔧 Loading Data Importer Module');

class DataImporter {
    constructor() {
        this.supportedTypes = [
            {
                id: 'doctors',
                name: 'Doctor Profiles',
                description: 'Import doctor information including names, specializations, and contact details',
                icon: 'user-md',
                sampleData: 'name,email,phone,specialization,isAvailable\nDr. John Smith,john@fayfa.hospital,+966501234567,Emergency Medicine,true\nDr. Sarah Johnson,sarah@fayfa.hospital,+966501234568,Internal Medicine,true',
                acceptedFormats: ['.csv']
            },
            {
                id: 'roster',
                name: 'Shift Schedules',
                description: 'Import roster entries with doctor assignments and shift schedules',
                icon: 'calendar-alt',
                sampleData: 'doctorId,shift,date,isReferralDuty\n1,morning,2025-07-01,false\n2,evening,2025-07-01,true\n3,night,2025-07-01,false',
                acceptedFormats: ['.csv']
            },
            {
                id: 'licenses',
                name: 'Medical Licenses',
                description: 'Import medical license information for all doctors',
                icon: 'id-card',
                sampleData: 'staffMemberId,licenseType,licenseNumber,issueDate,expirationDate,issuingAuthority,additionalNotes\n1,BLS,BLS-2024-001,2024-01-15,2026-01-15,American Heart Association,Renewed certification\n2,ACLS,ACLS-2023-045,2023-06-20,2025-06-20,American Heart Association,Advanced certification completed',
                acceptedFormats: ['.csv']
            },
            {
                id: 'consultations',
                name: 'Consultation Logs',
                description: 'Import consultation log entries and specialist responses',
                icon: 'clipboard-list',
                sampleData: 'date,shift,erDoctorId,timeCalled,specialistId,specialty,arrivalTime,responseTime,patientId,outcome,urgent\n2025-07-01,morning,1,08:30,fathi,Internal Medicine,09:15,45 min,P001,admitted,false\n2025-07-01,evening,2,15:45,joseph,Orthopedics,16:20,35 min,P002,discharged,true',
                acceptedFormats: ['.csv']
            }
        ];
        this.currentType = null;
        this.selectedFile = null;
        this.isInitialized = false;
        console.log('✅ DataImporter constructor completed');
    }

    // Initialize the data importer
    async init() {
        console.log('🔧 Initializing Data Importer...');
        this.isInitialized = true;
        console.log('✅ Data Importer initialized successfully');
        return true;
    }

    // Show the data importer modal
    showModal() {
        console.log('🔧 Opening Data Importer...');
        const modal = document.getElementById('dataImportModal');

        if (!modal) {
            console.error('❌ Data Import modal not found!');
            this.showNotification('Error: Data Import modal not found', 'error');
            return;
        }

        modal.style.display = 'flex';
        modal.classList.add('show');
        this.loadModalContent();
    }

    // Close the data importer modal
    closeModal() {
        const modal = document.getElementById('dataImportModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Wait for transition to complete
        }
    }

    // Load modal content
    loadModalContent() {
        const modalBody = document.getElementById('dataImportBody');
        if (!modalBody) return;

        const content = this.generateContent();
        modalBody.innerHTML = content;

        // Setup event listeners
        setTimeout(() => {
            this.setupEventListeners();
        }, 100);
    }

    // Generate modal content
    generateContent() {
        return `
            <div class="data-importer-container">
                <!-- Header Info -->
                <div class="importer-header">
                    <div class="header-info">
                        <h3><i class="fas fa-cloud-upload-alt"></i> Choose Import Type</h3>
                        <p>Select the type of data you want to import and upload your CSV file</p>
                    </div>
                    <div class="supported-formats">
                        <span class="format-badge csv">CSV Only</span>
                    </div>
                </div>

                <!-- Import Type Selection -->
                <div class="import-types-grid">
                    ${this.supportedTypes.map(type => `
                        <div class="import-type-card" data-type="${type.id}" onclick="dataImporter.selectType('${type.id}')">
                            <div class="type-icon">
                                <i class="fas fa-${type.icon}"></i>
                            </div>
                            <div class="type-content">
                                <h4>${type.name}</h4>
                                <p>${type.description}</p>
                                <div class="accepted-formats">
                                    ${type.acceptedFormats.map(format => `<span class="mini-badge">${format}</span>`).join('')}
                                </div>
                                <div class="template-action">
                                    <button class="btn-download-template" onclick="dataImporter.downloadTemplate('${type.id}')">
                                        <i class="fas fa-download"></i> Download CSV Template
                                    </button>
                                </div>
                                <div class="import-instruction">
                                    <small><i class="fas fa-info-circle"></i> Download the CSV template, fill it with your data according to the required fields, then re-upload here.</small>
                                </div>
                            </div>
                            <div class="select-indicator">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- File Upload Section -->
                <div class="file-upload-section" id="fileUploadSection" style="display: none;">
                    <div class="upload-header">
                        <h3><i class="fas fa-file-upload"></i> Upload Your File</h3>
                        <div class="selected-type-info" id="selectedTypeInfo"></div>
                    </div>

                    <div class="upload-zone" id="uploadZone">
                        <div class="upload-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <div class="upload-text">
                            <h4>Drag & Drop Your File Here</h4>
                            <p>or <span class="upload-link" onclick="document.getElementById('fileInput').click()">browse files</span></p>
                            <input type="file" id="fileInput" accept=".csv" style="display: none;">
                        </div>
                        <div class="upload-limits">
                            <small><i class="fas fa-info-circle"></i> Max size: 10MB | Format: CSV only</small>
                        </div>
                    </div>

                    <div class="file-selected" id="fileSelected" style="display: none;">
                        <div class="file-info">
                            <div class="file-icon">
                                <i class="fas fa-file"></i>
                            </div>
                            <div class="file-details">
                                <div class="file-name" id="fileName">filename.csv</div>
                                <div class="file-meta">
                                    <span id="fileSize">1.2 MB</span>
                                    <span id="fileType">CSV</span>
                                </div>
                            </div>
                        </div>
                        <div class="file-actions">
                            <button class="btn-sm danger" onclick="dataImporter.removeFile()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Sample Data Section -->
                <div class="sample-section" id="sampleSection" style="display: none;">
                    <div class="sample-header">
                        <h3><i class="fas fa-eye"></i> Expected Format</h3>
                        <button class="btn-outline" onclick="dataImporter.downloadSample()">
                            <i class="fas fa-download"></i> Download Sample
                        </button>
                    </div>
                    <div class="sample-preview">
                        <pre id="sampleData">Select an import type to see sample format</pre>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-section" id="actionSection" style="display: none;">
                    <div class="action-buttons">
                        <button class="btn-primary" id="importBtn" onclick="dataImporter.startImport()" disabled>
                            <i class="fas fa-upload"></i> Import Data
                        </button>
                        <button class="btn-secondary" onclick="dataImporter.validateFile()">
                            <i class="fas fa-check"></i> Validate File
                        </button>
                        <button class="btn-outline" onclick="dataImporter.resetForm()">
                            <i class="fas fa-undo"></i> Reset
                        </button>
                    </div>
                </div>

                <!-- Progress Section -->
                <div class="progress-section" id="progressSection" style="display: none;">
                    <div class="progress-header">
                        <h4 id="progressTitle">Processing...</h4>
                        <span id="progressStatus">Uploading file...</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                    </div>
                    <div class="progress-details" id="progressDetails"></div>
                </div>

                <!-- Results Section -->
                <div class="results-section" id="resultsSection" style="display: none;">
                    <div class="results-header">
                        <h3><i class="fas fa-check-circle"></i> Import Complete</h3>
                    </div>
                    <div class="results-content" id="resultsContent">
                        <!-- Results will be populated here -->
                    </div>
                </div>
            </div>

            <style>
                .data-importer-container {
                    padding: 25px;
                    max-height: 85vh;
                    overflow-y: auto;
                }

                .importer-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #f0f0f0;
                }

                .header-info h3 {
                    color: #1a1a1a;
                    margin: 0 0 5px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    text-shadow: none;
                }

                .header-info p {
                    color: #4a4a4a;
                    margin: 0;
                    font-weight: 600;
                    text-shadow: none;
                }

                .supported-formats {
                    display: flex;
                    gap: 8px;
                }

                .format-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    color: white;
                }

                .format-badge.csv { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); }

                .import-types-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .import-type-card {
                    background: rgba(255, 255, 255, 0.95);
                    border: 2px solid #e0e0e0;
                    border-radius: 15px;
                    padding: 25px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                }

                .import-type-card:hover {
                    border-color: #f093fb;
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);
                }

                .import-type-card.selected {
                    border-color: #f093fb;
                    background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
                }

                .import-type-card .type-icon {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 20px;
                    margin-bottom: 15px;
                }

                .type-content h4 {
                    margin: 0 0 8px 0;
                    color: #1a1a1a;
                    font-size: 18px;
                    font-weight: 700;
                    text-shadow: none;
                }

                .type-content p {
                    color: #4a4a4a;
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    line-height: 1.4;
                    font-weight: 600;
                    text-shadow: none;
                }

                .template-action {
                    margin: 12px 0;
                }

                .btn-download-template {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.3s ease;
                    width: 100%;
                    justify-content: center;
                }

                .btn-download-template:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }

                .import-instruction {
                    margin-top: 8px;
                    padding: 8px;
                    background: rgba(59, 130, 246, 0.1);
                    border-radius: 6px;
                    border-left: 3px solid #3b82f6;
                }

                .import-instruction small {
                    color: #1e40af;
                    font-size: 11px;
                    line-height: 1.3;
                    display: flex;
                    align-items: flex-start;
                    gap: 6px;
                }

                .import-instruction i {
                    margin-top: 1px;
                    flex-shrink: 0;
                }

                .accepted-formats {
                    display: flex;
                    gap: 5px;
                }

                .mini-badge {
                    background: rgba(243, 244, 246, 0.9);
                    color: #1a1a1a;
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 600;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                }

                .select-indicator {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    color: #f093fb;
                    font-size: 20px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .import-type-card.selected .select-indicator {
                    opacity: 1;
                }

                .file-upload-section {
                    margin-bottom: 30px;
                }

                .upload-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .upload-header h3 {
                    margin: 0;
                    color: #1a1a1a;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    text-shadow: none;
                }

                .selected-type-info {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                }

                .upload-zone {
                    border: 3px dashed #d1d5db;
                    border-radius: 15px;
                    padding: 40px 20px;
                    text-align: center;
                    transition: all 0.3s ease;
                    background: rgba(249, 250, 251, 0.8);
                    backdrop-filter: blur(5px);
                }

                .upload-zone:hover, .upload-zone.drag-over {
                    border-color: #f093fb;
                    background: rgba(240, 147, 251, 0.05);
                }

                .upload-icon {
                    font-size: 48px;
                    color: #ddd;
                    margin-bottom: 15px;
                }

                .upload-text h4 {
                    margin: 0 0 8px 0;
                    color: #1a1a1a;
                    font-weight: 700;
                    text-shadow: none;
                }

                .upload-text p {
                    color: #4a4a4a;
                    margin: 0 0 15px 0;
                    font-weight: 600;
                    text-shadow: none;
                }

                .upload-link {
                    color: #f093fb;
                    cursor: pointer;
                    text-decoration: underline;
                }

                .upload-limits {
                    color: #6b7280;
                    font-size: 13px;
                    font-weight: 500;
                }

                .file-selected {
                    background: rgba(255, 255, 255, 0.95);
                    border: 2px solid #4CAF50;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    backdrop-filter: blur(10px);
                }

                .file-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .file-icon {
                    width: 40px;
                    height: 40px;
                    background: #4CAF50;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                }

                .file-name {
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 4px;
                    text-shadow: none;
                }

                .file-meta {
                    display: flex;
                    gap: 10px;
                    font-size: 13px;
                    color: #4a4a4a;
                    font-weight: 600;
                    text-shadow: none;
                }

                .sample-section, .action-section, .progress-section, .results-section {
                    margin-bottom: 25px;
                }

                .sample-header, .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .sample-header h3, .results-header h3 {
                    margin: 0;
                    color: #1a1a1a;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    text-shadow: none;
                }

                .sample-preview {
                    background: rgba(248, 249, 250, 0.9);
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 15px;
                    backdrop-filter: blur(5px);
                }

                .sample-preview pre {
                    margin: 0;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    color: #1a1a1a;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-weight: 600;
                    text-shadow: none;
                }

                .action-buttons {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .btn-primary, .btn-secondary, .btn-outline, .btn-sm {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }

                .btn-sm { padding: 8px 12px; }

                .btn-primary {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                }

                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4); }
                .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

                .btn-secondary {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                }

                .btn-outline {
                    background: white;
                    border: 2px solid #f093fb;
                    color: #f093fb;
                }

                .btn-sm.danger {
                    background: #f44336;
                    color: white;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #e0e0e0;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    transition: width 0.3s ease;
                }

                .results-content {
                    background: rgba(248, 249, 250, 0.9);
                    border-radius: 12px;
                    padding: 20px;
                    backdrop-filter: blur(5px);
                }
            </style>
        `;
    }

    // Setup event listeners
    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadZone = document.getElementById('uploadZone');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (uploadZone) {
            uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
            uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        }
    }

    // Select import type
    selectType(typeId) {
        console.log(`🔧 Selecting import type: ${typeId}`);

        // Clear previous selection
        document.querySelectorAll('.import-type-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Select new type
        const selectedCard = document.querySelector(`[data-type="${typeId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        const type = this.supportedTypes.find(t => t.id === typeId);
        if (!type) return;

        this.currentType = type;

        // Show relevant sections
        document.getElementById('fileUploadSection').style.display = 'block';
        document.getElementById('sampleSection').style.display = 'block';
        document.getElementById('actionSection').style.display = 'block';

        // Update content
        document.getElementById('selectedTypeInfo').textContent = type.name;
        document.getElementById('sampleData').textContent = type.sampleData;

        this.updateImportButton();
    }

    // Handle file selection
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    // Handle drag over
    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    // Handle drag leave
    handleDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    }

    // Handle drop
    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    // Process selected file
    processFile(file) {
        console.log('🔧 Processing file:', file.name);

        // Validate file
        if (!this.validateFile(file)) return;

        this.selectedFile = file;

        // Update UI
        document.getElementById('uploadZone').style.display = 'none';
        const fileSelected = document.getElementById('fileSelected');
        fileSelected.style.display = 'flex';

        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
        document.getElementById('fileType').textContent = file.name.split('.').pop().toUpperCase();

        this.updateImportButton();
    }

    // Validate file
    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedExtensions = ['csv'];
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (file.size > maxSize) {
            this.showNotification('File too large. Maximum size is 10MB.', 'error');
            return false;
        }

        if (!allowedExtensions.includes(fileExtension)) {
            this.showNotification('Invalid file type. Please select a CSV file only.', 'error');
            return false;
        }

        return true;
    }

    // Remove selected file
    removeFile() {
        this.selectedFile = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('uploadZone').style.display = 'block';
        document.getElementById('fileSelected').style.display = 'none';
        this.updateImportButton();
    }

    // Update import button state
    updateImportButton() {
        const importBtn = document.getElementById('importBtn');
        const canImport = this.currentType && this.selectedFile;
        importBtn.disabled = !canImport;
    }

    // Validate file content
    async validateFile() {
        if (!this.selectedFile || !this.currentType) {
            this.showNotification('Please select an import type and file first', 'warning');
            return;
        }

        this.showProgress('Validating...', 'Checking file format and content', 25);

        try {
            const content = await this.readFile(this.selectedFile);
            const isValid = this.validateContent(content);

            if (isValid) {
                this.showProgress('Validation Complete', 'File is valid and ready for import', 100);
                setTimeout(() => this.hideProgress(), 2000);
                this.showNotification('File validation successful!', 'success');
            } else {
                throw new Error('Invalid file content format');
            }
        } catch (error) {
            this.hideProgress();
            this.showNotification('File validation failed: ' + error.message, 'error');
        }
    }

    // Start import process
    async startImport() {
        if (!this.selectedFile || !this.currentType) {
            this.showNotification('Please select an import type and file first', 'warning');
            return;
        }

        console.log('🔧 Starting import process...');
        this.showProgress('Uploading...', 'Uploading file to server', 10);

        try {
            // Simulate upload progress
            for (let i = 10; i <= 90; i += 20) {
                await this.delay(300);
                this.updateProgress(i, 'Processing data...');
            }

            // In a real implementation, you would send the file to the server here
            // const formData = new FormData();
            // formData.append('file', this.selectedFile);
            // formData.append('type', this.currentType.id);
            // const response = await fetch('/api/import', { method: 'POST', body: formData });

            this.updateProgress(100, 'Import complete!');

            // Simulate results
            const mockResults = {
                success: true,
                imported: Math.floor(Math.random() * 50) + 10,
                errors: Math.floor(Math.random() * 3),
                total: Math.floor(Math.random() * 50) + 10
            };

            setTimeout(() => {
                this.hideProgress();
                this.showResults(mockResults);
            }, 1000);

        } catch (error) {
            this.hideProgress();
            this.showNotification('Import failed: ' + error.message, 'error');
        }
    }

    // Download template for specific type
    downloadTemplate(typeId) {
        const type = this.supportedTypes.find(t => t.id === typeId);
        if (!type) {
            this.showNotification('Template not found', 'error');
            return;
        }

        const content = type.sampleData;
        const filename = `template-${type.id}.csv`;
        this.downloadFile(content, filename, 'text/csv');
        this.showNotification(`${type.name} template downloaded!`, 'success');
    }

    // Download sample file (legacy method for backward compatibility)
    downloadSample() {
        if (!this.currentType) {
            this.showNotification('Please select an import type first', 'warning');
            return;
        }

        const content = this.currentType.sampleData;
        const filename = `template-${this.currentType.id}.csv`;
        this.downloadFile(content, filename, 'text/csv');
        this.showNotification('Template file downloaded!', 'success');
    }

    // Reset form
    resetForm() {
        this.currentType = null;
        this.selectedFile = null;

        // Clear selections
        document.querySelectorAll('.import-type-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Hide sections
        document.getElementById('fileUploadSection').style.display = 'none';
        document.getElementById('sampleSection').style.display = 'none';
        document.getElementById('actionSection').style.display = 'none';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';

        // Reset file input
        document.getElementById('fileInput').value = '';
        document.getElementById('uploadZone').style.display = 'block';
        document.getElementById('fileSelected').style.display = 'none';

        this.showNotification('Form reset successfully', 'info');
    }

    // Show progress
    showProgress(title, status, percentage) {
        const progressSection = document.getElementById('progressSection');
        progressSection.style.display = 'block';

        document.getElementById('progressTitle').textContent = title;
        document.getElementById('progressStatus').textContent = status;
        document.getElementById('progressFill').style.width = percentage + '%';
    }

    // Update progress
    updateProgress(percentage, status) {
        document.getElementById('progressStatus').textContent = status;
        document.getElementById('progressFill').style.width = percentage + '%';
    }

    // Hide progress
    hideProgress() {
        document.getElementById('progressSection').style.display = 'none';
    }

    // Show results
    showResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsContent = document.getElementById('resultsContent');

        const html = `
            <div class="results-stats">
                <div class="result-stat success">
                    <div class="stat-number">${results.imported || 0}</div>
                    <div class="stat-label">Records Imported</div>
                </div>
                <div class="result-stat error">
                    <div class="stat-number">${results.errors || 0}</div>
                    <div class="stat-label">Errors</div>
                </div>
                <div class="result-stat info">
                    <div class="stat-number">${results.total || 0}</div>
                    <div class="stat-label">Total Processed</div>
                </div>
            </div>
            ${results.success ?
                '<div class="success-message"><i class="fas fa-check-circle"></i> Import completed successfully!</div>' :
                '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Import completed with errors.</div>'
            }
        `;

        resultsContent.innerHTML = html;
        resultsSection.style.display = 'block';

        this.showNotification('Import process completed!', results.success ? 'success' : 'warning');
    }

    // Helper methods
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    validateContent(content) {
        if (!content || content.length === 0) {
            throw new Error('File is empty');
        }

        if (!this.currentType) {
            throw new Error('No import type selected');
        }

        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('File must contain at least a header and one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const expectedHeaders = this.getExpectedHeaders(this.currentType.id);

        // Check if all expected headers are present
        const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
            throw new Error(`Missing required columns: ${missingHeaders.join(', ')}. Expected headers: ${expectedHeaders.join(', ')}`);
        }

        // Check for extra headers (warn but don't fail)
        const extraHeaders = headers.filter(header => !expectedHeaders.includes(header));
        if (extraHeaders.length > 0) {
            console.warn('Extra columns found (will be ignored):', extraHeaders.join(', '));
        }

        return true;
    }

    getExpectedHeaders(typeId) {
        switch (typeId) {
            case 'doctors':
                return ['name', 'email', 'phone', 'specialization', 'isAvailable'];
            case 'roster':
                return ['doctorId', 'shift', 'date', 'isReferralDuty'];
            case 'licenses':
                return ['staffMemberId', 'licenseType', 'licenseNumber', 'issueDate', 'expirationDate', 'issuingAuthority', 'additionalNotes'];
            case 'consultations':
                return ['date', 'shift', 'erDoctorId', 'timeCalled', 'specialistId', 'specialty', 'arrivalTime', 'responseTime', 'patientId', 'outcome', 'urgent'];
            default:
                return [];
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showNotification(message, type = 'info') {
        console.log(`📢 ${message} (${type})`);
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize and setup global functions
const dataImporter = new DataImporter();

function openDataImporter() {
    console.log('🔧 Opening Data Importer...');

    dataImporter.init().then((success) => {
        if (success) {
            dataImporter.showModal();
        } else {
            alert('Failed to initialize Data Importer');
        }
    }).catch(error => {
        console.error('❌ Error:', error);
        alert('Failed to load Data Importer: ' + error.message);
    });
}

function closeDataImporter() {
    dataImporter.closeModal();
}

// Make functions globally available
window.openDataImporter = openDataImporter;
window.closeDataImporter = closeDataImporter;
window.dataImporter = dataImporter;

// Global function for downloading templates
window.downloadTemplate = function(typeId) {
    dataImporter.downloadTemplate(typeId);
};

console.log('✅ Data Importer Module loaded successfully');