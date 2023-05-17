import Model from "../../models/model";
import { useState } from "react";
import Answer from "./answerComp";
import Comment from "./commentComp";
import React from "react";
import axios from 'axios'
import PropTypes from "prop-types";



export default function AnswerPage({ changeToPage, question_in }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const answersPerPage = 5;
  const isLoggedIn = document.cookie.includes('isLoggedIn=true');
  // const [reputationError, setReputationError] = useState(false);
  //const [voteStatus, setVoteStatus] = useState('');

  console.log(question_in);
  const [question, setCurrentQuestion] = useState(question_in);
  // useEffect(() => {
  //   setCurrentQuestion(question);
  // }, [question]);
  const tagSideItem = document.querySelector("#tag");
  tagSideItem.classList.remove("active");
  const questionSideItem = document.querySelector("#question");
  questionSideItem.classList.remove("active");

  let tagsList = question.tags.map((tag) => (
    <div className="small" key={tag._id}>
      {`${tag.name}`}
    </div>
  ));

  async function upvote_q() {
    try {
      const response = await axios.post(`http://localhost:8000/question/${question._id}/vote`, {
        op: 'upvote',
        //switch: voteStatus === 'downvote',
      });
      if (response.data.status === 'SUCCESS') {
        const res = await axios.get(`http://localhost:8000/questions/${question._id}`);
        setCurrentQuestion(res.data);
      } else if (response.data.status === "LOW-REPUTATION") {
        alert("Your reputation must be 50 or higher to vote!");
      }
    } catch (error) {
      console.error(error);
      // Handle error if necessary
    }
  }

  async function downvote_q() {
    try {
      const response = await axios.post(`http://localhost:8000/question/${question._id}/vote`, {
        op: 'downvote',
        //switch: voteStatus === 'upvote',
      });
      if (response.data.status === 'SUCCESS') {
        const res = await axios.get(`http://localhost:8000/questions/${question._id}`);
        console.log(res.data);
        setCurrentQuestion(res.data);
      } else if (response.data.status === "LOW-REPUTATION") {
        alert("Your reputation must be 50 or higher to vote!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  let votes = question.upvote.length - question.downvote.length;

  // Create header element
  const header = (
    <div className="header">
      <div className="headerQuestion">
        <div className="headerTitle">{`${question.answers.length} Answers`}</div>
        <div className="questionTitle">{question.title}</div>
        {isLoggedIn &&
          <button
            className="headerButton"
            onClick={() => {
              changeToPage("questionModal");
            }}
          >
            Ask Question
          </button>
        }
      </div>
      <div className="headerQuestion">
        <div className="headerInfo">
          <button id="upvote" className="vote-button" onClick={upvote_q}>
            <span className="vote-icon">&#9650;</span>
          </button>
          <span
            className="vote-count"
            id="upvote"
          >{`Votes: ${votes}`}</span>
          <button id="downvote" className="vote-button" onClick={downvote_q}>
            <span className="vote-icon">&#9660;</span>
          </button>
          <div className="headerNumber">{`${question.views} views`}</div>
        </div>
        <QText text={question.text} />
        <div className="headerUser">
          <div className="username">{question.asked_by.username}</div>
          <div className="date">{`asked ${Model.dateFormat(
            question.ask_date_time
          )}`}</div>
        </div>
        <div className="questionTags">Tags: {tagsList}</div>
      </div>
    </div>
  );
  let answerItems; // question will changes based on amount.
  //  if (typeof questions == "undefined" || questions.length == 0) {
  if (question.answers.length === 0) {
    answerItems = (
      <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "24px" }}>
        No Answers
      </p>
    );
  } else {
    // console.log(questions);
    var indexOfLastAnswer = currentPage * answersPerPage;
    var indexOfFirstAnswer = indexOfLastAnswer - answersPerPage;
    var currentAnswers = question.answers.slice(
      indexOfFirstAnswer,
      indexOfLastAnswer
    );
    answerItems = currentAnswers.map((answer) => (
      <div key={answer._id}>
        <button onClick={() => changeToPage('answerEdit', { answer })}>Edit Answer</button>
        <Answer ans={answer} />
      </div>
    ));
  }
  const goToNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };
  const isFirstPage = currentPage === 1;
  const isLastPage = indexOfLastAnswer >= question.answers.length;


  
  const commentsPerPage =3;
  let commentItems; // question will changes based on amount.
  //  if (typeof questions == "undefined" || questions.length == 0) {
  if (question.comments.length === 0) {
    commentItems = (
      <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "24px" }}>
        No Comments
      </p>
    );
  } else {
    // console.log(questions);
    var indexOfLastComment = currentPage2 * commentsPerPage;
    var indexOfFirstComment = indexOfLastComment - commentsPerPage;
    var currentComments = question.comments.slice(
      indexOfFirstComment,
      indexOfLastComment
    );
    // const response = await axios.get(`http://localhost:8000/comments/${com._id}`);
    //       const real = response.data;
    commentItems = currentComments.map((comment) => (
      <div key={comment._id}>
        <Comment com={comment} />
      </div>
    ));
  }
  const IFP = currentPage2 === 1; //isFirstPage
  const ILP = indexOfLastComment >= question.comments.length; //isLastPage
  const goToNextPage2 = () => {
    setCurrentPage2(currentPage2 + 1);
  };

  const goToPreviousPage2 = () => {
    setCurrentPage2(currentPage2 - 1);
  };

  async function handleCommentSubmit(event) {
    if (event.key === 'Enter') {
      const commentText = event.target.value;
      const trimmedComment = commentText.trim();
      if (trimmedComment.length < 0 || trimmedComment.length > 140) {
        alert("Must be less than 140 characters");
        return;
      }
      const qstnId = question._id; // Replace with the actual question ID
      axios
        .post(`http://localhost:8000/question/${qstnId}/postcomment`, { text: commentText })
        .then((response) => {
          // Handle the response here
          console.log(response.data);
          if (response.data.status === 'SUCCESS') {
            axios.get(`http://localhost:8000/questions/${question._id}`).then((res)=>{
              setCurrentQuestion(res.data);
           })
          } else if(response.data.status === "LOW-REPUTATION"){
            alert("Your reputation must be 50 or higher to comment!");
          }
        })
        .catch((error) => {
            console.error(error);
            alert("Error! Must be registered user");
        });
      // Clear the input field
      event.target.value = '';
    }
  }

  return (
    <>
      {header}
      <div className="content-container">
        {commentItems}
        <div className="pagination-buttons">
        <button className="ordering" disabled={IFP} onClick={goToPreviousPage2}>
          Prev
        </button>
        <button className="ordering" disabled={ILP} onClick={goToNextPage2}>
          Next
        </button>
        <p>{indexOfFirstComment}......{indexOfLastComment}</p>
      </div>
      <input
      type="text"
      placeholder="Enter your comment"
      onKeyUp={handleCommentSubmit}
    />
        {answerItems}
        <div className="pagination-buttons">
          <button className="ordering" disabled={isFirstPage} onClick={goToPreviousPage}>
            Prev
          </button>
          <button className="ordering" disabled={isLastPage} onClick={goToNextPage}>
            Next
          </button>
          <p>{indexOfFirstAnswer}......{indexOfLastAnswer}</p>
        </div>
        {isLoggedIn &&
          <button
            className="botButton"
            id="postAnswer"
            onClick={() => changeToPage("answerModal", { question })}
          >
            Answer Question
          </button>
        }
      </div>
    </>
  );
}
const QText = ({ text }) => {
  const convertedText = text.replace(
    /\[([^\]]+)\]\((.*?)\)/g,
    '<a href="$2" target = "_blank">$1</a>'
  );
  return (
    <div
      className="questionText"
      dangerouslySetInnerHTML={{ __html: convertedText }}
    />
  );
};

AnswerPage.propTypes = {
  changeToPage: PropTypes.func.isRequired,
  question_in: PropTypes.object.isRequired,
};

QText.propTypes = {
  text: PropTypes.string.isRequired,
};
