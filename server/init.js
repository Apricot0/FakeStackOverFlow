//Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
const faker = require('faker');
const bcrypt = require('bcrypt');
let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let User = require('./models/users')
let mongoose = require('mongoose');

const NUM_USERS = 10; // Number of users to generate
const NUM_QUESTIONS_PER_USER = 2; // Number of questions to generate per user
const NUM_ANSWERS_PER_QUESTION = 2; // Number of answers to generate per question
const NUM_TAGS_PER_QUESTION = 1; // Number of tags to generate per question

mongoose.connect('mongodb://127.0.0.1:27017/fake_so', {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// Get the provided username and password from command line arguments
const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
    console.error('Username and password must be provided');
    process.exit(1);
}

// Hash the password
const saltRounds = 10;
bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    // Create the admin user
    const admin = new User({
        username: "Admin",
        account_name: username,
        password: hash,
        role: 'Admin'
    });
    // Save the admin user
    admin.save()
        .then((user) => {
            console.log('Admin user created');
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
} 
); 
// Create a script to populate the database with test data.
// Generate random user data using Faker
const generateRandomUserData = () => {
    const username = faker.name.findName();
    const account_name = faker.internet.email();
    const password = faker.internet.password();
    const role = 'Registered';
    return {username, account_name, password, role};
}

// Generate random tag data
const generateRandomTagData = () => {
    const tagName = faker.lorem.word();
    // Add more properties as needed
    return {
      name: tagName,
      // Add more properties as needed
    };
  };
  
// Generate random question data
const generateRandomQuestionData = (User) => {
    const tag = new Tag(generateRandomTagData());
    tag.save();
    const title = faker.lorem.sentence();
    const text = faker.lorem.paragraph();
    const asked_by = User._id;
    const tags = [tag._id];
    const views = faker.datatype.number(100);
    const ask_date_time = new Date(faker.date.past());
    return {title, text, asked_by, tags, views, ask_date_time};
}

const generateRandomAnswerData = (User) => {
    const text = faker.lorem.paragraph();
    const ans_by = User._id;
    ans_date_time = new Date(faker.date.past());
    return {text, ans_by, ans_date_time};
}

const generateTestData = async () => {
  
    for (let i = 0; i < NUM_USERS; i++) {
      const userData = generateRandomUserData();
      const user =  new User(userData);
      user.save();
  
      for (let j = 0; j < NUM_QUESTIONS_PER_USER; j++) {
        const questionData = generateRandomQuestionData(user._id);
        const question = new Question(questionData);
        question.save();
        user.questions.push(question._id);
        for (let k = 0; k < NUM_ANSWERS_PER_QUESTION; k++) {
          const answerData = generateRandomAnswerData(user._id);
          const answer = new Answer(answerData);
            answer.save();
            question.answers.push(answer._id);
            user.answers.push(answer._id);
        }
      }
    }
  };

    generateTestData();