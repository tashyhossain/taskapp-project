import html from '../assets/app.html'
import pubsub from './pubsub'
import { Project } from './projects'

const app = (function() {
  let dom = document.querySelector('#app-container')

  dom.insertAdjacentHTML('afterbegin', html)
  return dom
})()

const navigation = (function() {
  let views = document.querySelectorAll('[data-view]')

  views.forEach(view => {
    let name = view.getAttribute('data-view')
    view.addEventListener('click', () => {
      pubsub.publish('PAGE-REQUEST', name)
    })
  })

  return views
})()

const toggle = (function() {
  let nav = document.querySelector('#nav-container')
  let btn = document.querySelector('#toggle-btn')

  btn.addEventListener('click', () => {
    if (nav.classList.contains('narrow')) {
      pubsub.publish('OPEN-REQUEST', nav)
    } else {
      pubsub.publish('CLOSE-REQUEST', nav)
    }
  })
})()

const dropdown = (function() {
  let nav = document.querySelector('#nav-container')
  let btn = document.querySelector('#projects-btn')

  btn.addEventListener('click', () => {
    pubsub.publish('OPEN-REQUEST', nav)
  })
})()

const color = (function() {
  let colors = document.querySelectorAll('#color-options li')

  colors.forEach(color => {
    color.addEventListener('click', () => {
      pubsub.publish('RECOLOR-REQUEST', color)
    })
  })
})()

const recolor = function(color) {
  let current = document.querySelector('#current-color')
  let data = color.querySelector('.btn-color').getAttribute('data-color')
  let name = color.querySelector('.btn-name').textContent

  current.querySelector('.btn-color').setAttribute('data-color', data)
  current.querySelector('.btn-name').textContent = name
  document.querySelector('#color-input').value = data
}

const submit = (function() {
  let form = document.querySelector('#project-form')

  pubsub.subscribe('RECOLOR-REQUEST', recolor)
  form.addEventListener('submit', e => {
    let fields = [...form.querySelectorAll('input')].map(i => i.value)
    pubsub.publish('PROJECT-SUBMITTED', new Project(...fields))
  })
})()

export default app