// Unified PDF Export Service for Fayfa ER Roster Management System
// Handles all PDF exports with fallback mechanisms and consistent styling

console.log('🔧 Loading Unified PDF Service...');

class UnifiedPDFService {
    constructor() {
        this.isInitialized = false;
        this.librariesReady = false;
        this.fallbackLibrariesReady = false;
        this.isDarkMode = false;
        this.progressCallback = null;
        this.retryAttempts = 3;
        this.loadingPromise = null;

        console.log('✅ Unified PDF Service constructor completed');
        this.initializeAsync();
    }

    // Initialize service asynchronously
    async initializeAsync() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this._doInitialize();
        return this.loadingPromise;
    }

    async _doInitialize() {
        try {
            console.log('🔧 Initializing Unified PDF Service...');

            // Detect dark mode
            this.detectDarkMode();

            // Check if libraries are already available
            await this.checkLibraryAvailability();

            // Load libraries if needed
            if (!this.librariesReady) {
                await this.loadPDFLibraries();
            }

            this.isInitialized = true;
            console.log('✅ Unified PDF Service initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize PDF Service:', error);
            return false;
        }
    }

    // Check if PDF libraries are available
    async checkLibraryAvailability() {
        this.librariesReady = (
            typeof window.jsPDF !== 'undefined' &&
            typeof window.jsPDF.jsPDF !== 'undefined'
        );

        this.fallbackLibrariesReady = (
            typeof window.html2canvas !== 'undefined'
        );

        console.log(`📋 Library Status: jsPDF=${this.librariesReady}, html2canvas=${this.fallbackLibrariesReady}`);

        return this.librariesReady;
    }

    // Load PDF libraries with fallback
    async loadPDFLibraries() {
        console.log('📚 Loading PDF libraries...');

        try {
            // Primary: Try to load libraries if they exist in the project
            await this.loadLibraryIfExists('jspdf', () => window.jsPDF);
            await this.loadLibraryIfExists('html2canvas', () => window.html2canvas);

            // Check availability again
            await this.checkLibraryAvailability();

            if (!this.librariesReady) {
                console.warn('⚠️ Primary PDF libraries not available, attempting alternative loading...');
                await this.loadFallbackLibraries();
            }

        } catch (error) {
            console.error('❌ Error loading PDF libraries:', error);
            throw new Error('PDF libraries failed to load. Please refresh the page and try again.');
        }
    }

    // Load library if it exists
    async loadLibraryIfExists(libName, checkFunction) {
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts && !checkFunction()) {
            console.log(`⏳ Waiting for ${libName} to load... (${attempts + 1}/${maxAttempts})`);
            await this.delay(500);
            attempts++;
        }

        if (checkFunction()) {
            console.log(`✅ ${libName} loaded successfully`);
            return true;
        }

        console.warn(`⚠️ ${libName} not available after waiting`);
        return false;
    }

    // Load fallback libraries (CDN)
    async loadFallbackLibraries() {
        console.log('🔄 Loading fallback PDF libraries from CDN...');

        const fallbackLibraries = [
            {
                name: 'jsPDF',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
                check: () => window.jsPDF
            },
            {
                name: 'jsPDF-AutoTable',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
                check: () => window.jsPDF && window.jsPDF.jsPDF && window.jsPDF.jsPDF.prototype.autoTable
            },
            {
                name: 'html2canvas',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
                check: () => window.html2canvas
            }
        ];

        for (const lib of fallbackLibraries) {
            try {
                if (!lib.check()) {
                    console.log(`📥 Loading ${lib.name} from CDN...`);
                    await this.loadScript(lib.url);

                    // Wait for library to be available
                    let attempts = 0;
                    while (attempts < 20 && !lib.check()) {
                        await this.delay(250);
                        attempts++;
                    }

                    if (lib.check()) {
                        console.log(`✅ ${lib.name} loaded from CDN successfully`);
                    } else {
                        console.warn(`⚠️ ${lib.name} failed to load from CDN`);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Failed to load ${lib.name}:`, error);
            }
        }

        // Final check
        await this.checkLibraryAvailability();
    }

    // Load script dynamically
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Detect dark mode
    detectDarkMode() {
        // Check multiple sources for dark mode
        this.isDarkMode = document.body.classList.contains('dark-mode') ||
                         document.documentElement.classList.contains('dark-mode') ||
                         document.body.classList.contains('dark-theme') ||
                         document.documentElement.classList.contains('dark-theme') ||
                         document.documentElement.getAttribute('data-theme') === 'dark' ||
                         window.matchMedia('(prefers-color-scheme: dark)').matches ||
                         localStorage.getItem('theme') === 'dark' ||
                         localStorage.getItem('darkMode') === 'true';

        // Also check CSS custom properties for theme indication
        try {
            const computedStyle = getComputedStyle(document.documentElement);
            const backgroundColorProperty = computedStyle.getPropertyValue('--background-color') ||
                                           computedStyle.getPropertyValue('--bg-color') ||
                                           computedStyle.getPropertyValue('--body-bg');
            if (backgroundColorProperty) {
                // If background color is dark, assume dark mode
                const bgColor = backgroundColorProperty.trim();
                this.isDarkMode = this.isDarkMode || this.isColorDark(bgColor);
            }
        } catch (error) {
            console.debug('Could not read CSS custom properties for theme detection');
        }

        console.log(`🎨 Theme detected: ${this.isDarkMode ? 'Dark' : 'Light'} mode`);
    }

    // Helper to determine if a color is dark
    isColorDark(color) {
        // Convert color to RGB and calculate luminance
        const rgb = this.parseColor(color);
        if (!rgb) return false;

        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
        return luminance < 128;
    }

    // Parse color string to RGB
    parseColor(color) {
        if (!color) return null;

        // Handle hex colors
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            if (hex.length === 3) {
                // Short hex format (e.g., #f0f)
                const r = parseInt(hex[0] + hex[0], 16);
                const g = parseInt(hex[1] + hex[1], 16);
                const b = parseInt(hex[2] + hex[2], 16);
                return { r, g, b };
            } else if (hex.length === 6) {
                // Full hex format (e.g., #ff00ff)
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                return { r, g, b };
            }
        }

        // Handle rgb() colors
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3])
            };
        }

        return null;
    }

    // Set progress callback
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }

    // Update progress
    updateProgress(message, percentage) {
        if (this.progressCallback) {
            this.progressCallback(message, percentage);
        }
        console.log(`📊 Progress: ${message} (${percentage}%)`);
    }

    // Main export function
    async exportToPDF(options = {}) {
        try {
            // Ensure service is initialized
            if (!this.isInitialized) {
                this.updateProgress('Initializing PDF service...', 5);
                await this.initializeAsync();
            }

            // Pre-check libraries
            this.updateProgress('Checking PDF libraries...', 10);
            await this.preCheckLibraries();

            // Validate options
            const validatedOptions = this.validateExportOptions(options);

            this.updateProgress('Preparing PDF generation...', 15);

            // Generate PDF based on type
            const result = await this.generatePDF(validatedOptions);

            this.updateProgress('PDF generated successfully!', 100);

            // Show success notification
            this.showNotification('Your report has been exported successfully!', 'success');

            return result;

        } catch (error) {
            console.error('❌ PDF Export Error:', error);

            // Try fallback generation
            if (this.retryAttempts > 0) {
                console.log('🔄 Attempting fallback PDF generation...');
                this.retryAttempts--;
                this.updateProgress('Retrying with fallback method...', 20);

                try {
                    return await this.generateFallbackPDF(options);
                } catch (fallbackError) {
                    console.error('❌ Fallback PDF generation also failed:', fallbackError);
                }
            }

            this.updateProgress('PDF generation failed', 0);
            this.showNotification('PDF export failed. Please try refreshing the page.', 'error');
            throw error;
        }
    }

    // Pre-check libraries and reload if necessary
    async preCheckLibraries() {
        await this.checkLibraryAvailability();

        if (!this.librariesReady) {
            console.log('🔄 PDF libraries not ready, attempting reload...');
            await this.loadPDFLibraries();

            if (!this.librariesReady) {
                throw new Error('PDF generation library is not available. Please refresh the page and try again.');
            }
        }
    }

    // Validate export options
    validateExportOptions(options) {
        const defaults = {
            type: 'generic',
            title: 'Fayfa ER Report',
            subtitle: `Generated on ${new Date().toLocaleDateString()}`,
            orientation: 'portrait',
            format: 'a4',
            filename: `fayfa-report-${new Date().toISOString().split('T')[0]}.pdf`,
            data: null,
            element: null,
            includeHeader: true,
            includeFooter: true,
            theme: this.isDarkMode ? 'dark' : 'light'
        };

        return { ...defaults, ...options };
    }

    // Generate PDF
    async generatePDF(options) {
        const { jsPDF } = window.jsPDF;

        // Create PDF with proper orientation and format
        const doc = new jsPDF({
            orientation: options.orientation,
            unit: 'mm',
            format: options.format
        });

        this.updateProgress('Generating PDF content...', 30);

        // Apply theme-specific styling
        this.applyThemeStyles(doc, options.theme);

        // Add header if requested
        if (options.includeHeader) {
            this.addHeader(doc, options);
        }

        this.updateProgress('Adding content to PDF...', 50);

        // Generate content based on type
        switch (options.type) {
            case 'roster':
                await this.generateRosterPDF(doc, options);
                break;
            case 'analytics':
                await this.generateAnalyticsPDF(doc, options);
                break;
            case 'consultation':
                await this.generateConsultationPDF(doc, options);
                break;
            case 'licenses':
                await this.generateLicensesPDF(doc, options);
                break;
            case 'dashboard':
                await this.generateDashboardPDF(doc, options);
                break;
            case 'calendar':
                await this.generateCalendarPDF(doc, options);
                break;
            case 'comprehensive':
                await this.generateComprehensivePDF(doc, options);
                break;
            default:
                await this.generateGenericPDF(doc, options);
                break;
        }

        this.updateProgress('Finalizing PDF...', 80);

        // Add footer if requested
        if (options.includeFooter) {
            this.addFooter(doc, options);
        }

        this.updateProgress('Saving PDF file...', 90);

        // Save the PDF
        doc.save(options.filename);

        return {
            success: true,
            filename: options.filename,
            size: doc.internal.pageSize.width + 'x' + doc.internal.pageSize.height,
            pages: doc.internal.getNumberOfPages()
        };
    }

    // Apply theme-specific styles
    applyThemeStyles(doc, theme) {
        if (theme === 'dark') {
            // Dark theme colors - professional and easy to read
            this.colors = {
                primary: '#ffffff',          // White text
                secondary: '#d1d5db',        // Light gray for secondary text
                accent: '#60a5fa',           // Bright blue for accents
                accentSecondary: '#34d399',  // Green for success/positive
                warning: '#fbbf24',          // Amber for warnings
                danger: '#f87171',           // Red for errors/danger
                background: '#1f2937',       // Dark gray background
                headerBg: '#111827',         // Very dark gray for headers
                footerBg: '#374151',         // Medium dark gray for footers
                tableBg: '#374151',          // Table background
                tableAlt: '#4b5563',         // Alternating row color
                tableHeader: '#1f2937',      // Table header background
                border: '#6b7280',           // Border color
                divider: '#4b5563'           // Divider lines
            };
        } else {
            // Light theme colors - clean and professional
            this.colors = {
                primary: '#111827',          // Very dark gray text
                secondary: '#6b7280',        // Medium gray for secondary text
                accent: '#2563eb',           // Professional blue for accents
                accentSecondary: '#059669',  // Green for success/positive
                warning: '#d97706',          // Orange for warnings
                danger: '#dc2626',           // Red for errors/danger
                background: '#ffffff',       // White background
                headerBg: '#f8fafc',         // Very light blue-gray for headers
                footerBg: '#f1f5f9',         // Light blue-gray for footers
                tableBg: '#ffffff',          // White table background
                tableAlt: '#f8fafc',         // Very light alternating rows
                tableHeader: '#e2e8f0',      // Light gray for table headers
                border: '#d1d5db',           // Light border color
                divider: '#e5e7eb'           // Light divider lines
            };
        }

        // Set document background color
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Only apply background for dark theme, light theme stays white
        if (theme === 'dark') {
            doc.setFillColor(this.getColorRGB(this.colors.background));
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
        }

        console.log(`🎨 Applied ${theme} theme styling to PDF`);
    }

    // Add header to PDF
    addHeader(doc, options) {
        const pageWidth = doc.internal.pageSize.width;

        // Header background with subtle gradient effect
        doc.setFillColor(this.getColorRGB(this.colors.headerBg));
        doc.rect(0, 0, pageWidth, 35, 'F');

        // Optional divider line
        doc.setDrawColor(this.getColorRGB(this.colors.divider));
        doc.setLineWidth(0.5);
        doc.line(0, 35, pageWidth, 35);

        // Hospital name with icon area
        doc.setTextColor(this.getColorRGB(this.colors.primary));
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('🏥 Fayfa General Hospital', 20, 15);

        // Department subtitle
        doc.setFontSize(12);
        doc.setTextColor(this.getColorRGB(this.colors.secondary));
        doc.text('Emergency Room Management System', 20, 24);

        // Title on the right side
        const titleWidth = doc.getTextWidth(options.title);
        doc.setTextColor(this.getColorRGB(this.colors.accent));
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(options.title, pageWidth - titleWidth - 20, 15);

        // Subtitle/date on the right side
        if (options.subtitle) {
            const subtitleWidth = doc.getTextWidth(options.subtitle);
            doc.setFontSize(10);
            doc.setTextColor(this.getColorRGB(this.colors.secondary));
            doc.setFont(undefined, 'normal');
            doc.text(options.subtitle, pageWidth - subtitleWidth - 20, 24);
        }

        // Generation timestamp (small)
        const timestamp = `Generated: ${new Date().toLocaleString()}`;
        const timestampWidth = doc.getTextWidth(timestamp);
        doc.setFontSize(8);
        doc.setTextColor(this.getColorRGB(this.colors.secondary));
        doc.text(timestamp, pageWidth - timestampWidth - 20, 32);

        // Logo placeholder (if logo element exists)
        const logoElement = document.querySelector('.hospital-logo, .logo');
        if (logoElement) {
            doc.setFontSize(10);
            doc.text('ER Roster Management System', pageWidth - 20, 15, { align: 'right' });
        }
    }

    // Add footer to PDF
    addFooter(doc, options) {
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const footerY = pageHeight - 15;

        // Footer background (subtle)
        doc.setFillColor(this.getColorRGB(this.colors.footerBg));
        doc.rect(0, footerY - 8, pageWidth, 15, 'F');

        // Footer divider line
        doc.setDrawColor(this.getColorRGB(this.colors.divider));
        doc.setLineWidth(0.3);
        doc.line(0, footerY - 8, pageWidth, footerY - 8);

        // Footer text styling
        doc.setTextColor(this.getColorRGB(this.colors.secondary));
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');

        // Left side - system info
        doc.text('Fayfa ER Management System', 20, footerY - 2);

        // Center - confidentiality notice
        const confidentialText = 'CONFIDENTIAL - For Internal Use Only';
        const confidentialWidth = doc.getTextWidth(confidentialText);
        doc.text(confidentialText, (pageWidth - confidentialWidth) / 2, footerY - 2);

        // Right side - page number and timestamp
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageText = `Page ${i} of ${pageCount}`;
            const pageTextWidth = doc.getTextWidth(pageText);
            doc.text(pageText, pageWidth - pageTextWidth - 20, footerY - 2);
        }

        // Bottom line with timestamp
        const timestamp = `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        const timestampWidth = doc.getTextWidth(timestamp);
        doc.setFontSize(7);
        doc.text(timestamp, (pageWidth - timestampWidth) / 2, footerY + 4);
    }

    // Get consistent table styling based on theme
    getTableStyles() {
        return {
            theme: 'grid',
            headStyles: {
                fillColor: this.getColorRGB(this.colors.tableHeader),
                textColor: this.getColorRGB(this.colors.primary),
                fontStyle: 'bold',
                fontSize: 10,
                halign: 'center',
                valign: 'middle'
            },
            alternateRowStyles: {
                fillColor: this.getColorRGB(this.colors.tableAlt)
            },
            styles: {
                textColor: this.getColorRGB(this.colors.primary),
                fontSize: 9,
                cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
                lineColor: this.getColorRGB(this.colors.border),
                lineWidth: 0.1,
                halign: 'left',
                valign: 'middle'
            },
            bodyStyles: {
                fillColor: this.getColorRGB(this.colors.tableBg)
            },
            columnStyles: {
                // Default column styling - can be overridden per table
            },
            margin: { top: 45, left: 20, right: 20, bottom: 25 },
            pageBreak: 'auto',
            showHead: 'everyPage'
        };
    }

    // Generate Roster PDF
    async generateRosterPDF(doc, options) {
        this.updateProgress('Processing roster data...', 40);

        const data = options.data || await this.fetchRosterData(options);

        if (!data || data.length === 0) {
            doc.setTextColor(this.getColorRGB(this.colors.secondary));
            doc.text('No roster data available for the selected period.', 20, 70);
            return;
        }

        // Create roster table
        const tableHeaders = ['Date', 'Doctor', 'Shift', 'Type', 'Referral Duty'];
        const tableData = data.map(entry => [
            new Date(entry.date).toLocaleDateString(),
            entry.doctorName || `Doctor ${entry.doctorId}`,
            entry.shift.charAt(0).toUpperCase() + entry.shift.slice(1),
            entry.isReferralDuty ? 'Referral' : 'Regular',
            entry.isReferralDuty ? 'Yes' : 'No'
        ]);

        // Apply consistent table styling
        const tableStyles = this.getTableStyles();
        doc.autoTable({
            head: [tableHeaders],
            body: tableData,
            startY: 50,
            ...tableStyles,
            columnStyles: {
                0: { cellWidth: 30 }, // Date
                1: { cellWidth: 40 }, // Doctor
                2: { cellWidth: 25 }, // Shift
                3: { cellWidth: 25 }, // Type
                4: { cellWidth: 30 }  // Referral Duty
            }
        });
    }

    // Generate Analytics PDF
    async generateAnalyticsPDF(doc, options) {
        this.updateProgress('Processing analytics data...', 40);

        const data = options.data || await this.fetchAnalyticsData(options);

        if (!data) {
            doc.setTextColor(this.getColorRGB(this.colors.secondary));
            doc.text('No analytics data available.', 20, 70);
            return;
        }

        // Summary statistics
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(this.getColorRGB(this.colors.primary));
        doc.text('Analytics Summary', 20, 65);

        let yPos = 75;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');

        if (data.summary) {
            Object.entries(data.summary).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, 25, yPos);
                yPos += 8;
            });
        }

        // Doctor analytics table
        if (data.doctors) {
            const tableHeaders = ['Doctor', 'Morning', 'Evening', 'Night', 'Referral', 'Total'];
            const tableData = Object.values(data.doctors).map(doctor => [
                doctor.name,
                doctor.counts?.morning || 0,
                doctor.counts?.evening || 0,
                doctor.counts?.night || 0,
                doctor.counts?.referral || 0,
                doctor.total || 0
            ]);

            doc.autoTable({
                head: [tableHeaders],
                body: tableData,
                startY: yPos + 10,
                theme: 'grid',
                headStyles: {
                    fillColor: this.getColorRGB(this.colors.accent),
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: this.getColorRGB(this.colors.tableAlt)
                },
                styles: {
                    textColor: this.getColorRGB(this.colors.primary),
                    fontSize: 9
                }
            });
        }
    }

    // Generate Consultation PDF
    async generateConsultationPDF(doc, options) {
        this.updateProgress('Processing consultation data...', 40);

        const data = options.data || await this.fetchConsultationData(options);

        if (!data || data.length === 0) {
            doc.setTextColor(this.getColorRGB(this.colors.secondary));
            doc.text('No consultation logs available.', 20, 70);
            return;
        }

        const tableHeaders = ['Date', 'Shift', 'ER Doctor', 'Specialist', 'Specialty', 'Patient ID', 'Outcome', 'Urgent'];
        const tableData = data.map(log => [
            log.date,
            log.shift,
            log.erDoctorId,
            log.specialistId,
            log.specialty,
            log.patientId,
            log.outcome,
            log.urgent ? 'Yes' : 'No'
        ]);

        doc.autoTable({
            head: [tableHeaders],
            body: tableData,
            startY: 55,
            theme: 'grid',
            headStyles: {
                fillColor: this.getColorRGB(this.colors.accent),
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: this.getColorRGB(this.colors.tableAlt)
            },
            styles: {
                textColor: this.getColorRGB(this.colors.primary),
                fontSize: 8
            },
            columnStyles: {
                0: { cellWidth: 20 },
                4: { cellWidth: 25 },
                5: { cellWidth: 20 }
            }
        });
    }

    // Generate Licenses PDF
    async generateLicensesPDF(doc, options) {
        this.updateProgress('Processing license data...', 40);

        const data = options.data || await this.fetchLicenseData(options);

        if (!data || data.length === 0) {
            doc.setTextColor(this.getColorRGB(this.colors.secondary));
            doc.text('No medical license data available.', 20, 70);
            return;
        }

        const tableHeaders = ['Staff ID', 'License Type', 'License Number', 'Issue Date', 'Expiration', 'Status', 'Authority'];
        const tableData = data.map(license => [
            license.staffMemberId,
            license.licenseType,
            license.licenseNumber,
            license.issueDate,
            license.expirationDate,
            license.status || 'Active',
            license.issuingAuthority
        ]);

        doc.autoTable({
            head: [tableHeaders],
            body: tableData,
            startY: 55,
            theme: 'grid',
            headStyles: {
                fillColor: this.getColorRGB(this.colors.accent),
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: this.getColorRGB(this.colors.tableAlt)
            },
            styles: {
                textColor: this.getColorRGB(this.colors.primary),
                fontSize: 8
            },
            columnStyles: {
                2: { cellWidth: 25 },
                6: { cellWidth: 30 }
            }
        });
    }

    // Generate Dashboard PDF
    async generateDashboardPDF(doc, options) {
        this.updateProgress('Capturing dashboard elements...', 40);

        // Try to capture dashboard visually if html2canvas is available
        if (this.fallbackLibrariesReady && options.element) {
            try {
                const canvas = await window.html2canvas(options.element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: this.colors.background
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 170; // Fit within page margins
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                doc.addImage(imgData, 'PNG', 20, 55, imgWidth, imgHeight);

            } catch (error) {
                console.warn('Visual capture failed, using text-based dashboard:', error);
                await this.generateTextBasedDashboard(doc, options);
            }
        } else {
            await this.generateTextBasedDashboard(doc, options);
        }
    }

    // Generate text-based dashboard fallback
    async generateTextBasedDashboard(doc, options) {
        const data = options.data || await this.fetchDashboardData(options);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(this.getColorRGB(this.colors.primary));
        doc.text('Dashboard Overview', 20, 65);

        let yPos = 80;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');

        if (data && data.statistics) {
            Object.entries(data.statistics).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, 25, yPos);
                yPos += 10;
            });
        } else {
            doc.text('Dashboard data not available in text format.', 25, yPos);
            doc.text('Please use the visual export feature for full dashboard capture.', 25, yPos + 10);
        }
    }

    // Generate Calendar PDF
    async generateCalendarPDF(doc, options) {
        this.updateProgress('Processing calendar data...', 40);

        // Try visual capture first
        const calendarElement = options.element || document.querySelector('.calendar-container, .calendar-view');

        if (this.fallbackLibrariesReady && calendarElement) {
            try {
                const canvas = await window.html2canvas(calendarElement, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: this.colors.background
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 170;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                doc.addImage(imgData, 'PNG', 20, 55, imgWidth, Math.min(imgHeight, 180));

                return;
            } catch (error) {
                console.warn('Calendar visual capture failed:', error);
            }
        }

        // Fallback to text-based calendar
        await this.generateTextBasedCalendar(doc, options);
    }

    // Generate text-based calendar
    async generateTextBasedCalendar(doc, options) {
        const data = options.data || await this.fetchCalendarData(options);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(this.getColorRGB(this.colors.primary));
        doc.text('Calendar Overview', 20, 65);

        if (!data || data.length === 0) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text('No calendar data available for the selected period.', 20, 80);
            return;
        }

        // Group by date
        const groupedData = {};
        data.forEach(entry => {
            const date = new Date(entry.date).toLocaleDateString();
            if (!groupedData[date]) groupedData[date] = [];
            groupedData[date].push(entry);
        });

        let yPos = 80;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        Object.entries(groupedData).forEach(([date, entries]) => {
            if (yPos > 250) { // Page break
                doc.addPage();
                yPos = 30;
            }

            doc.setFont(undefined, 'bold');
            doc.text(date, 20, yPos);
            yPos += 6;

            doc.setFont(undefined, 'normal');
            entries.forEach(entry => {
                const shiftText = `${entry.shift}: ${entry.doctorName || `Doctor ${entry.doctorId}`}${entry.isReferralDuty ? ' (R)' : ''}`;
                doc.text(shiftText, 25, yPos);
                yPos += 4;
            });

            yPos += 4;
        });
    }

    // Generate Comprehensive PDF
    async generateComprehensivePDF(doc, options) {
        this.updateProgress('Generating comprehensive report...', 40);

        // Add multiple sections
        await this.generateRosterPDF(doc, { ...options, title: 'Roster Section' });

        doc.addPage();
        await this.generateAnalyticsPDF(doc, { ...options, title: 'Analytics Section' });

        if (options.includeConsultations) {
            doc.addPage();
            await this.generateConsultationPDF(doc, { ...options, title: 'Consultation Logs' });
        }

        if (options.includeLicenses) {
            doc.addPage();
            await this.generateLicensesPDF(doc, { ...options, title: 'Medical Licenses' });
        }
    }

    // Generate generic PDF
    async generateGenericPDF(doc, options) {
        if (options.data) {
            doc.setFontSize(12);
            doc.setTextColor(this.getColorRGB(this.colors.primary));

            if (Array.isArray(options.data)) {
                // Table data
                const headers = Object.keys(options.data[0] || {});
                const rows = options.data.map(item => headers.map(header => item[header] || ''));

                doc.autoTable({
                    head: [headers],
                    body: rows,
                    startY: 55,
                    theme: 'grid',
                    headStyles: {
                        fillColor: this.getColorRGB(this.colors.accent),
                        textColor: [255, 255, 255]
                    },
                    alternateRowStyles: {
                        fillColor: this.getColorRGB(this.colors.tableAlt)
                    },
                    styles: {
                        textColor: this.getColorRGB(this.colors.primary),
                        fontSize: 9
                    }
                });
            } else {
                // Text data
                const text = typeof options.data === 'string' ? options.data : JSON.stringify(options.data, null, 2);
                const lines = doc.splitTextToSize(text, 170);
                doc.text(lines, 20, 70);
            }
        } else {
            doc.text('No data provided for export.', 20, 70);
        }
    }

    // Generate fallback PDF (simplified version)
    async generateFallbackPDF(options) {
        console.log('🔄 Generating fallback PDF...');

        // Simple text-based PDF as last resort
        if (typeof window.jsPDF === 'undefined') {
            throw new Error('No PDF generation capability available');
        }

        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();

        // Basic header
        doc.setFontSize(16);
        doc.text('Fayfa ER Report (Fallback)', 20, 20);

        doc.setFontSize(12);
        doc.text('Generated: ' + new Date().toLocaleString(), 20, 35);

        doc.setFontSize(10);
        doc.text('This is a simplified report due to technical limitations.', 20, 50);
        doc.text('Please refresh the page for full export functionality.', 20, 60);

        if (options.data && typeof options.data === 'string') {
            const lines = doc.splitTextToSize(options.data, 170);
            doc.text(lines, 20, 75);
        }

        doc.save(options.filename || 'fayfa-report-fallback.pdf');

        return {
            success: true,
            filename: options.filename || 'fayfa-report-fallback.pdf',
            fallback: true
        };
    }

    // Data fetching methods
    async fetchRosterData(options) {
        try {
            const url = options.year && options.month
                ? `/api/roster/${options.year}/${options.month}`
                : '/api/roster/current';
            const response = await fetch(url);
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.warn('Failed to fetch roster data:', error);
            return null;
        }
    }

    async fetchAnalyticsData(options) {
        try {
            const url = options.year && options.month
                ? `/api/analytics/${options.year}/${options.month}`
                : '/api/analytics/current';
            const response = await fetch(url);
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.warn('Failed to fetch analytics data:', error);
            return null;
        }
    }

    async fetchConsultationData(options) {
        try {
            const response = await fetch('/api/consultation-logs');
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.warn('Failed to fetch consultation data:', error);
            return null;
        }
    }

    async fetchLicenseData(options) {
        try {
            const response = await fetch('/api/medical-licenses');
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.warn('Failed to fetch license data:', error);
            return null;
        }
    }

    async fetchDashboardData(options) {
        try {
            const response = await fetch('/api/dashboard/statistics');
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.warn('Failed to fetch dashboard data:', error);
            return null;
        }
    }

    async fetchCalendarData(options) {
        try {
            const url = options.year && options.month
                ? `/api/roster/${options.year}/${options.month}`
                : '/api/roster/current';
            const response = await fetch(url);
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.warn('Failed to fetch calendar data:', error);
            return null;
        }
    }

    // Utility methods
    getColorRGB(hexColor) {
        if (Array.isArray(hexColor)) return hexColor;

        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return [r, g, b];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showNotification(message, type = 'info') {
        console.log(`📢 ${message} (${type})`);

        // Try different notification systems
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else if (typeof showAlert === 'function') {
            showAlert(message, type);
        } else if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `pdf-notification ${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-size: 14px;
                font-weight: 500;
                max-width: 400px;
                word-wrap: break-word;
            `;
            notification.textContent = message;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        }
    }
}

// Create global instance
window.unifiedPDFService = new UnifiedPDFService();

// Global convenience functions for different report types
window.exportRosterToPDF = (options = {}) => {
    return window.unifiedPDFService.exportToPDF({ ...options, type: 'roster' });
};

window.exportAnalyticsToPDF = (options = {}) => {
    return window.unifiedPDFService.exportToPDF({ ...options, type: 'analytics' });
};

window.exportConsultationToPDF = (options = {}) => {
    return window.unifiedPDFService.exportToPDF({ ...options, type: 'consultation' });
};

window.exportLicensesToPDF = (options = {}) => {
    return window.unifiedPDFService.exportToPDF({ ...options, type: 'licenses' });
};

window.exportDashboardToPDF = (options = {}) => {
    return window.unifiedPDFService.exportToPDF({ ...options, type: 'dashboard' });
};

window.exportCalendarToPDF = (options = {}) => {
    return window.unifiedPDFService.exportToPDF({ ...options, type: 'calendar' });
};

window.exportComprehensiveToPDF = (options = {}) => {
    return window.unifiedPDFService.exportToPDF({ ...options, type: 'comprehensive' });
};

console.log('✅ Unified PDF Service loaded successfully');