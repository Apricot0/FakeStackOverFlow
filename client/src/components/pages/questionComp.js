import Model from '../../models/model'
// import { useState } from "react";
import axios from 'axios'
import React from 'react'
import PropTypes from 'prop-types'

export default function Question(props) {
  const { changeToPage, question } = props
  // console.log(question);
  // let key = question.qid;
  const tagItems = question.tags.map(tag =>
    <div key={tag._id} className="tag">{tag.name}</div>
  )
  const updateViews = () => {
    axios.put(`http://localhost:8000/questions/${question._id}/views`)
      .catch((err) => {
        console.error(err)
      })
  }
  return (
    <div className="content">
      <div className="counts">
        <div className="count">{question.answers.length} answers</div>
        <div className="count">{question.views} views</div>
        <div className="count">{question.upvote+question.downvote} votes</div>
      </div>
      <div className="question-container">
        <div
          className="question"
          data-id={question._id}
          onClick={() => {
            updateViews()
            // TODO: Model.updateViews(question);
            changeToPage('answerPage', { question })
          }
          }
        >
          {question.title}
        </div>
        <div className="tags">
          {tagItems}
        </div>
      </div>
      <div className="user-container">
        <div className="askedUser">
          {question.asked_by.username}
          <span className="date">
            {' '}asked {Model.dateFormat(question.ask_date_time)}
          </span>
        </div>
      </div>
    </div>
  )
}
Question.propTypes = {
  changeToPage: PropTypes.func.isRequired,
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })).isRequired,
    answers: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      ans_by: PropTypes.string.isRequired,
      ans_date_time: PropTypes.string.isRequired
    })).isRequired,
    asked_by: PropTypes.string.isRequired,
    ask_date_time: PropTypes.string.isRequired,
    views: PropTypes.number.isRequired
  }).isRequired
}