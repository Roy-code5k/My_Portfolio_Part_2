/**
 * ============================================================
 * CONTACT FORM SUBMISSION
 * AJAX handler for Formspree submissions to prevent page reloads
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("mainContactForm");
    const successMessage = document.getElementById("successMessage");

    if (!contactForm || !successMessage) return;

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const submitBtn = contactForm.querySelector(".form-submit-btn");
        const originalBtnHTML = submitBtn.innerHTML;

        try {
            // Show loading state on button
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending...`;

            const response = await fetch(contactForm.action, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            });

            if (response.ok) {
                // Show success banner
                successMessage.classList.add("show");
                contactForm.reset();

                // Smooth scroll up to success message
                successMessage.scrollIntoView({ behavior: "smooth", block: "center" });

                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.classList.remove("show");
                }, 5000);
            } else {
                throw new Error("Form submission response not ok");
            }
        } catch (error) {
            console.error("Contact Form submission error:", error);
            alert("Oops! There was a problem submitting your form. Please try again or reach out on WhatsApp.");
        } finally {
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    });
});
