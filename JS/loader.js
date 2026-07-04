/**
 * ============================================================
 * CINEMATIC PORTFOLIO LOADER
 * Author : Hrituraj Roy
 * ============================================================
 */

document.body.classList.add("loading");

gsap.config({
    trialWarn: false
});

/* ============================================================
   DOM CACHE
============================================================ */

const loader = document.getElementById("loader");

const loaderText = document.getElementById("loader-status-text");

const loaderFlash = document.querySelector(".loader-flash");

const loaderTop = document.querySelector(".loader-top");

const loaderBottom = document.querySelector(".loader-bottom");

const toggle = document.getElementById("toggle");

const mainSVG = document.getElementById("mainSVG");

if (
    !loader ||
    !toggle ||
    !mainSVG
) {

    console.warn("Loader elements not found.");

} else {

    gsap.set(mainSVG, {
        visibility: "visible"
    });

}

/* ============================================================
   TOGGLE ENABLE
============================================================ */

function setToggleEnabled(state) {

    if (!toggle) return;

    if (state) {

        toggle.style.pointerEvents = "auto";

        toggle.addEventListener("click", startLoader);

    }

    else {

        toggle.style.pointerEvents = "none";

        toggle.removeEventListener("click", startLoader);

    }

}

/* ============================================================
   ROBOT TIMELINE
============================================================ */

const robotTimeline = gsap.timeline({

    paused: true,

    defaults: {

        ease: "expo.inOut"

    }

});

robotTimeline

    .to("#toggle", {

        x: -150,

        fill: "#F26B6B"

    })

    .add("fingerIn", "+=0.5")

    .to("#bothHands", {

        x: 30

    }, "fingerIn")

    .to("#toggle", {

        x: -140,

        duration: 0.43,

        ease: "elastic(0.3,0.6)"

    }, "-=0.25")

    .add("handIn", "+=0.25")

    .to("#bothHands", {

        x: 169

    }, "handIn")

    .to("#toggle", {

        x: 0,

        fill: "#2BDB7F"

    }, "handIn")

    .add("thumbs")

    .to(".robotHand", {

        duration: 0.12,

        opacity: gsap.utils.wrap([0, 1])

    }, "thumbs")

    .from("#robotThumb", {

        rotation: 45,

        duration: 1.3,

        transformOrigin: "55% 95%",

        ease: "elastic(0.86,0.3)"

    }, "thumbs")

    .to("#bothHands", {

        x: "+=20",

        duration: .3,

        ease: "power2.inOut"

    }, "thumbs")

    .to("#bothHands", {

        rotation: -20,

        duration: .2,

        transformOrigin: "20% 50%"

    }, "thumbs")

    .to("#bothHands", {

        rotation: 0,

        duration: .4,

        ease: "elastic(0.86,0.6)"

    }, "thumbs+=0.2")

    .add("handOut")

    .to("#bothHands", {

        x: 0,

        ease: "back.in(1)"

    }, "handOut")

    .to("#robotThumb", {

        rotation: 23,

        ease: "power2.in"

    }, "handOut")

    .call(showSystemReady);

setToggleEnabled(true);
/* ============================================================
   BOOT SEQUENCE
============================================================ */

function showSystemReady() {

    loaderText.textContent = "SYSTEM INITIALIZED";

    const master = gsap.timeline();

    master

        /*
        =====================================
        Text Animation
        =====================================
        */

        .fromTo(
            loaderText,
            {
                opacity: 0,
                y: 15
            },
            {
                opacity: 1,
                y: 0,
                duration: .45
            }
        )

        /*
        =====================================
        Glow Pulse
        =====================================
        */

        .to(
            loaderFlash,
            {
                opacity: .55,
                duration: .4,
                ease: "power2.out"
            },
            "-=.2"
        )

        .to(
            loaderFlash,
            {
                opacity: 0,
                duration: .45
            }
        )

        /*
        =====================================
        Center Glow Line
        =====================================
        */

        .to(
            "#loader",
            {
                "--split-line-opacity": 1,
                duration: .15
            }
        )

        /*
        =====================================
        Split Panels
        =====================================
        */

        .to(
            loaderTop,
            {
                yPercent: -100,
                duration: 1,
                ease: "power4.inOut"
            },
            "+=.15"
        )

        .to(
            loaderBottom,
            {
                yPercent: 100,
                duration: 1,
                ease: "power4.inOut"
            },
            "<"
        )

        /*
        =====================================
        Fade Loader Content
        =====================================
        */

        .to(
            ".loader-content",
            {
                opacity: 0,
                duration: .35
            },
            "<"
        )

        /*
        =====================================
        Remove Loading State
        =====================================
        */

        .call(() => {

            document.body.classList.remove("loading");

        })

        /*
        =====================================
        Start Portfolio
        =====================================
        */

        .call(() => {

            if (typeof window.startPortfolio === "function") {

                window.startPortfolio();

            }

        })

        /*
        =====================================
        Remove Loader
        =====================================
        */

        .to(
            loader,
            {
                opacity: 0,
                duration: .4
            }
        )

        .call(() => {

            loader.remove();

        });

}

/* ============================================================
   START LOADER
============================================================ */

function startLoader() {

    setToggleEnabled(false);

    robotTimeline.restart();

}