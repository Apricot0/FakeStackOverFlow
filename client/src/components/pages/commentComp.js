import Model from '../../models/model'
import PropTypes from 'prop-types';
import React from 'react';
import axios from 'axios'
import { useState, useEffect } from "react";
// import { useState } from "react";

export default function Comment (props) {
    const { com } = props
    console.log(com);
  // const real = await axios.get(`http://localhost:8000/answers/${ans._id}`);
    // console.log(ans);
    const [comment, setCurrentComment] = useState(com);
    //const [voteStatus, setVoteStatus] = useState('');
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/comments/${com._id}`);
          const real = response.data;
          setCurrentComment(real);
          console.log(real);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }, []);
  useEffect(() => {
    setCurrentComment(comment);
  }, [comment]);

  async function upvote_c() {
    try {
      const response = await axios.put(`http://localhost:8000/comments/${comment._id}/upvote`, {
      op: 'upvote',
      //switch: voteStatus === 'downvote',
    })
      if (response.data.status === 'SUCCESS') {
        const res = await axios.get(`http://localhost:8000/comments/${comment._id}`);
        console.log(res.data);
        setCurrentComment(res.data);
      } else if(response.data.status === "LOW-REPUTATION"){
        alert("Your reputation must be 50 or higher to vote!");
      }
    } catch (error) {
      console.error(error);
      alert("Error! Must be registered user");
      // Handle error if necessary
    }
  }

  let votes = comment.upvote.length;

  return (
    <div className="answer">
      <div className="headerInfo">
          <button id= "upvote" className="vote-button" onClick={upvote_c}>
            <span className ="vote-icon">&#9650;</span>
          </button>
          <span
              className ="vote-count"
              id="upvote"
            >{`Votes: ${votes}`}</span>
      </div>
      <AnswerText text = {comment.text}/>
      <div className="user-container">
        <div className="username">{comment.ans_by.username}</div>
        <div className="date">{`commented ${Model.dateFormat(
          comment.ans_date_time
        )}`}</div>
      </div>
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
