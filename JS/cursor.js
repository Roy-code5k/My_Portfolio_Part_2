/**
 * ============================================================
 * CUSTOM CURSOR
 * ============================================================
 */

window.initCursor = function () {

    // Prevent duplicate initialization
    if (window.cursorInitialized) return;
    window.cursorInitialized = true;

    const cursorDot = document.querySelector(".cursor-dot");
    const cursorOutline = document.querySelector(".cursor-outline");

    if (!cursorDot || !cursorOutline) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let outlineX = mouseX;
    let outlineY = mouseY;

    let particleCount = 0;
    const MAX_PARTICLES = 40;

    /**
     * ============================================
     * Particle Trail
     * ============================================
     */

    function createParticle(x, y) {

        if (document.body.classList.contains("is-loading")) return;

        if (particleCount >= MAX_PARTICLES) return;

        const particle = document.createElement("div");

        particle.className = "cursor-particle";

        particle.style.left = x + "px";
        particle.style.top = y + "px";

        document.body.appendChild(particle);

        particleCount++;

        setTimeout(() => {

            particle.remove();

            particleCount--;

        }, 700);

    }

    /**
     * ============================================
     * Mouse Move
     * ============================================
     */

    window.addEventListener("mousemove", (e) => {

        mouseX = e.clientX;
        mouseY = e.clientY;

        cursorDot.style.left = mouseX + "px";
        cursorDot.style.top = mouseY + "px";

        createParticle(mouseX, mouseY);

    });

    /**
     * ============================================
     * Smooth Outline
     * ============================================
     */

    function animateCursor() {

        outlineX += (mouseX - outlineX) * 0.16;
        outlineY += (mouseY - outlineY) * 0.16;

        cursorOutline.style.left = outlineX + "px";
        cursorOutline.style.top = outlineY + "px";

        requestAnimationFrame(animateCursor);

    }

    animateCursor();

    /**
     * ============================================
     * Click Effect
     * ============================================
     */

    window.addEventListener("mousedown", () => {

        cursorDot.classList.add("cursor-click");

        cursorOutline.classList.add("cursor-click");

    });

    window.addEventListener("mouseup", () => {

        cursorDot.classList.remove("cursor-click");

        cursorOutline.classList.remove("cursor-click");

    });

    /**
     * ============================================
     * Cursor Hidden
     * ============================================
     */

    document.addEventListener("mouseleave", () => {

        cursorDot.style.opacity = "0";

        cursorOutline.style.opacity = "0";

    });

    document.addEventListener("mouseenter", () => {

        cursorDot.style.opacity = "1";

        cursorOutline.style.opacity = "1";

    });

};