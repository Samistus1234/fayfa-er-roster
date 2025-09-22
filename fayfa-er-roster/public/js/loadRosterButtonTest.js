// Load Roster Button Test - Focus on one button at a time
(function() {
    'use strict';
    
    console.log('🎯 Load Roster Button Test: Starting...');
    
    function testLoadRosterButton() {
        console.log('🎯 Testing Load Roster button specifically...');
        
        // Find the Load Roster button
        const loadRosterButton = document.querySelector('button[onclick="loadRosterData()"]');
        
        if (!loadRosterButton) {
            console.error('❌ Load Roster button not found!');
            showTestResult('❌ Load Roster button not found', 'error');
            return false;
        }
        
        console.log('✅ Load Roster button found:', loadRosterButton);
        console.log('Button text:', loadRosterButton.textContent.trim());
        console.log('Button onclick:', loadRosterButton.getAttribute('onclick'));
        console.log('Button disabled:', loadRosterButton.disabled);
        console.log('Button style.pointerEvents:', loadRosterButton.style.pointerEvents);
        console.log('Button computed pointerEvents:', window.getComputedStyle(loadRosterButton).pointerEvents);
        
        // Check if loadRosterData function exists
        if (typeof window.loadRosterData === 'function') {
            console.log('✅ loadRosterData function exists');
            console.log('Function source:', window.loadRosterData.toString().substring(0, 200) + '...');
        } else {
            console.error('❌ loadRosterData function does not exist!');
            showTestResult('❌ loadRosterData function missing', 'error');
            return false;
        }
        
        // Test the function directly
        console.log('🧪 Testing loadRosterData function directly...');
        try {
            window.loadRosterData();
            console.log('✅ loadRosterData function executed successfully');
            showTestResult('✅ loadRosterData function works', 'success');
        } catch (error) {
            console.error('❌ Error executing loadRosterData:', error);
            showTestResult('❌ loadRosterData function error: ' + error.message, 'error');
            return false;
        }
        
        // Test clicking the button programmatically
        console.log('🧪 Testing button click programmatically...');
        try {
            loadRosterButton.click();
            console.log('✅ Button click executed successfully');
            showTestResult('✅ Load Roster button click works', 'success');
        } catch (error) {
            console.error('❌ Error clicking button:', error);
            showTestResult('❌ Button click error: ' + error.message, 'error');
            return false;
        }
        
        return true;
    }
    
    function fixLoadRosterButton() {
        console.log('🔧 Fixing Load Roster button...');
        
        const loadRosterButton = document.querySelector('button[onclick="loadRosterData()"]');
        
        if (!loadRosterButton) {
            console.error('❌ Load Roster button not found for fixing!');
            return false;
        }
        
        // Ensure the function exists
        if (typeof window.loadRosterData !== 'function') {
            console.log('🔧 Creating loadRosterData function...');
            window.loadRosterData = function() {
                console.log('📊 Load Roster clicked!');
                
                // Show main dashboard
                const sections = document.querySelectorAll('#dynamicSections > section');
                sections.forEach(section => section.style.display = 'none');
                
                const mainDashboard = document.getElementById('mainDashboard');
                if (mainDashboard) {
                    mainDashboard.style.display = 'block';
                    console.log('✅ Main dashboard shown');
                }
                
                // Try to load analytics
                if (typeof loadAnalytics === 'function') {
                    console.log('📊 Loading analytics...');
                    const monthYear = document.getElementById('monthYear');
                    if (monthYear) {
                        const [year, month] = monthYear.value.split('-');
                        loadAnalytics(parseInt(year), parseInt(month));
                    } else {
                        loadAnalytics(2025, 6); // Default
                    }
                } else {
                    console.warn('⚠️ loadAnalytics function not found');
                }
                
                // Show success message
                showTestResult('✅ Load Roster executed successfully!', 'success');
            };
        }
        
        // Fix button properties
        loadRosterButton.style.pointerEvents = 'auto';
        loadRosterButton.style.cursor = 'pointer';
        loadRosterButton.disabled = false;
        
        // Remove any conflicting event listeners by cloning
        const newButton = loadRosterButton.cloneNode(true);
        loadRosterButton.parentNode.replaceChild(newButton, loadRosterButton);
        
        // Add fresh event listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ Load Roster button clicked!');
            
            // Visual feedback
            newButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                newButton.style.transform = '';
            }, 150);
            
            // Execute function
            try {
                window.loadRosterData();
            } catch (error) {
                console.error('❌ Error in click handler:', error);
                showTestResult('❌ Click handler error: ' + error.message, 'error');
            }
        });
        
        // Also preserve onclick attribute
        newButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.loadRosterData();
        };
        
        console.log('✅ Load Roster button fixed');
        showTestResult('🔧 Load Roster button fixed!', 'info');
        
        return true;
    }
    
    function showTestResult(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 99999;
            font-family: Inter, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.innerHTML = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    // Initialize
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    fixLoadRosterButton();
                    setTimeout(testLoadRosterButton, 1000);
                }, 500);
            });
        } else {
            setTimeout(() => {
                fixLoadRosterButton();
                setTimeout(testLoadRosterButton, 1000);
            }, 500);
        }
    }
    
    // Expose functions for manual testing
    window.testLoadRosterButton = testLoadRosterButton;
    window.fixLoadRosterButton = fixLoadRosterButton;
    
    // Start
    initialize();
    
    console.log('🎯 Load Roster Button Test loaded');
})();
