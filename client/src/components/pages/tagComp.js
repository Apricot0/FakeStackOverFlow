// import Model from "../../models/model";
// import { useState } from "react";
// import Question from "./questionComp";
// import { ReactDOM } from "react";
import axios from 'axios'
import React from 'react'
import PropTypes from 'prop-types'

export default function Tag ({ tag, changeToPage }) {
  // function showTag(tag) {
  //  console.log(tag);
  //    const qList = Model.getQuestionsByTag(tag.tid);
  //    let headerName = `Tag: ${tag.name}`;
  //    changeToPage("resultPage",{},qList,headerName);
  //  }
  async function showTag (tag) {
    try {
      const response = await axios.get(`http://localhost:8000/questions/tags/${tag._id}`)
      const qList = response.data
      console.log(qList)
      const headerName = `Tag: ${tag.name}`
      changeToPage('resultPage', {}, qList, headerName)
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <div className="tag-box">
      <button className="tag-name" href="#" onClick={() => showTag(tag)}>
        {tag.name}
      </button>
      <p className="tag-link">{tag.questionCount} questions</p>
    </div>
  )
}

Tag.propTypes = {
  tag: PropTypes.object.isRequired,
  changeToPage: PropTypes.func.isRequired
}
