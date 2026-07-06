/* ==========================================
   SCROLL HERO — "I am a ___"
   Minimal runtime: sets CSS custom properties
   and highlights the active word on scroll.
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const heroItems = document.querySelectorAll(".hero-item");

    if (!heroItems.length) return;

    let activeIndex = -1;

    function updateActiveItem() {

        const viewportCenter = window.innerHeight / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        heroItems.forEach((item, index) => {

            const rect = item.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const distance = Math.abs(itemCenter - viewportCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }

        });

        if (closestIndex !== activeIndex) {

            heroItems.forEach((item) => {
                item.classList.remove("active");
            });

            heroItems[closestIndex].classList.add("active");
            activeIndex = closestIndex;

        }

    }

    function animate() {
        updateActiveItem();
        requestAnimationFrame(animate);
    }

    animate();

});