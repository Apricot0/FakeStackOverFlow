import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
// import FakeStackOverflow from './components/fakestackoverflow.js'
import App from './App.js'

//ReactDOM.render(
//  <App />,
//  document.getElementById('root')
//)
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);