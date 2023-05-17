import React from 'react'
import Header from './header.js'
import SideBar from './sidebar.js'
import QuestionPage from './pages/QuestionPage'
import AnswerPage from './pages/AnswerPage'
import QuestionModal from './pages/QuestionModal'
import AnswerModal from './pages/AnswerModal'
import TagsPage from './pages/TagsPage'
import ResultPage from './pages/ResultPage.js'
import ProfilePage from './pages/profilePage.js'  
import MyTagPage from './pages/MyTagsPage.js'

let hn

export default class FakeStackOverflow extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentPage: 'questionPage',
      ql: [],
      indicator: 'question',
      // currentQuestion: null,
      qe: null
    }
    this.handlePageChange = this.handlePageChange.bind(this)
  }

  handlePageChange (page, { question } = {}, qList, headerName) {
    console.log('here is changeToPage', qList)
    console.log(page)
    // console.log("question pass in page change: ",question)
    // this.setState({currentQuestion: question });
    this.setState({ qe: question })
    this.setState({ currentPage: page, ql: qList })
    if (page === 'tagsPage') {
      this.setState({ indicator: 'tag' })
    } else if (page === 'questionPage') {
      this.setState({ indicator: 'question' })
    }
    // this.setState({ qe: question });
    console.log('qe', this.state.qe)
    hn = headerName
  }

  render () {
    console.log(this.state)
    let pageToRender
    if (this.state.currentPage === 'questionPage') {
      pageToRender = <QuestionPage changeToPage={this.handlePageChange} />
    } else if (this.state.currentPage === 'answerPage') {
      pageToRender = (
        <>
        {this.state.qe
          ? (
          <AnswerPage changeToPage={this.handlePageChange} question_in={this.state.qe} />
            )
          : null}
        </>
      )
    } else if (this.state.currentPage === 'questionModal') {
      pageToRender = (
        <QuestionModal changeToPage={this.handlePageChange} />
      )
    } else if (this.state.currentPage === 'answerModal') {
      pageToRender = (
        <AnswerModal changeToPage={this.handlePageChange} question={this.state.qe} />
      )
    } else if (this.state.currentPage === 'tagsPage') {
      // this.setState({ indicator: 'tag' });
      pageToRender = (
        <TagsPage changeToPage={this.handlePageChange} />
      )
    } else if (this.state.currentPage === 'resultPage') {
      const list = this.state.ql
      const headerName = hn || ''
      pageToRender = (
        <ResultPage
          changeToPage={this.handlePageChange}
          list={list}
          headerName={headerName}
        />
      )
    } else if (this.state.currentPage === 'profilePage') {
      pageToRender = (
        <ProfilePage changeToPage={this.handlePageChange} />
      )
    } else if (this.state.currentPage === 'myTagsPage') {
      pageToRender = (
        <MyTagPage changeToPage={this.handlePageChange} />
      )
    }

    return (
      <div className="container">
        <Header changeToPage={this.handlePageChange} />
        <SideBar changeToPage={this.handlePageChange} indicator={this.state.indicator} />
        <div id="main-container" className="main-container">
          {pageToRender}
        </div>
      </div>
    )
  }
}
