const backToTopButton = document.querySelector(".back-to-top");

function updateBackToTopVisibility() {
    const isAtPageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    backToTopButton.classList.toggle("is-visible", isAtPageBottom);
}

window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
window.addEventListener("resize", updateBackToTopVisibility);
backToTopButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
});
updateBackToTopVisibility();
