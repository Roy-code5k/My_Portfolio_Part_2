/**
 * ============================================================
 * JOURNEY TIMELINE
 * ============================================================
 */

window.initTimeline = function () {

    if (window.timelineInitialized) return;
    window.timelineInitialized = true;

    const timelineItems = document.querySelectorAll(".timeline-item");
    const timelineSvg = document.getElementById("timeline-svg");
    const timelinePath = document.getElementById("timeline-path");
    const timelineContainer = document.getElementById("journey-timeline");

    if (
        timelineItems.length === 0 ||
        !timelineSvg ||
        !timelinePath ||
        !timelineContainer
    ) {
        return;
    }

    let currentDrawLength = 0;
    let targetDrawLength = 0;

    /* ===========================================
       CARD OBSERVER
    =========================================== */

    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {
                    entry.target.classList.remove("hidden");
                }

            });

        },
        {
            threshold: 0.2,
            rootMargin: "0px 0px -100px 0px"
        }
    );

    timelineItems.forEach(item => observer.observe(item));

    const projectCards = document.querySelectorAll(".project-card");
    projectCards.forEach(card => observer.observe(card));

    /* ===========================================
       DRAW SVG PATH
    =========================================== */

    function drawCurve() {

        const containerRect =
            timelineContainer.getBoundingClientRect();

        timelineSvg.setAttribute(
            "viewBox",
            `0 0 ${containerRect.width} ${containerRect.height}`
        );

        const centerX = containerRect.width / 2;

        const dots = Array.from(timelineItems).map(item => {

            const rect = item.getBoundingClientRect();

            return {

                x: centerX,

                y:
                    rect.top -
                    containerRect.top +
                    rect.height / 2

            };

        });

        if (dots.length < 2) return;

        let path = `M ${dots[0].x} ${dots[0].y}`;

        for (let i = 1; i < dots.length; i++) {

            path += ` L ${dots[i].x} ${dots[i].y + 3}`;

        }

        timelinePath.setAttribute("d", path);

        const circles =
            timelineSvg.querySelectorAll(".timeline-circle");

        dots.forEach((dot, index) => {

            if (!circles[index]) return;

            circles[index].setAttribute("cx", dot.x);
            circles[index].setAttribute("cy", dot.y);

            circles[index].dataset.y = dot.y;

        });

        const pathLength = timelinePath.getTotalLength();

        timelinePath.style.strokeDasharray = pathLength;
        timelinePath.style.strokeDashoffset = pathLength;

    }
    /* ===========================================
   SCROLL PROGRESS
=========================================== */

    function animateLine() {

        const pathLength = timelinePath.getTotalLength();

        if (pathLength === 0) return;

        const rect = timelineContainer.getBoundingClientRect();

        const scrollPercent =
            (window.innerHeight - rect.top) /
            (rect.height + window.innerHeight / 2);

        targetDrawLength = pathLength * scrollPercent;

        targetDrawLength = Math.max(
            0,
            Math.min(pathLength, targetDrawLength)
        );

    }

    /* ===========================================
       DRAW ANIMATION LOOP
    =========================================== */

    function animateTimeline() {

        const pathLength = timelinePath.getTotalLength();

        if (pathLength === 0) {

            requestAnimationFrame(animateTimeline);

            return;

        }

        currentDrawLength +=
            (targetDrawLength - currentDrawLength) * 0.05;

        timelinePath.style.strokeDashoffset =
            pathLength - currentDrawLength;

        /*
         * Shared progress for Saturn
         */

        window.timelineDrawProgress =
            pathLength > 0
                ? currentDrawLength / pathLength
                : 0;

        /*
         * Energy Ball
         */

        const point =
            timelinePath.getPointAtLength(currentDrawLength);

        const head =
            document.getElementById("line-head");

        if (head) {

            head.setAttribute("cx", point.x);

            head.setAttribute("cy", point.y);

            if (currentDrawLength > 2) {

                head.classList.add("active");

            } else {

                head.classList.remove("active");

            }

        }

        /*
         * Activate Timeline Dots
         */

        const circles =
            timelineSvg.querySelectorAll(".timeline-circle");

        circles.forEach(circle => {

            const dotY =
                parseFloat(circle.dataset.y || 0);

            if (point.y >= dotY) {

                circle.classList.add("active");

            } else {

                circle.classList.remove("active");

            }

        });

        requestAnimationFrame(animateTimeline);

    }

    /* ===========================================
       RESIZE
    =========================================== */

    let resizeTimeout;

    window.addEventListener("resize", () => {

        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {

            drawCurve();

            animateLine();

        }, 100);

    });

    /* ===========================================
       INITIALIZE
    =========================================== */

    setTimeout(() => {

        drawCurve();

        animateLine();

    }, 100);

    animateTimeline();

    window.addEventListener(
        "scroll",
        animateLine,
        {
            passive: true
        }
    );

};