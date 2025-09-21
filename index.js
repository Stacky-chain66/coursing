require('dotenv').config();
const express = require('express');
const path = require('path');
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { collection, Registration, Contact, Feedback } = require('./mongodb');

const app = express();
const templatePath = path.join(__dirname, '../views');
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));
app.set('views', templatePath);
app.use(express.static(path.join(__dirname, '../public')));
const PORT = process.env.PORT || 3000;



// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Utility functions for validation
const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
const isValidName = (name) => /^[A-Za-z\s]+$/.test(name);
const isValidPhone = (phone) => /^\d{10}$/.test(phone);

// Routes
app.get('/', (req, res) => res.render('home'));
// Routes
app.get('/home', (req, res) => res.render('home'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/login', (req, res) => res.render('loginpage'));
app.get('/admin', (req, res) => res.render('admin'));
app.get('/course', (req, res) => res.render('courses'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/enroll-course', (req, res) => res.render('courseform'));
app.get('/thankyou', (req, res) => res.render('thankyou'));
app.get('/feedback', (req, res) => res.render('feedback'));
app.get('/about', (req, res) => res.render('About'));
app.get('/instrument',(req,res)=>res.render('instrmuentcourse'));
app.get('/total-enrollments',(req,res)=>res.render('enrollmentdata'));
// **Secure Signup Route with Password Hashing**
app.get('/total-enrollments', async (req, res) => {
  try {
    // Count the total number of documents in the registrations collection
    const totalEnrollments = await Registration.countDocuments();
    console.log("Total Enrollments:", totalEnrollments); // Debugging statement

    // Render a new Handlebars template and pass the totalEnrollments variable
    res.render('total-enrollments', { totalEnrollments });
  } catch (error) {
    console.error('Error fetching total enrollments:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/contactcount', async (req, res) => {
  try {
    // Count the total number of documents in the registrations collection
    const totalEnrollments = await Contact.countDocuments();
    // Debugging statement

    // Render a new Handlebars template and pass the totalEnrollments variable
    res.render('contactcount', { totalEnrollments });
  } catch (error) {
    console.error('Error fetching total enrollments:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/feedbackdata', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ date: -1 }); // Sort by latest first
    res.render('feedbackdata', { feedbacks });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/signup', async (req, res) => {
    const { name, password, email } = req.body;

    if (!isValidName(name)) {
        return res.render('signup', { usernameError: 'Username must contain only characters.' });
    }

    if (password.length < 7) {
        return res.render('signup', { passwordError: 'Password must be at least 7 characters long.' });
    }

    if (!isValidEmail(email)) {
        return res.render('signup', { emailError: 'Please enter a valid email address.' });
    }

    try {
        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.render('signup', { usernameError: 'Username already exists.' });
        }

        // **Hash the password before storing**
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store user with hashed password
        await collection.create({ name, password: hashedPassword, email });

        res.redirect('/login'); // Redirect to login page after successful signup
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send('Internal Server Error');
    }
});

// **Secure Login Route with Hashed Password Check**
app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    // **Admin Login**
    if (name === 'Admin' && password === 'momsloving') {
        return res.render('admin');
    }

    try {
        const user = await collection.findOne({ name });

        if (!user) {
            return res.render('loginpage', { usernameError: 'Username not found', passwordError: null });
        }

        // **Compare hashed password**
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('loginpage', { usernameError: null, passwordError: 'Incorrect password' });
        }

        res.render('courseform'); // Redirect after successful login
    } catch (err) {
        console.error('Error logging in:', err);
        return res.render('loginpage', { usernameError: 'Login failed. Please try again.', passwordError: null });
    }
});

// **Fetch and Display Registration Data**
app.get('/enrollmentdata', async (req, res) => {
    try {
        const registrations = await Registration.find();
        res.render('enrollmentdata', { registrations });
    } catch (error) {
        console.error('Error fetching registration data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// **Feedback Submission**
app.post('/submit-feedback', async (req, res) => {
    const { name,message } = req.body;

    if (!isValidName(name)) {
        return res.render('signup', { usernameError: 'Username must contain only characters.' });
    }

    if (!name || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const newFeedback = new Feedback({ name,message });
        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully!' });
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ message: 'Error submitting feedback. Please try again.' });
    }
});
// **Feedback Submission**
app.post('/submit-contact', async (req, res) => {
    const { name,email,message } = req.body;

   

    if (!name ||!email|| !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const newFeedback = new Contact({ name,email,message });
        await newFeedback.save();
        res.status(201).json({ message: 'Thank you for your query.we will soon reply you on your email.' });
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ message: 'Error submitting feedback. Please try again.' });
    }
});

// **User Registration with Twilio SMS**
app.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, courseName, className } = req.body;

        // Save to database
        const newRegistration = new Registration({
            firstName, lastName, email, mobile, courseName, className
        });

        await newRegistration.save();

        // Temporary: Hardcode your verified number for testing
        const phoneNumber = '+919321056687';  // Your verified number

        // Sending SMS via Twilio
        await client.messages.create({
            body: `Thank you ${firstName} ${lastName} for enrolling in the ${className} of ${courseName} course at ByteLogix. We will soon contact you for further process.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        res.json({ success: true, message: "Registration successful!" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error, please try again!" });
    }
});


// **Start the Server**
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
