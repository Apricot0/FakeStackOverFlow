import Model from '../../models/model'
import PropTypes from 'prop-types';
import React from 'react';
import axios from 'axios'
import { useState, useEffect } from "react";
import Comment from "./commentComp";
// import { useState } from "react";

export default function Answer (props) {
    const { ans } = props
  // const real = await axios.get(`http://localhost:8000/answers/${ans._id}`);
    // console.log(ans);
    const [answer, setCurrentAnswer] = useState(ans);
    const [currentPage2, setCurrentPage2] = useState(1);
    //const [voteStatus, setVoteStatus] = useState('');
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/answers/${ans._id}`);
          const real = response.data;
          setCurrentAnswer(real);
          console.log(real);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }, [ans._id]);
  useEffect(() => {
    setCurrentAnswer(answer);
  }, [answer]);
  async function upvote_a() {
    try {
      const response = await axios.post(`http://localhost:8000/answer/${answer._id}/vote`, {
      op: 'upvote',
      //switch: voteStatus === 'downvote',
    })
      if (response.data.status === 'SUCCESS') {
        const res = await axios.get(`http://localhost:8000/answers/${answer._id}`);
        console.log(res.data);
        setCurrentAnswer(res.data);
      } else if(response.data.status === "LOW-REPUTATION"){
        alert("Your reputation must be 50 or higher to vote!");
      }
    } catch (error) {
      console.error(error);
      // Handle error if necessary
    }
  }

  async function downvote_a() {
    try {
      const response = await axios.post(`http://localhost:8000/answer/${answer._id}/vote`, {
        op: 'downvote',
        //switch: voteStatus === 'upvote',
      });
      if (response.data.status === 'SUCCESS') {
        const res = await axios.get(`http://localhost:8000/answers/${answer._id}`);
        setCurrentAnswer(res.data);
      } else if(response.data.status === "LOW-REPUTATION"){
        alert("Your reputation must be 50 or higher to vote!");
      }
    } catch (error) {
      console.error(error);
    }
  }
  console.log(answer);
  let votes = answer.upvote.length - answer.downvote.length;
  
  const commentsPerPage =3;
  let commentItems; // question will changes based on amount.
  //  if (typeof questions == "undefined" || questions.length == 0) {
  if (answer.comments.length === 0) {
    commentItems = (
      <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "14px" }}>
        No Comments
      </p>
    );
  } else {
    // console.log(questions);
    var indexOfLastComment = currentPage2 * commentsPerPage;
    var indexOfFirstComment = indexOfLastComment - commentsPerPage;
    var currentComments = answer.comments.slice(
      indexOfFirstComment,
      indexOfLastComment
    );
    commentItems = currentComments.map((comment) => (
      <div key={comment._id}>
        <Comment com={comment} />
      </div>
    ));
  }
  const IFP = currentPage2 === 1; //isFirstPage
  const ILP = indexOfLastComment >= answer.comments.length; //isLastPage
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
      const ansId = answer._id; // Replace with the actual question ID
      axios
        .post(`http://localhost:8000/answer/${ansId}/postcomment`, { text: commentText })
        .then((response) => {
          // Handle the response here
          console.log(response.data);
          if (response.data.status === 'SUCCESS') {
            axios.get(`http://localhost:8000/answers/${ansId}`).then((res)=>{
              setCurrentAnswer(res.data);
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
    <div className="newAnswer">
    <div className="answer">
      <div className="headerInfo">
          <button id= "upvote" className="vote-button" onClick={upvote_a}>
            <span className ="vote-icon">&#9650;</span>
          </button>
          <span
              className ="vote-count"
              id="upvote"
            >{`Votes: ${votes}`}</span>
          <button id="downvote" className ="vote-button" onClick={downvote_a}>
            <span className ="vote-icon">&#9660;</span>
          </button>
      </div>
      <AnswerText text = {answer.text}/>
      <div className="user-container">
        <div className="username">{answer.ans_by.username}</div>
        <div className="date">{`answered ${Model.dateFormat(
          answer.ans_date_time
        )}`}</div>
      </div>
      
    </div>
    {commentItems}
        <div className="pagination-buttons">
        <button className="ordering smaller" disabled={IFP} onClick={goToPreviousPage2}>
          Prev
        </button>
        <button className="ordering smaller" disabled={ILP} onClick={goToNextPage2}>
          Next
        </button>
        <p>{indexOfFirstComment}......{indexOfLastComment}</p>
      </div>
      <input
      type="text"
      placeholder="Enter your comment"
      onKeyUp={handleCommentSubmit}
      id ="answerInput"
    />
    </div>
  )
}
// Answer.propTypes = {
//   answer: PropTypes.shape({
//     text: PropTypes.string.isRequired,
//     ans_by: PropTypes.string.isRequired,
//     ans_date_time: PropTypes.string.isRequired
//   }).isRequired
// };

const AnswerText = ({ text }) => {
  const convertedText = text.replace(/\[([^\]]+)\]\((.*?)\)/g, '<a href="$2" target = "_blank">$1</a>')
  return <div className="answerText" dangerouslySetInnerHTML={{ __html: convertedText }} />
}

AnswerText.propTypes = {
  text: PropTypes.string.isRequired
};
