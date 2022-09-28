import Event from './event'
import Project from './project'
import Task from './task'
import * as bootstrap from 'bootstrap'
import { format, isBefore, isToday, isAfter, parseISO } from 'date-fns'

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
  let views = document.querySelectorAll('.page-btn')
  
  title.textContent = page.title
  content.innerHTML = ''
  content.dataset.id = page.id

  Event.publish('TASKS-REQUEST', content)
  Event.publish('PROJECTS-REQUEST', Project.storage())
  Event.publish('STATS-REQUEST', views)
}

const loadViewStats = function(views) {
  let stat, tasks = Task.storage()

  views.forEach(view => {
    let container = view.querySelector('.selection-etc')

    if (view.dataset.id == 'today') {
      stat = tasks.filter(t => isToday(parseISO(t.date)))
    } else if (view.dataset.id === 'inbox') {
      stat = tasks.filter(t => t.project == 'inbox')
    } else if (view.dataset.id === 'upcoming') {
      stat = tasks.filter(t => isAfter(parseISO(t.date), new Date()))
    }

    container.textContent = stat.length == 0 ? '' : stat.length
  })
}

const loadProjectStats = function({ container, project }) {
  let tasks = project.tasks.filter(t => !t.status)

  container.innerHTML = tasks.length == 0 ? '' : tasks.length
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
          <span class="selection-etc"></span>
        </button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item" id="project-edit-btn">Edit</button></li>
          <li><button class="dropdown-item" id="project-delete-btn">Delete</button></li>
        </ul>
      </div>
    `)

    let btn = nav.querySelector(`[data-id="${project.id}"]`)
    let stats = btn.querySelector('.selection-etc')
    let list = btn.parentNode.querySelector('.dropdown-menu')
    let edit = btn.parentNode.querySelector('#project-edit-btn')
    let del = btn.parentNode.querySelector('#project-delete-btn')

    Event.publish('PROJECT-STATS-REQUEST', { container: stats, project })

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
    <button type="button" class="add-project-btn" id="show-project-form-btn">
      <span class="btn-icon"><i class="bi bi-plus"></i></span> 
      <span class="btn-name">New Project</span>
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
    tasks = Project.storage().find(p => p.id === page.dataset.id).tasks
  }

  tasks = tasks.filter(t => t.priority)
               .sort((a, b) => new Date(a.date) < new Date(b.date) ? -1 : 1)
               .sort((a, b) => a.priority > b.priority ? -1 : 1)

  Event.publish('RENDER-REQUEST', { page, tasks })
}

const loadTasks = function({ page, tasks }) {
  page.innerHTML = ''
  tasks.forEach(task => {
    page.insertAdjacentHTML('beforeend', `
      <div class="task-item" data-id="${task.id}">
        <div class="task-wrapper">
          <div class="task-status">
            <div class="task-status-icon">
            <div class="task-status-input">
            ${task.status ? `<input type="checkbox" checked>`
                          : `<input type="checkbox">`}
          </div>
          <div class="task-status-display" data-value="${task.priority}">
            ${task.status ? `<i class="bi bi-check-circle-fill"></i>`
                          : `<i class="bi bi-circle"></i>`}
          </div>
            </div>
          </div>
          <div class="task-content">
            <div class="task-details">
              <div class="task-name">${task.name}</div>
              ${task.desc ? `<div class="task-desc">${task.desc}</div>`
                          : ''}
            </div>
            <div class="task-etc">
              <div class="task-date">
                <span class="task-date-icon"><i class="bi bi-calendar-event"></i></span>
                <span class="task-date-info">${format(parseISO(task.date), 'MMM dd')}</span>
              </div>
              <div class="task-project selection-display"></div>
            </div>
          </div>
        </div>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item" id="task-edit-btn">Edit</button></li>
          <li><button class="dropdown-item" id="task-delete-btn">Delete</button></li>
        </ul>
      </div>
    `)
    
    let item = page.querySelector(`[data-id="${task.id}"]`)
    let list = item.querySelector('.dropdown-menu')

    item.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      list.classList.add('show')
    })

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

    document.addEventListener('click', () => {
      list.classList.remove('show')
    })

    let overdue = isBefore(parseISO(task.date), new Date().setHours(0, 0, 0, 0))
    
    if (overdue) {
      item.querySelector('.task-date').classList.add('overdue')
      console.log('OVERDUE')
    }

    let project = Project.storage().find(p => p.name == task.project)
    let projectBtn = item.querySelector('.task-project') 

    if (task.project == 'inbox') {
      projectBtn.innerHTML = `
        <span class="selection-name">${task.project}</span>
        <span class="selection-icon"><i class="bi bi-inbox"></i></span>
      `

      projectBtn.dataset.value = 'inbox'
      projectBtn.addEventListener('click', () => {
        Event.publish('PAGE-REQUEST', getPage('inbox'))
      })
    } else {
      projectBtn.innerHTML = `
        <span class="selection-name">${task.project}</span>
        <span class="selection-color"></span>
      `

      projectBtn.dataset.color = project.color
      projectBtn.addEventListener('click', () => {
        Event.publish('PAGE-REQUEST', getProjectPage(project))
      }) 
    }
  })

  Event.publish('TASK-BTN-REQUEST', page)
}

export const loadTaskBtn = function(page) {
  page.insertAdjacentHTML('afterbegin', `
    <button class="add-task-btn" id="show-task-form-btn" type="button">
      <span class="btn-icon"><i class="bi bi-plus-circle"></i></span> 
      <span class="btn-name">New Task</span>
    </button>
  `)

  let btn = page.querySelector('#show-task-form-btn')

  btn.addEventListener('click', (e) => {
    Event.publish('TASK-FORM-REQUEST', page)
    page.removeChild(btn)
  })
}

const Page = function() {
  Event.subscribe('PAGE-REQUEST', loadPage)
  Event.subscribe('PROJECTS-REQUEST', loadProjects)
  Event.subscribe('STATS-REQUEST', loadViewStats)
  Event.subscribe('PROJECT-STATS-REQUEST', loadProjectStats)
  Event.subscribe('MODAL-REQUEST', loadModal)
  Event.subscribe('TASK-BTN-REQUEST', loadTaskBtn)
  Event.subscribe('TASKS-REQUEST', getTasks)
  Event.subscribe('RENDER-REQUEST', loadTasks)
}

export default Page()