import Model from '../../models/model'
import PropTypes from 'prop-types';
import React from 'react';
import axios from 'axios'
import { useState, useEffect } from "react";
// import { useState } from "react";

export default function Answer (props) {
    const { ans } = props
  // const real = await axios.get(`http://localhost:8000/answers/${ans._id}`);
    // console.log(ans);
    const [answer, setCurrentAnswer] = useState(ans);
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
    }, []);
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
  let votes = answer.upvote.length - answer.downvote.length;

  return (
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
