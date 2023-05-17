import Model from '../../models/model'
import { useState, useEffect } from 'react'
import Question from './questionComp'
import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import model from '../../models/model'

axios.defaults.withCredentials = true;
//TODO>>>>>>>>>>>>
export default function ProfilePage({ changeToPage }) {
    // const tagSideItem = document.querySelector('#tag');
    // tagSideItem.classList.remove('active');
    // const questionSideItem = document.querySelector('#question');
    // questionSideItem.classList.add('active');
    const headerName = 'User Profile'
    const [ordering, setOrdering] = useState('Newest')
    const isLoggedIn = document.cookie.includes('isLoggedIn=true')
    const [currentPage, setCurrentPage] = useState(1)
    const [list, setQuestions] = useState([])
    const [timeDifference, setTimeDifference] = useState("")
    const [reputation, setReputation] = useState(0)
    const questionsPerPage = 5

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/userprofile`)
                console.log(response.data);
                const memberDate = new Date(response.data.create_date);

                // Construct the user-friendly duration message
                let durationMessage = model.dateFormat(memberDate);
                setTimeDifference(durationMessage);
                setReputation(response.data.reputation);
                console.log(response.data.reputation);
                setQuestions(response.data.questions)
                //setQuestions(response.data)
            } catch (error) {
                console.error(error)
            }
        }
        fetchProfile()
    }, [])
    // Create the header element
    const handleOrderingChange = (page) => {
        setOrdering(page)
    }
    const header = (
        <div className="header">
            <div className="headerTop">
                <div className="headerTitle">{headerName}</div>
                <div className="headerTitle">You have been a member {timeDifference}</div>
                <div className="headerTitle">reputation: {reputation}</div>
                {isLoggedIn &&
                    <button
                        className="headerButton"
                        onClick={() => changeToPage('questionModal')}
                    >
                        Ask Question
                    </button>
                }
            </div>
            <div>
                {isLoggedIn &&
                    <button
                        className="headerButton"
                        onClick={() => changeToPage('myTagsPage')}
                    >
                        My Tags
                    </button>
                }
            </div>
            <div className="headerBottom">
                <div className="headerNumber"> You asked {list.length} Questions
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
        //console.log(qList);
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
                <button onClick={() => changeToPage('questionEditPage', { question })}>Edit Question</button>
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
ProfilePage.propTypes = {
    changeToPage: PropTypes.func,
    list: PropTypes.array,
    headerName: PropTypes.string
}
