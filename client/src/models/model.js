import axios from 'axios'
class model {
  getNewestInList(questions) {
    return this.sortByNewestPost(questions)
  }

  getActiveInList(questions) {
    return this.sortByMostRecentlyAnswered(questions)
  }

  getUnansweredInList(questions) {
    const result = []
    questions.forEach(question => {
      if (question.answers.length == 0) {
        result.push(question)
      }
    })
    return result
  }

  sortByMostRecentlyAnswered(questions) {
    return questions.sort((a, b) => {
      const bAnswer = b.answers[b.answers.length - 1]
      const aAnswer = a.answers[a.answers.length - 1]
      if (!bAnswer && !aAnswer) {
        return 0
      }
      if (!aAnswer) {
        return 1
      }
      if (!bAnswer) {
        return -1
      }
      const Adate = new Date(aAnswer.ans_date_time)
      const Bdate = new Date(bAnswer.ans_date_time)
      return Bdate - Adate
    })
  }

  sortByNewestPost(questions) {
    return questions.sort((a, b) => {
      const Adate = new Date(a.ask_date_time)
      const Bdate = new Date(b.ask_date_time)
      return (Bdate - Adate)
    })
  }

  async searchQuestions(searchString) {
    const searchWords = searchString.toLowerCase().split(/\s+/)
    const filteredQuestions = []
    try {
      const res = await axios.get('http://localhost:8000/questions?ordering=Newest')
      const questions = res.data
      for (const question of questions) {
        let hasSearchWord = false
        // Check if the question title or text contains at least one of the search words
        const titleWords = question.title.toLowerCase().split(/\s+/)
        const textWords = question.text.toLowerCase().split(/\s+/)
        hasSearchWord = searchWords.some(word => titleWords.includes(word) || textWords.includes(word))
        // console.log("question examine:", question)
        // console.log("hasSearchWord: ",hasSearchWord)

        // Check if the question has any of the specified tags
        const tagMatches = searchString.match(/\[(.*?)\]/g)
        // console.log(tagMatches);
        let hasTag = false
        if (tagMatches) {
          const tagNames = tagMatches.map(match => match.slice(1, -1).toLowerCase())
          console.log(tagNames);
          console.log(question)
          hasTag = tagNames.some(tagName => question.tags.some(tag => {
            console.log(tag.name.toLowerCase(), tagName)
            return tag.name.toLowerCase() === tagName
          }))
        }
        // console.log("hasTag: ",hasSearchWord);
        if (hasSearchWord || hasTag) {
          filteredQuestions.push(question)
        }
      }
    } catch (error) {
      console.log(error)
    }

    return filteredQuestions
  }

  dateFormat(date_param) {
    const date = new Date(date_param)
    // console.log(date);
    // console.log(typeof (date));
    const now = new Date()
    const diff = (now - date) / 1000 // difference in seconds
    const oneDay = 86400 // number of seconds in a day

    if (diff < 60) {
      return `${Math.round(diff)} seconds ago`
    } else if (diff < 3600) {
      const mins = Math.round(diff / 60)
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`
    } else if (diff < oneDay) {
      const hours = Math.round(diff / 3600)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    } else {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
      ]
      const year = date.getFullYear()
      const month = monthNames[date.getMonth()]
      const day = date.getDate()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      if (diff < oneDay * 365) {
        return `${month} ${day} at ${hours}:${minutes}`
      } else {
        return `${month} ${day}, ${year} at ${hours}:${minutes}`
      }
    }
  }
}
const Model = new model()
export default Model
