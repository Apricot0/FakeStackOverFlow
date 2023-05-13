
// import { useState, useEffect } from 'react';

import { useState } from 'react'
import Model from '../models/model'
import React from 'react'
import PropTypes from 'prop-types'

export default function Header ({ changeToPage }) {
  const [searchValue, setSearchValue] = useState('')

  function handleSearchChange (event) {
    setSearchValue(event.target.value)
  }

  async function searchResult (event) {
    if (event.key === 'Enter') {
      const searchQuery = searchValue.trim()
      // change to something else;
      const qList = await Model.searchQuestions(searchQuery)
      console.log(qList)
      setSearchValue('')
      // changeToPage("questionPage")
      changeToPage('resultPage', {}, qList)
    }
  }

  return (
    <div id="title-container" className="title-container">
      <div className="title">Fake Stack Overflow</div>
      <input type="search" name="search" id="search" placeholder="Search . . ." value={searchValue} onChange={handleSearchChange} onKeyDown={searchResult} />
    </div>
  )
}

Header.propTypes = {
  changeToPage: PropTypes.func.isRequired
}