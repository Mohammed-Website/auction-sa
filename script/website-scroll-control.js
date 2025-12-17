let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
let isScrollableContainerScrolling = false;

// Helper function to check if an element is within a scrollable container
function isWithinScrollableContainer(element) {
    if (!element) return false;

    // Check if the element itself is a scrollable container
    if (element.classList && element.classList.contains('scrollable-container')) {
        return true;
    }

    // Check if any parent is a scrollable container
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
        if (parent.classList && parent.classList.contains('scrollable-container')) {
            return true;
        }
        parent = parent.parentElement;
    }

    return false;
}

// Track which containers have been initialized to avoid duplicate listeners
const initializedContainers = new WeakSet();

// Track scroll events on scrollable containers and handle wheel events
function initializeScrollableContainers() {
    const containers = document.querySelectorAll('.scrollable-container');

    containers.forEach(container => {
        // Skip if already initialized
        if (initializedContainers.has(container)) {
            return;
        }

        // Mark as initialized
        initializedContainers.add(container);

        // Add scroll listener to each container
        container.addEventListener('scroll', () => {
            isScrollableContainerScrolling = true;

            // Reset flag after scroll ends
            clearTimeout(container._scrollTimeout);
            container._scrollTimeout = setTimeout(() => {
                isScrollableContainerScrolling = false;
            }, 150);
        }, { passive: true });

        // Handle wheel events on scrollable containers
        container.addEventListener('wheel', (e) => {
            const canScrollDown = container.scrollTop < container.scrollHeight - container.clientHeight - 1;
            const canScrollUp = container.scrollTop > 0;

            // If scrolling down and container can scroll down, prevent window scroll
            if (e.deltaY > 0 && canScrollDown) {
                e.stopPropagation();
                isScrollableContainerScrolling = true;
                clearTimeout(container._scrollTimeout);
                container._scrollTimeout = setTimeout(() => {
                    isScrollableContainerScrolling = false;
                }, 150);
            }
            // If scrolling up and container can scroll up, prevent window scroll
            else if (e.deltaY < 0 && canScrollUp) {
                e.stopPropagation();
                isScrollableContainerScrolling = true;
                clearTimeout(container._scrollTimeout);
                container._scrollTimeout = setTimeout(() => {
                    isScrollableContainerScrolling = false;
                }, 150);
            }
            // If container can't scroll in this direction, prevent default to stop window scroll
            else {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false });
    });
}

// Prevent downward scrolling on the main window
function preventScrollDown(e) {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // If a scrollable container is currently scrolling, allow it
    if (isScrollableContainerScrolling) {
        lastScrollTop = currentScrollTop;
        return;
    }

    // If user tries to scroll DOWN on the main window, prevent it
    if (currentScrollTop > lastScrollTop) {
        window.scrollTo(0, lastScrollTop);
        e.preventDefault();
    } else {
        // Allow scroll UP
        lastScrollTop = currentScrollTop;
    }
}

// Desktop (mouse / trackpad) - prevent downward window scroll
window.addEventListener("scroll", preventScrollDown, { passive: false });

// Handle wheel events on window to prevent downward scrolling
window.addEventListener("wheel", (e) => {
    // Check if the wheel event is over a scrollable container
    const element = document.elementFromPoint(e.clientX, e.clientY);

    if (isWithinScrollableContainer(element)) {
        // Let the scrollable container handle it
        return;
    }

    // If trying to scroll down on the main window, prevent it
    if (e.deltaY > 0) {
        e.preventDefault();
    }
    // Allow scrolling up
}, { passive: false });


// Mobile (touch)
let touchStartY = 0;
let touchStartElement = null;

window.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
    // Get the element at the touch point
    const touch = e.touches[0];
    touchStartElement = document.elementFromPoint(touch.clientX, touch.clientY);
}, { passive: true });

window.addEventListener("touchmove", (e) => {
    const touchCurrentY = e.touches[0].clientY;
    const touch = e.touches[0];

    // Check if touch started within a scrollable container
    if (isWithinScrollableContainer(touchStartElement)) {
        // Allow scrolling within scrollable containers
        return;
    }

    // Also check if the current touch point is within a scrollable container
    const currentElement = document.elementFromPoint(touch.clientX, touch.clientY);
    if (isWithinScrollableContainer(currentElement)) {
        // Allow scrolling within scrollable containers
        return;
    }

    // Swiping UP (scroll down) on main window
    if (touchCurrentY < touchStartY) {
        e.preventDefault();
    }
}, { passive: false });

// Initialize scrollable containers when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScrollableContainers);
} else {
    initializeScrollableContainers();
}

// Reinitialize when new scrollable containers are added dynamically
const observer = new MutationObserver(() => {
    initializeScrollableContainers();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

/**
 * Global function to instantly scroll all scrollable containers to the top
 * This function is unnoticeable to the user as it uses direct property assignment
 * @param {string} elementId - Optional: ID of the parent element. If provided, only scrolls scrollable-container divs inside that element. If not provided, scrolls all containers.
 */
window.scrollScrollableContainersToTop = function (elementId) {
    // If a specific parent element ID is provided
    if (elementId) {
        const parentElement = document.getElementById(elementId);

        if (parentElement) {
            // Find all scrollable-container divs within the parent element
            const containers = parentElement.querySelectorAll('.scrollable-container');
            containers.forEach(container => {
                // Instantly scroll to top using direct property assignment (unnoticeable)
                // Setting scrollTop directly is instant and happens synchronously
                container.scrollTop = 0;
            });
        }
        return;
    }

    // Scroll all scrollable containers to top (when no elementId is provided)
    const containers = document.querySelectorAll('.scrollable-container');
    containers.forEach(container => {
        // Instantly scroll to top using direct property assignment (unnoticeable)
        container.scrollTop = 0;
    });
};