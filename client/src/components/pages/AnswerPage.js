import Model from '../../models/model'
import { useState, useEffect } from 'react'
import Answer from './answerComp'
import React from 'react'
import PropTypes from 'prop-types';

export default function AnswerPage ({ changeToPage, question_in }) {
  console.log(question_in)
  const [question, setCurrentQuestion] = useState(question_in)
  useEffect(() => {
    setCurrentQuestion(question)
  }, [question])
  const tagSideItem = document.querySelector('#tag')
  tagSideItem.classList.remove('active')
  const questionSideItem = document.querySelector('#question')
  questionSideItem.classList.remove('active')

  // Create header element
  const header = (
    <div className="header">
      <div className="headerQuestion">
        <div className="headerTitle">{`${question.answers.length} Answers`}</div>
        <div className="questionTitle">{question.title}</div>
        <button className="headerButton" onClick={() => { changeToPage('questionModal') }}>Ask Question</button>
      </div>
      <div className="headerQuestion">
        <div className="headerNumber">{`${question.views} views`}</div>
        <QText text = {question.text}/>
        <div className="headerUser">
          <div className="username">{question.asked_by}</div>
          <div className="date">{`asked ${Model.dateFormat(
            question.ask_date_time
          )}`}</div>
        </div>
      </div>
    </div>
  )
  const answerItems = question.answers.map(answer =>
    <div key = {answer._id}>
      <Answer answer = {answer} />
    </div>
  )
  return (
    <>
      {header}
      <div className="content-container">
        {answerItems}
        <button className="botButton" id="postAnswer" onClick={() => changeToPage('answerModal', { question })}>
          Answer Question
        </button>
      </div>
    </>
  )
}
const QText = ({ text }) => {
  const convertedText = text.replace(/\[([^\]]+)\]\((.*?)\)/g, '<a href="$2" target = "_blank">$1</a>')
  return <div className="questionText" dangerouslySetInnerHTML={{ __html: convertedText }} />
}

AnswerPage.propTypes = {
  changeToPage: PropTypes.func.isRequired,
  question_in: PropTypes.object.isRequired,
};

QText.propTypes = {
  text: PropTypes.string.isRequired
}