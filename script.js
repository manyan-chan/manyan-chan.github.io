document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
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
    const sections = document.querySelectorAll('section[id]');

    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const submitButton = contactForm?.querySelector('button[type="submit"]');

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
    }

    // --- Theme Toggle ---
    const updateThemeUI = (isDarkMode) => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            themeToggleLightIcon?.classList.remove('hidden');
            themeToggleDarkIcon?.classList.add('hidden');
            if (mobileThemeText) mobileThemeText.textContent = 'Switch to Light Mode';
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            themeToggleLightIcon?.classList.add('hidden');
            themeToggleDarkIcon?.classList.remove('hidden');
            if (mobileThemeText) mobileThemeText.textContent = 'Switch to Dark Mode';
            localStorage.theme = 'light';
        }
    };

    // Set initial theme based on class on <html> or user system settings
    const initialIsDark = document.documentElement.classList.contains('dark') || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    updateThemeUI(initialIsDark);

    const toggleThemeHandler = () => {
        const isDark = !document.documentElement.classList.contains('dark');
        updateThemeUI(isDark);
    };

    themeToggle?.addEventListener('click', toggleThemeHandler);
    mobileThemeToggle?.addEventListener('click', toggleThemeHandler);

    // --- Avatar Fallback Logic ---
    const heroAvatar = document.getElementById('hero-avatar');
    const fallbackIcon = document.getElementById('hero-fallback-icon');

    if (heroAvatar && fallbackIcon) {
        const handleAvatarError = () => {
            heroAvatar.style.display = 'none';
            fallbackIcon.style.display = 'flex';
        };

        const handleAvatarSuccess = () => {
            heroAvatar.style.opacity = '1';
            fallbackIcon.style.display = 'none';
        };

        heroAvatar.addEventListener('error', handleAvatarError);
        heroAvatar.addEventListener('load', handleAvatarSuccess);

        // Check cache state
        if (heroAvatar.complete) {
            heroAvatar.naturalHeight === 0 ? handleAvatarError() : handleAvatarSuccess();
        }
    }

    // --- Smooth Scroll & Navigation ---
    const navbarHeight = document.querySelector('nav')?.offsetHeight || 64;

    const setActiveLink = (targetId) => {
        const allLinks = [...navLinks, ...mobileNavLinks];
        
        allLinks.forEach(link => {
            const isMatch = link.getAttribute('href') === `#${targetId}`;
            const isMobile = link.classList.contains('mobile-nav-link');

            if (isMobile) {
                link.classList.toggle('text-primary', isMatch);
                link.classList.toggle('dark:text-primary', isMatch);
                link.classList.toggle('bg-gray-100', isMatch);
                link.classList.toggle('dark:bg-gray-800', isMatch);
            } else {
                link.classList.toggle('text-primary', isMatch);
                link.classList.toggle('dark:text-primary', isMatch);
                link.classList.toggle('font-semibold', isMatch);
            }

            if (isMatch) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const handleNavClick = (e, link) => {
        const targetId = link.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;

        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            e.preventDefault();

            // Close mobile menu if open
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                menuOpenIcon.classList.add('hidden');
                menuClosedIcon.classList.remove('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }

            const targetPosition = targetSection.offsetTop - navbarHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            
            setActiveLink(targetId.replace('#', ''));
            if (history.pushState) history.pushState(null, null, targetId);
        }
    };

    navLinks.forEach(link => link.addEventListener('click', (e) => handleNavClick(e, link)));
    mobileNavLinks.forEach(link => link.addEventListener('click', (e) => handleNavClick(e, link)));

    // --- High-Performance Intersection Observer (Scroll Spy) ---
    if (sections.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: `-${navbarHeight}px 0px -40% 0px`, // Triggers when section enters active viewport
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // --- Contact Form Submission ---
    if (contactForm && formMessage && submitButton) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const originalButtonText = submitButton.innerHTML;

            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
            `;
            formMessage.innerHTML = '';

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formMessage.innerHTML = `
                        <div class="py-3 px-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-md">
                            <p>Thank you for your message!</p>
                            <p class="text-sm mt-1">I'll get back to you as soon as possible.</p>
                        </div>
                    `;
                    contactForm.reset();
                } else {
                    const data = await response.json().catch(() => null);
                    let errorMsg = "Oops! There was a problem submitting your form.";
                    if (data?.errors) {
                        errorMsg += "<br>" + data.errors.map(err => `${err.field}: ${err.message}`).join("<br>");
                    }
                    formMessage.innerHTML = `<div class="py-3 px-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-md">${errorMsg}</div>`;
                }
            } catch (error) {
                formMessage.innerHTML = `<div class="py-3 px-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-md">Network error: Could not submit the form.</div>`;
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;

                setTimeout(() => {
                    if (!formMessage.querySelector('.bg-red-100')) {
                        formMessage.innerHTML = '';
                    }
                }, 7000);
            }
        });
    }

    // --- Scroll to Top Button ---
    if (scrollToTopButton) {
        const toggleScrollTopVisibility = () => {
            const isVisible = window.scrollY > 300;
            scrollToTopButton.classList.toggle('opacity-100', isVisible);
            scrollToTopButton.classList.toggle('visible', isVisible);
            scrollToTopButton.classList.toggle('opacity-0', !isVisible);
            scrollToTopButton.classList.toggle('invisible', !isVisible);
        };

        window.addEventListener('scroll', toggleScrollTopVisibility, { passive: true });
        scrollToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // --- Footer Current Year ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
