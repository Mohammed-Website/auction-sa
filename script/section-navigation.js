/**
 * Section Navigation with Horizontal Sliding Animation
 * 
 * This file handles:
 * - Switching between different sections (Home, Sell, Rent, Auctions, My Actions, Profile)
 * - Smooth slide animations when switching sections
 * - Managing which section is currently visible
 * - Handling clicks on navigation buttons
 */

(function () {
    'use strict';

    /**
     * Section order for direction detection (RTL - Right to Left)
     * This order determines which direction sections slide when switching
     */
    const sectionOrder = [
        'home-section',
        'buy-section',
        'rent-section',
        'auction-section',
        'my-actions-section',
        'profile-section'
    ];

    // Get all sections and navigation items from the page
    const sections = document.querySelectorAll('.tab-section');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    const topNavItems = document.querySelectorAll('.top-nav .top-nav-item');
    const quickAccessBoxes = document.querySelectorAll('.access-box');

    // Track which section is currently active
    let currentSection = 'home-section';

    /**
     * Get the position of a section in the order array
     * @param {string} sectionId - The ID of the section
     * @returns {number} The index position
     */
    function getSectionIndex(sectionId) {
        return sectionOrder.indexOf(sectionId);
    }

    /**
     * Determine which direction the slide animation should go
     * @param {number} fromIndex - Current section index
     * @param {number} toIndex - Target section index
     * @returns {string} 'right' or 'left'
     */
    function getSlideDirection(fromIndex, toIndex) {
        // For RTL: moving to higher index means sliding from right (translateX 100%)
        // Moving to lower index means sliding from left (translateX -100%)
        return toIndex > fromIndex ? 'right' : 'left';
    }

    /**
     * Clear all property cards from view
     * Used when switching to profile section to clean up
     */
    function clearPropertyCards() {
        const propertyGrids = [
            'home-properties-grid',
            'buy-properties-grid',
            'rent-properties-grid',
            'auction-properties-grid'
        ];

        propertyGrids.forEach(gridId => {
            const grid = document.getElementById(gridId);
            if (grid) {
                // Clear all property cards but keep the grid element
                const cards = grid.querySelectorAll('.property-card-home-page');
                cards.forEach(card => {
                    card.style.display = 'none';
                    card.remove();
                });
            }
        });
    }

    /**
     * Hide all property sections and show only profile section
     * This is called when switching to the profile section
     */
    function ensureProfileOnlyVisible() {
        // Hide all property sections
        const propertySections = ['home-section', 'buy-section', 'rent-section', 'auction-section', 'my-actions-section'];

        propertySections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.remove('active');
                section.style.display = 'none';
                section.style.opacity = '0';
                section.style.visibility = 'hidden';
                section.style.pointerEvents = 'none';
                section.style.transform = 'translateX(100%)';
            }
        });

        // Hide banner section smoothly (use only active class)
        const bannerSection = document.querySelector('.banner-section');
        if (bannerSection) {
            bannerSection.classList.remove('active');
        }

        // Clear any visible property cards
        clearPropertyCards();
    }

    /**
     * Main function to switch between sections
     * This is the most important function - it handles all section switching
     * @param {string} sectionId - The ID of the section to switch to
     */
    function switchToSection(sectionId) {
        // Scroll to the top of the page when switching sections
        window.scrollToTop();


        // Handle case: switching from subsection (buy-section, rent-section, auction-section) to home-section
        const isSubsection = currentSection === 'buy-section' || currentSection === 'rent-section' || currentSection === 'auction-section';
        if (isSubsection && sectionId === 'home-section') {
            // When coming from a subsection to home-section, use fade-in animation (like profile-to-home)
            const homeSection = document.getElementById('home-section');
            const currentActiveSection = document.querySelector('.tab-section.active');

            if (homeSection && currentActiveSection) {
                // Hide profile if it's active
                const profileSection = document.getElementById('profile-section');
                if (profileSection && profileSection.classList.contains('active')) {
                    // Re-enable body scrolling when leaving profile section
                    if (typeof window.SettingsPage !== 'undefined' && typeof window.SettingsPage.enableBodyScroll === 'function') {
                        window.SettingsPage.enableBodyScroll();
                    }
                    profileSection.classList.remove('active');
                    profileSection.style.display = 'none';
                    profileSection.style.opacity = '0';
                    profileSection.style.visibility = 'hidden';
                    profileSection.style.pointerEvents = 'none';
                }

                // Show banner section
                const bannerSection = document.querySelector('.banner-section');
                if (bannerSection) {
                    bannerSection.classList.add('active');
                }

                // Ensure home-section is visible
                homeSection.style.display = 'block';
                homeSection.style.visibility = 'visible';
                homeSection.style.opacity = '1';
                homeSection.style.pointerEvents = 'auto';
                homeSection.style.transform = 'translateX(0)';
                homeSection.classList.add('active');

                // Hide content initially for fade-in animation
                const sectionContent = homeSection.querySelector('.section-content');
                if (sectionContent) {
                    sectionContent.style.opacity = '0';
                    sectionContent.style.transform = 'translateX(20px)';
                    sectionContent.style.visibility = 'hidden';
                    sectionContent.style.transition = 'none';
                }

                // Fade in content after brief delay (like profile-to-home)
                setTimeout(() => {
                    if (sectionContent) {
                        sectionContent.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.4s';
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                sectionContent.style.opacity = '1';
                                sectionContent.style.transform = 'translateX(0)';
                                sectionContent.style.visibility = 'visible';
                            });
                        });
                    }
                }, 100);

                // Show all subsections with animation
                toggleHomeSubsections('home-section');

                // Update current section
                currentSection = sectionId;

                // Update active states on all navigation items
                updateActiveNavItems(sectionId);

                // Push navigation state to history
                setTimeout(() => {
                    if (typeof window.pushNavigationState === 'function') {
                        window.pushNavigationState(false);
                    }
                }, 100);

                return;
            }
        }

        // Prevent switching to the same section
        if (sectionId === currentSection) {
            // If clicking the same section, still update visibility of subsections
            if (sectionId === 'auction-section' || sectionId === 'buy-section' || sectionId === 'rent-section') {
                toggleHomeSubsections(sectionId);
            }
            return;
        }

        // Special handling for transitions between home-section and my-actions-section
        // Also handles transitions between subsections (auction-section, buy-section, rent-section) and my-actions-section
        // Also handles transitions between profile-section and my-actions-section
        // This creates a smooth transition similar to profile-section
        const isFromHomeToMyActions = currentSection === 'home-section' && sectionId === 'my-actions-section';
        const isFromMyActionsToHome = currentSection === 'my-actions-section' && sectionId === 'home-section';
        const isFromSubsectionToMyActions = (currentSection === 'auction-section' || currentSection === 'buy-section' || currentSection === 'rent-section') && sectionId === 'my-actions-section';
        const isFromMyActionsToSubsection = currentSection === 'my-actions-section' && (sectionId === 'auction-section' || sectionId === 'buy-section' || sectionId === 'rent-section');
        const isFromProfileToMyActions = currentSection === 'profile-section' && sectionId === 'my-actions-section';
        const isFromMyActionsToProfile = currentSection === 'my-actions-section' && sectionId === 'profile-section';

        if (isFromHomeToMyActions || isFromMyActionsToHome || isFromSubsectionToMyActions || isFromMyActionsToSubsection || isFromProfileToMyActions || isFromMyActionsToProfile) {
            const homeSection = document.getElementById('home-section');
            const myActionsSection = document.getElementById('my-actions-section');
            const profileSection = document.getElementById('profile-section');
            const currentActiveSection = document.querySelector('.tab-section.active');

            if (!homeSection || !myActionsSection || !currentActiveSection) {
                return;
            }

            // Hide profile if it's active (unless we're transitioning to/from profile)
            if (!isFromProfileToMyActions && !isFromMyActionsToProfile) {
                if (profileSection && profileSection.classList.contains('active')) {
                    // Re-enable body scrolling when leaving profile section
                    if (typeof window.SettingsPage !== 'undefined' && typeof window.SettingsPage.enableBodyScroll === 'function') {
                        window.SettingsPage.enableBodyScroll();
                    }
                    profileSection.classList.remove('active');
                    profileSection.style.display = 'none';
                    profileSection.style.opacity = '0';
                    profileSection.style.visibility = 'hidden';
                    profileSection.style.pointerEvents = 'none';
                }
            }

            // Handle banner section
            const bannerSection = document.querySelector('.banner-section');
            if (bannerSection) {
                // Show banner for home-section and subsections, hide for my-actions-section and profile-section
                if (sectionId === 'home-section' || sectionId === 'auction-section' || sectionId === 'buy-section' || sectionId === 'rent-section') {
                    bannerSection.classList.add('active');
                } else {
                    bannerSection.classList.remove('active');
                }
            }

            // Determine target section
            // For subsections, we're actually showing home-section, but will toggle the specific subsection
            const isTargetingSubsection = sectionId === 'auction-section' || sectionId === 'buy-section' || sectionId === 'rent-section';
            let targetSection;
            if (isFromMyActionsToProfile) {
                targetSection = profileSection;
            } else if (isTargetingSubsection) {
                targetSection = homeSection;
            } else if (sectionId === 'home-section') {
                targetSection = homeSection;
            } else {
                targetSection = myActionsSection;
            }

            // Determine if we're coming from a subsection (current section is a subsection)
            const isComingFromSubsection = currentSection === 'auction-section' || currentSection === 'buy-section' || currentSection === 'rent-section';

            // Prepare target section - position it off-screen
            targetSection.style.display = 'block';

            // Determine slide direction based on transition type
            if (isFromHomeToMyActions || isFromSubsectionToMyActions) {
                // Coming from home/subsection, my-actions slides in from LEFT
                targetSection.style.transform = 'translateX(-100%)';
            } else if (isFromProfileToMyActions) {
                // Coming from profile, my-actions slides in from RIGHT
                targetSection.style.transform = 'translateX(100%)';
            } else if (isFromMyActionsToHome || isFromMyActionsToSubsection) {
                // Coming from my-actions to home/subsection, home slides in from right
                targetSection.style.transform = 'translateX(100%)';
            } else if (isFromMyActionsToProfile) {
                // Coming from my-actions to profile, profile slides in from left
                targetSection.style.transform = 'translateX(-100%)';
            }

            targetSection.style.opacity = '0';
            targetSection.style.visibility = 'visible';
            targetSection.style.pointerEvents = 'none';
            targetSection.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
            targetSection.classList.remove('active');

            // Clean up current section with fade-out animation (synchronized)
            currentActiveSection.classList.remove('active');
            currentActiveSection.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';

            if (isFromHomeToMyActions || isFromSubsectionToMyActions) {
                // Home/subsection slides out to the right (my-actions comes from left)
                currentActiveSection.style.transform = 'translateX(100%)';
            } else if (isFromProfileToMyActions) {
                // Profile slides out to the left (my-actions comes from right)
                currentActiveSection.style.transform = 'translateX(-100%)';
            } else if (isFromMyActionsToHome || isFromMyActionsToSubsection) {
                // My-actions slides out to the left (home comes from right)
                currentActiveSection.style.transform = 'translateX(-100%)';
            } else if (isFromMyActionsToProfile) {
                // My-actions slides out to the right (profile comes from left)
                currentActiveSection.style.transform = 'translateX(100%)';
            }

            currentActiveSection.style.opacity = '0';

            // Force reflow to ensure styles are applied
            targetSection.offsetHeight;
            currentActiveSection.offsetHeight;

            // Animate both sections simultaneously for smooth synchronized transition
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Animate target section in
                    targetSection.style.transform = 'translateX(0)';
                    targetSection.style.opacity = '1';
                    targetSection.style.pointerEvents = 'auto';
                    targetSection.classList.add('active');

                    // Hide current section after fade-out completes
                    setTimeout(() => {
                        currentActiveSection.style.display = 'none';
                        currentActiveSection.style.visibility = 'hidden';
                        currentActiveSection.style.pointerEvents = 'none';
                    }, 400);

                    // If switching to home-section or a subsection, show appropriate subsections
                    if (sectionId === 'home-section' || isTargetingSubsection) {
                        toggleHomeSubsections(sectionId);
                    }

                    // Apply fade-in animation to content
                    const sectionContent = targetSection.querySelector('.section-content');
                    if (sectionContent) {
                        sectionContent.style.opacity = '0';
                        sectionContent.style.transform = 'translateX(20px)';
                        sectionContent.style.visibility = 'hidden';
                        sectionContent.style.transition = 'none';

                        setTimeout(() => {
                            sectionContent.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.4s';
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    sectionContent.style.opacity = '1';
                                    sectionContent.style.transform = 'translateX(0)';
                                    sectionContent.style.visibility = 'visible';
                                });
                            });
                        }, 100);
                    }
                });
            });

            // Update current section
            currentSection = sectionId;

            // Update active states on all navigation items
            updateActiveNavItems(sectionId);

            // Push navigation state to history
            setTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
            }, 100);

            return;
        }

        // Handle special cases: auction-section, buy-section, rent-section
        // These are now subsections within home-section
        if (sectionId === 'auction-section' || sectionId === 'buy-section' || sectionId === 'rent-section') {
            // Switch to home-section and show/hide appropriate subsections
            const homeSection = document.getElementById('home-section');
            const currentActiveSection = document.querySelector('.tab-section.active');

            if (!homeSection) {
                return;
            }

            // Hide profile if it's active
            const profileSection = document.getElementById('profile-section');
            if (profileSection && profileSection.classList.contains('active')) {
                // Re-enable body scrolling when leaving profile section
                if (typeof window.SettingsPage !== 'undefined' && typeof window.SettingsPage.enableBodyScroll === 'function') {
                    window.SettingsPage.enableBodyScroll();
                }
                profileSection.classList.remove('active');
                profileSection.style.display = 'none';
                profileSection.style.opacity = '0';
                profileSection.style.visibility = 'hidden';
                profileSection.style.pointerEvents = 'none';
            }

            // Show banner section smoothly when navigating to these sections (use only active class)
            const bannerSection = document.querySelector('.banner-section');
            if (bannerSection) {
                bannerSection.classList.add('active');
            }

            // Check if we need to switch sections (coming from a different section)
            const needsSectionSwitch = currentActiveSection && currentActiveSection.id !== 'home-section';
            const isComingFromProfile = currentActiveSection && currentActiveSection.id === 'profile-section';

            if (needsSectionSwitch) {
                currentActiveSection.classList.remove('active');
                currentActiveSection.style.display = 'none';
                currentActiveSection.style.opacity = '0';
                currentActiveSection.style.visibility = 'hidden';
                currentActiveSection.style.pointerEvents = 'none';
            }

            // Show home-section
            homeSection.style.display = 'block';
            homeSection.style.visibility = 'visible';
            homeSection.style.opacity = '1';
            homeSection.style.pointerEvents = 'auto';
            homeSection.style.transform = 'translateX(0)';
            homeSection.classList.add('active');

            // Hide content initially for fade-in animation (same as home-section)
            const sectionContent = homeSection.querySelector('.section-content');
            if (sectionContent) {
                sectionContent.style.opacity = '0';
                sectionContent.style.transform = 'translateX(20px)';
                sectionContent.style.visibility = 'hidden';
                sectionContent.style.transition = 'none';
            }

            // Fade in content after brief delay (same timing as home-section)
            const fadeInDelay = isComingFromProfile ? 100 : 150;
            setTimeout(() => {
                if (sectionContent) {
                    sectionContent.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.4s';
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            sectionContent.style.opacity = '1';
                            sectionContent.style.transform = 'translateX(0)';
                            sectionContent.style.visibility = 'visible';
                        });
                    });
                }
            }, fadeInDelay);

            // Toggle visibility of subsections
            toggleHomeSubsections(sectionId);

            // Update current section
            currentSection = sectionId;

            // Update active states on all navigation items
            updateActiveNavItems(sectionId);

            // Load data if needed
            if (typeof window.reloadSectionData === 'function') {
                setTimeout(() => {
                    window.reloadSectionData('home-section').then(() => {
                    });
                }, 100);
            }

            // Push navigation state to history
            setTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
            }, 200);

            return;
        }

        const targetSection = document.getElementById(sectionId);
        const currentActiveSection = document.querySelector('.tab-section.active');

        if (!targetSection || !currentActiveSection) {
            return;
        }

        // Special handling for profile section
        if (sectionId === 'profile-section') {
            ensureProfileOnlyVisible();

            // Prepare profile section - position it off-screen from the left
            targetSection.style.display = 'block';
            targetSection.style.transform = 'translateX(-100%)';
            targetSection.style.opacity = '0';
            targetSection.style.visibility = 'visible';
            targetSection.style.pointerEvents = 'none';
            targetSection.classList.remove('active');

            // Force reflow to ensure styles are applied
            targetSection.offsetHeight;

            // Clean up current section first
            currentActiveSection.classList.remove('active');
            currentActiveSection.style.display = 'none';
            currentActiveSection.style.opacity = '0';
            currentActiveSection.style.visibility = 'hidden';
            currentActiveSection.style.pointerEvents = 'none';

            // Animate profile section in from the left
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    targetSection.style.transform = 'translateX(0)';
                    targetSection.style.opacity = '1';
                    targetSection.style.pointerEvents = 'auto';
                    targetSection.classList.add('active');
                    
                    // Disable body scrolling when profile section becomes active
                    // Allow only section-content scrolling
                    if (typeof window.SettingsPage !== 'undefined' && typeof window.SettingsPage.disableBodyScroll === 'function') {
                        setTimeout(() => {
                            window.SettingsPage.disableBodyScroll();
                            // Scroll section-content to top
                            const sectionContent = targetSection.querySelector('.section-content');
                            if (sectionContent) {
                                sectionContent.scrollTop = 0;
                            }
                        }, 100);
                    }
                });
            });

            // Update current section
            currentSection = sectionId;

            // Update active states on all navigation items
            updateActiveNavItems(sectionId);

            // Push navigation state to history
            setTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
            }, 100);

            return;
        }

        // Check if we're coming from profile section or a subsection
        const isComingFromProfile = currentSection === 'profile-section';
        const isComingFromSubsection = currentSection === 'buy-section' || currentSection === 'rent-section' || currentSection === 'auction-section';

        // For non-profile sections, ensure profile is hidden
        const profileSection = document.getElementById('profile-section');
        if (profileSection && profileSection.classList.contains('active')) {
            // Re-enable body scrolling when leaving profile section
            if (typeof window.SettingsPage !== 'undefined' && typeof window.SettingsPage.enableBodyScroll === 'function') {
                window.SettingsPage.enableBodyScroll();
            }
            
            profileSection.classList.remove('active');
            profileSection.style.display = 'none';
            profileSection.style.opacity = '0';
            profileSection.style.visibility = 'hidden';
            profileSection.style.pointerEvents = 'none';
        }

        // If switching back to home-section from profile, ensure it's fully restored
        if (sectionId === 'home-section') {
            const homeSection = document.getElementById('home-section');
            if (homeSection) {
                // Remove any styles that might block interaction
                homeSection.style.removeProperty('pointer-events');
                homeSection.style.pointerEvents = 'auto';
            }
        }

        // Show banner section smoothly when navigating to other sections (use only active class)
        const bannerSection = document.querySelector('.banner-section');
        if (bannerSection && (sectionId === 'home-section' || sectionId === 'buy-section' || sectionId === 'rent-section' || sectionId === 'auction-section')) {
            bannerSection.classList.add('active');
        } else if (bannerSection && sectionId === 'my-actions-section') {
            // Hide banner for my-actions-section
            bannerSection.classList.remove('active');
        }

        // Get direction for animation
        const fromIndex = getSectionIndex(currentSection);
        const toIndex = getSectionIndex(sectionId);
        const direction = getSlideDirection(fromIndex, toIndex);

        // Remove active class from current section (will trigger exit animation)
        currentActiveSection.classList.remove('active');

        // Add appropriate slide-out class based on direction
        if (direction === 'right') {
            currentActiveSection.classList.add('slide-out-left');
        } else {
            currentActiveSection.classList.add('slide-out-right');
        }

        // Ensure target section is visible before animation
        targetSection.style.display = 'block';
        // If switching to home-section, ensure pointer-events are enabled
        if (sectionId === 'home-section') {
            targetSection.style.pointerEvents = 'auto';
        }

        // For my-actions-section, ensure proper initial state for animation
        if (sectionId === 'my-actions-section') {
            // Remove any conflicting inline styles to let CSS transitions work
            targetSection.style.removeProperty('opacity');
            targetSection.style.removeProperty('transform');
            targetSection.style.removeProperty('visibility');
            // Set initial state for animation
            targetSection.style.visibility = 'visible';
            targetSection.style.pointerEvents = 'none';
        }

        // For home-section, hide content initially so it can fade in smoothly
        if (sectionId === 'home-section') {
            const sectionContent = targetSection.querySelector('.section-content');
            if (sectionContent) {
                sectionContent.style.opacity = '0';
                sectionContent.style.transform = 'translateX(20px)';
                sectionContent.style.visibility = 'hidden';
                sectionContent.style.transition = 'none'; // Disable transition initially
            }
        }

        // Prepare target section - position it off-screen in opposite direction
        if (direction === 'right') {
            targetSection.classList.remove('slide-in-left');
            targetSection.classList.add('slide-in-right');
        } else {
            targetSection.classList.remove('slide-in-right');
            targetSection.classList.add('slide-in-left');
        }

        // For my-actions-section, ensure it's visible and ready for animation
        if (sectionId === 'my-actions-section') {
            // Clear any conflicting inline styles to let CSS handle animation
            targetSection.style.removeProperty('opacity');
            targetSection.style.removeProperty('transform');
            targetSection.style.visibility = 'visible';
        }

        // Force reflow to ensure classes are applied
        targetSection.offsetHeight;

        // Small delay to ensure exit animation starts
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Remove slide-in class and add active to trigger enter animation
                targetSection.classList.remove('slide-in-left', 'slide-in-right');
                targetSection.classList.add('active');

                // For my-actions-section, ensure CSS transitions work properly
                if (sectionId === 'my-actions-section') {
                    // Clear any remaining inline styles that might override CSS
                    // The .active class in CSS will handle the animation
                    requestAnimationFrame(() => {
                        targetSection.style.removeProperty('opacity');
                        targetSection.style.removeProperty('transform');
                        // Force reflow to ensure CSS classes take effect
                        targetSection.offsetHeight;
                    });
                }

                // For home-section, apply fade-in animation to section content after slide completes
                // Use the same smooth animation pattern regardless of source section
                if (sectionId === 'home-section') {
                    // When coming from profile or subsection, use immediate fade-in (like profile-to-home)
                    // When coming from other sections, wait for slide animation to complete
                    const animationDelay = (isComingFromProfile || isComingFromSubsection) ? 100 : 400;

                    setTimeout(() => {
                        const sectionContent = targetSection.querySelector('.section-content');
                        if (sectionContent) {
                            // Ensure content is hidden before fade-in (only if not already hidden)
                            const currentOpacity = window.getComputedStyle(sectionContent).opacity;
                            if (parseFloat(currentOpacity) > 0) {
                                sectionContent.style.opacity = '0';
                                sectionContent.style.transform = 'translateX(20px)';
                                sectionContent.style.visibility = 'hidden';
                            }
                            // Enable transition and animate in
                            sectionContent.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.4s';
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    sectionContent.style.opacity = '1';
                                    sectionContent.style.transform = 'translateX(0)';
                                    sectionContent.style.visibility = 'visible';
                                });
                            });
                        }
                    }, animationDelay);
                } else {
                    // For other sections, apply fade-in animation
                    const animationDelay = isComingFromProfile ? 100 : 200;
                    setTimeout(() => {
                        animateSectionContentFadeIn(targetSection);
                    }, animationDelay);
                }

                // If switching to home-section, ensure scroll containers are enabled
                if (sectionId === 'home-section') {
                    targetSection.style.pointerEvents = 'auto';
                }

                // Clean up current section after animation completes
                setTimeout(() => {
                    currentActiveSection.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right', 'active');
                    currentActiveSection.style.display = 'none';

                    // For my-actions-section, ensure it's properly positioned when active
                    if (sectionId === 'my-actions-section') {
                        // Ensure the section is fully visible and interactive
                        targetSection.style.pointerEvents = 'auto';
                    }
                }, 350); // Match CSS transition duration
            });
        });

        // Save previous section before updating
        const previousSection = currentSection;

        // Update current section
        currentSection = sectionId;

        // If switching to home-section, show all subsections
        if (sectionId === 'home-section') {
            toggleHomeSubsections('home-section');
            // Ensure scrolling is enabled after switching to home section
            // Use multiple timeouts to ensure it works after all animations
            setTimeout(() => {
                const scrollContainers = document.querySelectorAll('.horizontal-scroll-container');
                scrollContainers.forEach(container => {
                    // Remove any inline styles that might block scrolling
                    container.style.removeProperty('overflow');
                    container.style.removeProperty('overflow-x');
                    container.style.removeProperty('overflow-y');
                    container.style.removeProperty('pointer-events');
                    // Explicitly set scroll properties
                    container.style.overflowX = 'auto';
                    container.style.overflowY = 'hidden';
                    container.style.pointerEvents = 'auto';
                    // Force browser to recalculate scroll
                    const scrollLeft = container.scrollLeft;
                    container.scrollLeft = scrollLeft;
                });

                // Also ensure subsections have pointer-events enabled
                const subsections = document.querySelectorAll('.home-subsection');
                subsections.forEach(subsection => {
                    subsection.style.pointerEvents = 'auto';
                });
            }, 400); // Wait for animations to complete

            // Additional check after a longer delay to ensure everything is working
            setTimeout(() => {
                const scrollContainers = document.querySelectorAll('.horizontal-scroll-container');
                scrollContainers.forEach(container => {
                    container.style.overflowX = 'auto';
                    container.style.overflowY = 'hidden';
                    container.style.pointerEvents = 'auto';
                });
            }, 600);
        }

        // Update active states on all navigation items
        updateActiveNavItems(sectionId);

        // Load section data if it's a property section and hasn't been loaded
        if (sectionId !== 'profile-section' && typeof window.reloadSectionData === 'function') {
            // Wait for section to become visible (after animation completes)
            setTimeout(() => {
                // Verify section is actually visible
                const sectionElement = document.getElementById(sectionId);
                if (sectionElement) {
                    const sectionStyle = window.getComputedStyle(sectionElement);
                    const isVisible = sectionElement.classList.contains('active') &&
                        sectionStyle.visibility !== 'hidden' &&
                        sectionStyle.opacity !== '0' &&
                        sectionStyle.display !== 'none';

                    if (!isVisible) {
                        console.warn(`Section ${sectionId} is not visible yet, waiting...`);
                        // Force visibility
                        sectionElement.style.display = 'block';
                        sectionElement.style.visibility = 'visible';
                        sectionElement.style.opacity = '1';
                        sectionElement.style.pointerEvents = 'auto';
                    }
                }

                // Find the grid element by ID based on section
                let gridId = '';
                if (sectionId === 'home-section') gridId = 'home-properties-grid';
                else if (sectionId === 'buy-section') gridId = 'buy-properties-grid';
                else if (sectionId === 'rent-section') gridId = 'rent-properties-grid';
                else if (sectionId === 'auction-section') gridId = 'auction-properties-grid';

                const targetGrid = document.getElementById(gridId);
                if (targetGrid) {
                    // Always reload when switching to a different section
                    // This ensures cards are properly rendered and visible
                    const wasPreviousActive = (previousSection === sectionId);

                    if (!wasPreviousActive) {
                        // Switching to a new section - always reload
                        const config = window.dataConfig ? window.dataConfig[sectionId] : null;
                        const jsonFile = config ? config.url : 'unknown';
                        window.reloadSectionData(sectionId).then(() => {
                            // Re-initialize Lucide icons after cards are rendered
                            if (typeof lucide !== 'undefined') {
                                lucide.createIcons();
                            }

                            // Double-check section visibility after rendering
                            if (sectionElement) {
                                sectionElement.style.display = 'block';
                                sectionElement.style.visibility = 'visible';
                                sectionElement.style.opacity = '1';
                                sectionElement.style.pointerEvents = 'auto';
                                if (!sectionElement.classList.contains('active')) {
                                    sectionElement.classList.add('active');
                                }
                            }
                        }).catch(err => {
                            console.error(`Error loading data for ${sectionId}:`, err);
                        });
                    } else {
                        // Same section (shouldn't happen due to early return, but check anyway)
                        const hasCards = targetGrid.querySelector('.property-card-home-page');
                        const isEmpty = targetGrid.children.length === 0;

                        if (!hasCards || isEmpty) {
                            window.reloadSectionData(sectionId).then(() => {
                                if (typeof lucide !== 'undefined') {
                                    lucide.createIcons();
                                }
                            }).catch(err => {
                                console.error(`Error loading data for ${sectionId}:`, err);
                            });
                        }
                    }
                } else {
                    // Grid not found - check if section exists in DOM
                    const sectionElement = document.getElementById(sectionId);
                    if (!sectionElement) {
                        // Section doesn't exist in DOM, skip silently
                        return;
                    }
                    // Grid not found but section exists, try to load anyway
                    window.reloadSectionData(sectionId).then(() => {
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }).catch(err => {
                        // Only log error if section exists
                        const sectionElement = document.getElementById(sectionId);
                        if (sectionElement) {
                            console.error(`Error loading data for ${sectionId}:`, err);
                        }
                    });
                }
            }, 450); // Wait for animation to complete (slightly longer to ensure visibility)
        }

        // Push navigation state to history after section switch completes
        setTimeout(() => {
            if (typeof window.pushNavigationState === 'function') {
                window.pushNavigationState(false);
            }
        }, 500);
    }

    /**
     * Update which navigation button is highlighted (active)
     * @param {string} sectionId - The ID of the active section
     */
    function updateActiveNavItems(sectionId) {
        // Update bottom nav
        bottomNavItems.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update top nav
        topNavItems.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Handle when user clicks a navigation button
     * @param {Event} e - The click event
     */
    function handleNavClick(e) {
        e.preventDefault();
        const sectionId = this.getAttribute('data-section');
        if (sectionId) {
            switchToSection(sectionId);
        }
    }

    /**
     * Animate section content with a fade-in effect
     * Makes content appear smoothly when a section becomes visible
     * @param {HTMLElement} sectionElement - The section element to animate
     */
    function animateSectionContentFadeIn(sectionElement) {
        if (!sectionElement) return;

        // Find the section-content element within the section
        const sectionContent = sectionElement.querySelector('.section-content');
        if (!sectionContent) {
            return; // Skip if no section-content found (profile section has different structure)
        }

        // Start with fade-out state
        sectionContent.style.opacity = '0';
        sectionContent.style.transform = 'translateX(20px)';
        sectionContent.style.visibility = 'hidden';
        sectionContent.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.4s';

        // After a brief delay, fade in (stagger for smoother effect)
        setTimeout(() => {
            requestAnimationFrame(() => {
                sectionContent.style.opacity = '1';
                sectionContent.style.transform = 'translateX(0)';
                sectionContent.style.visibility = 'visible';
            });
        }, 50);
    }


    /**
     * Show or hide subsections within the home section
     * Home section has 3 subsections: auctions, buy, and rent
     * @param {string} activeSubsection - Which subsection to show ('auction-section', 'buy-section', 'rent-section', or 'home-section' for all)
     */
    function toggleHomeSubsections(activeSubsection) {
        const auctionsSubsection = document.getElementById('auctions-section');
        const sellSubsection = document.getElementById('buy-section');
        const rentSubsection = document.getElementById('rent-section');

        const allSubsections = [auctionsSubsection, sellSubsection, rentSubsection].filter(Boolean);

        // First, fade out all subsections
        allSubsections.forEach(subsection => {
            if (subsection) {
                subsection.style.opacity = '0';
                subsection.style.transform = 'translateX(20px)';
                subsection.style.visibility = 'hidden';
            }
        });

        // After fade out completes, update display and fade in selected ones
        setTimeout(() => {
            // Hide all subsections
            allSubsections.forEach(subsection => {
                if (subsection) {
                    subsection.style.display = 'none';
                }
            });

            // Show the selected subsection(s) and fade in
            if (activeSubsection === 'auction-section' && auctionsSubsection) {
                auctionsSubsection.style.display = 'block';
                requestAnimationFrame(() => {
                    auctionsSubsection.style.opacity = '1';
                    auctionsSubsection.style.transform = 'translateX(0)';
                    auctionsSubsection.style.visibility = 'visible';
                });
            } else if (activeSubsection === 'buy-section' && sellSubsection) {
                sellSubsection.style.display = 'block';
                requestAnimationFrame(() => {
                    sellSubsection.style.opacity = '1';
                    sellSubsection.style.transform = 'translateX(0)';
                    sellSubsection.style.visibility = 'visible';
                });
            } else if (activeSubsection === 'rent-section' && rentSubsection) {
                rentSubsection.style.display = 'block';
                requestAnimationFrame(() => {
                    rentSubsection.style.opacity = '1';
                    rentSubsection.style.transform = 'translateX(0)';
                    rentSubsection.style.visibility = 'visible';
                });
            } else if (activeSubsection === 'home-section') {
                // Show all subsections for home-section
                allSubsections.forEach((subsection, index) => {
                    if (subsection) {
                        subsection.style.display = 'block';
                        subsection.style.pointerEvents = 'auto';
                        // Stagger the animations slightly for a nicer effect
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                subsection.style.opacity = '1';
                                subsection.style.transform = 'translateX(0)';
                                subsection.style.visibility = 'visible';
                                subsection.style.pointerEvents = 'auto';
                            });
                        }, index * 50);
                    }
                });
            }
        }, 200); // Wait for fade out to complete
    }

    /**
     * Handle when user clicks a quick access box
     * @param {Event} e - The click event
     */
    function handleQuickAccessClick(e) {
        e.preventDefault();
        const sectionId = this.getAttribute('data-section');
        if (sectionId) {
            switchToSection(sectionId);
        }
    }

    /**
     * Initialize all event listeners
     * Sets up click handlers for all navigation buttons
     */
    function init() {
        // Bottom navigation items
        bottomNavItems.forEach(item => {
            item.addEventListener('click', handleNavClick);
        });

        // Top navigation items
        topNavItems.forEach(item => {
            item.addEventListener('click', handleNavClick);
        });

        // Quick access boxes
        quickAccessBoxes.forEach(box => {
            box.addEventListener('click', handleQuickAccessClick);
        });

        // Header profile button
        const headerProfileBtn = document.querySelector('.header-profile-btn');
        if (headerProfileBtn) {
            headerProfileBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                if (sectionId) {
                    switchToSection(sectionId);
                }
            });
        }

        // Add property buttons
        const addPropertyBtns = document.querySelectorAll('.add-property-btn');
        addPropertyBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
            });
        });

        // Prevent default anchor behavior on all navigation links
        document.querySelectorAll('a[href="#"]').forEach(link => {
            link.addEventListener('click', function (e) {
                // Only prevent if it's a nav item or access box
                if (this.classList.contains('nav-item') ||
                    this.classList.contains('top-nav-item') ||
                    this.classList.contains('access-box')) {
                    e.preventDefault();
                }
            });
        });

        // Initialize Lucide icons
        if (typeof window.initLucideIcons === 'function') {
            setTimeout(() => {
                window.initLucideIcons();
            }, 100);
        } else if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    /**
     * Make sure the correct section is visible when page first loads
     * Hides all sections except the active one
     */
    function ensureInitialState() {
        const activeSection = document.querySelector('.tab-section.active');

        // Hide all sections first
        sections.forEach(section => {
            section.style.display = 'none';
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            section.style.pointerEvents = 'none';
            section.style.transform = 'translateX(100%)';
        });

        // Show only the active section
        if (activeSection) {
            activeSection.style.display = 'block';
            activeSection.style.transform = 'translateX(0)';
            activeSection.style.opacity = '1';
            activeSection.style.visibility = 'visible';
            activeSection.style.pointerEvents = 'auto';

            // If home-section is active, show all subsections
            if (activeSection.id === 'home-section') {
                toggleHomeSubsections('home-section');
            }
        } else {
            // If no section is active, activate home-section
            const homeSection = document.getElementById('home-section');
            if (homeSection) {
                homeSection.classList.add('active');
                homeSection.style.display = 'block';
                homeSection.style.transform = 'translateX(0)';
                homeSection.style.opacity = '1';
                homeSection.style.visibility = 'visible';
                homeSection.style.pointerEvents = 'auto';
                toggleHomeSubsections('home-section');
            }
        }

        // If profile section is active initially, ensure property sections are hidden and cleared
        if (activeSection && activeSection.id === 'profile-section') {
            ensureProfileOnlyVisible();
            // Re-show profile section after clearing
            activeSection.style.display = 'block';
            activeSection.style.opacity = '1';
            activeSection.style.visibility = 'visible';
            activeSection.style.pointerEvents = 'auto';
            activeSection.style.transform = 'translateX(0)';
        }

        // Ensure my-actions-section is properly initialized
        const myActionsSection = document.getElementById('my-actions-section');
        if (myActionsSection && !myActionsSection.classList.contains('active')) {
            // Ensure it starts in the correct hidden state
            myActionsSection.style.display = 'none';
            myActionsSection.style.opacity = '0';
            myActionsSection.style.visibility = 'hidden';
            myActionsSection.style.pointerEvents = 'none';
            myActionsSection.style.transform = 'translateX(100%)';
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            ensureInitialState();
            init();
        });
    } else {
        ensureInitialState();
        init();
    }

    /**
     * Export switchToSection function so other files can use it
     * This allows the history manager to switch sections when user presses back button
     */
    window.switchToSection = switchToSection;
})();
