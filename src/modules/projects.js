import pubsub from './pubsub'
import Storage from './storage'
import { wipe } from './helpers'

export class Project {
  constructor(name, color) {
    this.name = name 
    this.color = color 
    this.tasks = []
  
  } 
}

const check = function(project) {
  let storage = JSON.stringify(Storage.get('projects'))
  return storage.includes(project)
}

const store = function(project) {
  let projects = Storage.get('projects').concat(project)
  Storage.set('projects', projects)
}

const render = function(projects) {
  let dom = document.querySelector('.projects-list')

  wipe(dom)
  projects.forEach(project => {
    dom.insertAdjacentHTML('afterbegin', `
      <li>
        <button class="btn btn-project" data-project="${project.name}">
          <span class="btn-color" data-color="${project.color}"></span>
          <span class="btn-name">${project.name}</span>
        </button>
      </li>
    `)
  })

  return dom
}

const structurer = function() {
  pubsub.subscribe('PROJECT-SUBMITTED', store)
  pubsub.subscribe('PROJECT-ADDED', render)
}

export default structurer()