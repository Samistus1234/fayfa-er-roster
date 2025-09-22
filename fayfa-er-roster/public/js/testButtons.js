// Simple button test - verify all buttons work
(function() {
    'use strict';
    
    console.log('🧪 Button Test: Starting verification...');
    
    function testAllButtons() {
        console.log('🧪 Testing all button functions...');
        
        const functionsToTest = [
            'showMainDashboard',
            'loadRosterData', 
            'showAddDoctorModal',
            'showAddRosterModal',
            'showWorkloadAnalysis',
            'showFairnessMetrics',
            'showConsultationLog',
            'showReferralStats',
            'showReferralEntry',
            'showSaudiCrescent',
            'showLicenseManager',
            'showDutyAnalytics',
            'showERStatistics',
            'showLeaveManagement',
            'showSwapRequests',
            'showReports',
            'showImportRoster',
            'showExportMenu'
        ];
        
        let workingCount = 0;
        let totalCount = functionsToTest.length;
        
        functionsToTest.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                console.log(`✅ ${funcName} - Available`);
                workingCount++;
            } else {
                console.log(`❌ ${funcName} - Missing`);
            }
        });
        
        console.log(`🧪 Function Test Result: ${workingCount}/${totalCount} functions available`);
        
        // Test actual button elements
        console.log('🧪 Testing button elements...');
        
        const buttonSelectors = [
            '.action-card[onclick*="showAddDoctorModal"]',
            '.action-card[onclick*="showAddRosterModal"]', 
            '.action-card[onclick*="showWorkloadAnalysis"]',
            '.action-card[onclick*="showFairnessMetrics"]',
            '.action-card[onclick*="showConsultationLog"]',
            '.action-card[onclick*="showReferralStats"]'
        ];
        
        let buttonCount = 0;
        buttonSelectors.forEach(selector => {
            const button = document.querySelector(selector);
            if (button) {
                console.log(`✅ Button found: ${selector}`);
                console.log(`  onclick: ${button.getAttribute('onclick')}`);
                console.log(`  disabled: ${button.disabled}`);
                console.log(`  pointerEvents: ${window.getComputedStyle(button).pointerEvents}`);
                buttonCount++;
            } else {
                console.log(`❌ Button not found: ${selector}`);
            }
        });
        
        console.log(`🧪 Button Element Test: ${buttonCount}/${buttonSelectors.length} buttons found`);
        
        // Overall result
        const allFunctionsWork = workingCount === totalCount;
        const allButtonsFound = buttonCount === buttonSelectors.length;
        
        if (allFunctionsWork && allButtonsFound) {
            console.log('🎉 ALL TESTS PASSED! Buttons should be working.');
            showTestResult('🎉 All Tests Passed!', 'success');
        } else {
            console.log('⚠️ Some tests failed. Check console for details.');
            showTestResult('⚠️ Some Tests Failed', 'warning');
        }
        
        return { allFunctionsWork, allButtonsFound, workingCount, totalCount, buttonCount };
    }
    
    function showTestResult(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#f59e0b'};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            z-index: 99999;
            font-family: Inter, sans-serif;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInUp 0.3s ease;
        `;
        notification.innerHTML = message;
        
        // Add animation
        if (!document.getElementById('testButtonStyles')) {
            const style = document.createElement('style');
            style.id = 'testButtonStyles';
            style.textContent = `
                @keyframes slideInUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateY(100%)';
            notification.style.opacity = '0';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    // Manual test function
    window.testButtonClick = function(buttonText) {
        console.log(`🧪 Manual test: ${buttonText}`);
        
        const buttons = Array.from(document.querySelectorAll('.action-card'));
        const button = buttons.find(btn => btn.textContent.trim().toLowerCase().includes(buttonText.toLowerCase()));
        
        if (button) {
            console.log(`Found button: ${button.textContent.trim()}`);
            const onclick = button.getAttribute('onclick');
            
            if (onclick) {
                console.log(`Executing: ${onclick}`);
                try {
                    eval(onclick);
                    console.log(`✅ Success: ${onclick}`);
                    showTestResult(`✅ ${buttonText} works!`, 'success');
                    return true;
                } catch (error) {
                    console.error(`❌ Error: ${error.message}`);
                    showTestResult(`❌ ${buttonText} failed`, 'warning');
                    return false;
                }
            } else {
                console.log('❌ No onclick attribute');
                return false;
            }
        } else {
            console.log(`❌ Button not found: ${buttonText}`);
            return false;
        }
    };
    
    // Auto-run test after page loads
    function runTest() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(testAllButtons, 2000);
            });
        } else {
            setTimeout(testAllButtons, 2000);
        }
    }
    
    // Expose test function
    window.testAllButtons = testAllButtons;
    
    // Run test
    runTest();
    
    console.log('🧪 Button Test loaded. Use testButtonClick("Button Name") to test individual buttons.');
})();
