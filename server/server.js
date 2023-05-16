// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express')
const mongoose = require('mongoose')
const PORT = 8000
const DB_URL = 'mongodb://127.0.0.1:27017/fake_so'
const cors = require('cors')
const services = require('./models/services')
const saltRounds = 10;
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const Question = require('./models/questions')
const Tag = require('./models/tags')
const Answer = require('./models/answers')
const User = require('./models/users')

const app = express()

// mongod --dbpath /mnt/c/data/db to start mongodb
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to database')
  })
  .catch((error) => {
    console.log(`Error connecting to database: ${error}`)
  })
  const store = new MongoDBStore({ uri: DB_URL});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json())
// enable CORS

app.use(session({
  secret: "c3627c34e68ae02a2eef4d1a8494c66fb2b570ebd49dd5e6a046754d1a91fc55",
  store: store,
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Server closed. Database instance disconnected.')
    process.exit(0)
  })
})

// TODO: endpoints?
// app.get().......
// Define the route for getting all questions
app.get('/questions', (req, res) => {
  // Get the ordering value from the query parameter
  const ordering = req.query.ordering
  // console.log(ordering);
  services.getAllQuestions(res, ordering)
})

app.get('/questions/:id', (req, res) => {
  Question.findById(req.params.id)
    .populate('answers')
    .then((question) => {
      res.status(200).send(question)
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send('Internal Server Error')
    })
})
app.get('/tags', (req, res) => {
  Tag.aggregate([
    {
      $lookup: {
        from: 'questions',
        localField: '_id',
        foreignField: 'tags',
        as: 'questions'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        questionCount: { $size: '$questions' }
      }
    }
  ])
    .then((tags) => {
      // console.log(tags);
      res.status(200).send(tags)
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send('Internal Server Error')
    })
})
// put is for updating. updates views.
app.put('/questions/:id/views', (req, res) => {
  Question.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
    .then(() => {
      res.sendStatus(200)
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send('Internal Server Error')
    })
})
app.get('/questions/tags/:tagId', async (req, res) => {
  try {
    const { tagId } = req.params
    console.log(tagId)
    // Find tag by id
    const tag = await Tag.findById(tagId)
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' })
    }
    // Find questions with the given tag id
    const questions = await Question.find({ tags: tagId })
      .sort({ ask_date_time: -1 })
      .populate('tags')
      .populate('answers')
    console.log(questions)
    res.status(200).send(questions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

app.post('/questions/:id/postAnswer', async (req, res) => {
  console.log(req.params.id)
  const questionId = req.params.id
  const { username, inputText } = req.body
  console.log(username)
  console.log(inputText)
  try {
    const question = await Question.findById(questionId)
    if (!question) {
      return res.status(404).json({ message: 'Question not found' })
    }
    const newAnswer = new Answer({ text: inputText, ans_by: username })
    const savedAnswer = await newAnswer.save()
    console.log(savedAnswer)
    question.answers.push(savedAnswer)
    const savedQuestion = await question.save()
    const populatedQuestion = await Question.findById(savedQuestion._id)
      .populate('tags')
      .populate('answers')
    res.status(201).json(populatedQuestion)
    console.log(populatedQuestion)
  } catch (err) {
    console.error(err)
    res.status(500).send('Internal Server Error')
  }
})
app.post('/questions/postquestion', async (req, res) => {
  const { title, summary, text, tags } = req.body
  try {
    console.log("post question session:", req.session)
    account_name = req.session.account_name
    console.log(account_name)
    const user = await User.findOne({ account_name: account_name })
    console.log("user find:", user)
    const savedTags = []
    for (const tagName of tags) {
      const iftag = await Tag.find({ name: tagName })
      if (iftag.length === 0) {
        //user can not create tag if reputation is less than 50
        if(user.reputation < 50) {
          return res.status(403).json({ message: 'You do not have enough reputation to create a new tag' })
        }
        const tag = new Tag({ name: tagName })
        const newTag = await tag.save()
        savedTags.push(newTag)
      } else {
        savedTags.push(iftag[0])
      }
    }
    //console.log(savedTags)
    console.log(user)
    const newQuestion = await new Question({
      title,
      summary,
      text,
      tags: savedTags,
      asked_by: user._id
    })
    await newQuestion.save()

    user.questions.push(newQuestion);
    await user.save();

    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.status(500).send('Internal Server Error')
  }
})


app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  let emailExists = await User.exists({ account_name: email });
  if (emailExists) {
      res.status(400).json({ message: 'Email already exists' });
  } else {
    // Create user
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return res.status(400);
      let user = new User({
        username: username,
        account_name: email,
        password: hash,
        role: "Registered"
      });
      user.save();
      res.status(200).json({ message: 'Registration successful' });
    });
  }
});

app.post('/login', async (req, res) => {
  const {email, password} = req.body;
    //Check if logged in via session
    if (req.session.account_name) {
      let user = await User.findOne({ account_name: req.session.account_name }).lean();
      res.status(200).json({ status: 'SESSION', user: user.username });
    } else {
      if (email == null) return res.status(200).json({ message: 'waiting for login' });
      console.log(email); 
      console.log(password);
      let user = await User.findOne({account_name: email });
      if (user == null) return res.status(400).json({ message: 'No such user' });
      bcrypt.compare(password, user.password, (err, result) => {
        if (err || !result) res.status(400).json({ message: 'Incorrect Password' });
        else {
          req.session.username = user.username;
          req.session.account_name = user.account_name;
          console.log(req.session);
          res.status(200).json({ user: user.username });
        }
      });
    }
  });

  app.post('/logout', (req, res) => {
    console.log(req.session);
    if (req.session.account_name) {
      req.session.destroy();
      res.status(200).json({ status: 'OK' });
    } else {
      res.status(400).json({ message: 'No user to log out' });
    }
  });
  
