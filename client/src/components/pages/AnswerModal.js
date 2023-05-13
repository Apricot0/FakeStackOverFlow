// import Model from "../../models/model";

// import { useState } from "react";
// function postAnswerButton(question){
//   const post = document.querySelector('#form');
//   post.addEventListener('submit',function(event) {
//       Controller.submitAnswers(event,question);
//   });
// }
import React from 'react'
import axios from 'axios'
import PropTypes from 'prop-types';
export default function AnswerPage ({ changeToPage, question }) {
  async function submitAnswer (event, question) {
    event.preventDefault()
    const usernameInput = document.querySelector('#username')
    const answerTextInput = document.querySelector('#input_text')
    const username = usernameInput.value.trim()
    const answerText = answerTextInput.value.trim()
    // Clear input fields
    usernameInput.value = ''
    answerTextInput.value = ''
    // console.log(question);
    const questionId = question._id
    axios.post(`http://localhost:8000/questions/${questionId}/postAnswer`, {
      username,
      inputText: answerText
    })
      .then((response) => {
      // Update the question with the new answer
      // console.log(response);
        const updatedQuestion = response.data
        console.log('updated question', updatedQuestion)
        changeToPage('answerPage', { question: updatedQuestion })
      })
      .catch(function (error) {
        console.error(error)
      })

    // Model.addAnswerToQuestion(question, answerText,username);
    // changeToPage('answerPage', {question});
  }
  const handleTextInput = (event) => {
    let isValid = true
    const input = event.target
    const value = input.value
    const matches = value.match(/\[[^\]]+\]\((.*?)\)/g)
    if (matches != null) {
      const urls = matches.map(match => {
        const url = match.match(/\((.*?)\)/)[1]
        return url
      })
      urls.forEach(url => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          console.log(`${url} starts with http:// or https://`)
        } else {
          console.log(`${url} does not start with http:// or https://`)
          isValid = false
        }
      })
    }
    if (!isValid) {
      input.setCustomValidity('Invalid hyperlink format. The target of a hyperlink must begin with "https://" or "http://".')
    } else {
      input.setCustomValidity('')
    }
  }
  return (
    <form action="#" method="post" id="form" onSubmit={(e) => submitAnswer(e, question)}>
      <div className="form-container">
        <div className="input">
          <label htmlFor="username">Username*</label>
          <input
            type="text"
            name="username"
            id="username"
            minLength="1"
            required
          />
        </div>
        <div className="input">
          <label htmlFor="input_text">Answer Text*</label>
          <em>Add details</em>
          <textarea
            name="input_text"
            id="input_text"
            minLength="1"
            required
            onInput={handleTextInput}
          ></textarea>
        </div>
        <div>
          <button className="botButton" style={{ submit: 'submit' }}>
            Post Answer
          </button>
          <p className="mustfillHint">*indicates mandatory fields</p>
        </div>
      </div>
    </form>
  )
}

AnswerPage.propTypes = {
  changeToPage: PropTypes.func.isRequired,
  question: PropTypes.object.isRequired,
};