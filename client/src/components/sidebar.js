
import React from 'react'
import PropTypes from 'prop-types'
export default function SideBar ({ changeToPage, indicator }) {
  let questionClass = 'sideItem'
  let tagClass = 'sideItem'
  if (indicator === 'question') {
    questionClass += ' active'
  } else {
    tagClass += ' active'
  }
  return (
    <div className="sidebar">
      <div
        style={{ cursor: 'pointer' }}
        className={questionClass}
        id="question"
        onClick={() => changeToPage('questionPage')}
      >
        Questions
      </div>
      <div
        style={{ cursor: 'pointer' }}
        className={tagClass}
        id="tag"
        onClick={() => changeToPage('tagsPage')}
      >
        Tags
      </div>
    </div>
  )
}
SideBar.propTypes = {
  changeToPage: PropTypes.func.isRequired,
  indicator: PropTypes.string.isRequired
}