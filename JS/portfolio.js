/**
 * ============================================================
 * PORTFOLIO INITIALIZER
 * Author : Hrituraj Roy
 * ============================================================
 */

window.portfolioStarted = false;

window.startPortfolio = function () {

    // Prevent multiple initializations
    if (window.portfolioStarted) return;
    window.portfolioStarted = true;

    console.log("%c🚀 Portfolio Started",
        "color:#ff4d8d;font-size:14px;font-weight:bold;"
    );

    // Cursor
    if (typeof initCursor === "function") {
        initCursor();
    }

    // Bento Tile Intro Animation
    if (typeof initTiles === "function") {
        initTiles();
    }

    // Hero Name Animation
    if (typeof initNameScramble === "function") {
        initNameScramble();
    }

    // View Counter
    if (typeof initViewCounter === "function") {
        initViewCounter();
    }

    // Profile Lightbox
    if (typeof initLightbox === "function") {
        initLightbox();
    }

    // Journey Timeline
    if (typeof initTimeline === "function") {
        initTimeline();
    }

    // Saturn Animation
    if (typeof initSaturn === "function") {
        initSaturn();
    }

};