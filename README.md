# FakeStackOverFlow
Final project for Stony Brook University's software development course. We try to imitate the StackOverflow website and build a similar question and answer platform. The UI of the platform is relatively simple because of the limited time of a week, but most of the functions are complete. The development process uses react, express, html, css, javascript, MongoDB, axios, cors and other development tools. The development content includes front-end and back-end. Users can log in to interact with questions and answers and perform simple operations on accounts. Administrators can perform operations on registered users.

## Instructions to setup and run the project
1. Make sure Node.js and an installation of MongoDB is up and running for your operating system. To install the latter, head to: https://www.mongodb.com/docs/manual/installation

2. Clone this repository.

3. Change into the server/ directory. 

4. Install the necessary npm dependencies with
``` npm install ```.

5. Run the server.js file with
``` node server.js ```.

6. Open up a new terminal, and change into the client/ directory in the repository.

7. Install the necessary npm dependencies with
``` npm install ```.

8. Run the React app with
``` npm start ```.

9. The React app will open on a new tab in your browser.

## Team Member 1 Contribution
Jasper Zeng - complete the main framework of the project, implement sessions, compeleted homepage, login page(login logout register etd), question submit, answer sumbit, tags page, normal user profile(include question edit, tag delete, exclude answer edit), complete admin profile page, include user delete, complete init.js, complete models( Question, User, Comments, ..)
complete uml diagram

## Team Member 2 Contribution
Completed Comments, AnswerPage, downVote, upvote, styled.
