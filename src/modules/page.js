import Event from './event'
import Project from './project'
import Task from './task'
import { isToday, isAfter, parseISO } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

export const getPage = function(name) {
  let page = document.querySelector(`button[data-id="${name}"]`)
  
  return { id: page.dataset.id, title: page.dataset.title }
}

const loadPage = function(page) {
  let title = document.querySelector('.page-title')
  let content = document.querySelector('.main-tasks-list')
  
  title.textContent = page.title
  content.innerHTML = ''
  content.dataset.id = page.id

  Event.publish('TASKS-REQUEST', content)
  Event.publish('PROJECTS-REQUEST', Project.storage())
}

const loadProjects = function(projects) {
  let nav = document.querySelector('.nav-projects-list')
  
  projects = projects.filter(p => p.id !== 'inbox')
  nav.innerHTML = ''

  projects.forEach(project => {
    nav.insertAdjacentHTML('beforeend', `
      <button class="nav-project-btn" data-id="${project.id}" data-title="Project: ${project.name}">
        ${project.name}
      </button>
    `)

    let btn = nav.querySelector(`[data-id="${project.id}"]`)

    btn.addEventListener('click', () => {
      Event.publish('PAGE-REQUEST', { id: btn.dataset.id, title: btn.dataset.title })
    })
  })

  nav.insertAdjacentHTML('beforeend', `
    <button class="nav__projects-form-btn show-project-form-btn">Add Project</button>
  `)

  let btn = nav.querySelector('.show-project-form-btn')
  btn.addEventListener('click', (e) => {
    Event.publish('PROJECT-FORM-REQUEST', nav)
    nav.removeChild(btn)
  })
}

const loadProjectForm = function(container) {
  container.insertAdjacentHTML('beforeend', `
    <form class="project-form">
      <input type="text" name="project-color">
      <input type="text" name="project-name">
      <button class="project-submit-btn" type="submit">Add Project</button>
      <button class="project-cancel-btn" type="button">Cancel</button>
    </form>
  `)

  let form = container.querySelector('form')
  let cancel = container.querySelector('.project-form-cancel-btn')

  form.addEventListener('submit', submitProjectForm)
  cancel.addEventListener('click', closeProjectForm)
}

const submitProjectForm = function(e) {
  e.preventDefault()
  
  let name = e.target.querySelector('[name="project-name"]').value
  let color = e.target.querySelector('[name="project-color"]').value

  if (Project.has(name)) {
    alert('This project already exists')
  } else {
    Event.publish('PROJECT-SUBMIT', { name, color, tasks: [] })    
  }
}

const closeProjectForm = function(e) {
  let form = e.target.parentNode

  form.parentNode.removeChild(form)
  Event.publish('PROJECTS-REQUEST', Project.storage())
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

  console.log(tasks)
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
          <div class="task-project">${task.project}</div>
          <div class="task-tools">
            <button class="task-edit-btn">Edit</button>
            <button class="task-delete-btn">Delete</button>
          </div>
        </div>
      </div>
    `)

    let item = page.querySelector(`[data-id="${task.id}"]`)

    item.querySelector('.task-status input').addEventListener('change', (e) => {
      e.preventDefault()
      Event.publish('TASK-CHECK-REQUEST', { page, task, status: e.target.hasAttribute('checked') })
    })

    item.querySelector('.task-edit-btn').addEventListener('click', (e) => {
      e.preventDefault()
      Event.publish('TASK-EDIT-REQUEST', { page, task })
    })

    item.querySelector('.task-delete-btn').addEventListener('click', (e) => {
      Event.publish('TASK-DELETE-REQUEST', task)
    })
  })

  page.insertAdjacentHTML('afterbegin', `
    <button class="show-task-form-btn" type="button">Add Task</button>
  `)

  let btn = page.querySelector('.show-task-form-btn')

  btn.addEventListener('click', (e) => {
    Event.publish('TASK-FORM-REQUEST', page)
    page.removeChild(btn)
  })
}

export const getTaskForm = function() {
  let projects = Project.storage()
  let form = document.createElement('div')

  form.classList.add('tasks-form-container')
  form.insertAdjacentHTML('afterbegin', `
    <form class="task-form">
      <input type="text" name="task-name">
      <input type="date" name="task-date">
      <select name="task-project" id="project-options"></select>
      <button class="task-submit-btn" type="submit">Add Task</button>
      <button class="task-cancel-btn" type="button">Cancel</button>
    </form>
  `)

  projects.forEach(project => {
    form.querySelector('select').insertAdjacentHTML('beforeend', `
      <option value="${project.name}">${project.name}</option>
    `)
  })

  return form
}

const loadTaskForm = function(container) {
  container.insertAdjacentElement('afterbegin', getTaskForm())

  let form = container.querySelector('form')
  let cancel = container.querySelector('.task-cancel-btn')

  form.addEventListener('submit', submitTaskForm)
  cancel.addEventListener('click', closeTaskForm)
}

const submitTaskForm = function(e) {
  e.preventDefault()

  Event.publish('TASK-SUBMIT', { 
    page: getPage(document.querySelector('.main-tasks-list').dataset.id), 
    task: { 
      name: e.target.querySelector('[name="task-name"]').value, 
      date: e.target.querySelector('[name="task-date"]').value, 
      project: e.target.querySelector('[name="task-project"]').value, 
      status: false, 
      id: uuidv4() }
  })
}

export const closeTaskForm = function(e) {
  let content = document.querySelector('.main-tasks-list')
  let form = e.target.closest('form')

  form.parentNode.removeChild(form)
  Event.publish('TASKS-REQUEST', content)
}

const Page = function() {
  Event.subscribe('PAGE-REQUEST', loadPage)
  Event.subscribe('PROJECTS-REQUEST', loadProjects)
  Event.subscribe('PROJECT-FORM-REQUEST', loadProjectForm)
  Event.subscribe('TASKS-REQUEST', getTasks)
  Event.subscribe('RENDER-REQUEST', loadTasks)
  Event.subscribe('TASK-FORM-REQUEST', loadTaskForm)
}

export default Page()