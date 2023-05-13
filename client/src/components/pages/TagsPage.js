// import Model from "../../models/model";
import { useState, useEffect } from 'react'
import Tag from './tagComp'
import axios from 'axios'
import React from 'react'
import PropTypes from 'prop-types'

export default function TagPage ({ changeToPage }) {
  const [tags, setTags] = useState([])

  useEffect(() => {
    axios.get('http://localhost:8000/tags')
      .then(response => {
        setTags(response.data)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])
  console.log(tags)

  let tagsList
  if (typeof tags === 'undefined' || tags.length === 0) {
    tagsList = (
            <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '24px' }}>
                No Tags
            </p>
    )
  } else {
    tagsList = tags.map((tag) => (
            <div key={tag._id}>
                <Tag tag={tag} changeToPage={changeToPage} />
            </div>
    ))
  }
  return (
        <div className="main-container">
        <header className="tagHeader">
          <div className="left-head">
            <span className="head-span">{`${tags.length} Tags`}</span>
          </div>
          <div className="right-head">
            <span className="head-span">All Tags</span>
          </div>
          <button className="headerButton" onClick={() => changeToPage('questionModal')}>Ask Question</button>
        </header>
        <div className="tagContainer">{tagsList}</div>
      </div>
  )
}
TagPage.propTypes = {
  changeToPage: PropTypes.func.isRequired
}