import { format } from 'date-fns'
import { append, create, wipe } from './helpers'
import pubsub from './pubsub'

const date = (function() {
  let dom = document.querySelector('#todays-date')
  let day = create('span', 'current-day', format(Date.now(), 'EEEE '))
  let date = document.createTextNode(format(Date.now(), 'MMMM do yyyy'))

  append(dom, day, date)
  return dom
})()

const open = function(dom) {
  dom.classList.remove('narrow')
}

const close = function(dom) {
  let projects = document.querySelector('#projects-nav') 

  if (projects.classList.contains('show')) {
    projects.classList.remove('show')
  }

  dom.classList.add('narrow')
}

const deactivate = function(dom) {
  let views = dom.parentNode.querySelectorAll('button')
  views.forEach(view => {
    view.classList.remove('active')
  })
}

const activate = function(view) {
  let dom = document.querySelector(`#${view}-btn`)
  
  deactivate(dom)
  dom.classList.add('active')
  return dom
}

const title = function(view) {
  let dom = document.querySelector('#page-title')
  let name = document.querySelector(`[data-view="${view}"]`)
  dom.textContent = name.getAttribute('data-title')
  return dom
}

const content = function(view) {
  let dom = document.querySelector('main')
  let tasklist = create('div', `${view}-tasklist`)

  wipe(dom)
  append(dom, tasklist)
  pubsub.publish(`${view.toUpperCase()}-RENDER`, tasklist)
  return dom
}

const structurer = function() {
  pubsub.subscribe('OPEN-REQUEST', open)
  pubsub.subscribe('CLOSE-REQUEST', close)
  pubsub.subscribe('PAGE-REQUEST', activate)
  pubsub.subscribe('PAGE-REQUEST', title)
  pubsub.subscribe('PAGE-REQUEST', content)
}

export default structurer()