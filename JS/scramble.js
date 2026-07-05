/**
 * ============================================================
 * HERO NAME SCRAMBLE
 * ============================================================
 */

window.initNameScramble = function () {

    // Prevent duplicate initialization
    if (window.scrambleInitialized) return;
    window.scrambleInitialized = true;

    const firstName = document.getElementById("name-text");
    const surname = document.getElementById("surname-text");

    if (!firstName || !surname) return;

    // Characters used during scrambling
    const RANDOM_CHARS =
        "XYZ0123456789/<>[]{}—=+*^?#________";

    /**
     * ============================================
     * Scramble Function
     * ============================================
     */

    function scramble(element, finalText) {

        let iterations = 0;

        const interval = setInterval(() => {

            element.innerText = finalText
                .split("")
                .map((letter, index) => {

                    if (index < iterations) {
                        return finalText[index];
                    }

                    return RANDOM_CHARS[
                        Math.floor(Math.random() * RANDOM_CHARS.length)
                    ];

                })
                .join("");

            if (iterations >= finalText.length) {

                clearInterval(interval);

                element.innerText = finalText;

            }

            iterations += 1 / 3;

        }, 100);

    }

    /**
     * ============================================
     * Initial State
     * ============================================
     */

    firstName.style.opacity = "1";
    surname.style.opacity = "1";

    /**
     * ============================================
     * Play Animation
     * ============================================
     */

    setTimeout(() => {

        scramble(firstName, "Hrituraj");

        setTimeout(() => {

            scramble(surname, "Roy");

        }, 120);

    }, 600);

};