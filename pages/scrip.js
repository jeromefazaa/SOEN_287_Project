//date logic

let dateElement = document.createElement("h3");
let dateParent = document.querySelector(".header");
dateParent.appendChild(dateElement);




setInterval(() => {
    let now = new Date();
    let string = `Curren Date: ${now.toLocaleString()}`;
    dateElement.innerHTML = string;
}, 1000)


//client side validation form logic

let form_find = document.getElementById("find_pet_form");
let form_giveaway = document.getElementById("giveaway_pet_form");

function clientSideInputValidation(e) {
    let form = e.target;
    let formData = new FormData(form);

    //input validation
    if (!formData.get("get_along_with")) {
        e.preventDefault();
        window.alert("Please complete all fields do not leave any field blank!");
        return;
    }
    for (const pair of formData.entries()) {
        if (pair[0] === "extra_info") continue;
        if (!pair[1]) {
            e.preventDefault();
            window.alert("Please complete all fields do not leave any field blank!");
            return;
        }
        else {

        }
    }

    //email validation (if exists)
    if (formData.has("email")) {
        const emailToValidate = formData.get("email");
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let valid = emailPattern.test(emailToValidate);
        if (!valid) {
            window.alert("Invalid email adress!");
            return;
        }
    }


}
if (form_giveaway)
    form_giveaway.onsubmit = clientSideInputValidation;
if (form_find)
    form_find.onsubmit = clientSideInputValidation;


