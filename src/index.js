import './style.scss'
import Event from './modules/event'
import View from './modules/view'
import Page from './modules/page'
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

  let page = document.querySelector('[data-id="today"]')

  Event.publish('PAGE-REQUEST', { 
    id: page.dataset.id, 
    title: page.dataset.title 
  })
})()