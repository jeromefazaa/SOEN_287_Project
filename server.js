const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());

// Setup session middleware
app.use(session({
    secret: 'secret-key', // In production, use a stronger secret!
    resave: false,
    saveUninitialized: true
}));

// Existing GET routes for pages
app.get('/index.html', (req, res, next) => {
    try {
        const data = loadContent('index.html');
        res.send(data);
    } catch (error) {
        next(error);
    }
});

app.get('/contact_us.html', (req, res, next) => {
    try {
        const data = loadContent('contact_us.html');
        res.send(data);
    } catch (error) {
        next(error);
    }
});

app.get('/cat_care.html', (req, res, next) => {
    try {
        const data = loadContent('cat_care.html');
        res.send(data);
    } catch (error) {
        next(error);
    }
});

app.get('/dog_care.html', (req, res, next) => {
    try {
        const data = loadContent('dog_care.html');
        res.send(data);
    } catch (error) {
        next(error);
    }
});

app.get('/find_a_dog_cat.html', (req, res, next) => {
    try {
        const data = loadContent('find_a_dog_cat.html');
        res.send(data);
    } catch (error) {
        next(error);
    }
});

app.get('/pet_giveaway.html', (req, res, next) => {
    try {
        const data = loadContent('pet_giveaway.html');
        res.send(data);
    } catch (error) {
        next(error);
    }
});

app.get('/privacy_disclaimer.html', (req, res, next) => {
    try {
        const data = loadContent('privacy_disclaimer.html');
        res.send(data);
    } catch (error) {
        next(error);
    }
});

// New GET routes for account creation and login pages
app.get('/create_account.html', (req, res, next) => {
    try {
        const data = loadContent('create_account.html');
        res.send(data);
    } catch (error) {
        next(error);
    }
});
app.get('/login.html', (req, res, next) => {
    try {
        const data = loadContent('login.html');
        res.send(data);
    } catch (error) {
        next(error);
    }
});

// New route to check session status
app.get('/checkSession', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
});

// POST route for creating an account
app.post('/createAccount', (req, res, next) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        // Validate username: letters and digits only.
        if (!/^[A-Za-z0-9]+$/.test(username)) {
            return res.status(400).send({ error: "Invalid username format. Use letters and digits only." });
        }
        // Validate password: minimum 4 characters, at least one letter and one digit.
        if (password.length < 4 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).send({ error: "Invalid password format. It must be at least 4 characters long and contain at least one letter and one digit." });
        }
        // Check for existing username.
        let users = [];
        const loginFile = 'login.txt';
        if (fs.existsSync(loginFile)) {
            const content = fs.readFileSync(loginFile, 'utf-8');
            const lines = content.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                const [user] = line.split(':');
                users.push(user);
            }
        }
        if (users.includes(username)) {
            return res.status(400).send({ error: "Username already exists. Please choose another." });
        }
        // Append new user to file.
        fs.appendFileSync(loginFile, `${username}:${password}\n`);
        res.send({ title: "Account Created", body: `<div><h2>Account successfully created.</h2><p>You can now log in.</p></div>` });
    } catch (error) {
        next(error);
    }
});

// POST route for login
app.post('/login', (req, res, next) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const loginFile = 'login.txt';
        let exists = false;
        if (fs.existsSync(loginFile)) {
            const content = fs.readFileSync(loginFile, 'utf-8');
            const lines = content.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                const [user, pass] = line.split(':');
                if (user === username && pass === password) {
                    exists = true;
                    break;
                }
            }
        }
        if (!exists) {
            return res.status(401).send({ error: "Login failed. Incorrect username or password." });
        }
        // Start user session.
        req.session.user = username;
        res.send({ title: "Login Successful", body: `<div><h2>Login successful.</h2><p>Welcome, ${username}!</p></div>` });
    } catch (error) {
        next(error);
    }
});

// Updated POST route for pet giveaway (requires login)
app.post('/formGiveaway', (req, res, next) => {
    try {
        // Require user to be logged in.
        if (!req.session.user) {
            return res.status(401).send({ error: "You must be logged in to submit a pet for giveaway." });
        }
        // Retrieve pet details.
        const { petType, petBreed, petAge, petGender, petGetAlong, extraInfo } = req.body;
        const ownerName = req.session.user;
        const petFile = 'pet_info.txt';
        let newId = 1;
        if (fs.existsSync(petFile)) {
            const content = fs.readFileSync(petFile, 'utf-8');
            const lines = content.split('\n').filter(line => line.trim() !== '');
            if (lines.length > 0) {
                const lastLine = lines[lines.length - 1];
                const parts = lastLine.split(':');
                newId = parseInt(parts[0]) + 1;
            }
        }
        // Record format: id:username:petType:petBreed:petAge:petGender:petGetAlong:extraInfo
        const record = `${newId}:${ownerName}:${petType}:${petBreed}:${petAge}:${petGender}:${petGetAlong}:${extraInfo}\n`;
        fs.appendFileSync(petFile, record);
        res.send({ title: "Pet Submitted", body: `<div><h2>Thank you!</h2><p>Your pet has been submitted for giveaway.</p></div>` });
    } catch (error) {
        next(error);
    }
});

// GET route for pet search (find a dog/cat)
app.get('/findPet', (req, res, next) => {
    try {
        const { type, pet_breed, age, gender, get_along_with } = req.query;
        const petFile = 'pet_info.txt';
        let resultsHTML = '';
        if (fs.existsSync(petFile)) {
            const content = fs.readFileSync(petFile, 'utf-8');
            const lines = content.split('\n').filter(line => line.trim() !== '');
            const results = [];
            for (const line of lines) {
                const [id, owner, petType, petBreed, petAge, petGender, petGetAlong, extraInfo] = line.split(':');
                // Filter only on criteria that are provided.
                if (type && type !== petType) continue;
                if (pet_breed && pet_breed.toLowerCase() !== petBreed.toLowerCase()) continue;
                if (age && Number(age) !== Number(petAge)) continue;
                if (gender && gender !== petGender) continue;
                if (get_along_with && get_along_with !== petGetAlong) continue;
                results.push({ id, owner, petType, petBreed, petAge, petGender, petGetAlong, extraInfo });
            }
            if (results.length === 0) {
                resultsHTML = '<h3>No matching pets found.</h3>';
            } else {
                resultsHTML = '<h3>Matching Pets:</h3>';
                results.forEach(pet => {
                    resultsHTML += `<div class="pet_item">
                                        <h4>${pet.petType} - ${pet.petBreed}</h4>
                                        <p>Age: ${pet.petAge}</p>
                                        <p>Gender: ${pet.petGender}</p>
                                        <p>Gets along with: ${pet.petGetAlong}</p>
                                        <p>Extra Info: ${pet.extraInfo}</p>
                                    </div>`;
                });
            }
        } else {
            resultsHTML = '<h3>No pet records available.</h3>';
        }
        res.send({ title: "Search Results", body: `<div>${resultsHTML}</div>` });
    } catch (error) {
        next(error);
    }
});

// GET route for logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.send({ title: 'Logout', body: `<div><h2>You have been logged out successfully.</h2></div>` });
});

// Error handler
app.use((error, req, res, next) => {
    console.log(error.message);
    res.status(error.status || 500).send({ error: error.message });
});

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});

// Updated loadContent function with new pages for account creation and login
function loadContent(page) {
    let title, body;
    switch (page) {
        case 'contact_us.html':
            title = 'Contact Us';
            body = `
        <div class="content_area_title">
            <h2>Contact Us</h2>
            <p>Here's some information to get in touch with us.</p>
        </div>
        <div class="content_area_content">
            <p>Name: Gerom Fazaa</p>
            <p>Student Id: 40274250</p>
            <p>Email: jeromefazaa123@gmail.com</p>
        </div>`;
            break;
        case 'cat_care.html':
            title = 'Cat Care';
            body = `<div class="content_area_title">
            <h2>How To Properly Care For A Cat</h2>
            <p>We have included some resources to help you care for your cat.</p>
        </div>
        <div class="content_area_content">
            <p>Useful Links:</p>
            <dl>
                <dt>PetMD's Complete Cat Health Guide</dt>
                <dd><a href="https://www.petmd.com/cat/general-health/complete-cat-health-guide-every-life-stage">Click Here</a></dd>
                <dt>ASPCA's Cat Nutrition Tips</dt>
                <dd><a href="https://www.aspca.org/pet-care/cat-care/cat-nutrition-tips">Click Here</a></dd>
                <dt>ASPCA's Common Cat Diseases</dt>
                <dd><a href="https://www.aspca.org/pet-care/cat-care/common-cat-diseases">Click Here</a></dd>
                <dt>WebMD's Cat Health Center</dt>
                <dd><a href="https://www.webmd.com/pets/cats/default.htm">Click Here</a></dd>
            </dl>
        </div>`;
            break;
        case 'dog_care.html':
            title = 'Dog Care';
            body = `<div class="content_area_title">
                <h2>How To Properly Care For A Dog</h2>
                <p>Here are some useful links on caring for your dog.</p>
            </div>
            <div class="content_area_content">
                <dl>
                    <dt>ASPCA's General Dog Care</dt>
                    <dd><a href="https://www.aspca.org/pet-care/dog-care/general-dog-care">Click Here</a></dd>
                    <dt>PetMD's Dog Care Checklist</dt>
                    <dd><a href="https://www.petmd.com/dog/general-health/how-to-take-care-of-dogs-pet-parent-checklist">Click Here</a></dd>
                    <dt>RSPCA's Dog Care Advice</dt>
                    <dd><a href="https://www.rspca.org.uk/adviceandwelfare/pets/dogs">Click Here</a></dd>
                    <dt>The Vets' Guide on Dog Care</dt>
                    <dd><a href="https://thevets.com/resources/pet-health-care/how-to-take-care-of-a-dog/">Click Here</a></dd>
                </dl>
            </div>`;
            break;
        case 'find_a_dog_cat.html':
            title = 'Find A Dog/Cat';
            body = `<div class="content_area_title">
                <h2>Find A Specific Dog Or Cat</h2>
                <p>Fill out the form below to filter your search for adoption.</p>
            </div>
            <div class="content_area_content">
                <form id="find_pet_form">
                    <label>Animal Type</label>
                    <input type="radio" name="type" id="type_dog" value="dog">
                    <label for="type_dog">Dog</label>
                    <input type="radio" name="type" id="type_cat" value="cat">
                    <label for="type_cat">Cat</label>
                    <br>
                    <label for="pet_breed">Breed</label>
                    <input list="breed" id="pet_breed" name="pet_breed">
                    <datalist id="breed">
                        <option value="Doesn't Matter"></option>
                    </datalist>
                    <br>
                    <label for="age">Preferred Age</label>
                    <input type="number" name="age" id="age" min="0">
                    <br>
                    <label for="gender">Gender</label>
                    <select name="gender" id="gender">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="either">Doesn't Matter</option>
                    </select>
                    <br>
                    <label>Gets along with:</label>
                    <label><input type="checkbox" name="get_along_with" value="children">Children</label>
                    <label><input type="checkbox" name="get_along_with" value="dog">Other Dogs</label>
                    <label><input type="checkbox" name="get_along_with" value="cats">Other Cats</label>
                    <br>
                    <input type="submit" value="Search">
                    <input type="reset" value="Reset">
                </form>
            </div>`;
            break;
        case 'index.html':
            title = 'Home Page';
            body = `<div class="content_area_title">
                <h2>Welcome To Our Pethouse</h2>
                <p>We built this website for people looking to adopt a dog or cat.</p>
            </div>
            <div class="content_area_content">
                <p>Here's what you can do:</p>
                <dl>
                    <dt>Find a dog/cat</dt>
                    <dd>Search for a pet based on your criteria.</dd>
                    <dt>Have a pet to giveaway</dt>
                    <dd>Register your pet for adoption (requires login).</dd>
                    <dt>Contact us</dt>
                    <dd>Get our contact information.</dd>
                </dl>
            </div>`;
            break;
        case 'pet_giveaway.html':
            title = 'Giveaway A Pet';
            body = `<div class="content_area_title">
                <h2>Giveaway Your Pet</h2>
                <p>Fill out the form below to register your pet for adoption.</p>
            </div>
            <div class="content_area_content">
                <form id="giveaway_pet_form">
                    <label>Animal Type</label>
                    <input type="radio" name="type" id="type_dog" value="dog">
                    <label for="type_dog">Dog</label>
                    <input type="radio" name="type" id="type_cat" value="cat">
                    <label for="type_cat">Cat</label>
                    <br>
                    <label for="pet_breed">Breed</label>
                    <input list="breed" id="pet_breed" name="pet_breed">
                    <datalist id="breed">
                        <option value="Doesn't Matter"></option>
                    </datalist>
                    <br>
                    <label for="age">Pet Age</label>
                    <input type="number" name="age" id="age" min="0">
                    <br>
                    <label for="gender">Gender</label>
                    <select name="gender" id="gender">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    <br>
                    <label>Gets along with:</label>
                    <label><input type="checkbox" name="get_along_with" value="children">Children</label>
                    <label><input type="checkbox" name="get_along_with" value="dogs">Other Dogs</label>
                    <label><input type="checkbox" name="get_along_with" value="cats">Other Cats</label>
                    <br>
                    <label for="extra_info">Extra Info (feel free to brag about your pet):</label>
                    <br>
                    <textarea name="extra_info" id="extra_info"></textarea>
                    <br>
                    <input type="submit" value="Submit">
                    <input type="reset" value="Reset">
                </form>
            </div>`;
            break;
        case 'privacy_disclaimer.html':
            title = 'Privacy Disclaimer';
            body = `<div class="content_area_title">
                <h2>Privacy Disclaimer</h2>
                <p>We promise not to sell or misuse your information.</p>
            </div>
            <div class="content_area_content">
                <p>Your data is protected and you are solely responsible for your content. By using this website, you agree to our terms.</p>
            </div>`;
            break;
        // New case for Create Account Page
        case 'create_account.html':
            title = 'Create Account';
            body = `<div class="content_area_title">
                        <h2>Create an Account</h2>
                        <p>Username: letters and digits only.<br>
                        Password: minimum 4 characters (letters and digits only) with at least one letter and one digit.</p>
                    </div>
                    <div class="content_area_content">
                        <form id="create_account_form">
                            <label for="username">Username:</label>
                            <input type="text" name="username" id="username" required>
                            <br>
                            <label for="password">Password:</label>
                            <input type="password" name="password" id="password" required>
                            <br>
                            <input type="submit" value="Create Account">
                        </form>
                    </div>`;
            break;
        // New case for Login Page
        case 'login.html':
            title = 'Login';
            body = `<div class="content_area_title">
                        <h2>Login</h2>
                    </div>
                    <div class="content_area_content">
                        <form id="login_form">
                            <label for="username">Username:</label>
                            <input type="text" name="username" id="username" required>
                            <br>
                            <label for="password">Password:</label>
                            <input type="password" name="password" id="password" required>
                            <br>
                            <input type="submit" value="Login">
                        </form>
                    </div>`;
            break;
    }
    return { title: title, body: body };
}
