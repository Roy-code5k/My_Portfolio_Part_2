window.initSaturn = function () {
    // Check for prefers-reduced-motion configuration
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Retrieve Saturn System DOM Elements
    const journeySpace = document.querySelector('.journey-space');
    const canvas = document.querySelector('.journey-stars-canvas');
    const saturnWrapper = document.querySelector('.saturn-wrapper');
    const planet = document.querySelector('.planet');
    const glow = document.querySelector('.glow');
    const moon = document.querySelector('.moon');
    const highlight = document.querySelector('.planet-highlight');
    const rings = document.querySelectorAll('.ring');

    if (!journeySpace || !canvas || !saturnWrapper || !planet || !glow || !moon || !highlight || rings.length === 0) {
        return; // Guard statement: elements not present
    }

    const ctx = canvas.getContext('2d');

    // Central Saturn State Object
    const saturnState = {
        rotation: 0,
        ringRotation: 0,
        moonAngle: 0,
        glowIntensity: 0.5,
        planetScale: 0.9,
        planetTilt: 0,
        mouseX: 0,
        mouseY: 0,
        targetX: 0,
        targetY: 0,
        scrollProgress: 0
    };

    // Parallax and Twinkling Star Definitions
    const stars = [];
    const numStars = 40;
    const dust = [];
    const numDust = 15;

    // Reset a specific cosmic dust particle properties
    function resetDustParticle(index) {
        dust[index] = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.0 - 0.5, // Drift upwards faster
            size: Math.random() * 1.5 + 0.8,
            opacity: 10,
            maxOpacity: Math.random() * 0.3 + 0.1,
            fadeSpeed: Math.random() * 0.008 + 0.003,
            fadeIn: true
        };
    }

    // Initialize stars and cosmic dust
    function initStarsAndDust() {
        stars.length = 0;
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5 + 0.8,
                baseOpacity: Math.random() * 0.4 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2,
                depth: Math.random() * 1.5 + 0.5 // Star depth index for parallax multiplier
            });
        }

        dust.length = 0;
        for (let i = 0; i < numDust; i++) {
            resetDustParticle(i);
        }
    }

    // Centered window offsets
    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;

    // Update screen-centric lighting and coordinates target
    window.addEventListener('mousemove', (e) => {
        saturnState.targetX = (e.clientX - centerX) / (window.innerWidth / 2);
        saturnState.targetY = (e.clientY - centerY) / (window.innerHeight / 2);
    });

    // Resize Handler
    const handleResize = () => {
        centerX = window.innerWidth / 2;
        centerY = window.innerHeight / 2;
        canvas.width = journeySpace.clientWidth;
        canvas.height = journeySpace.clientHeight;
        initStarsAndDust();
    };

    window.addEventListener('resize', handleResize);

    // Initial positioning calibration
    handleResize();

    // Central Render Pipeline
    const render = () => {
        // 1. Read Shared Timeline Progress from window object
        const progress = window.timelineDrawProgress || 0;
        saturnState.scrollProgress = progress;

        // 2. Lerp Mouse Target Coordinates (Smoothing like outline cursor)
        saturnState.mouseX += (saturnState.targetX - saturnState.mouseX) * 0.04;
        saturnState.mouseY += (saturnState.targetY - saturnState.mouseY) * 0.04;

        // 3. Update Scale & Rotation (Scroll triggered)
        if (!prefersReducedMotion) {
            // Planet Scale ranges 0.9 (start) -> 1.0 (middle) -> 1.08 (end)
            if (progress <= 0.5) {
                const t = progress / 0.5; // Normalized to 0-1
                saturnState.planetScale = 0.9 + t * 0.08;
            } else {
                const t = (progress - 0.5) / 0.5; // Normalized to 0-1
                saturnState.planetScale = 1.0 + t * 0.08;
            }
        } else {
            saturnState.planetScale = 1.0;
        }

        // Tilted left: wrapper is rotated by -25deg
        saturnState.planetTilt = 23;

        // Apply dynamic scale and tilt
        saturnWrapper.style.transform = `translate(-50%, -50%) scale(${saturnState.planetScale}) rotate(${saturnState.planetTilt}deg)`;

        // Continuous X-axis rotation of the planet texture (slides vertically) - frozen at current position
        if (!prefersReducedMotion) {
            const texture = planet.querySelector('.planet-texture');
            if (texture) {
                // Shift vertically modulo 48px to loop seamlessly - static shift
                const shift = (saturnState.rotation * 620) % 48;
                texture.style.transform = `rotate(25deg) translateY(${shift}px)`;
            }
        }

        // 4. Update Ring Oscillation & Spin Rotation - frozen at current position
        const ringTiltZ = 0; // Relative to the wrapper, making it parallel to the planet's bands (which are rotated by -25deg with the wrapper)
        rings.forEach(ring => {
            ring.style.setProperty('--ring-tilt-z', `${ringTiltZ}deg`);
            ring.style.setProperty('--ring-spin', `0deg`);
        });

        // 5. Move Moon Orbit (Projected 3D coordinates & relative z-index logic)
        // Timeline integration: Moon wakes up and orbits starting in middle phase (progress >= 0.35)
        if (progress >= 0.35) {
            moon.classList.add('active');
            if (!prefersReducedMotion) {
                saturnState.moonAngle += 0.020; // Orbit speed parameter
            }

            // Sync orbit radius to planet bounding client rectangle width
            const planetRect = planet.getBoundingClientRect();
            const orbitRadiusX = planetRect.width * 0.75;
            const orbitRadiusY = planetRect.width * 0.75;

            const localX = Math.cos(saturnState.moonAngle) * orbitRadiusX;
            const localY = Math.sin(saturnState.moonAngle) * orbitRadiusY;

            // Screen-space horizontal orbit (0deg tilt, 75deg vertical compression)
            let screenX = localX;
            let screenY = localY * Math.cos(75 * Math.PI / 180);

            // Rotate screen-space coordinates back to wrapper-space to cancel wrapper's -25deg tilt
            const tiltRad = -saturnState.planetTilt * Math.PI / 180;
            let rx = screenX * Math.cos(tiltRad) - screenY * Math.sin(tiltRad);
            let ry = screenX * Math.sin(tiltRad) + screenY * Math.cos(tiltRad);

            moon.style.transform = `translate(calc(-50% + ${rx}px), calc(-50% + ${ry}px)) scale(1) rotate(${-saturnState.planetTilt}deg)`;

            // Dynamically set Z-Index depending on orbit position relative to the sphere boundary
            if (Math.sin(saturnState.moonAngle) < 0) {
                moon.style.zIndex = 3; // Orbiting behind planet (zIndex matches back ring)
            } else {
                moon.style.zIndex = 6; // Orbiting in front (zIndex wraps front rings)
            }
        } else {
            moon.classList.remove('active');
            moon.style.transform = `translate(-50%, -50%) scale(0)`;
        }

        // 6. Update Lighting Highlight Position (Shift highlight based on mouse offset)
        const lightX = 30 + saturnState.mouseX * 20;
        const lightY = 30 + saturnState.mouseY * 20;
        highlight.style.setProperty('--light-x', `${lightX}%`);
        highlight.style.setProperty('--light-y', `${lightY}%`);


        // 8. Render Parallax Stars (Clear, twinkle, draw)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            if (!prefersReducedMotion) {
                star.twinklePhase += star.twinkleSpeed;
            }
            const opacity = Math.max(0.1, Math.min(1.0, star.baseOpacity + Math.sin(star.twinklePhase) * 0.25));

            // Wrap coordinates horizontally and vertically with mouse parallax
            const drawX = (star.x - saturnState.mouseX * 35 * star.depth + canvas.width) % canvas.width;
            const drawY = (star.y - saturnState.mouseY * 35 * star.depth + canvas.height) % canvas.height;

            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // 9. Render Cosmic Dust (Clear, drift, fade, wrap, draw)
        dust.forEach((particle, index) => {
            if (!prefersReducedMotion) {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.fadeIn) {
                    particle.opacity += particle.fadeSpeed;
                    if (particle.opacity >= particle.maxOpacity) {
                        particle.opacity = particle.maxOpacity;
                        particle.fadeIn = false;
                    }
                } else {
                    particle.opacity -= particle.fadeSpeed;
                    if (particle.opacity <= 0) {
                        resetDustParticle(index);
                    }
                }
            } else {
                particle.opacity = particle.maxOpacity;
            }

            // Boundary wrap check
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;

            const drawX = (particle.x - saturnState.mouseX * 12 + canvas.width) % canvas.width;
            const drawY = (particle.y - saturnState.mouseY * 12 + canvas.height) % canvas.height;

            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(drawX, drawY, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // 10. Loop (requestAnimationFrame)
        requestAnimationFrame(render);
    };

    // Initialize Render Pipeline
    requestAnimationFrame(render);
};
