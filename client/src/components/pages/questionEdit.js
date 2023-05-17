// import Model from '../../models/model'
import axios from 'axios'
//import { set } from 'mongoose';
import { useState } from "react";
import React from 'react'
//import PropTypes from 'prop-types'

axios.defaults.withCredentials = true;

export default function QuestionEdit({ changeToPage, question_in }) {
    console.log("edit",question_in);

  const [errorMessage, setErrorMessage] = useState('');
  const [title, setTitle] = useState(question_in.title);
  const [summary, setSummary] = useState(question_in.summary);
  const [text, setText] = useState(question_in.text);
  const initail_tag = question_in.tags.map((tag) => tag.name).join(' ')
  const [tags, setTags] = useState(initail_tag);



  const handleTitleInput = (event) => {
    setTitle(event.target.value);
    const value = event.target.value.trim()
    if (value.length === 0 || /^\s*$/.test(value)) {
      event.target.setCustomValidity(
        'Title cannot be empty or only contain whitespace'
      )
    } else {
      event.target.setCustomValidity('')
    }
  }

  const handleSummaryInput = (event) => {
    setSummary(event.target.value);
    event.target.setCustomValidity('')
  }
  const handleTagInput = (event) => {
    setTags(event.target.value);
    const tagString = event.target.value.trim()
    const tags = tagString.split(/\s+/)
    const tagSet = new Set(tags)
    const hyphenatedWordRegex = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/
    const tagLengthLimit = 10

    if (tags.length > 5) {
      event.target.setCustomValidity('You can add at most 5 tags')
    } else if (tags.some((tag) => tag.length > tagLengthLimit)) {
      event.target.setCustomValidity(
        `Tag length should not exceed ${tagLengthLimit} characters`
      )
    } else if (tags.some((tag) => !hyphenatedWordRegex.test(tag))) {
      event.target.setCustomValidity(
        'Tags should be one word or hyphenated words'
      )
    } else if (tags.length !== tagSet.size) {
      event.target.setCustomValidity('Tags should not have duplicates')
    } else {
      event.target.setCustomValidity('')
    }
  }
  const handleTextInput = (event) => {
    setText(event.target.value);
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
  function submitQuestion(event) {
    event.preventDefault()
    const form = event.target
    const title = form.elements['question-title'].value.trim()
    const summary = form.elements['question-summary'].value.trim()
    const text = form.elements.input_text.value.trim()
    const tagsInput = form.elements.tags.value.trim()
    const tags = tagsInput.split(/\s+/)
    console.log(tags)
    //const username = form.elements.username.value.trim()
    axios.post(`http://localhost:8000/questions/${question_in._id}/editquestion`, {
      title,
      summary,
      text,
      tags,
      //askedBy: username
    }).then(() => {
      // form.reset();
      console.log('hi')
      changeToPage('profilePage')
    })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {
          setErrorMessage(`Post failed: ${error.response.data.message}`);
          console.error(error.response.data.message)
        }else{
          setErrorMessage("Error due to server: ", error.status)
        }

      })

    // add question and add tag
    // const tagIds = tags.map((tag) => Model.addTag(tag));
    // Model.addQuestion(title, text, tagIds, username);
    // changeToPage("questionPage");
  }
  // onSubmit={handleSubmit}
  return (
    <form onSubmit={submitQuestion} id="form" action="#" method="post">
      <div className="form-container">
        <div className="input">
          <label htmlFor="question-title">Question Title*</label>
          <em>Limit text to 50 characters or less</em>
          <input
            type="text"
            name="question-title"
            id="question-title"
            maxLength={50}
            required
            onInput={handleTitleInput}
            value={title}
          />
        </div >
        <div className="input">
        <label htmlFor="question-summary">Question Summary*</label>
          <em>Limit text to 140 characters or less</em>
          <input
            type="text"
            name="question-summary"
            id="question-summary"
            maxLength={140}
            required
            onInput={handleSummaryInput}
            value={summary}
          />
        </div>
        <div className="input">
          <label htmlFor="input_text">Question Text*</label>
          <em>Add details</em>
          <textarea
            name="input_text"
            id="input_text"
            minLength={1}
            required
            onInput={handleTextInput}
            value={text}
          ></textarea>
        </div>
        <div className="input">
          <label htmlFor="tags">Tags*</label>
          <em>Add keywords separated by whitespace</em>
          <input
            type="text"
            name="tags"
            id="tags"
            required
            onInput={handleTagInput}
            value = {tags}
          />
        </div>
        {/*
        <div className="input">
          <label htmlFor="username">Username*</label>
          <input
            type="text"
            name="username"
            id="username"
            minLength={1}
            required
          />
        </div>
        */}
        <div>
          <button type="submit" className="botButton">
            RePost Question
          </button>
          <p className="mustfillHint">*indicates mandatory fields</p>
        </div>
        <p className='welcome_error'>{errorMessage}</p>
      </div>
    </form >
  )
}