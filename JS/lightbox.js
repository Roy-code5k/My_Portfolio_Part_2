/**
 * ============================================================
 * PROFILE LIGHTBOX
 * ============================================================
 */

window.initLightbox = function () {

    // Prevent duplicate initialization
    if (window.lightboxInitialized) return;
    window.lightboxInitialized = true;

    const profileTrigger = document.getElementById("profile-trigger");
    const lightbox = document.getElementById("profile-lightbox");
    const backdrop = document.getElementById("lightbox-backdrop");
    const closeBtn = document.getElementById("lightbox-close");

    if (!profileTrigger || !lightbox) return;

    /**
     * ============================================
     * Open
     * ============================================
     */

    function openLightbox() {

        lightbox.classList.add("active");

        document.body.style.overflow = "hidden";

    }

    /**
     * ============================================
     * Close
     * ============================================
     */

    function closeLightbox() {

        lightbox.classList.remove("active");

        document.body.style.overflow = "";

    }

    /**
     * ============================================
     * Events
     * ============================================
     */

    profileTrigger.addEventListener("click", openLightbox);

    if (backdrop) {
        backdrop.addEventListener("click", closeLightbox);
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeLightbox);
    }

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            lightbox.classList.contains("active")
        ) {
            closeLightbox();
        }

    });

};