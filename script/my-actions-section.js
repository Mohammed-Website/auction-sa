// My Actions Section - Tab Switching Logic
(function () {
    'use strict';

    // Initialize tab switching
    function initMyActionsTabs() {
        const tabs = document.querySelectorAll('.my-actions-tab');
        const tabContents = document.querySelectorAll('.my-actions-tab-content');

        // Add click event listeners to tabs
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const targetTab = this.getAttribute('data-tab');

                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));

                // Add active class to clicked tab
                this.classList.add('active');

                // Hide all tab contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });

                // Show the corresponding content
                const targetContent = document.getElementById(`${targetTab}-content`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // Initialize when DOM is ready
    function init() {
        const myActionsSection = document.getElementById('my-actions-section');
        if (!myActionsSection) {
            return;
        }

        // Initialize tabs
        initMyActionsTabs();

        // Use MutationObserver to re-initialize when section becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = myActionsSection.classList.contains('active');
                    if (isActive) {
                        // Re-initialize tabs when section becomes active
                        setTimeout(() => {
                            initMyActionsTabs();
                        }, 100);
                    }
                }
            });
        });

        observer.observe(myActionsSection, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Also initialize if already active
        if (myActionsSection.classList.contains('active')) {
            initMyActionsTabs();
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for external use
    window.MyActionsTabs = {
        init: initMyActionsTabs
    };
})();
