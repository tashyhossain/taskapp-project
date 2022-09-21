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

const loadProjects = function(projects) {
  let nav = document.querySelector('.projects-list')
  
  projects = projects.filter(p => p.id !== 'inbox')
  nav.innerHTML = ''

  projects.forEach(project => {
    nav.insertAdjacentHTML('beforeend', `
      <div class="btn-group">
        <button type="button" class="btn nav-project-btn" data-id="${project.id}" data-title="Project: ${project.name}">
          ${project.color} - ${project.name}
        </button>
        <button type="button" class="btn dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item project-edit-btn">Edit</button></li>
          <li><button class="dropdown-item project-delete-btn">Delete</button></li>
        </ul>
      </div>
    `)

    let btn = nav.querySelector(`[data-id="${project.id}"]`)
    let edit = btn.parentNode.querySelector('.project-edit-btn')
    let del = btn.parentNode.querySelector('.project-delete-btn')

    btn.addEventListener('click', () => {
      Event.publish('PAGE-REQUEST', getPage(btn.dataset.id))
    })

    edit.addEventListener('click', () => {
      Event.publish('PROJECT-EDIT-REQUEST', project)
    })

    del.addEventListener('click', () => {
      Event.publish('PROJECT-DELETE-REQUEST', project)
    })
  })

  nav.insertAdjacentHTML('beforeend', `
    <button type="button" class="show-project-form-btn">
      Add Project
    </button>
  `)

  let btn = nav.querySelector('.show-project-form-btn')
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
              <button class="task-edit-btn">Edit</button>
              <button class="task-delete-btn">Delete</button>
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

    // item.querySelector('.task-edit-btn').addEventListener('click', (e) => {
    //   e.preventDefault()
    //   Event.publish('TASK-EDIT-REQUEST', { page, task })
    // })

    // item.querySelector('.task-delete-btn').addEventListener('click', (e) => {
    //   Event.publish('TASK-DELETE-REQUEST', task)
    // })

    Event.publish('TASK-TOOLS-REQUEST', { item, page, task })
  })

  Event.publish('TASK-BTN-REQUEST', page)
}

export const loadTaskTools = function({ item, page, task }) {
  item.querySelector('.task-edit-btn').addEventListener('click', (e) => {
    e.preventDefault()
    Event.publish('TASK-EDIT-REQUEST', { page, task })
  })

  item.querySelector('.task-delete-btn').addEventListener('click', (e) => {
    Event.publish('TASK-DELETE-REQUEST', task)
  })
}

export const loadTaskBtn = function(page) {
  page.insertAdjacentHTML('afterbegin', `
    <button class="show-task-form-btn" type="button">Add Task</button>
  `)

  let btn = page.querySelector('.show-task-form-btn')

  btn.addEventListener('click', (e) => {
    Event.publish('TASK-FORM-REQUEST', page)
    page.removeChild(btn)
  })
}

const Page = function() {
  Event.subscribe('PAGE-REQUEST', loadPage)
  Event.subscribe('PROJECTS-REQUEST', loadProjects)
  Event.subscribe('MODAL-REQUEST', loadModal)
  Event.subscribe('TASK-BTN-REQUEST', loadTaskBtn)
  Event.subscribe('TASKS-REQUEST', getTasks)
  Event.subscribe('RENDER-REQUEST', loadTasks)
  Event.subscribe('TASK-TOOLS-REQUEST', loadTaskTools)
}

export default Page()