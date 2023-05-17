// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require("express");
const mongoose = require("mongoose");
const PORT = 8000;
const DB_URL = "mongodb://127.0.0.1:27017/fake_so";
const cors = require("cors");
const services = require("./models/services");
const saltRounds = 10;
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const Question = require("./models/questions");
const Tag = require("./models/tags");
const Answer = require("./models/answers");
const User = require("./models/users");
const Comment = require("./models/comment");
const { ObjectId } = require('mongodb');

const app = express();

// mongod --dbpath /mnt/c/data/db to start mongodb
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log(`Error connecting to database: ${error}`);
  });
const store = new MongoDBStore({ uri: DB_URL });

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
// enable CORS

app.use(
  session({
    secret: "c3627c34e68ae02a2eef4d1a8494c66fb2b570ebd49dd5e6a046754d1a91fc55",
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("Server closed. Database instance disconnected.");
    process.exit(0);
  });
});

// TODO: endpoints?
// app.get().......
// Define the route for getting all questions
app.get("/questions", (req, res) => {
  // Get the ordering value from the query parameter
  const ordering = req.query.ordering;
  // console.log(ordering);
  services.getAllQuestions(res, ordering);
});

app.get("/answers/:id", async function (req, res) {
  try {
    const answerId = req.params.id;
    const answer = await Answer.findById(answerId)
      .populate("ans_by") // Populate the 'ans_by' field with 'username' from the 'User' collection
      .populate("comments"); // Populate the 'comments' field with the referenced 'Comment' documents
    if (!answer) {
      return res.status(404).json({ error: "Answer not found" });
    }
    res.json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/questions/:id", (req, res) => {
  Question.findById(req.params.id)
    .populate('answers')
    .populate("upvote")
    .populate("downvote")
    .populate("tags")
    .populate("asked_by")
    .populate("comments")
    .then((question) => {
      const modifiedQuestion = {
        ...question._doc, // Copy the question object
        //downvote: question.downvote.length, // Replace downvote array with its count
        //upvote: question.upvote.length, // Replace upvote array with its count
      };
      res.status(200).send(modifiedQuestion);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});
app.get("/tags", (req, res) => {
  Tag.aggregate([
    {
      $lookup: {
        from: "questions",
        localField: "_id",
        foreignField: "tags",
        as: "questions",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        questionCount: { $size: "$questions" },
      },
    },
  ])
    .then((tags) => {
      // console.log(tags);
      res.status(200).send(tags);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});
app.get("/myanswers", async (req, res) => {
  try {
    const user = await User.findOne({ account_name: req.session.account_name });

    const answers = await Answer.find({ ans_by: user._id })
      .populate('comments')
      .populate('upvote', 'username')
      .populate('downvote', 'username')
      .exec();

    res.status(200).send(answers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/mytags", async (req, res) => {
  const user = await User.findOne({ account_name: req.session.account_name })
  console.log(user)
  Question.find({ asked_by: user._id })
    .populate('tags') // Populate the 'tags' field of the questions with only the 'name' property
    .exec()
    .then((questions) => {
      // Create a Set to store the unique tags
      const uniqueTags = new Set();

      // Loop through the questions and retrieve the tags
      questions.forEach((question) => {
        question.tags.forEach((tag) => {
          uniqueTags.add(tag._id);
        });
      });

      // Convert the Set to an array
      const combinedTags = Array.from(uniqueTags);
      console.log(combinedTags);

      Tag.aggregate([
        {
          $match: {
            _id: { $in: combinedTags },
          },
        },
        {
          $lookup: {
            from: "questions",
            localField: "_id",
            foreignField: "tags",
            as: "questions",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            questionCount: { $size: "$questions" },
          },
        },
      ])
        .then((tags) => {
          // console.log(tags);
          res.status(200).send(tags);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Internal Server Error");
        });
    });
});
// put is for updating. updates views.
app.put("/questions/:id/views", (req, res) => {
  Question.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});
app.get("/questions/tags/:tagId", async (req, res) => {
  try {
    const { tagId } = req.params;
    console.log(tagId);
    // Find tag by id
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    // Find questions with the given tag id
    const questions = await Question.find({ tags: tagId })
      .sort({ ask_date_time: -1 })
      .populate("tags")
      .populate("answers");
    console.log(questions);
    res.status(200).send(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/userprofile", async (req, res) => {
  try {
    const { account_name } = req.session;
    console.log(account_name)
    const user = await User.findOne({ account_name: account_name }).populate({
      path: 'questions',
      populate: [{
        path: 'tags',
        model: Tag,

      }, {
        path: 'asked_by',
        model: User
      }, {
        path: 'answers',
        model: Answer,
      }
      ]
    })
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.role === 'Admin') {
      User.find({ role: 'Registered' }).then((users) => {
        console.log(users)
        return res.status(200).send({ admin: true, users })
      })
      return
    }
    res.status(200).send(user)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/questions/:id/postAnswer", async (req, res) => {
  console.log(req.params.id);
  account_name = req.session.account_name;
  const user = await User.findOne({ account_name: account_name });
  const questionId = req.params.id;
  const { inputText } = req.body;
  console.log(inputText);
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    const newAnswer = new Answer({ text: inputText, ans_by: user._id });
    const savedAnswer = await newAnswer.save();
    console.log(savedAnswer);
    question.answers.push(savedAnswer);
    const savedQuestion = await question.save();
    const populatedQuestion = await Question.findById(savedQuestion._id)
      .populate("asked_by")
      .populate("tags")
      .populate("answers")
      .populate("comments");
    res.status(201).json(populatedQuestion);
    console.log(populatedQuestion);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/questions/postquestion", async (req, res) => {
  const { title, summary, text, tags } = req.body;
  try {
    console.log("post question session:", req.session);
    account_name = req.session.account_name;
    console.log(account_name);
    const user = await User.findOne({ account_name: account_name });
    console.log("user find:", user);
    const savedTags = [];
    for (const tagName of tags) {
      const iftag = await Tag.find({ name: tagName });
      if (iftag.length === 0) {
        //user can not create tag if reputation is less than 50
        if (user.reputation < 50) {
          return res
            .status(403)
            .json({
              message: "You do not have enough reputation to create a new tag",
            });
        }
        const tag = new Tag({ name: tagName });
        const newTag = await tag.save();
        savedTags.push(newTag);
      } else {
        savedTags.push(iftag[0]);
      }
    }
    //console.log(savedTags)
    console.log(user);
    const newQuestion = await new Question({
      title,
      summary,
      text,
      tags: savedTags,
      asked_by: user._id,
    });
    await newQuestion.save();

    user.questions.push(newQuestion);
    await user.save();

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/usersdelete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("IIIIIIIIDDDDDDDDDDDDD",id);// Delete the user by their ID
    await User.findByIdAndDelete(id);
    await Question.deleteMany({ asked_by: id });
    await Answer.deleteMany({ ans_by: id });

    // Delete any associated data or perform additional cleanup if necessary

    // Respond with a success message
    res.json({ status: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    // Respond with an error message
    res.status(500).json({ error: "Failed to delete user" });
  }
});


app.post("/questions/:questionId/editquestion", async (req, res) => {
  const { title, summary, text, tags } = req.body;
  const { questionId } = req.params;
  try {
    console.log("post question session:", req.session);
    account_name = req.session.account_name;
    console.log(account_name);
    const user = await User.findOne({ account_name: account_name });
    console.log("user find:", user);
    const savedTags = [];
    for (const tagName of tags) {
      const iftag = await Tag.find({ name: tagName });
      if (iftag.length === 0) {
        //user can not create tag if reputation is less than 50
        if (user.reputation < 50) {
          return res
            .status(403)
            .json({
              message: "You do not have enough reputation to create a new tag",
            });
        }
        const tag = new Tag({ name: tagName });
        const newTag = await tag.save();
        savedTags.push(newTag);
      } else {
        savedTags.push(iftag[0]);
      }
    }
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (!user.questions.includes(question._id)) {
      return res.status(403).json({ message: "You are not the owner of this question" });
    }

    question.title = title;
    question.summary = summary;
    question.text = text;
    question.tags = savedTags;

    await question.save();


    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});



app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  let emailExists = await User.exists({ account_name: email });
  if (emailExists) {
    res.status(400).json({ message: "Email already exists" });
  } else {
    // Create user
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return res.status(400);
      let user = new User({
        username: username,
        account_name: email,
        password: hash,
        role: "Registered",
      });
      user.save();
      res.status(200).json({ message: "Registration successful" });
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //Check if logged in via session
  if (req.session.account_name) {
    let user = await User.findOne({
      account_name: req.session.account_name,
    }).lean();
    res.status(200).json({ status: "SESSION", user: user.username });
  } else {
    if (email == null)
      return res.status(200).json({ message: "waiting for login" });
    console.log(email);
    console.log(password);
    let user = await User.findOne({ account_name: email });
    if (user == null) return res.status(400).json({ message: "No such user" });
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result)
        res.status(400).json({ message: "Incorrect Password" });
      else {
        req.session.username = user.username;
        req.session.account_name = user.account_name;
        console.log(req.session);
        res.status(200).json({ user: user.username });
      }
    });
  }
});

app.post("/logout", (req, res) => {
  console.log(req.session);
  if (req.session.account_name) {
    req.session.destroy();
    res.status(200).json({ status: "OK" });
  } else {
    res.status(400).json({ message: "No user to log out" });
  }
});
app.post("/question/:qstnId/vote", async function (req, res) {
  try {
    if (req.session.username) {
      const qstnId = req.params.qstnId;

      const result = await Question.findById(qstnId).exec();
      if (!result) {
        return res.json({ status: "FAIL" });
      }

      const user = await User.findOne({
        account_name: req.session.account_name,
      }).exec();
      console.log(user);
      const uid = user._id; // Person who is voting

      if (!user || user.reputation < 50) {
        return res.json({ status: "LOW-REPUTATION" });
      }

      console.log("vote", user);
      console.log("vote", result);

      //const userWhoPosted = await User.findOne({ questions: qstnId }).exec();
      //if (!userWhoPosted) {
      //  return res.json({ status: "FAIL" });
      //}

      if (req.body.op === "upvote") {
        // Switching from up to downvote and vice versa
        //if (req.body.switch) {
        user.reputation += 5;
        result.downvote = result.downvote.filter((e) => !e.equals(uid));
        console.log("upvote result", result)
        //}

        if (result.upvote.indexOf(uid) === -1) {
          //userWhoPosted.reputation += 5;
          result.upvote.push(uid);
        }
        //else {
        // If already upvoted, remove upvote
        //  userWhoPosted.reputation -= 10;
        //  result.upvote = result.upvote.filter((e) => e !== uid);
        //}
      } else if (req.body.op === "downvote") {
        //if (req.body.switch) {
        user.reputation -= 10;
        result.upvote = result.upvote.filter((e) => !e.equals(uid));
        //}

        if (result.downvote.indexOf(uid) === -1) {
          //  userWhoPosted.reputation -= 10;
          result.downvote.push(uid);
        }
        //else {
        // If already downvoted, remove downvote
        //  userWhoPosted.reputation += 5;
        //  result.downvote = result.downvote.filter((e) => e !== uid);
        //}
      } else {
        return res.json({ status: "FAIL" });
      }

      await user.save();
      await result.save();
      console.log("after vote", user);
      console.log("after vote", result);
      return res.json({ status: "SUCCESS" });
    } else {
      return res.json({ status: "FAIL" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: "FAIL" });
  }
});

// app.post("/answer/:ansId/vote", async function (req, res) {
//   try {
//     if (req.session.username) {
//       const ansId = req.params.ansId;
//       const result = await Answer.findById(ansId).exec();

//       if (!result) {
//         return res.json({ status: "FAIL" });
//       }

//       const user = await User.findOne({ username: req.session.username }).exec();
//       const uid = user._id; // Person who is voting

//       // if (!user || user.reputation < 50) {
//       //   return res.json({ status: "LOW-REPUTATION" });
//       // }

//       const userWhoPosted = await User.findOne({ answers: ansId }).exec();

//       if (!userWhoPosted) {
//         return res.json({ status: "FAIL" });
//       }

//       if (req.body.op === "upvote") {
//         if (!result.upvote.includes(uid.toString())) {
//           if (req.body.switch) {
//             // Switching from downvote to upvote
//             if (result.downvote.includes(uid.toString())) {
//               userWhoPosted.reputation += 15;
//               result.downvote = result.downvote.filter((e) => e.toString() !== uid.toString());
//             }
//           } else {
//             // Upvote the answer
//             userWhoPosted.reputation += 5;
//             result.upvote.push(uid);
//           }
//         }
//       } else if (req.body.op === "downvote") {
//         if (!result.downvote.includes(uid.toString())) {
//           if (req.body.switch) {
//             // Switching from upvote to downvote
//             if (result.upvote.includes(uid.toString())) {
//               userWhoPosted.reputation -= 15;
//               result.upvote = result.upvote.filter((e) => e.toString() !== uid.toString());
//             }
//           } else {
//             // Downvote the answer
//             userWhoPosted.reputation -= 10;
//             result.downvote.push(uid);
//           }
//         }
//       } else {
//         return res.json({ status: "FAIL" });
//       }

//       await userWhoPosted.save();
//       await result.save();
//       return res.json({ status: "SUCCESS" });
//     } else {
//       return res.json({ status: "FAIL" });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.json({ status: "FAIL" });
//   }
// });

app.get("/deleteTag/:tagID", async function (req, res) {
  if (!req.session.username) {
    return res.json({ status: "FAIL", message: "You must be logged in to delete a tag." });
  }
  try {
    const tagID = req.params.tagID;
    const user = await User.findOne({ account_name: req.session.account_name }).exec();
    // Check if any other user has used the tag in their questions
    const usersWithQuestionTag = await User.find({
      _id: { $ne: user._id }, // Exclude the current user
      "questions.tags": tagID
    }).exec();
    if (usersWithQuestionTag.length > 0) {
      return res.json({ status: "ERROR", message: "Tag is being used by other users' questions. Cannot delete." });
    }
    // Update all questions that have the tag and remove the reference
    await Question.updateMany({ tags: tagID }, { $pull: { tags: tagID } }).exec();
    // Delete the tag
    await Tag.findByIdAndDelete(tagID).exec();

    return res.json({ status: "SUCCESS", message: "Tag deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.json({ status: "ERROR", message: "Failed to delete tag." });
  }
});

app.post("/answer/:ansId/vote", async function (req, res) {
  try {
    if (req.session.account_name) {
      const ansId = req.params.ansId;

      const result = await Answer.findById(ansId).exec();
      if (!result) {
        return res.json({ status: "FAIL" });
      }

      const user = await User.findOne({
        account_name: req.session.account_name,
      }).exec();
      const uid = user._id; // Person who is voting

      if (!user || user.reputation < 50) {
        return res.json({ status: "LOW-REPUTATION" });
      }

      //const userWhoPosted = await User.findOne({ answers: ansId }).exec();
      if (!user) {
        return res.json({ status: "FAIL" });
      }

      if (req.body.op === "upvote") {
        // Switching from up to downvote and vice versa
        //if (req.body.switch) {
        user.reputation += 5;
        result.downvote = result.downvote.filter((e) => !e.equals(uid));
        console.log("upvote result", result)
        //}

        if (result.upvote.indexOf(uid) === -1) {
          //userWhoPosted.reputation += 5;
          result.upvote.push(uid);
        }
        //else {
        // If already upvoted, remove upvote
        //  userWhoPosted.reputation -= 10;
        //  result.upvote = result.upvote.filter((e) => e !== uid);
        //}
      } else if (req.body.op === "downvote") {
        //if (req.body.switch) {
        user.reputation -= 10;
        result.upvote = result.upvote.filter((e) => !e.equals(uid));
        //}

        if (result.downvote.indexOf(uid) === -1) {
          //  userWhoPosted.reputation -= 10;
          result.downvote.push(uid);
        }
        //else {
        // If already downvoted, remove downvote
        //  userWhoPosted.reputation += 5;
        //  result.downvote = result.downvote.filter((e) => e !== uid);
        //}
      } else {
        return res.json({ status: "FAIL" });
      }

      await user.save();
      await result.save();
      return res.json({ status: "SUCCESS" });
    } else {
      return res.json({ status: "FAIL" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: "FAIL" });
  }
});


app.post('/question/:qstnId/postcomment', async (req, res) => {
  try {
    if (req.session.username) {
      const result = await Question.findById(req.params.qstnId).exec();
      if (!result) {
        return res.json({ status: 'FAIL' });
      }

      const user = await User.findOne({ username: req.session.username }).exec();
      if (user.reputation >= 50) {
        const comment = new Comment({
          text: req.body.text,
          ans_by: user
        });

        result.comments.unshift(comment);
        await comment.save();
        await result.save();

        return res.json({ status: 'SUCCESS', comment: comment, result: result });
      } else {
        return res.json({ status: 'LOW-REPUTATION' });
      }
    } else {
      return res.json({ status: 'FAIL' });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: 'FAIL' });
  }
});
app.post('/answer/:ansId/postcomment', async (req, res) => {
  try {
    if (req.session.username) {
      const answer = await Answer.findById(req.params.ansId).exec();
      if (!answer) {
        return res.json({ status: 'FAIL' });
      }
      const user = await User.findOne({ username: req.session.username }).exec();
      if (user.reputation >= 50) {
        const comment = new Comment({
          text: req.body.text,
          ans_by: user
        });

        answer.comments.unshift(comment);
        await comment.save();
        await answer.save();

        return res.json({ status: 'SUCCESS', comment: comment });
      } else {
        return res.json({ status: 'LOW-REPUTATION' });
      }
    } else {
      return res.json({ status: 'FAIL' });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: 'FAIL' });
  }
});

app.put('/comments/:id/upvote', async (req, res) => {
  try {
    if (req.session.username) {
      const user = await User.findOne({ username: req.session.username }).exec();
      if (user.reputation < 50) {
        return res.json({ status: 'LOW-REPUTATION' });
      }
      const comment = await Comment.findById(req.params.id).exec();
      if (!comment) {
        return res.json({ status: 'FAIL' });
      }

      const userId = user._id.toString();
      if (!comment.upvote.includes(userId)) {
        comment.upvote.push(userId);
        await comment.save();
      }

      return res.json({ status: 'SUCCESS' });
    } else {
      return res.json({ status: 'FAIL' });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: 'FAIL' });
  }
});

app.get('/comments/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('ans_by');
    if (!comment) {
      return res.json({ status: 'FAIL' });
    }
    res.status(200).send(comment);
  } catch (error) {
    console.error(error);
    return res.json({ status: 'FAIL' });
  }
});