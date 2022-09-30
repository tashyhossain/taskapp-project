import './sass/app.scss'
import Event from './modules/event'
import View from './modules/view'
import Project from './modules/project'
import Page, { getPage } from './modules/page'
import Form from './modules/form'
import App from './modules/app'

(function() {
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

  if (window.matchMedia('(max-width: 600px)').matches) {
    Event.publish('MOBILE-VIEW-REQUEST', document.body)
  } 
})()