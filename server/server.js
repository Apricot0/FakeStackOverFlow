// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express')
const mongoose = require('mongoose')
const PORT = 8000
const DB_URL = 'mongodb://127.0.0.1:27017/fake_so'
const cors = require('cors')
const services = require('./models/services')
const Question = require('./models/questions')
const Tag = require('./models/tags')
const Answer = require('./models/answers')

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

const app = express()
app.use(express.json())
// enable CORS
app.use(cors())

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
  const { title, text, tags, askedBy } = req.body
  try {
    const savedTags = []
    for (const tagName of tags) {
      const iftag = await Tag.find({ name: tagName })
      if (iftag.length === 0) {
        const tag = new Tag({ name: tagName })
        const newTag = await tag.save()
        savedTags.push(newTag)
      } else {
        savedTags.push(iftag[0])
      }
    }
    console.log(savedTags)
    const newQuestion = await new Question({
      title,
      text,
      tags: savedTags,
      asked_by: askedBy
    })
    await newQuestion.save()
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.status(500).send('Internal Server Error')
  }
})
