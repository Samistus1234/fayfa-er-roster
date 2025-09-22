// ULTIMATE BUTTON FIX - Definitive solution for all button issues
(function() {
    'use strict';
    
    console.log('🚀 ULTIMATE BUTTON FIX: Starting comprehensive solution...');
    
    // Global flag to prevent multiple initializations
    if (window.ultimateButtonFixApplied) {
        console.log('Ultimate Button Fix already applied, skipping...');
        return;
    }
    
    // Configuration
    const CONFIG = {
        DEBUG: true,
        VISUAL_FEEDBACK: true,
        FORCE_OVERRIDE: true
    };
    
    // Store original functions to prevent conflicts
    const originalFunctions = {};
    
    // Core button functions - definitive implementations
    const BUTTON_FUNCTIONS = {
        showMainDashboard: function() {
            log('📊 Dashboard');
            hideAllSections();
            showElement('mainDashboard');
        },
        
        loadRosterData: function() {
            log('📊 Load Roster');
            BUTTON_FUNCTIONS.showMainDashboard();
            safeCall('loadAnalytics');
        },
        
        showAddDoctorModal: function() {
            log('👨‍⚕️ Add Doctor');
            showBootstrapModal('addDoctorModal');
        },
        
        showAddRosterModal: function() {
            log('📝 New Entry');
            showBootstrapModal('addRosterModal');
        },
        
        showWorkloadAnalysis: function() {
            log('⚖️ Workload');
            hideAllSections();
            showElement('workloadSection');
            safeCall('loadWorkload');
        },
        
        showFairnessMetrics: function() {
            log('⚖️ Fairness');
            hideAllSections();
            showElement('fairnessSection');
            safeCall('loadFairness');
        },
        
        showConsultationLog: function() {
            log('💬 Consults');
            hideAllSections();
            showElement('consultationLogSection');
            safeCall('loadConsults');
        },
        
        showReferralStats: function() {
            log('🔄 Referrals');
            hideAllSections();
            showElement('referralStatsSection');
            safeCall('loadReferrals');
        },
        
        showReferralEntry: function() {
            log('📝 Log Referral');
            hideAllSections();
            showElement('referralEntrySection');
            safeCall('showReferralEntryForm');
        },
        
        showSaudiCrescent: function() {
            log('🗓️ Saudi Crescent');
            hideAllSections();
            showElement('saudiCrescentSection');
            safeCall('loadSaudiCrescent');
        },
        
        showLicenseManager: function() {
            log('📋 Licenses');
            hideAllSections();
            showElement('licenseSection');
            safeCall('loadLicenses');
        },
        
        showDutyAnalytics: function() {
            log('📊 Duty Analytics');
            hideAllSections();
            showElement('dutyAnalyticsSection');
            safeCall('loadDutyAnalytics');
        },
        
        showERStatistics: function() {
            log('📊 ER Statistics');
            hideAllSections();
            showElement('erStatisticsSection');
            safeCall('loadERStatistics');
        },
        
        showLeaveManagement: function() {
            log('🏖️ Leave Management');
            hideAllSections();
            showElement('leaveManagementSection');
            safeCall('loadLeaveManagement');
        },
        
        showSwapRequests: function() {
            log('🔄 Swap Requests');
            hideAllSections();
            showElement('swapRequestsSection');
            safeCall('loadSwapRequests');
        },
        
        showReports: function() {
            log('📈 Reports');
            hideAllSections();
            showElement('reportsSection');
            safeCall('loadReportsSection');
        },
        
        showImportRoster: function() {
            log('📥 Import');
            showBootstrapModal('importModal');
        },
        
        showExportMenu: function() {
            log('📤 Export');
            safeCall('exportRosterData') || safeCall('showExportOptions');
        },

        // Additional functions that might be called
        addDoctor: function() {
            log('👨‍⚕️ Add Doctor (form)');
            safeCall('addDoctor');
        },

        addRosterEntry: function() {
            log('📝 Add Roster Entry (form)');
            safeCall('addRosterEntry');
        },

        previewImport: function() {
            log('👁️ Preview Import');
            safeCall('previewImport');
        },

        confirmImport: function() {
            log('✅ Confirm Import');
            safeCall('confirmImport');
        },

        refreshAnalytics: function() {
            log('🔄 Refresh Analytics');
            safeCall('loadRosterData') || BUTTON_FUNCTIONS.loadRosterData();
        },

        exportAnalytics: function(format) {
            log(`📊 Export Analytics (${format})`);
            safeCall('exportAnalytics', format);
        },

        toggleSidebar: function() {
            log('📱 Toggle Sidebar');
            safeCall('toggleSidebar');
        },

        showNotificationCenter: function() {
            log('🔔 Notifications');
            safeCall('showNotificationCenter');
        },

        setLightMode: function() {
            log('☀️ Light Mode');
            safeCall('setLightMode');
        },

        setDarkMode: function() {
            log('🌙 Dark Mode');
            safeCall('setDarkMode');
        },

        showProfileModal: function() {
            log('👤 Profile');
            safeCall('showProfileModal');
        },

        showChangePasswordModal: function() {
            log('🔑 Change Password');
            safeCall('showChangePasswordModal');
        },

        logout: function() {
            log('🚪 Logout');
            safeCall('logout');
        },

        closeCommandPalette: function() {
            log('❌ Close Command Palette');
            const palette = document.getElementById('commandPalette');
            if (palette) {
                palette.classList.remove('active');
            }
        }
    };
    
    // Hide functions
    const HIDE_FUNCTIONS = [
        'hideWorkloadAnalysis', 'hideFairnessMetrics', 'hideConsultationLog',
        'hideReferralStats', 'hideReferralEntry', 'hideSaudiCrescent',
        'hideLicenseManager', 'hideDutyAnalytics', 'hideERStatistics',
        'hideLeaveManagement', 'hideSwapRequests', 'hideReports'
    ];
    
    // Utility functions
    function log(message) {
        if (CONFIG.DEBUG) {
            console.log(`🚀 ${message}`);
        }
    }
    
    function hideAllSections() {
        const sections = document.querySelectorAll('#dynamicSections > section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
    }
    
    function showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
            return true;
        }
        console.warn(`Element '${elementId}' not found`);
        return false;
    }
    
    function showBootstrapModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal && typeof bootstrap !== 'undefined') {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        } else {
            console.warn(`Modal '${modalId}' not found or Bootstrap not available`);
        }
    }
    
    function safeCall(functionName, ...args) {
        if (typeof window[functionName] === 'function') {
            try {
                window[functionName](...args);
                return true;
            } catch (error) {
                console.warn(`Error calling ${functionName}:`, error);
            }
        }
        return false;
    }
    
    function showNotification(message, type = 'success') {
        if (!CONFIG.VISUAL_FEEDBACK) return;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 99999;
            font-family: Inter, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = message;
        
        // Add animation styles
        if (!document.getElementById('ultimateFixStyles')) {
            const style = document.createElement('style');
            style.id = 'ultimateFixStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .ultimate-button-fixed {
                    border: 2px solid #10b981 !important;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Main fix function
    function applyUltimateFix() {
        log('Applying ultimate button fix...');
        
        // 1. Override all global functions
        Object.keys(BUTTON_FUNCTIONS).forEach(funcName => {
            if (window[funcName] && !CONFIG.FORCE_OVERRIDE) {
                originalFunctions[funcName] = window[funcName];
            }
            window[funcName] = BUTTON_FUNCTIONS[funcName];
        });
        
        // 2. Add hide functions
        HIDE_FUNCTIONS.forEach(funcName => {
            window[funcName] = BUTTON_FUNCTIONS.showMainDashboard;
        });
        
        // 3. Fix all buttons with onclick attributes
        fixAllButtons();
        
        // 4. Apply CSS fixes
        applyCSSFixes();
        
        // 5. Set global flag
        window.ultimateButtonFixApplied = true;
        
        showNotification('🚀 Ultimate Button Fix Applied!');
        log('Ultimate fix complete!');
    }
    
    function fixAllButtons() {
        // Find all elements with onclick attributes
        const elementsWithOnclick = document.querySelectorAll('[onclick]');
        let fixedCount = 0;
        
        elementsWithOnclick.forEach(element => {
            const onclick = element.getAttribute('onclick');
            if (onclick) {
                // Remove existing event listeners by cloning
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                
                // Apply ultimate click handler
                const clickHandler = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    // Visual feedback
                    if (CONFIG.VISUAL_FEEDBACK) {
                        newElement.style.transform = 'scale(0.95)';
                        newElement.style.transition = 'transform 0.1s';
                        setTimeout(() => {
                            newElement.style.transform = '';
                        }, 150);
                    }
                    
                    // Execute onclick
                    try {
                        eval(onclick);
                        log(`Executed: ${onclick}`);
                    } catch (error) {
                        console.error(`Error executing ${onclick}:`, error);
                    }
                };
                
                // Add multiple event types
                newElement.addEventListener('click', clickHandler, true);
                newElement.addEventListener('touchstart', clickHandler, true);
                newElement.onclick = clickHandler;
                
                // Mark as fixed
                newElement.classList.add('ultimate-button-fixed');
                fixedCount++;
            }
        });
        
        log(`Fixed ${fixedCount} buttons with onclick attributes`);
    }
    
    function applyCSSFixes() {
        const style = document.createElement('style');
        style.id = 'ultimateButtonFixCSS';
        style.textContent = `
            /* Ultimate Button Fix CSS */
            .action-card, button[onclick], [onclick] {
                pointer-events: auto !important;
                cursor: pointer !important;
                position: relative !important;
                z-index: 100 !important;
                touch-action: manipulation !important;
            }
            
            .action-card *, button[onclick] *, [onclick] * {
                pointer-events: none !important;
            }
            
            .ripple {
                pointer-events: none !important;
            }
            
            .glass-effect {
                pointer-events: auto !important;
            }
        `;
        
        // Remove existing fix styles
        const existingStyles = document.querySelectorAll('#ultimateButtonFixCSS, #clickNotificationStyles, #actionCardFixCSS');
        existingStyles.forEach(style => style.remove());
        
        document.head.appendChild(style);
    }
    
    // Initialize
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyUltimateFix);
        } else {
            setTimeout(applyUltimateFix, 100);
        }
        
        // Also apply on window load as backup
        window.addEventListener('load', () => {
            if (!window.ultimateButtonFixApplied) {
                setTimeout(applyUltimateFix, 500);
            }
        });
    }
    
    // Expose manual trigger
    window.applyUltimateButtonFix = applyUltimateFix;
    
    // Start initialization
    initialize();
    
    log('Ultimate Button Fix loaded and ready');
})();
