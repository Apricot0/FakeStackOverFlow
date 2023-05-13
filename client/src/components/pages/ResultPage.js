import Model from '../../models/model'
import { useState } from 'react'
import Question from './questionComp'
import React from 'react'
import PropTypes from 'prop-types'

export default function ResultPage({ changeToPage, list, headerName = 'Search Result' }) {
    // const tagSideItem = document.querySelector('#tag');
    // tagSideItem.classList.remove('active');
    // const questionSideItem = document.querySelector('#question');
    // questionSideItem.classList.add('active');

    const [ordering, setOrdering] = useState('Newest')
    const isLoggedIn = document.cookie.includes('isLoggedIn=true')
    const [currentPage, setCurrentPage] = useState(1)
    const questionsPerPage = 5
    // Create the header element
    const handleOrderingChange = (page) => {
        setOrdering(page)
    }
    const header = (
        <div className="header">
            <div className="headerTop">
                <div className="headerTitle">{headerName}</div>
                {isLoggedIn &&
                    <button
                        className="headerButton"
                        onClick={() => changeToPage('questionModal')}
                    >
                        Ask Question
                    </button>
                }
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
        var indexOfLastQuestion = currentPage * questionsPerPage;
        var indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
        var currentQuestions = qList.slice(indexOfFirstQuestion, indexOfLastQuestion);
        questionItems = currentQuestions.map((question) => (
            <div key={question._id}>
                <Question question={question} changeToPage={changeToPage} />
            </div>
        ))
    }

    const goToNextPage = () => {
        setCurrentPage(currentPage + 1);
    };

    const goToPreviousPage = () => {
        setCurrentPage(currentPage - 1);
    };

    const isFirstPage = currentPage === 1;
    const isLastPage = indexOfLastQuestion >= qList.length;


    return (
        <>
            {header}
            <div className="content-container question-list">{questionItems}</div>
            <div className="pagination-buttons">
                <button className="ordering" disabled={isFirstPage} onClick={goToPreviousPage}>
                    Prev
                </button>
                <button className="ordering" disabled={isLastPage} onClick={goToNextPage}>
                    Next
                </button>
                <p>{indexOfFirstQuestion}......{indexOfLastQuestion}</p>
            </div>
        </>
    )
}
ResultPage.propTypes = {
    changeToPage: PropTypes.func,
    list: PropTypes.array,
    headerName: PropTypes.string
}
