document.addEventListener('DOMContentLoaded', () => {
    // 1. Custom Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0, outlineY = 0;

    // Particle Trail System
    let particleCount = 0;
    const maxParticles = 50;

    function createParticle(x, y) {
        if (particleCount >= maxParticles) return;

        const particle = document.createElement('div');
        particle.className = 'cursor-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        document.body.appendChild(particle);
        particleCount++;

        setTimeout(() => {
            particle.remove();
            particleCount--;
        }, 800);
    }

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;

            // Create particle trail
            createParticle(e.clientX, e.clientY);
        });

        // Smooth cursor outline animation
        function animateOutline() {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;

            cursorOutline.style.left = outlineX + 'px';
            cursorOutline.style.top = outlineY + 'px';

            requestAnimationFrame(animateOutline);
        }
        animateOutline();
    }

    // 2. Staggered Animation for Tiles
    const tiles = document.querySelectorAll('.bento-tile');
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.style.opacity = '1';
            tile.style.transform = 'translateY(0)';
        }, index * 150);
    });



    // 5. Name Scramble/Glitch Effect (Hrituraj Roy)
    const firstName = document.getElementById('name-text');
    const surname = document.getElementById('surname-text');


    if (firstName && surname) {
        // Aesthetic tech characters (Katakana + Glyphs)
        const randomChars = "XYZ0123456789/<>[]{}—=+*^?#________";

        const scrambleElement = (element, originalText) => {
            let iterations = 0;

            const interval = setInterval(() => {
                element.innerText = originalText
                    .split("")
                    .map((letter, index) => {
                        // If we've passed this index, show the real letter
                        if (index < iterations) {
                            return originalText[index];
                        }
                        // Otherwise show a random cool character
                        return randomChars[Math.floor(Math.random() * randomChars.length)];
                    })
                    .join("");

                // Stop when done
                if (iterations >= originalText.length) {
                    clearInterval(interval);
                    element.innerText = originalText;
                }

                // Tuned speed: slow start, then accelerates
                iterations += 1 / 3;
            }, 30); // Faster update rate (30ms) for smoother scramble
        }

        const triggerScramble = () => {
            // Reveal text container
            firstName.style.opacity = '1';
            surname.style.opacity = '1';

            // Stagger animations slightly for 'flowing' feel
            scrambleElement(firstName, "Hrituraj");
            setTimeout(() => {
                scrambleElement(surname, "Roy");
            }, 100);
        };

        // Run on load with start delay
        setTimeout(triggerScramble, 800);
    }

    // 6. View Counter Logic
    const viewCountElement = document.getElementById('view-count');
    if (viewCountElement) {
        fetch('https://api.counterapi.dev/v1/hrituraj_roy/portfolio/up')
            .then(response => response.json())
            .then(data => {
                const count = data.count || data.value || 0;

                // Animate counting up
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsedTime = currentTime - startTime;
                    const progress = Math.min(elapsedTime / duration, 1);

                    // easeOutQuart
                    const easeOut = 1 - Math.pow(1 - progress, 4);
                    const currentDisplay = Math.floor(easeOut * count);

                    viewCountElement.innerText = currentDisplay.toLocaleString();

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        viewCountElement.innerText = count.toLocaleString();
                    }
                }

                requestAnimationFrame(updateCounter);
            })
            .catch(err => {
                console.error('Error fetching view count:', err);
                viewCountElement.innerText = "---";
            });
    }
    // 7. Profile Lightbox
    const profileTrigger = document.getElementById('profile-trigger');
    const lightbox = document.getElementById('profile-lightbox');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');

    if (profileTrigger && lightbox) {
        profileTrigger.addEventListener('click', () => {
            lightbox.classList.add('active');
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
        };

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxBackdrop.addEventListener('click', closeLightbox);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    // 8. Timeline Animations
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineSvg = document.getElementById('timeline-svg');
    const timelinePath = document.getElementById('timeline-path');
    const timelineContainer = document.getElementById('journey-timeline');

    if (timelineItems.length > 0 && timelineSvg && timelinePath) {
        let currentDrawLength = 0;
        let targetDrawLength = 0;

        // Intersection Observer for slide-in cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('hidden');
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -100px 0px' });
        timelineItems.forEach((item) => {
            observer.observe(item);
        });

        // Draw SVG straight line connecting dots
        const drawCurve = () => {
            if (!timelineContainer) return;
            const containerRect = timelineContainer.getBoundingClientRect();

            // Set SVG size
            timelineSvg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);

            // Calculate perfect center line for X coordinate to bypass animation translation offsets
            const centerX = containerRect.width / 2;

            // Get all dots positions relative to container (centered vertically on each card/item)
            const dots = Array.from(timelineItems).map(item => {
                const rect = item.getBoundingClientRect();
                return {
                    x: centerX,
                    y: rect.top - containerRect.top + (rect.height / 2)
                };
            });

            if (dots.length < 2) return;

            // Generate straight vertical line path exactly from first dot to last dot
            let pathD = `M ${dots[0].x} ${dots[0].y}`;
            for (let i = 1; i < dots.length; i++) {
                pathD += ` L ${dots[i].x} ${dots[i].y + 55}`;
            }

            timelinePath.setAttribute('d', pathD);

            // Position the SVG circles and store their relative Y position
            const circles = timelineSvg.querySelectorAll('.timeline-circle');
            dots.forEach((dot, index) => {
                if (circles[index]) {
                    circles[index].setAttribute("cx", dot.x);
                    circles[index].setAttribute("cy", dot.y);
                    circles[index].dataset.y = dot.y;
                }
            });

            // Setup dash array for drawing animation
            const pathLength = timelinePath.getTotalLength();
            timelinePath.style.strokeDasharray = pathLength;
            timelinePath.style.strokeDashoffset = pathLength;
        };

        // Scroll event to calculate target draw length
        const animateLine = () => {
            const pathLength = timelinePath.getTotalLength();
            if (pathLength === 0) return; // not drawn yet

            const rect = timelineContainer.getBoundingClientRect();
            // Calculate how far we've scrolled past the top of the container
            const scrollPercent = (window.innerHeight - rect.top) / (rect.height + window.innerHeight / 2);

            targetDrawLength = pathLength * scrollPercent;
            // Clamp target between 0 and pathLength
            targetDrawLength = Math.max(0, Math.min(pathLength, targetDrawLength));
        };

        // Easing animation loop to chase targetDrawLength (Lerping)
        const animateTimeline = () => {
            const pathLength = timelinePath.getTotalLength();
            if (pathLength === 0) {
                requestAnimationFrame(animateTimeline);
                return;
            }

            currentDrawLength += (targetDrawLength - currentDrawLength) * 0.05;
            timelinePath.style.strokeDashoffset = pathLength - currentDrawLength;

            // Expose draw progress globally for the Saturn system integration
            window.timelineDrawProgress = pathLength > 0 ? (currentDrawLength / pathLength) : 0;

            // Use SVG geometry to find current draw coordinates (glowing tip of the line)
            const point = timelinePath.getPointAtLength(currentDrawLength);

            // Move the line head (glowing energy ball)
            const head = document.getElementById('line-head');
            if (head) {
                head.setAttribute("cx", point.x);
                head.setAttribute("cy", point.y);
                if (currentDrawLength > 2) {
                    head.classList.add('active');
                } else {
                    head.classList.remove('active');
                }
            }

            // Animate dynamic circles when the line reaches them
            const circles = timelineSvg.querySelectorAll('.timeline-circle');
            circles.forEach(circle => {
                const dotY = parseFloat(circle.dataset.y || 0);
                if (point.y >= dotY) {
                    circle.classList.add('active');
                } else {
                    circle.classList.remove('active');
                }
            });

            requestAnimationFrame(animateTimeline);
        };

        // Debounce resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                drawCurve();
                animateLine();
            }, 100);
        });

        // Initialize
        setTimeout(() => {
            drawCurve();
            animateLine();
        }, 100);

        // Start animation loop
        animateTimeline();

        window.addEventListener('scroll', animateLine, { passive: true });
    }

});
