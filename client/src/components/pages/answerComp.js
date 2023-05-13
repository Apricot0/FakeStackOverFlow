import Model from '../../models/model'
import PropTypes from 'prop-types';
import React from 'react';
// import { useState } from "react";

export default function Answer (props) {
  const { answer } = props
  return (
    <div className="answer">
      <AnswerText text = {answer.text}/>
      <div className="user-container">
        <div className="username">{answer.ans_by}</div>
        <div className="date">{`answered ${Model.dateFormat(
          answer.ans_date_time
        )}`}</div>
      </div>
    </div>
  )
}
Answer.propTypes = {
  answer: PropTypes.shape({
    text: PropTypes.string.isRequired,
    ans_by: PropTypes.string.isRequired,
    ans_date_time: PropTypes.string.isRequired
  }).isRequired
};

const AnswerText = ({ text }) => {
  const convertedText = text.replace(/\[([^\]]+)\]\((.*?)\)/g, '<a href="$2" target = "_blank">$1</a>')
  return <div className="answerText" dangerouslySetInnerHTML={{ __html: convertedText }} />
}

AnswerText.propTypes = {
  text: PropTypes.string.isRequired
};
