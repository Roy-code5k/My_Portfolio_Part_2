/**
 * ============================================================
 * PORTFOLIO VIEW COUNTER
 * ============================================================
 */

window.initViewCounter = function () {

    // Prevent duplicate initialization
    if (window.counterInitialized) return;
    window.counterInitialized = true;

    const counter = document.getElementById("view-count");

    if (!counter) return;

    const API_URL =
        "https://api.counterapi.dev/v1/hrituraj_roy/portfolio/up";

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {

            const totalViews = data.count || data.value || 0;

            animateCounter(totalViews);

        })
        .catch(error => {

            console.error("View Counter Error:", error);

            counter.textContent = "---";

        });

    /**
     * ============================================
     * Counter Animation
     * ============================================
     */

    function animateCounter(finalValue) {

        const duration = 1800;

        const start = performance.now();

        function update(time) {

            const elapsed = time - start;

            const progress = Math.min(elapsed / duration, 1);

            // Ease Out Quart
            const eased = 1 - Math.pow(1 - progress, 4);

            const currentValue = Math.floor(eased * finalValue);

            counter.textContent = currentValue.toLocaleString();

            if (progress < 1) {

                requestAnimationFrame(update);

            } else {

                counter.textContent = finalValue.toLocaleString();

            }

        }

        requestAnimationFrame(update);

    }

};