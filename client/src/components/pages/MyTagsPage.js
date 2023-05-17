// import Model from "../../models/model";
import { useState, useEffect } from 'react'
import Tag from './tagComp'
import axios from 'axios'
import React from 'react'
import PropTypes from 'prop-types'

axios.defaults.withCredentials = true;


export default function MyTagPage ({ changeToPage }) {
  const [tags, setTags] = useState([])

  useEffect(() => {
    axios.get('http://localhost:8000/mytags')
      .then(response => {
        setTags(response.data)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])
  console.log(tags)

  const deleteTag = async (tagId) => {
    try {
      axios.get(`http://localhost:8000/deleteTag/${tagId}`)
      const response = await axios.get('http://localhost:8000/mytags')
      setTags(response.data)
    } catch (error) {
      console.error(error)
    }
  }


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
                <button onClick={() => deleteTag(tag._id)}>Delete Tag</button>
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
MyTagPage.propTypes = {
  changeToPage: PropTypes.func.isRequired
}