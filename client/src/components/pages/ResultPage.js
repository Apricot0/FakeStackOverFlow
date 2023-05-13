import Model from '../../models/model'
import { useState } from 'react'
import Question from './questionComp'
import React from 'react'
import PropTypes from 'prop-types'

export default function ResultPage ({ changeToPage, list, headerName = 'Search Result' }) {
  // const tagSideItem = document.querySelector('#tag');
  // tagSideItem.classList.remove('active');
  // const questionSideItem = document.querySelector('#question');
  // questionSideItem.classList.add('active');

  const [ordering, setOrdering] = useState('Newest')
  // Create the header element
  const handleOrderingChange = (page) => {
    setOrdering(page)
  }
  const header = (
        <div className="header">
            <div className="headerTop">
                <div className="headerTitle">{headerName}</div>
                <button
                    className="headerButton"
                    onClick={() => changeToPage('questionModal')}
                >
                    Ask Question
                </button>
            </div>
            <div className="headerBottom">
                <div className="headerNumber">{list.length} Questions
                </div>
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
  let questionItems, qList
  if (ordering === 'Newest') {
    qList = Model.getNewestInList(list)
  } else if (ordering === 'Active') {
    qList = Model.getActiveInList(list)
  } else if (ordering === 'Unanswered') {
    qList = Model.getUnansweredInList(list)
  }
  if (typeof qList === 'undefined' || qList.length === 0) {
    questionItems = (
            <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '24px' }}>
                No Questions
            </p>
    )
  } else {
    questionItems = qList.map((question) => (
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
ResultPage.propTypes = {
    changeToPage: PropTypes.func,
    list: PropTypes.array,
    headerName: PropTypes.string
}
