import Event from './event'
import Project from './project'
import Task from './task'
import * as bootstrap from 'bootstrap'
import { isToday, isAfter, parseISO } from 'date-fns'

export const getPage = function(name) {
  let page = document.querySelector(`button[data-id="${name}"]`)
  
  return { id: page.dataset.id, title: page.dataset.title }
}

export const getProjectPage = function(project) {
  return { id: project.id, title: `Project: ${project.name}` }
}

const loadPage = function(page) {
  let title = document.querySelector('.page-title')
  let content = document.querySelector('.tasks-list')
  
  title.textContent = page.title
  content.innerHTML = ''
  content.dataset.id = page.id

  Event.publish('TASKS-REQUEST', content)
  Event.publish('PROJECTS-REQUEST', Project.storage())
}

const getProjectStats = function({ container, project }) {
  container.querySelector('.test').innerHTML = `
    <span class="project-stat">
      ${project.tasks.filter(t => !t.status).length}
    </span>
  `

  return container
}

const loadProjects = function(projects) {
  let nav = document.querySelector('.projects-list')
  
  projects = projects.filter(p => p.id !== 'inbox')
  nav.innerHTML = ''

  projects.forEach(project => {
    nav.insertAdjacentHTML('beforeend', `
      <div class="project-btn-container">
        <button type="button" class="selection-display project-btn" id="nav-project-btn" data-id="${project.id}" data-title="Project: ${project.name}" data-color="${project.color}" data-ts-toggle="dropdown" aria-expanded="false">
          <span class="selection-color"></span>
          <span class="selection-name">${project.name}</span>
          <span class="selection-etc">${project.tasks.filter(t => !t.status).length}</span>
        </button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item" id="project-edit-btn">Edit</button></li>
          <li><button class="dropdown-item" id="project-delete-btn">Delete</button></li>
        </ul>
      </div>
    `)

    let btn = nav.querySelector(`[data-id="${project.id}"]`)
    let list = btn.parentNode.querySelector('.dropdown-menu')
    let edit = btn.parentNode.querySelector('#project-edit-btn')
    let del = btn.parentNode.querySelector('#project-delete-btn')

    btn.addEventListener('click', () => {
      Event.publish('PAGE-REQUEST', getPage(btn.dataset.id))
    })

    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      list.classList.add('show')
    })  

    edit.addEventListener('click', () => {
      Event.publish('PROJECT-EDIT-REQUEST', project)
    })

    del.addEventListener('click', () => {
      Event.publish('PROJECT-DELETE-REQUEST', project)
    })

    document.addEventListener('click', () => {
      list.classList.remove('show')
    })

  })


  nav.insertAdjacentHTML('beforeend', `
    <button type="button" class="btn add-project-btn" id="show-project-form-btn">
      <span class="btn-icon"><i class="bi bi-plus-circle"></i></span> 
      <span class="btn-name">Add Project</span>
    </button>
  `)

  let btn = nav.querySelector('#show-project-form-btn')
  
  btn.addEventListener('click', () => {
    Event.publish('PROJECT-FORM-REQUEST', document.body)
  })
}

const loadModal = function(container) {
  let content = container.querySelector('.modal')
  let modal = new bootstrap.Modal(content)

  modal.show()

  content.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(container)
  })
}

const getTasks = function(page) {
  let tasks, storage = Task.storage()

  if (page.dataset.id == 'today') {
    tasks = storage.filter(t => isToday(parseISO(t.date)))
  } else if (page.dataset.id === 'inbox') {
    tasks = storage.filter(t => t.project == 'inbox')
  } else if (page.dataset.id === 'upcoming') {
    tasks = storage.filter(t => isAfter(parseISO(t.date), new Date()))
  } else {
    console.log(page.dataset.id)
    tasks = Project.storage().find(p => p.id === page.dataset.id).tasks
  }

  tasks = tasks.sort((a, b) => a.priority > b.priority ? -1 : 1)

  Event.publish('RENDER-REQUEST', { page, tasks })
}

const loadTasks = function({ page, tasks }) {
  page.innerHTML = ''
  tasks.forEach(task => {
    page.insertAdjacentHTML('beforeend', `
      <div class="task-item" data-id="${task.id}">
        <div class="task-content">
          <div class="task-status">
            ${task.status ? '<input type="checkbox" checked>'
                          : '<input type="checkbox">'}
          </div>
          <div class="task-name">${task.name}</div>
          <div class="task-date">${task.date}</div>
          <div class="task-priority">${task.priority}</div>
          <div class="task-project">${task.project}</div>
          <div class="dropdown task-tools">
            <button type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu">
              <button class="btn btn-primary" id="task-edit-btn">Edit</button>
              <button class="btn btn-secondary" id="task-delete-btn">Delete</button>
            </ul>
          </div>
        </div>
      </div>
    `)

    let item = page.querySelector(`[data-id="${task.id}"]`)

    item.querySelector('.task-status input').addEventListener('change', (e) => {
      e.preventDefault()
      Event.publish('TASK-CHECK-REQUEST', { 
        page: page.dataset.id, 
        task, 
        status: e.target.hasAttribute('checked') 
      })
    })

    item.querySelector('#task-edit-btn').addEventListener('click', (e) => {
      e.preventDefault()
      Event.publish('TASKS-REQUEST', page)
      Event.publish('TASK-EDIT-REQUEST', { page, task })
    })
  
    item.querySelector('#task-delete-btn').addEventListener('click', (e) => {
      Event.publish('TASK-DELETE-REQUEST', task)
    })

  })

  Event.publish('TASK-BTN-REQUEST', page)
}

export const loadTaskBtn = function(page) {
  page.insertAdjacentHTML('afterbegin', `
    <button class="btn-add-task" id="show-task-form-btn" type="button">
      <span class="btn-icon"><i class="bi bi-plus-circle"></i></span>
      <span class="btn-name">Add Task</span>
    </button>
  `)

  let btn = page.querySelector('#show-task-form-btn')

  // btn.addEventListener('mouseover', () => {
  //   btn.querySelector('.btn-icon').innerHTML = `
  //     <i class="bi bi-plus-circle-fill"></i>
  //   `
  // })

  // btn.addEventListener('mouseout', () => {
  //   btn.querySelector('.btn-icon').innerHTML = `
  //     <i class="bi bi-plus-circle"></i>
  //   `
  // })

  btn.addEventListener('click', (e) => {
    Event.publish('TASK-FORM-REQUEST', page)
    page.removeChild(btn)
  })
}

const Page = function() {
  Event.subscribe('PAGE-REQUEST', loadPage)
  Event.subscribe('PROJECTS-REQUEST', loadProjects)
  Event.subscribe('PROJECT-STATS-REQUEST', getProjectStats)
  Event.subscribe('MODAL-REQUEST', loadModal)
  Event.subscribe('TASK-BTN-REQUEST', loadTaskBtn)
  Event.subscribe('TASKS-REQUEST', getTasks)
  Event.subscribe('RENDER-REQUEST', loadTasks)
}

export default Page()