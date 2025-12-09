/**
 * Profile Data Loading and Binding
 * 
 * This file handles:
 * - Loading user data from JSON file
 * - Binding user data to profile form fields
 * - Managing the national ID visibility toggle (show/hide with dots)
 */

(function () {
    'use strict';

    /**
     * Fetch user data from JSON file
     * @returns {Object|null} User data object or null if error
     */
    async function fetchUserData() {
        try {
            const response = await fetch('json-data/user-data.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    /**
     * Update profile image in the form
     * @param {string} imageUrl - URL of the profile image
     */
    function updateProfileImage(imageUrl) {
        const profileImage = document.getElementById('profile-image');
        const placeholder = profileImage ? profileImage.querySelector('.profile-image-placeholder') : null;

        if (!profileImage) return;

        if (imageUrl) {
            // Create img element if it doesn't exist
            let img = profileImage.querySelector('img');
            if (!img) {
                img = document.createElement('img');
                img.alt = 'صورة الملف الشخصي';
                profileImage.appendChild(img);
            }

            img.src = imageUrl;
            img.onerror = function () {
                // If image fails to load, show placeholder
                if (img.parentNode) {
                    img.parentNode.removeChild(img);
                }
                if (placeholder) {
                    placeholder.style.display = 'block';
                }
            };

            // Hide placeholder when image loads successfully
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        } else {
            // Remove image if no URL provided
            const img = profileImage.querySelector('img');
            if (img) {
                img.remove();
            }
            if (placeholder) {
                placeholder.style.display = 'block';
            }
        }
    }

    /**
     * Bind user data to profile form fields
     * Fills in all the form fields with user data
     * @param {Object} userData - User data object
     */
    function bindUserData(userData) {
        if (!userData) {
            console.warn('No user data provided');
            return;
        }

        // Update profile image
        const imageUrl = userData.imageUrl || userData.image || userData.profileImage || null;
        updateProfileImage(imageUrl);

        // Update full name field
        const fullNameInput = document.getElementById('profile-fullname');
        if (fullNameInput) {
            const fullName = userData.fullName || userData.name || userData.fullname || '';
            fullNameInput.value = fullName;
        }

        // Update phone number field
        const phoneInput = document.getElementById('profile-phone');
        if (phoneInput) {
            const phone = userData.phone || userData.phoneNumber || userData.mobile || '';
            phoneInput.value = phone;
        }

        // Update email field
        const emailInput = document.getElementById('profile-email');
        if (emailInput) {
            const email = userData.email || userData.emailAddress || '';
            emailInput.value = email;
        }

        // Update national ID field (store real value, display masked with dots)
        const nationalIdInput = document.getElementById('profile-national-id');
        if (nationalIdInput) {
            const nationalId = userData.nationalId || userData.nationalID || userData.idNumber || '';
            // Store the real value in data attribute
            if (nationalId) {
                nationalIdInput.setAttribute('data-real-value', nationalId);
                // Mask the value with dots for privacy
                nationalIdInput.value = '•'.repeat(nationalId.length);
            } else {
                nationalIdInput.removeAttribute('data-real-value');
                nationalIdInput.value = '';
            }
            // Set type to text for proper dot masking (not password type)
            nationalIdInput.type = 'text';
        }
    }

    /**
     * Load and bind user data
     * Main function that loads data and fills the form
     */
    async function loadUserData() {
        const userData = await fetchUserData();

        if (userData) {
            bindUserData(userData);
        } else {
            console.warn('Failed to load user data. Profile fields will remain empty.');
        }
    }

    /**
     * Initialize the national ID visibility toggle
     * Allows users to show/hide their national ID with a button
     */
    function initProfileToggle() {
        const toggleBtn = document.getElementById('toggle-national-id');
        const nationalIdInput = document.getElementById('profile-national-id');
        const eyeIcon = document.getElementById('eye-icon');
        const inputWrapper = toggleBtn ? toggleBtn.closest('.input-wrapper') : null;

        if (!toggleBtn || !nationalIdInput || !eyeIcon) {
            return;
        }

        // Add class to wrapper for styling
        if (inputWrapper) {
            inputWrapper.classList.add('with-toggle');
        }

        /**
         * Get the real (unmasked) value from data attribute
         * @returns {string} The real national ID value
         */
        function getRealValue() {
            const realValue = nationalIdInput.getAttribute('data-real-value');
            if (realValue) {
                return realValue;
            }
            // If no data attribute, use current value (fallback)
            return nationalIdInput.value.replace(/•/g, '') || '';
        }

        /**
         * Mask value with dots
         * @param {string} value - The value to mask
         * @returns {string} Masked value with dots
         */
        function maskValue(value) {
            if (!value) return '';
            return '•'.repeat(value.length);
        }

        /**
         * Check if value is currently masked
         * @param {string} value - The value to check
         * @returns {boolean} True if masked
         */
        function isMasked(value) {
            return /^•+$/.test(value);
        }

        /**
         * Initialize masking state
         * Makes sure the value is masked when page loads
         */
        function initializeMasking() {
            const realValue = getRealValue();
            const currentValue = nationalIdInput.value;

            // If there's a real value stored
            if (realValue) {
                // If current value is not masked or different, mask it
                if (!isMasked(currentValue) || currentValue !== maskValue(realValue)) {
                    nationalIdInput.value = maskValue(realValue);
                }
                // Ensure real value is stored
                nationalIdInput.setAttribute('data-real-value', realValue);
            } else if (currentValue && !isMasked(currentValue)) {
                // If there's a value but no stored real value, store and mask it
                const digitsOnly = currentValue.replace(/\D/g, '');
                if (digitsOnly) {
                    nationalIdInput.setAttribute('data-real-value', digitsOnly);
                    nationalIdInput.value = maskValue(digitsOnly);
                }
            }

            // Ensure input type is text (not password) for proper masking
            nationalIdInput.type = 'text';
        }

        /**
         * Toggle visibility of national ID
         * Switches between showing dots and showing the real value
         */
        function toggleVisibility() {
            const realValue = getRealValue();
            const currentValue = nationalIdInput.value;
            const currentlyMasked = isMasked(currentValue);

            // Add animation for icon transition
            eyeIcon.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
            eyeIcon.style.transform = 'scale(0.8)';
            eyeIcon.style.opacity = '0.5';

            // Use requestAnimationFrame for smooth transition
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (currentlyMasked) {
                        // Show real value
                        if (realValue) {
                            nationalIdInput.value = realValue;
                        }
                        // Switch to eye-off icon (hidden state)
                        eyeIcon.setAttribute('data-lucide', 'eye-off');
                        toggleBtn.classList.add('active');
                        toggleBtn.setAttribute('aria-label', 'إخفاء الهوية الوطنية');
                    } else {
                        // Hide with dots
                        if (realValue) {
                            nationalIdInput.value = maskValue(realValue);
                            nationalIdInput.setAttribute('data-real-value', realValue);
                        }
                        // Switch to eye icon (visible state)
                        eyeIcon.setAttribute('data-lucide', 'eye');
                        toggleBtn.classList.remove('active');
                        toggleBtn.setAttribute('aria-label', 'إظهار الهوية الوطنية');
                    }

                    // Re-initialize Lucide icon after attribute change
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }

                    // Animate icon back
                    eyeIcon.style.transform = 'scale(1)';
                    eyeIcon.style.opacity = '1';
                }, 100);
            });
        }

        // Prevent showing real value when typing (if user edits)
        nationalIdInput.addEventListener('input', function () {
            const currentValue = this.value;
            const realValue = getRealValue();

            // If user is typing and value contains actual digits (not just dots)
            if (currentValue && !isMasked(currentValue) && /\d/.test(currentValue)) {
                // Store as real value and mask it
                const digitsOnly = currentValue.replace(/\D/g, '');
                if (digitsOnly) {
                    this.setAttribute('data-real-value', digitsOnly);
                    // Only mask if toggle is in hidden state
                    if (!toggleBtn.classList.contains('active')) {
                        this.value = maskValue(digitsOnly);
                    }
                }
            }
        });

        // Prevent paste from breaking masking
        nationalIdInput.addEventListener('paste', function (e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const digitsOnly = pastedText.replace(/\D/g, '').substring(0, 10); // Max 10 digits

            if (digitsOnly) {
                this.setAttribute('data-real-value', digitsOnly);

                // Show or mask based on current state
                if (toggleBtn.classList.contains('active')) {
                    this.value = digitsOnly;
                } else {
                    this.value = maskValue(digitsOnly);
                }
            }
        });

        // Initialize masking state
        initializeMasking();

        // Attach click event to toggle button
        toggleBtn.addEventListener('click', toggleVisibility);

        // Set initial aria-label for accessibility
        toggleBtn.setAttribute('aria-label', 'إظهار الهوية الوطنية');
    }

    /**
     * Initialize profile data loading
     * Sets up the toggle and loads user data
     */
    function init() {
        initProfileToggle();
        loadUserData();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /**
     * Export function to reload user data
     * Can be called from other files to refresh user data
     */
    window.reloadUserData = loadUserData;
})();

