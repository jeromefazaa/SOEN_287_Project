// Show current date and time in the header.
let dateElement = document.createElement("h3");
let dateParent = document.querySelector(".header");
dateParent.appendChild(dateElement);
const apiURL = 'http://localhost:3000';

setInterval(() => {
    let now = new Date();
    dateElement.innerHTML = `Current Date: ${now.toLocaleString()}`;
}, 1000);

// Client-side input validation (for giveaway form, etc.)
function clientSideInputValidation(e) {
    let form = e.target;
    let formData = new FormData(form);
    if (!formData.get("get_along_with")) {
        e.preventDefault();
        window.alert("Please complete all fields; do not leave any field blank!");
        return false;
    }
    for (const pair of formData.entries()) {
        if (pair[0] === "extra_info") continue;
        if (!pair[1]) {
            e.preventDefault();
            window.alert("Please complete all fields; do not leave any field blank!");
            return false;
        }
    }
    if (formData.has("email")) {
        const emailToValidate = formData.get("email");
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailToValidate)) {
            window.alert("Invalid email address!");
            return false;
        }
    }
    return true;
}

async function formFindSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = new URLSearchParams();
    for (const entry of formData.entries()) {
        if (entry[1]) {
            params.append(entry[0], entry[1]);
        }
    }
    const response = await fetch(`${apiURL}/findPet?` + params.toString());
    const data = await response.json();
    document.title = data.title;
    contentArea.innerHTML = data.body;
}

// Event listeners for navigation buttons
const indexPage = document.querySelector(".index-page");
const findDogCatPage = document.querySelector(".find-a-dog-cat-page");
const dogCarePage = document.querySelector(".dog-care-page");
const catCarePage = document.querySelector(".cat-care-page");
const petGiveawayPage = document.querySelector(".pet-giveaway-page");
const contactUsPage = document.querySelector(".contact-us-page");
const privacyDisclaimerPage = document.querySelector(".privacy-disclaimer-page");
const createAccountPage = document.querySelector(".create-account-page");
const loginPage = document.querySelector(".login-page");
const logoutPage = document.querySelector(".logout-page");
const contentArea = document.getElementById('content_area_section');

indexPage.onclick = async () => {
    const response = await fetch(`${apiURL}/index.html`);
    const data = await response.json();
    document.title = data.title;
    contentArea.innerHTML = data.body;
};

findDogCatPage.onclick = async () => {
    const response = await fetch(`${apiURL}/find_a_dog_cat.html`);
    const data = await response.json();
    document.title = data.title;
    contentArea.innerHTML = data.body;
    let form_find = document.getElementById("find_pet_form");
    if (form_find)
        form_find.onsubmit = formFindSubmit;
};

dogCarePage.onclick = async () => {
    const response = await fetch(`${apiURL}/dog_care.html`);
    const data = await response.json();
    document.title = data.title;
    contentArea.innerHTML = data.body;
};

catCarePage.onclick = async () => {
    const response = await fetch(`${apiURL}/cat_care.html`);
    const data = await response.json();
    document.title = data.title;
    contentArea.innerHTML = data.body;
};

// For pet giveaway, check session first
petGiveawayPage.onclick = async () => {
    const sessionResp = await fetch(`${apiURL}/checkSession`);
    const sessionData = await sessionResp.json();
    if (!sessionData.loggedIn) {
        window.alert("You must be logged in to access the pet giveaway form. Please log in first.");
        const loginResp = await fetch(`${apiURL}/login.html`);
        const loginData = await loginResp.json();
        document.title = loginData.title;
        contentArea.innerHTML = loginData.body;
        let loginForm = document.getElementById("login_form");
        if (loginForm) {
            loginForm.onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(loginForm);
                const username = formData.get("username");
                const password = formData.get("password");
                const res = await fetch(`${apiURL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const result = await res.json();
                if (res.ok) {
                    window.alert("Login successful. Now accessing the giveaway form.");
                    // Load the giveaway form after successful login.
                    const giveawayResp = await fetch(`${apiURL}/pet_giveaway.html`);
                    const giveawayData = await giveawayResp.json();
                    document.title = giveawayData.title;
                    contentArea.innerHTML = giveawayData.body;
                    let form_giveaway = document.getElementById("giveaway_pet_form");
                    if (form_giveaway)
                        form_giveaway.onsubmit = async (e) => {
                            if (clientSideInputValidation(e)) {
                                e.preventDefault();
                                const formData = new FormData(form_giveaway);
                                const petData = {
                                    petType: formData.get('type'),
                                    petBreed: formData.get('pet_breed'),
                                    petAge: formData.get('age'),
                                    petGender: formData.get('gender'),
                                    petGetAlong: formData.get('get_along_with'),
                                    extraInfo: formData.get('extra_info')
                                };
                                const submitResp = await fetch(`${apiURL}/formGiveaway`, {
                                    method: 'POST',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify(petData)
                                });
                                if (submitResp.ok) {
                                    window.alert("Success! Your pet has been submitted.");
                                    form_giveaway.reset();
                                } else {
                                    const errData = await submitResp.json();
                                    window.alert(errData.error);
                                }
                            }
                        };
                } else {
                    window.alert(result.error);
                }
            };
        }
    } else {
        const response = await fetch(`${apiURL}/pet_giveaway.html`);
        const data = await response.json();
        document.title = data.title;
        contentArea.innerHTML = data.body;
        let form_giveaway = document.getElementById("giveaway_pet_form");
        if (form_giveaway)
            form_giveaway.onsubmit = async (e) => {
                if (clientSideInputValidation(e)) {
                    e.preventDefault();
                    const formData = new FormData(form_giveaway);
                    const petData = {
                        petType: formData.get('type'),
                        petBreed: formData.get('pet_breed'),
                        petAge: formData.get('age'),
                        petGender: formData.get('gender'),
                        petGetAlong: formData.get('get_along_with'),
                        extraInfo: formData.get('extra_info')
                    };
                    const res = await fetch(`${apiURL}/formGiveaway`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(petData)
                    });
                    if (res.ok) {
                        window.alert("Success! Your pet has been submitted.");
                        form_giveaway.reset();
                    } else {
                        const result = await res.json();
                        window.alert(result.error);
                    }
                }
            };
    }
};

contactUsPage.onclick = async () => {
    const response = await fetch(`${apiURL}/contact_us.html`);
    const data = await response.json();
    document.title = data.title;
    contentArea.innerHTML = data.body;
};

privacyDisclaimerPage.onclick = async () => {
    const response = await fetch(`${apiURL}/privacy_disclaimer.html`);
    const data = await response.json();
    document.title = data.title;
    contentArea.innerHTML = data.body;
};

createAccountPage.onclick = async () => {
    const response = await fetch(`${apiURL}/create_account.html`);
    const data = await response.json();
    document.title = data.title;
    contentArea.innerHTML = data.body;
    let createForm = document.getElementById("create_account_form");
    if (createForm) {
        createForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(createForm);
            const username = formData.get("username");
            const password = formData.get("password");
            const res = await fetch(`${apiURL}/createAccount`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await res.json();
            if (res.ok) {
                window.alert("Account created successfully. You can now log in.");
            } else {
                window.alert(result.error);
            }
        };
    }
};

loginPage.onclick = async () => {
    const response = await fetch(`${apiURL}/login.html`);
    const data = await response.json();
    document.title = data.title;
    contentArea.innerHTML = data.body;
    let loginForm = document.getElementById("login_form");
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const username = formData.get("username");
            const password = formData.get("password");
            const res = await fetch(`${apiURL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await res.json();
            if (res.ok) {
                window.alert("Login successful.");
            } else {
                window.alert(result.error);
            }
        };
    }
};

logoutPage.onclick = async () => {
    const response = await fetch(`${apiURL}/logout`);
    const data = await response.json();
    document.title = data.title;
    contentArea.innerHTML = data.body;
    window.alert("You have been logged out.");
};
