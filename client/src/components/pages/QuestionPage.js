// import Model from "../../models/model";
import { useState, useEffect } from 'react'
import Question from './questionComp'
import axios from 'axios'
import React from 'react'
import PropTypes from 'prop-types'

export default function QuestionPage({ changeToPage }) {
  // const tagSideItem = document.querySelector('#tag');
  // tagSideItem.classList.remove('active');
  // const questionSideItem = document.querySelector('#question');
  // questionSideItem.classList.add('active');

  const [ordering, setOrdering] = useState('Newest')
  const [questions, setQuestions] = useState([])
  // Create the header element
  const handleOrderingChange = async (page) => {
    setOrdering(page)
    try {
      const response = await axios.get(`http://localhost:8000/questions?ordering=${page}`)
      setQuestions(response.data)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/questions?ordering=${ordering}`)
        // console.log(response.data);
        setQuestions(response.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchQuestions()
  }, [ordering]) // runs whenever dependency changes.
  const header = (
    <div className="header">
      <div className="headerTop">
        <div className="headerTitle">All Questions</div>
        <button
          className="headerButton"
          onClick={() => changeToPage('questionModal')}
        >
          Ask Question
        </button>
      </div>
      <div className="headerBottom">
        <div className="headerNumber">{questions.length} Questions</div>
        <div className="headerordering">
          <button
            className="ordering"
            id="NewestButton"
            onClick={() => handleOrderingChange('Newest')}
          >
            Newest
          </button>
          <button
            className="ordering"
            id="ActiveButton"
            onClick={() => handleOrderingChange('Active')}
          >
            Active
          </button>
          <button
            className="ordering"
            id="UnansweredButton"
            onClick={() => handleOrderingChange('Unanswered')}
          >
            Unanswered
          </button>
        </div>
      </div>
    </div>
  )
  //  let questions, questionItems;
  //  if (ordering === "Newest") {
  //    questions = Model.getNewest();
  //  } else if (ordering === "Active") {
  //    questions = Model.getActive();
  //  } else if (ordering === "Unanswered") {
  //    questions = Model.getUnanswered();
  //  }
  let questionItems // question will changes based on amount.
  //  if (typeof questions == "undefined" || questions.length == 0) {
  if (questions.length === 0) {
    questionItems = (
      <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '24px' }}>
        No Questions
      </p>
    )
  } else {
    // console.log(questions);
    questionItems = questions.map((question) => (
      <div key={question._id}>
        <Question question={question} changeToPage={changeToPage} />
      </div>
    ))
  }
  return (
    <>
      {header}
      <div className="content-container">{questionItems}</div>
    </>
  )
}

QuestionPage.propTypes = {
  changeToPage: PropTypes.func.isRequired
}