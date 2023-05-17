import Model from "../../models/model";
import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import PropTypes from "prop-types";

export default function MyAnswersPage({ changeToPage }) {
  const [answers, setAnswers] = useState([]);
  console.log("hi");
  useEffect(() => {
    axios
      .get("http://localhost:8000/myanswers")
      .then((response) => {
        setAnswers(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  console.log(answers);
  const Answer = ({ answer }) => {
    return (
      <div className="newAnswer">
        <div className="answer">
          <AnswerText text={answer.text} />
          <div className="user-container">
            <div className="username">{answer.ans_by.username}</div>
            <div className="date">{`answered ${Model.dateFormat(
              answer.ans_date_time
            )}`}</div>
          </div>
        </div>
      </div>
    );
  };
  const AnswerText = ({ text }) => {
    const convertedText = text.replace(
      /\[([^\]]+)\]\((.*?)\)/g,
      '<a href="$2" target = "_blank">$1</a>'
    );
    return (
      <div
        className="answerText"
        dangerouslySetInnerHTML={{ __html: convertedText }}
      />
    );
  };
  let answerItems;
  if (answers.length === 0) {
    answerItems = (
      <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "24px" }}>
        No Answers
      </p>
    );
  } else {
    answerItems = answers.map((answer) => (
      <div key={answer._id}>
        <Answer answer={answer} />
      </div>
    ));
    console.log(answerItems);
  }
  
  return answerItems
}
