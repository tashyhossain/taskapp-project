import './style.scss'
import Event from './modules/event'
import View from './modules/view'
import Page, { getPage } from './modules/page'
import Form from './modules/form'
import App from './modules/app'
import Project from './modules/project'

const initialize = (function() {
  View(document.querySelector('#app'))
  
  if (localStorage.length == 0) {
    Project.set([{
      name: 'inbox',
      color: null,
      tasks: [],
      id: 'inbox'
    }])
  }
  
  Event.publish('PAGE-REQUEST', getPage('today'))
})()