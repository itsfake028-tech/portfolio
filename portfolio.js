
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        // Loading Screen
        window.addEventListener('load', () => {
            const loader = document.querySelector('.loader-overlay');
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 1200); // Hide after 1.2 seconds
        });

        // Hero Photo Tilt on Scroll
        let photoTilted = false;
        const heroPhoto = document.querySelector('.hero-photo');

        window.addEventListener('scroll', () => {
            if (!photoTilted && window.scrollY > 5) {
                heroPhoto.classList.add('tilted');
                photoTilted = true;
            }
        });

        // Hero Photo Hover - Reset to starting position
        heroPhoto.addEventListener('mouseenter', () => {
            heroPhoto.classList.remove('tilted');
        });

        heroPhoto.addEventListener('mouseleave', () => {
            if (photoTilted) {
                heroPhoto.classList.add('tilted');
            }
        });

        // Falling SVG - Only terminal (top-right)
        let terminalFallen = false;
        const decoTerminal = document.querySelector('.deco-terminal');
        const heroContent = document.querySelector('.hero-content');

        function calculateFallDistance() {
            // Land within the portrait, leaving the caption below it unobstructed.
            const terminalFall = Math.max(0, heroPhoto.offsetTop + heroPhoto.offsetHeight - decoTerminal.offsetTop - decoTerminal.offsetHeight - 38);
            decoTerminal.style.setProperty('--fall-distance', `${terminalFall}px`);
        }

        calculateFallDistance();
        window.addEventListener('resize', calculateFallDistance);

        window.addEventListener('scroll', () => {
            if (!reduceMotion.matches && !terminalFallen && window.scrollY > 5) {
                decoTerminal.classList.add('falling');
                terminalFallen = true;
            }
        });

        // Paper Tear Gap Parallax Effect
        const pageGap = document.querySelector('.page-gap');
        const paperTearBottom = document.querySelector('.paper-tear-bottom');
        const paperTearBottomBgGray = document.querySelector('.paper-tear-bottom svg path[fill="#d0d0d0"]');
        const paperTearBottomBgWhite = document.querySelector('.paper-tear-bottom svg path[fill="#ffffff"]');
        const tearTapeSticker = document.querySelector('.tear-tape-sticker');
        const minGapHeight = -30;

        function updateTapePosition() {
            if (paperTearBottom && tearTapeSticker) {
                const rect = paperTearBottom.getBoundingClientRect();
                tearTapeSticker.style.setProperty('--tape-position', `${rect.top}px`);
            }
        }

        function updateGapParallax() {
            if (!pageGap || !paperTearBottom) return;

            const isMobile = window.innerWidth <= 768;

            // Skip animation on mobile
            if (isMobile || reduceMotion.matches) return;

            const scrollY = window.scrollY;
            const initialGapHeight = 300;
            const scrollStart = 100;
            const scrollRange = 200;
            const stickerDelay = 30;
            const stickerStart = scrollStart + scrollRange + stickerDelay;
            const stickerRange = 60;

            updateTapePosition();

            if (scrollY <= scrollStart) {
                pageGap.style.setProperty('height', initialGapHeight + 'px', 'important');
                paperTearBottom.style.setProperty('margin-top', '0px', 'important');
                if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = '1';
                if (tearTapeSticker) {
                    tearTapeSticker.style.transform = 'rotate(-8deg) translateY(-40px) translateZ(30px) rotateX(35deg)';
                    tearTapeSticker.style.opacity = '0';
                }
            } else if (scrollY >= scrollStart && scrollY <= scrollStart + scrollRange) {
                const progress = (scrollY - scrollStart) / scrollRange;
                const currentHeight = initialGapHeight - (initialGapHeight - minGapHeight) * progress;

                if (currentHeight >= 0) {
                    pageGap.style.setProperty('height', currentHeight + 'px', 'important');
                    paperTearBottom.style.setProperty('margin-top', '0px', 'important');
                    if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = '1';
                    if (tearTapeSticker) {
                        tearTapeSticker.style.transform = 'rotate(-8deg) translateY(-100px) translateZ(50px) rotateX(45deg)';
                        tearTapeSticker.style.opacity = '0';
                    }
                } else {
                    // Negative margin starts - fade background
                    pageGap.style.setProperty('height', '0px', 'important');
                    paperTearBottom.style.setProperty('margin-top', currentHeight + 'px', 'important');

                    // Fade based on negative margin progress
                    const negativePart = Math.abs(minGapHeight);
                    const negativeProgress = Math.abs(currentHeight) / negativePart;
                    const opacity = 1 - negativeProgress;

                    if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = opacity;
                    if (tearTapeSticker) {
                        tearTapeSticker.style.transform = 'rotate(-8deg) translateY(-100px) translateZ(50px) rotateX(45deg)';
                        tearTapeSticker.style.opacity = '0';
                    }
                }
            } else if (scrollY > stickerStart && scrollY < stickerStart + stickerRange) {
                // Sticker animation in progress
                pageGap.style.setProperty('height', '0px', 'important');
                paperTearBottom.style.setProperty('margin-top', minGapHeight + 'px', 'important');
                if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = '0';

                if (tearTapeSticker) {
                    const stickerProgress = (scrollY - stickerStart) / stickerRange;

                    // Interpolate transform values based on progress
                    const translateY = -40 + (40 * stickerProgress);
                    const translateZ = 30 - (30 * stickerProgress);
                    const rotateX = 35 - (35 * stickerProgress);
                    const opacityVal = Math.min(1, Math.max(0, (stickerProgress - 0.35) * 1.54));

                    tearTapeSticker.style.transform = `rotate(-8deg) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg)`;
                    tearTapeSticker.style.opacity = opacityVal;
                }
            } else if (scrollY >= stickerStart + stickerRange) {
                // Sticker fully stuck
                pageGap.style.setProperty('height', '0px', 'important');
                paperTearBottom.style.setProperty('margin-top', minGapHeight + 'px', 'important');
                if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = '0';
                if (tearTapeSticker) {
                    tearTapeSticker.style.transform = 'rotate(-8deg) translateY(0px) translateZ(0px) rotateX(0deg)';
                    tearTapeSticker.style.opacity = '1';
                }
            } else {
                // Between gap close and sticker start
                pageGap.style.setProperty('height', '0px', 'important');
                paperTearBottom.style.setProperty('margin-top', minGapHeight + 'px', 'important');
                if (paperTearBottomBgGray) paperTearBottomBgGray.style.opacity = '0';
                if (tearTapeSticker) {
                    tearTapeSticker.style.transform = 'rotate(-8deg) translateY(-40px) translateZ(30px) rotateX(35deg)';
                    tearTapeSticker.style.opacity = '0';
                }
            }
        }

        window.addEventListener('scroll', updateGapParallax);
        window.addEventListener('resize', updateGapParallax);

        // Initialize all animations with current scroll position
        requestAnimationFrame(() => {
            updateGapParallax();
        });

        // Highlight Parallax Effect
        const highlights = document.querySelectorAll('.highlight');
        const highlightData = new Map();

        highlights.forEach((highlight, index) => {
            const direction = index % 2 === 0 ? 'left' : 'right';
            highlight.setAttribute('data-direction', direction);
            highlightData.set(highlight, {
                hasStarted: false,
                startScroll: 0,
                duration: 100,
                direction: direction
            });
        });

        function updateHighlights() {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;

            highlights.forEach(highlight => {
                const rect = highlight.getBoundingClientRect();
                const elementTop = rect.top + scrollY;
                const data = highlightData.get(highlight);

                // Start highlighting when element is near top of viewport
                const triggerPoint = scrollY + windowHeight * 0.8;

                if (!data.hasStarted && triggerPoint >= elementTop) {
                    data.hasStarted = true;
                    data.startScroll = scrollY;
                }

                if (data.hasStarted) {
                    const progress = Math.min(1, Math.max(0, (scrollY - data.startScroll) / data.duration));
                    highlight.style.setProperty('--highlight-progress', `${progress * 100}%`);
                }

                // Reset when scrolling back up past element
                if (data.hasStarted && scrollY < data.startScroll - 50) {
                    data.hasStarted = false;
                    highlight.style.setProperty('--highlight-progress', '0%');
                }
            });
        }

        window.addEventListener('scroll', updateHighlights);
        requestAnimationFrame(() => {
            updateHighlights();
        });

        // Theme Toggle
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;
        const icon = themeToggle.querySelector('i');

        const currentTheme = readTheme();
        body.setAttribute('data-theme', currentTheme);
        updateIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            const theme = body.getAttribute('data-theme');
            const newTheme = theme === 'light' ? 'dark' : 'light';

            body.setAttribute('data-theme', newTheme);
            try { localStorage.setItem('theme', newTheme); } catch {}
            updateIcon(newTheme);
        });

        function updateIcon(theme) {
            if (theme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }

        // Smooth Scroll for Navigation
        function navigateToSection(targetSection) {
            let settled = false;
            let fallback;
            const settle = () => {
                if (settled) return;
                settled = true;
                clearTimeout(fallback);
                window.removeEventListener('scrollend', settle);
                targetSection.scrollIntoView({ behavior: 'instant', block: 'start' });
            };
            window.addEventListener('scrollend', settle, { once: true });
            fallback = setTimeout(settle, 1100);
            targetSection.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
        }
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    history.replaceState(null, '', targetId);
                    navigateToSection(targetSection);
                }
            });
        });

        // Smart Navbar Scroll
        const navbar = document.querySelector('.navbar');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Smart hide/show navbar
            if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down & past threshold - hide navbar
                navbar.classList.add('navbar-hidden');
            } else if (currentScroll < lastScroll) {
                // Scrolling up - show navbar
                navbar.classList.remove('navbar-hidden');
            }

            // Active link highlighting
            const sections = document.querySelectorAll('section[id]');
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });

            lastScroll = currentScroll;
        });

        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.section:not(#experience), .skill-box').forEach(el => {
            observer.observe(el);
        });

        // Matrix Typing Effect for Hero Greeting
        const greetingElement = document.getElementById('hero-greeting');
        const finalText = 'Hi there! 👋';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

        function matrixTypingEffect() {
            let iterations = 0;
            const interval = setInterval(() => {
                greetingElement.textContent = finalText
                    .split('')
                    .map((char, index) => {
                        if (index < iterations) {
                            return finalText[index];
                        }
                        if (char === ' ' || char === '👋') {
                            return char;
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');

                if (iterations >= finalText.length) {
                    clearInterval(interval);
                }

                iterations += 1/3;
            }, 50);
        }

        // Start the effect after a short delay
        if (!reduceMotion.matches) setTimeout(matrixTypingEffect, 500);

        // Progress Bar Functionality
        const progressBarFill = document.querySelector('.progress-bar-fill');
        const checkpoints = document.querySelectorAll('.checkpoint');

        function updateProgressBar() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / documentHeight) * 100;

            progressBarFill.style.width = progress + '%';

            // Update active checkpoint based on scroll position
            const sections = ['hero', 'about', 'experience', 'skills', 'contact'];
            let activeIndex = 0;

            sections.forEach((sectionId, index) => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
                        activeIndex = index;
                    }
                }
            });

            checkpoints.forEach((checkpoint, index) => {
                if (index <= activeIndex) {
                    checkpoint.classList.add('active');
                } else {
                    checkpoint.classList.remove('active');
                }
            });
        }

        // Checkpoint click handlers
        checkpoints.forEach(checkpoint => {
            checkpoint.addEventListener('click', () => {
                const sectionId = checkpoint.getAttribute('data-section');
                const section = document.getElementById(sectionId);
                if (section) {
                    navigateToSection(section);
                }
            });
        });

        window.addEventListener('scroll', updateProgressBar);
        window.addEventListener('resize', updateProgressBar);
        updateProgressBar();

    
        function readTheme() { try { return localStorage.getItem('theme') || 'light'; } catch { return 'light'; } }
        const menuButton = document.querySelector('.menu-toggle');
        const mobileMenu = document.querySelector('#mobile-menu');
        const closeMenu = () => { mobileMenu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); };
        menuButton.addEventListener('click', () => { const opening = mobileMenu.hidden; mobileMenu.hidden = !opening; menuButton.setAttribute('aria-expanded', String(opening)); menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation'); });
        mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuButton.focus(); } });
        // Hash destinations remain valid on reload and when arriving from another page.
        window.addEventListener('load', () => {
            document.querySelector('.loader-overlay').classList.add('hidden');
            const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
            if (target) requestAnimationFrame(() => navigateToSection(target));
        });


