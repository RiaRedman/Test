const bookingToggle = document.querySelector("#restaurant-booking-toggle");
const bookingDrawer = document.querySelector("#restaurant-booking-drawer");
const bookingForm = document.querySelector("#restaurant-booking-form");
const reservationDate = document.querySelector("#reservation-date");
const reservationTime = document.querySelector("#reservation-time");
const reservationPartySize = document.querySelector("#reservation-party-size");
const reservationName = document.querySelector("#reservation-name");
const reservationEmail = document.querySelector("#reservation-email");
const reservationConsent = document.querySelector("#reservation-consent");
const reservationMessage = document.querySelector("#reservation-message");
const reservationConfirmation = document.querySelector("#reservation-confirmation");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const faqQuestionButtons = document.querySelectorAll("[data-faq-toggle]");
const contactEmailForm = document.querySelector("#contact-email-form");
const contactName = document.querySelector("#contact-name");
const contactEmail = document.querySelector("#contact-email");
const contactTopic = document.querySelector("#contact-topic");
const contactMessage = document.querySelector("#contact-msg");
const contactEmailOutput = document.querySelector("#contact-email-output");
const contactEmailPreview = document.querySelector("#contact-email-preview");
const contactEmailMailto = document.querySelector("#contact-email-mailto");
const contactEmailCopyButton = document.querySelector("#contact-email-copy");
const contactEmailCopyStatus = document.querySelector("#contact-email-copy-status");
const livePrototypeSection = document.querySelector(".prototype-demo");
const cookieBanner = document.querySelector("#cookie-consent-banner");
const cookieConsentTitle = document.querySelector("#cookie-consent-title");
const cookieConsentStatus = document.querySelector("#cookie-consent-status");
const cookiePreferences = document.querySelector("#cookie-prefs");
const cookieAnalytics = document.querySelector("#cookie-analytics");
const cookieSettingsLink = document.querySelector("#cookie-settings");
const cookieChoiceButtons = document.querySelectorAll("[data-cookie-choice]");

let openFrame = 0;
let closeTransitionHandler;
let contactEmailCopyTimeout;
let cookieBannerTransitionHandler;
let cookieBannerScopeFrame = 0;
let cookieBannerOpen = true;
let isPrototypeVisible = false;

function openBookingDrawer() {
    if (closeTransitionHandler) {
        bookingDrawer.removeEventListener("transitionend", closeTransitionHandler);
        closeTransitionHandler = null;
    }

    bookingDrawer.hidden = false;
    bookingToggle.setAttribute("aria-expanded", "true");
    openFrame = window.requestAnimationFrame(() => {
        bookingDrawer.classList.add("is-open");
        reservationDate.focus();
        openFrame = 0;
    });
}

function closeBookingDrawer() {
    if (openFrame) {
        window.cancelAnimationFrame(openFrame);
        openFrame = 0;
    }

    const wasOpen = bookingDrawer.classList.contains("is-open");
    bookingDrawer.classList.remove("is-open");
    bookingToggle.setAttribute("aria-expanded", "false");
    bookingToggle.focus();

    if (!wasOpen || reduceMotion.matches) {
        bookingDrawer.hidden = true;
        return;
    }

    closeTransitionHandler = (event) => {
        if (event.target !== bookingDrawer || event.propertyName !== "max-height") {
            return;
        }

        bookingDrawer.removeEventListener("transitionend", closeTransitionHandler);
        closeTransitionHandler = null;

        if (!bookingDrawer.classList.contains("is-open")) {
            bookingDrawer.hidden = true;
        }
    };
    bookingDrawer.addEventListener("transitionend", closeTransitionHandler);
}

bookingToggle.addEventListener("click", () => {
    if (bookingDrawer.hidden) {
        openBookingDrawer();
    } else {
        closeBookingDrawer();
    }
});

bookingDrawer.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !bookingDrawer.hidden) {
        closeBookingDrawer();
    }
});

faqQuestionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const answer = document.getElementById(button.getAttribute("aria-controls"));
        const icon = button.querySelector("[data-faq-icon]");

        if (!answer || !icon) {
            throw new Error("FAQ question is missing its answer panel or toggle icon.");
        }

        const isExpanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isExpanded));
        icon.textContent = isExpanded ? "+" : "−";

        if (isExpanded) {
            answer.classList.remove("is-open");

            if (reduceMotion.matches) {
                answer.hidden = true;
                return;
            }

            const hideAfterCollapse = (event) => {
                if (event.target !== answer || event.propertyName !== "grid-template-rows") {
                    return;
                }

                answer.removeEventListener("transitionend", hideAfterCollapse);

                if (button.getAttribute("aria-expanded") === "false") {
                    answer.hidden = true;
                }
            };
            answer.addEventListener("transitionend", hideAfterCollapse);
            return;
        }

        answer.hidden = false;

        if (reduceMotion.matches) {
            answer.classList.add("is-open");
            return;
        }

        answer.classList.remove("is-open");
        void answer.offsetHeight;
        answer.classList.add("is-open");
    });
});

reservationName.addEventListener("input", () => {
    reservationName.setCustomValidity("");
});

reservationEmail.addEventListener("input", () => {
    reservationEmail.setCustomValidity("");
});

bookingForm.addEventListener("input", () => {
    reservationMessage.hidden = true;
});

bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = reservationName.value.trim();
    reservationName.setCustomValidity(name ? "" : "Please enter your name.");
    const email = reservationEmail.value.trim();

    if (!reservationDate.value || !name || !email || !reservationConsent.checked || !bookingForm.reportValidity()) {
        return;
    }

    const [year, month, day] = reservationDate.value.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);

    if (selectedDate.getDay() === 1) {
        reservationConfirmation.textContent = "We are not open on Mondays. Please select another date.";
        reservationMessage.hidden = false;
        return;
    }

    const formattedDate = selectedDate.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    // This prototype confirms locally; it does not submit a real booking or send email.
    reservationConfirmation.textContent = `Your reservation has been confirmed for ${name} (${reservationPartySize.value}) on ${formattedDate} at ${reservationTime.value}. A confirmation has been sent to ${email}.`;
    reservationMessage.hidden = false;
});

contactName.addEventListener("input", () => {
    contactName.setCustomValidity("");
});

contactEmail.addEventListener("input", () => {
    contactEmail.setCustomValidity("");
});

contactMessage.addEventListener("input", () => {
    contactMessage.setCustomValidity("");
});

function hideContactEmailOutput() {
    contactEmailOutput.hidden = true;
    resetContactEmailCopy();
}

function resetContactEmailCopy() {
    window.clearTimeout(contactEmailCopyTimeout);
    contactEmailCopyTimeout = null;
    contactEmailCopyButton.textContent = "Copy Email to Clipboard";
    contactEmailCopyStatus.textContent = "";
}

function showContactEmailCopyResult(buttonText, statusText) {
    resetContactEmailCopy();
    contactEmailCopyButton.textContent = buttonText;
    contactEmailCopyStatus.textContent = statusText;
    contactEmailCopyTimeout = window.setTimeout(resetContactEmailCopy, 2000);
}

async function copyContactEmailToClipboard() {
    const emailText = contactEmailPreview.textContent;

    if (!emailText) {
        contactEmailCopyStatus.textContent = "Generate an email preview before copying.";
        return;
    }

    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        showContactEmailCopyResult(
            "Copy unavailable",
            "Clipboard access is unavailable. You can select and copy the email preview manually."
        );
        return;
    }

    try {
        await navigator.clipboard.writeText(emailText);
        showContactEmailCopyResult("Copied!", "Email copied to clipboard.");
    } catch (error) {
        console.error("Unable to copy the generated email to the clipboard.", error);
        showContactEmailCopyResult(
            "Copy failed",
            "Clipboard access failed. You can select and copy the email preview manually."
        );
    }
}

contactEmailForm.addEventListener("input", hideContactEmailOutput);
contactEmailForm.addEventListener("change", hideContactEmailOutput);
contactEmailCopyButton.addEventListener("click", copyContactEmailToClipboard);

contactEmailForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = contactName.value.trim();
    const email = contactEmail.value.trim();
    const topic = contactTopic.value;
    const message = contactMessage.value;
    contactName.setCustomValidity(name ? "" : "Please enter your name.");
    contactEmail.setCustomValidity(email ? "" : "Please enter your email address.");
    contactMessage.setCustomValidity(message.trim() ? "" : "Please enter your message.");

    if (!contactEmailForm.reportValidity()) {
        return;
    }

    const subject = `Verde & Grano ${topic} – ${name}`;
    const body = `Hello Verde & Grano team,\n\n${message}\n\nName: ${name}\nEmail: ${email}\nInquiry topic: ${topic}`;

    // Keep user-entered content as text and encode it for the mailto URL.
    contactEmailPreview.textContent = `To: hello@verdegrano.co.uk\nSubject: ${subject}\n\n${body}`;
    contactEmailMailto.href = `mailto:hello@verdegrano.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    resetContactEmailCopy();
    contactEmailOutput.hidden = false;
});

const menuCatalog = {
    Starters: [
        { name: "Roasted tomato bruschetta", price: "£8", description: "Grilled sourdough, slow-roasted tomatoes, basil, and extra virgin olive oil.", image: "images/Starter.webp", imageAlt: "Roasted tomato bruschetta on grilled sourdough" },
        { name: "Garlic & rosemary focaccia", price: "£6", description: "Warm house-baked focaccia with rosemary and extra virgin olive oil.", image: "images/menu/garlic6.jpg", imageAlt: "Garlic and rosemary focaccia" },
        { name: "Burrata & basil", price: "£10", description: "Creamy burrata with heritage tomatoes, fresh basil, and balsamic." },
        { name: "Mushroom arancini", price: "£9", description: "Crisp risotto bites filled with wild mushrooms and parmesan." },
        { name: "Crispy calamari", price: "£10", description: "Lightly fried calamari with lemon and a herby dipping sauce." }
    ],
    Pasta: [
        { name: "Beef ragu pappardelle", price: "£19", description: "Wide ribbons of pasta with slow-cooked halal beef in tomato sauce.", image: "images/pasta.webp", imageAlt: "Beef ragu pappardelle served with pasta lifted on a fork" },
        { name: "Rigatoni pomodoro", price: "£15", description: "Rigatoni tossed with slow-simmered tomato, basil, and parmesan." },
        { name: "Pesto genovese linguine", price: "£16", description: "Linguine with basil pesto, toasted pine nuts, and parmesan." },
        { name: "Wild mushroom tagliatelle", price: "£16", description: "Fresh ribbons of pasta, woodland mushrooms, parmesan, and thyme." },
        { name: "Garlic prawn linguine", price: "£20", description: "Prawns, linguine, garlic, chilli, parsley, and lemon." }
    ],
    Pizza: [
        { name: "Wild mushroom", price: "£16", description: "Wild mushrooms, mozzarella, thyme, and parmesan.", image: "images/pizza.webp", imageAlt: "Wild mushroom pizza with melted cheese and fresh herbs" },
        { name: "Spicy beef salami", price: "£16", description: "Halal beef salami, mozzarella, tomato, and a little chilli." },
        { name: "Roasted garden vegetables", price: "£15", description: "Seasonal roasted vegetables, mozzarella, and basil." },
        { name: "Margherita", price: "£13", description: "Tomato, mozzarella, fresh basil, and extra virgin olive oil." },
        { name: "Four cheese", price: "£16", description: "A rich blend of mozzarella, gorgonzola, parmesan, and ricotta." }
    ],
    Sides: [
        { name: "House salad", price: "£6", description: "Seasonal leaves, cucumber, tomatoes, and lemon dressing.", image: "images/salad.webp", imageAlt: "House salad with leafy greens, cucumber, and tomatoes" },
        { name: "Rosemary fries", price: "£5", description: "Crisp fries tossed with rosemary and sea salt." },
        { name: "Parmesan polenta", price: "£6", description: "Creamy polenta finished with parmesan and cracked pepper." },
        { name: "Grilled tenderstem broccoli", price: "£7", description: "Tenderstem broccoli with garlic, lemon, and olive oil." },
        { name: "Marinated olives", price: "£4", description: "Mixed olives with citrus peel and fresh herbs." }
    ],
    Desserts: [
        { name: "Alcohol-free tiramisu", price: "£8", description: "Espresso-soaked sponge layered with mascarpone and cocoa.", image: "images/desert.webp", imageAlt: "Alcohol-free tiramisu layered with mascarpone and cocoa" },
        { name: "Lemon olive oil cake", price: "£7", description: "Soft citrus cake with seasonal berries and vanilla cream." },
        { name: "Vanilla panna cotta", price: "£7", description: "Silky vanilla panna cotta with seasonal fruit." },
        { name: "Pistachio affogato", price: "£7", description: "Vanilla gelato, pistachio, and a shot of espresso." },
        { name: "Chocolate fondant", price: "£8", description: "Warm chocolate fondant with vanilla gelato." }
    ],
    Drinks: [
        { name: "Passion fruit spritz", price: "£8", description: "A bright, sparkling passion fruit and citrus mocktail.", image: "images/drink.webp", imageAlt: "Passion fruit spritz mocktail" },
        { name: "Blood orange & rosemary soda", price: "£7", description: "Blood orange, rosemary syrup, and sparkling water." },
        { name: "House lemonade", price: "£5", description: "Freshly squeezed lemons with a hint of mint." },
        { name: "Italian peach iced tea", price: "£5", description: "Black tea infused with peach and served over ice." },
        { name: "Espresso", price: "£3", description: "A short, rich Italian-style coffee." }
    ]
};
const menuCategoryTitle = document.querySelector("#restaurant-menu-category-title");
const menuItems = document.querySelector("#restaurant-menu-items");
const menuCategoryButtons = document.querySelectorAll("[data-menu-category]");

function renderMenuCategory(category) {
    const dishes = menuCatalog[category];

    if (!dishes) {
        throw new Error(`Unknown restaurant menu category: ${category}`);
    }

    menuCategoryTitle.textContent = category;
    menuCategoryButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.menuCategory === category));
    });

    const dishCards = dishes.map(({ name, price, description, image, imageAlt }) => {
        const card = document.createElement("article");
        card.className = "prototype-demo__dish";

        const heading = document.createElement("h4");
        const dishName = document.createElement("span");
        dishName.textContent = name;
        const dishPrice = document.createElement("span");
        dishPrice.textContent = price;
        heading.append(dishName, dishPrice);

        const details = document.createElement("p");
        details.textContent = description;

        if (image) {
            card.classList.add("prototype-demo__dish--with-image");

            const imageWrap = document.createElement("div");
            imageWrap.className = "prototype-demo__dish-image-wrap";

            const dishImage = document.createElement("img");
            dishImage.className = "prototype-demo__dish-image";
            dishImage.src = image;
            dishImage.alt = imageAlt;
            dishImage.loading = "lazy";
            dishImage.decoding = "async";
            imageWrap.append(dishImage);

            const content = document.createElement("div");
            content.className = "prototype-demo__dish-content";
            content.append(heading, details);
            card.append(imageWrap, content);
        } else {
            card.append(heading, details);
        }

        return card;
    });

    menuItems.replaceChildren(...dishCards);
}

menuCategoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        renderMenuCategory(button.dataset.menuCategory);
    });
});

renderMenuCategory("Starters");

function readCookieConsent() {
    let savedConsent;

    try {
        savedConsent = window.localStorage.getItem("verdeCookieConsent");
    } catch (error) {
        console.error("Unable to read the saved cookie consent.", error);
        cookieConsentStatus.textContent = "Your cookie settings could not be loaded. Please choose an option below.";
        return null;
    }

    if (!savedConsent) {
        return null;
    }

    try {
        const consent = JSON.parse(savedConsent);

        if (!consent || !["all", "selected", "rejected"].includes(consent.choice)) {
            throw new Error("Saved cookie consent has an invalid format.");
        }

        return consent;
    } catch (error) {
        console.error("Unable to parse the saved cookie consent.", error);
        cookieConsentStatus.textContent = "Your saved cookie settings could not be read. Please choose again.";
        return null;
    }
}

function applyCookieConsent(consent) {
    cookiePreferences.checked = consent.choice === "all" ||
        (consent.choice === "selected" && consent.preferences === true);
    cookieAnalytics.checked = consent.choice === "all" ||
        (consent.choice === "selected" && consent.analytics === true);
}

function saveCookieConsent(choice) {
    const consent = {
        choice,
        preferences: choice === "all" || (choice === "selected" && cookiePreferences.checked),
        analytics: choice === "all" || (choice === "selected" && cookieAnalytics.checked)
    };

    try {
        window.localStorage.setItem("verdeCookieConsent", JSON.stringify(consent));
    } catch (error) {
        console.error("Unable to save the cookie consent.", error);
        cookieConsentStatus.textContent = "Your cookie choice could not be saved. Check your browser storage settings and try again.";
        return false;
    }

    applyCookieConsent(consent);
    return true;
}

function clearCookieBannerTransitionHandler() {
    if (cookieBannerTransitionHandler) {
        cookieBanner.removeEventListener("transitionend", cookieBannerTransitionHandler);
        cookieBannerTransitionHandler = null;
    }
}

function dismissCookieBanner() {
    clearCookieBannerTransitionHandler();
    cookieBannerOpen = false;
    updateCookieBannerScope();
    cookieBanner.classList.add("is-dismissed");

    if (reduceMotion.matches) {
        cookieBanner.hidden = true;
        cookieSettingsLink.focus({ preventScroll: true });
        return;
    }

    cookieBannerTransitionHandler = (event) => {
        if (event.target !== cookieBanner || event.propertyName !== "opacity") {
            return;
        }

        clearCookieBannerTransitionHandler();

        if (cookieBanner.getAttribute("aria-hidden") === "true") {
            cookieBanner.hidden = true;
            cookieSettingsLink.focus({ preventScroll: true });
        }
    };
    cookieBanner.addEventListener("transitionend", cookieBannerTransitionHandler);
}

function showCookieBanner() {
    clearCookieBannerTransitionHandler();
    cookieConsentStatus.textContent = "";
    const consent = readCookieConsent();

    if (consent) {
        applyCookieConsent(consent);
    }

    cookieBannerOpen = true;
    cookieBanner.hidden = false;
    cookieBanner.classList.remove("is-dismissed");
    updatePrototypeVisibility();
    cookieConsentTitle.focus();
}

function updateCookieBannerScope() {
    cookieBanner.classList.toggle("is-outside-prototype", !isPrototypeVisible);
    const shouldShow = isPrototypeVisible && cookieBannerOpen && !cookieBanner.hidden;
    cookieBanner.setAttribute("aria-hidden", String(!shouldShow));
    cookieSettingsLink.setAttribute("aria-expanded", String(shouldShow));
}

function setPrototypeVisibility(isVisible) {
    isPrototypeVisible = isVisible;
    updateCookieBannerScope();
}

function updatePrototypeVisibility() {
    if (!cookieBannerOpen || cookieBanner.hidden) {
        setPrototypeVisibility(false);
        return;
    }

    const sectionBounds = livePrototypeSection.getBoundingClientRect();
    const availableWidth = Math.min(window.innerWidth * 0.92, 960, sectionBounds.width - 32);

    if (availableWidth <= 0) {
        setPrototypeVisibility(false);
        return;
    }

    cookieBanner.style.setProperty("--cookie-banner-width", `${availableWidth}px`);
    cookieBanner.style.setProperty("--cookie-banner-left", `${sectionBounds.left + sectionBounds.width / 2}px`);

    const bannerHeight = cookieBanner.getBoundingClientRect().height;
    const bannerBottom = Math.min(window.innerHeight - 16, sectionBounds.bottom - 16);
    const bannerTop = bannerBottom - bannerHeight;
    const isContained = sectionBounds.left + 16 <= sectionBounds.left + sectionBounds.width / 2 - availableWidth / 2 &&
        sectionBounds.right - 16 >= sectionBounds.left + sectionBounds.width / 2 + availableWidth / 2 &&
        sectionBounds.top + 16 <= bannerTop &&
        bannerBottom <= sectionBounds.bottom - 16;

    if (isContained) {
        cookieBanner.style.setProperty("--cookie-banner-bottom", `${window.innerHeight - bannerBottom}px`);
    }

    setPrototypeVisibility(isContained);
}

function scheduleCookieBannerScopeUpdate() {
    if (cookieBannerScopeFrame) {
        return;
    }

    cookieBannerScopeFrame = window.requestAnimationFrame(() => {
        cookieBannerScopeFrame = 0;
        updatePrototypeVisibility();
    });
}

cookieChoiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const choice = button.dataset.cookieChoice;

        if (saveCookieConsent(choice)) {
            cookieConsentStatus.textContent = "";
            dismissCookieBanner();
        }
    });
});

cookieSettingsLink.addEventListener("click", (event) => {
    event.preventDefault();
    showCookieBanner();
});

const savedCookieConsent = readCookieConsent();

if (savedCookieConsent) {
    applyCookieConsent(savedCookieConsent);
}

window.addEventListener("scroll", scheduleCookieBannerScopeUpdate, { passive: true });
window.addEventListener("resize", scheduleCookieBannerScopeUpdate);
updatePrototypeVisibility();
