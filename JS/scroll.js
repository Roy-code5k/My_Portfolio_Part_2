/* ==========================================
   SCROLL HERO — "I am a ___"
   Discrete step-based scrolling:
   Each wheel event reveals exactly ONE word.
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const scrollHero = document.querySelector(".scroll-hero");
    const heroItems = document.querySelectorAll(".hero-item");

    if (!scrollHero || !heroItems.length) return;

    const count = heroItems.length;
    let currentIndex = 0;
    let locked = false;
    let cooldown = false;

    /* ── Helpers ── */

    function setActive(i) {
        heroItems.forEach(el => el.classList.remove("active"));
        heroItems[i].classList.add("active");
        currentIndex = i;
    }

    function centerOnItem(i) {
        const el = heroItems[i];
        const elTop = el.getBoundingClientRect().top + window.scrollY;
        const target = elTop - (window.innerHeight / 2) + (el.offsetHeight / 2);
        window.scrollTo({ top: target, behavior: "smooth" });
    }

    function heroIsVisible() {
        const r = scrollHero.getBoundingClientRect();
        return r.top < window.innerHeight * 0.7 &&
            r.bottom > window.innerHeight * 0.3;
    }

    function findClosestItem() {
        const vc = window.innerHeight / 2;
        let bestI = 0;
        let bestD = Infinity;
        heroItems.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const d = Math.abs(rect.top + rect.height / 2 - vc);
            if (d < bestD) { bestD = d; bestI = i; }
        });
        return bestI;
    }

    /* ── Activate first item on load ── */
    setActive(0);

    /* ── Wheel Event: discrete stepping ── */
    window.addEventListener("wheel", (e) => {
        // Disable custom snapping wheel controls on mobile/tablet to prevent scroll freezing
        if (window.innerWidth <= 768) return;

        /* Outside the section → release control */
        if (!heroIsVisible()) {
            locked = false;
            return;
        }

        /* During cooldown, block scroll but don't step */
        if (cooldown) {
            e.preventDefault();
            return;
        }

        const down = e.deltaY > 0;

        /* First contact with section → snap to nearest item */
        if (!locked) {
            locked = true;
            const nearest = findClosestItem();
            setActive(nearest);
        }

        /* Calculate next index */
        const next = down ? currentIndex + 1 : currentIndex - 1;

        /* Boundary: release scroll so user can leave section */
        if (next < 0 || next >= count) {
            locked = false;
            return;
        }

        /* Intercept scroll and step one word */
        e.preventDefault();
        cooldown = true;

        setActive(next);
        centerOnItem(next);

        /* Cooldown prevents rapid-fire skipping */
        setTimeout(() => { cooldown = false; }, 100);

    }, { passive: false });

    // /* ── Mobile Touch Scroll Highlights ── */
    window.addEventListener("scroll", () => {
        if (window.innerWidth <= 768) {
            if (heroIsVisible()) {
                const nearest = findClosestItem();
                setActive(nearest);
            }
        }
    }, { passive: true });

});