// Quick Actions Slider/Scrollbar Fix
(function() {
    'use strict';
    
    function fixQuickActionsSlider() {
        const quickActionsGrid = document.querySelector('.quick-actions-grid');
        
        if (!quickActionsGrid) {
            return;
        }
        
        // Ensure the grid is focusable for keyboard navigation
        if (!quickActionsGrid.hasAttribute('tabindex')) {
            quickActionsGrid.setAttribute('tabindex', '0');
        }
    }
    
    // Initialize the fix
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixQuickActionsSlider);
    } else {
        fixQuickActionsSlider();
    }
    
})();