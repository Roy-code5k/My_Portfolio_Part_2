/**
 * ============================================================
 * BENTO TILE INTRO ANIMATION
 * ============================================================
 */

window.initTiles = function () {

    // Prevent duplicate initialization
    if (window.tilesInitialized) return;
    window.tilesInitialized = true;

    const tiles = document.querySelectorAll(".bento-tile");

    if (!tiles.length) return;

    tiles.forEach((tile, index) => {

        // Reset (useful if reused later)
        tile.style.opacity = "0";
        tile.style.transform = "translateY(30px)";

        setTimeout(() => {

            tile.style.transition =
                "opacity 0.8s ease, transform 0.8s cubic-bezier(.22,.61,.36,1)";

            tile.style.opacity = "1";
            tile.style.transform = "translateY(0)";

        }, index * 150);

    });

};