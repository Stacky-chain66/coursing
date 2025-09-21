const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/MusicWebsiteData", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((error) => console.log("Failed to Connect!", error));

// Define the Contact schema
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        match: /^[A-Za-z\s]+$/, // Validate alphabets only
    },
    email: {
        type: String,
        required: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validate proper email format
    },
    message: {
        type: String,
        required: true,
        minlength: 5, // Ensure the message has a minimum length
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const LogInSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email:{type:String,required:true},
   
  });

  const registrationSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    courseName: { type: String, required: true },
    className: { type: String, required: true },
  }, { timestamps: true });
  const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
  });
  
  const Feedback = mongoose.model('Feedback', feedbackSchema);
  
  // Create the model
  const Registration = mongoose.model('Registration', registrationSchema);
  
  



const collection = mongoose.model("LogInCollection", LogInSchema);

// Create the Contact model
const Contact = mongoose.model("Contact", contactSchema);

module.exports ={ collection,Contact,Registration,Feedback};
