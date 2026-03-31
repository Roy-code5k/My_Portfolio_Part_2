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

    // 3. Project Card Click Handlers
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.style.cursor = 'pointer';

        card.addEventListener('click', (e) => {
            // Don't trigger if user clicked on a link directly
            if (e.target.tagName === 'A') return;

            const liveLink = card.querySelector('a[href*="http"]:not([href*="github"])');
            const githubLink = card.querySelector('a[href*="github"]');

            // Prefer Live link, fallback to GitHub
            const targetLink = liveLink || githubLink;

            if (targetLink) {
                window.open(targetLink.href, '_blank');
            }
        });
    });

    // 4. Interactive Fluid Gradient Animation (Original section 3, now 4)
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Orb {
            constructor(color) {
                this.radius = (Math.random() * 150) + 200; // Extra large for liquid feel
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // Base velocity
                this.dx = (Math.random() - 0.5) * 1.5;
                this.dy = (Math.random() - 0.5) * 1.5;
                this.color = color;

                // For organic pulse
                this.baseRadius = this.radius;
                this.angle = Math.random() * Math.PI * 2;
                this.pulseSpeed = 0.02;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();
            }

            update() {
                // Organic movement (pulse size)
                this.angle += this.pulseSpeed;
                this.radius = this.baseRadius + Math.sin(this.angle) * 20;

                // Mouse Interaction (Liquid Repulsion)
                // Calculate distance to mouse
                const dxMouse = mouseX - this.x;
                const dyMouse = mouseY - this.y;
                const distance = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                const interactionRadius = 400;

                if (distance < interactionRadius) {
                    // Move away from mouse
                    const forceDirectionX = dxMouse / distance;
                    const forceDirectionY = dyMouse / distance;
                    const force = (interactionRadius - distance) / interactionRadius;
                    const directionX = forceDirectionX * force * 3; // Push strength
                    const directionY = forceDirectionY * force * 3;

                    this.x -= directionX;
                    this.y -= directionY;
                }

                // Bounce off walls
                if (this.x + this.radius > canvas.width) this.dx = -Math.abs(this.dx);
                if (this.x - this.radius < 0) this.dx = Math.abs(this.dx);
                if (this.y + this.radius > canvas.height) this.dy = -Math.abs(this.dy);
                if (this.y - this.radius < 0) this.dy = Math.abs(this.dy);

                // Constant ambient movement
                this.x += this.dx;
                this.y += this.dy;

                this.draw();
            }
        }

        let orbs = [];
        function init() {
            orbs = [];
            // Create theme-colored liquid blobs
            orbs.push(new Orb('#FF2E63')); // Pink
            orbs.push(new Orb('#FF9F1C')); // Orange
            orbs.push(new Orb('#FF2E63')); // Pink
            orbs.push(new Orb('#FF9F1C')); // Orange
            orbs.push(new Orb('#6C1BF9')); // Deep Purple accent for depth
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Screen blend mode for glowing look
            ctx.globalCompositeOperation = 'screen';

            for (let i = 0; i < orbs.length; i++) {
                orbs[i].update();
            }

            ctx.globalCompositeOperation = 'source-over';
        }

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        });

        init();
        animate();
    }

    // 5. Name Scramble/Glitch Effect (Hrituraj Roy)
    const firstName = document.getElementById('name-text');
    const surname = document.getElementById('surname-text');
    const headerName = document.getElementById('header-name');

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

});
