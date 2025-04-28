// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuClosedIcon = document.getElementById('menu-closed-icon');

    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const mobileThemeText = document.getElementById('mobile-theme-text');

    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    // *** UPDATED sections querySelector to ensure all sections with IDs are selected ***
    const sections = document.querySelectorAll('section[id]'); // Select all <section> elements that have an id attribute

    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

    const scrollToTopButton = document.getElementById('scroll-to-top');
    const currentYearSpan = document.getElementById('current-year');

    // --- Mobile Menu ---
    if (mobileMenuButton && mobileMenu && menuOpenIcon && menuClosedIcon) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
            menuOpenIcon.classList.toggle('hidden');
            menuClosedIcon.classList.toggle('hidden');
        });
    } else {
        console.warn("Mobile menu elements not found.");
    }

    // --- Theme Toggle ---
    const updateThemeIconsAndText = (isDarkMode) => {
        if (themeToggleDarkIcon && themeToggleLightIcon && mobileThemeText) {
            if (isDarkMode) {
                themeToggleLightIcon.classList.remove('hidden');
                themeToggleDarkIcon.classList.add('hidden');
                mobileThemeText.textContent = 'Switch to Light Mode';
                localStorage.theme = 'dark'; // Persist preference
            } else {
                themeToggleLightIcon.classList.add('hidden');
                themeToggleDarkIcon.classList.remove('hidden');
                mobileThemeText.textContent = 'Switch to Dark Mode';
                localStorage.theme = 'light'; // Persist preference
            }
            // Ensure initial state is correct even if toggled quickly before script fully loads
            if (localStorage.theme === 'dark') {
                document.documentElement.classList.add('dark');
                themeToggleLightIcon.classList.remove('hidden');
                themeToggleDarkIcon.classList.add('hidden');
            } else {
                document.documentElement.classList.remove('dark');
                themeToggleLightIcon.classList.add('hidden');
                themeToggleDarkIcon.classList.remove('hidden');
            }

        } else {
            console.warn("Theme toggle icons or text elements not found.");
        }
    };

    // Set initial state based on class applied in head script or localStorage
    updateThemeIconsAndText(document.documentElement.classList.contains('dark'));

    const toggleThemeHandler = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        updateThemeIconsAndText(isDark);
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleThemeHandler);
    }
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleThemeHandler);
    }

    // --- Avatar Fallback Logic ---
    const heroAvatar = document.getElementById('hero-avatar');
    const fallbackIcon = document.getElementById('hero-fallback-icon');

    if (heroAvatar && fallbackIcon) {
        heroAvatar.onerror = () => {
            console.warn('Avatar image failed to load or not found. Displaying fallback icon.');
            heroAvatar.style.display = 'none'; // Hide the broken image
            fallbackIcon.style.display = 'flex'; // Show the fallback icon
        };
        // Optional: Fade in on successful load (if not using inline onload)
        // heroAvatar.onload = () => {
        //     heroAvatar.style.opacity = 1;
        // };
        // Ensure the fallback is hidden if the image *does* load (covers edge cases)
        heroAvatar.addEventListener('load', () => {
            if (fallbackIcon.style.display !== 'none') {
                fallbackIcon.style.display = 'none';
            }
            heroAvatar.style.opacity = 1; // Ensure opacity is set on load
        });

        // Edge case: If the image is already cached and loads instantly, 'load' might fire early
        // Check if it's already complete
        if (heroAvatar.complete && heroAvatar.naturalHeight !== 0) {
            heroAvatar.style.opacity = 1;
            fallbackIcon.style.display = 'none';
        } else if (heroAvatar.complete && heroAvatar.naturalHeight === 0) {
            // If 'complete' but height is 0, it likely failed before JS ran
            heroAvatar.style.display = 'none';
            fallbackIcon.style.display = 'flex';
        }


    } else {
        console.warn("Hero avatar or fallback icon element not found.");
        // If avatar element doesn't exist at all, ensure fallback is shown
        if (!heroAvatar && fallbackIcon) {
            fallbackIcon.style.display = 'flex';
        }
    }

    // --- Smooth Scrolling & Active Link Highlighting ---
    const navbarHeight = document.querySelector('nav')?.offsetHeight || 64; // Get navbar height or fallback

    const smoothScrollTo = (targetId) => {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            const targetPosition = targetSection.offsetTop - navbarHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            // Update URL hash without jumping
            if (history.pushState) {
                // Use replaceState to avoid filling browser history during scroll spy updates
                history.replaceState(null, null, targetId);
            } else {
                // Fallback for older browsers (might cause jump)
                // location.hash = targetId;
                // Or avoid hash change on old browsers to prevent jump
            }
        } else {
            console.warn(`Scroll target "${targetId}" not found.`);
        }
    };

    // Desktop links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            smoothScrollTo(targetId);
            // Optionally, manually set active class immediately on click for faster feedback
            setActiveLink(targetId);
        });
    });

    // Mobile links (also close menu)
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                // Close menu immediately
                mobileMenu.classList.add('hidden');
                menuOpenIcon.classList.add('hidden');
                menuClosedIcon.classList.remove('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
            smoothScrollTo(targetId);
            // Optionally, manually set active class immediately on click for faster feedback
            setActiveLink(targetId);
        });
    });

    // Active link highlighting on scroll or click
    // Pass targetIdOnClick optional parameter for immediate update
    const setActiveLink = (targetIdOnClick = null) => {
        let currentSectionId = targetIdOnClick; // Prioritize clicked ID

        if (!currentSectionId) { // If not clicked, determine by scroll position
            const scrollPosition = window.scrollY + navbarHeight + 50; // Add offset for better accuracy

            sections.forEach(section => {
                // Check if the scroll position is within the bounds of the section
                if (scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
                    currentSectionId = '#' + section.getAttribute('id');
                }
            });

            // Handle edge cases: top of page or bottom of page
            if (!currentSectionId && sections.length > 0) {
                if (window.scrollY < sections[0].offsetTop - navbarHeight) {
                    // If scrolled above the first section, still highlight the first section's link (e.g., #home)
                    currentSectionId = '#' + sections[0].getAttribute('id');
                } else if (window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 50) {
                    // If scrolled near the bottom, highlight the last section's link
                    currentSectionId = '#' + sections[sections.length - 1].getAttribute('id');
                }
            }
        }

        // Update styles for all nav links (desktop)
        navLinks.forEach(link => {
            link.classList.remove('text-primary', 'dark:text-primary', 'font-semibold'); // Reset styles
            link.classList.add('text-gray-700', 'dark:text-gray-300');
            link.removeAttribute('aria-current');

            if (link.getAttribute('href') === currentSectionId) {
                link.classList.remove('text-gray-700', 'dark:text-gray-300');
                link.classList.add('text-primary', 'dark:text-primary', 'font-semibold'); // Add active styles
                link.setAttribute('aria-current', 'page');
            }
        });

        // Update styles for all nav links (mobile) - optional, but good practice
        mobileNavLinks.forEach(link => {
            link.classList.remove('text-primary', 'dark:text-primary', 'bg-gray-100', 'dark:bg-gray-800'); // Reset mobile active styles
            link.classList.add('text-gray-700', 'dark:text-gray-300');

            if (link.getAttribute('href') === currentSectionId) {
                link.classList.remove('text-gray-700', 'dark:text-gray-300');
                link.classList.add('text-primary', 'dark:text-primary', 'bg-gray-100', 'dark:bg-gray-800'); // Add mobile active styles
            }
        });

        // Update URL hash after determining the active section (only on scroll, not on click)
        // Debounce this or use Intersection Observer for better performance if needed
        if (!targetIdOnClick && currentSectionId && history.replaceState) {
            history.replaceState(null, null, currentSectionId);
        }
    };

    // Use throttle or debounce for performance if scroll event causes issues
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            setActiveLink();
        }, 100); // Adjust delay as needed
    });

    // Run on load to set initial active link
    setActiveLink();


    // --- Contact Form Submission (AJAX with Fetch) ---
    if (contactForm && formMessage && submitButton) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent default browser submission

            const formData = new FormData(contactForm);
            const originalButtonText = submitButton.innerHTML;

            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
            `;
            formMessage.innerHTML = ''; // Clear previous messages
            formMessage.className = 'mt-4 text-center'; // Reset classes

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json' // Important for Formspree AJAX
                }
            })
                .then(response => {
                    if (response.ok) {
                        // Success
                        formMessage.innerHTML = `
                        <div class="py-3 px-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-md">
                            <p>Thank you for your message!</p>
                            <p class="text-sm mt-1">I'll get back to you as soon as possible.</p>
                        </div>
                    `;
                        contactForm.reset(); // Clear the form
                    } else {
                        // Server returned an error (e.g., Formspree validation error)
                        response.json().then(data => {
                            let errorMsg = "Oops! There was a problem submitting your form.";
                            if (data && data.errors) {
                                // Extract Formspree specific errors
                                errorMsg += "<br>" + data.errors.map(error => error.field + ': ' + error.message).join("<br>");
                            } else if (data && data.error) {
                                errorMsg += `<br>${data.error}`;
                            }
                            formMessage.innerHTML = `<div class="py-3 px-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-md">${errorMsg}</div>`;
                        }).catch(() => {
                            // Fallback error if parsing JSON fails or response is not JSON
                            formMessage.innerHTML = `<div class="py-3 px-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-md">Oops! There was a problem submitting your form. Server returned an error (${response.status}).</div>`;
                        });
                    }
                })
                .catch(error => {
                    // Network error or other fetch issue
                    console.error('Form submission error:', error);
                    formMessage.innerHTML = `<div class="py-3 px-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-md">Network error: Could not submit the form. Please check your connection and try again.</div>`;
                })
                .finally(() => {
                    // Re-enable button and restore text
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;

                    // Optionally hide the success/error message after a delay
                    setTimeout(() => {
                        // Check if it's NOT an error message before hiding
                        if (!formMessage.querySelector('.bg-red-100')) {
                            formMessage.innerHTML = ''; // Clear success message
                        }
                    }, 7000); // Hide success message after 7 seconds
                });
        });
    } else {
        console.warn("Contact form elements not found.");
    }

    // --- Scroll to Top Button ---
    if (scrollToTopButton) {
        const toggleScrollTopVisibility = () => {
            if (window.scrollY > 300) {
                scrollToTopButton.classList.remove('opacity-0', 'invisible');
                scrollToTopButton.classList.add('opacity-100', 'visible');
            } else {
                scrollToTopButton.classList.remove('opacity-100', 'visible');
                scrollToTopButton.classList.add('opacity-0', 'invisible');
            }
        };

        window.addEventListener('scroll', toggleScrollTopVisibility);
        toggleScrollTopVisibility(); // Initial check

        scrollToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } else {
        console.warn("Scroll-to-top button not found.");
    }

    // --- Footer Current Year ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

}); // End DOMContentLoaded