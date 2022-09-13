import Event from './event'
import Project from './project'
import * as bootstrap from 'bootstrap'
import { getPage } from './page'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'

const getProjectForm = function() {
  let container = document.createElement('div')
  
  container.classList.add('form-container')
  container.insertAdjacentHTML('afterbegin', `
    <div class="modal fade" tabindex="-1">
      <div class="modal-dialog">
        <form class="project-form modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Project</h5>
          </div>
          <div class="modal-body">
            <label for="project-name-input">Name:</label>
            <input type="text" name="project-name" id="project-name-input">
            <label for="project-color-input">Color:</label>
            <input type="hidden" name="project-color" id="project-color-input">
            <div class="dropdown project-colors">
              <button type="button" class="btn dropdown-toggle color-select-btn" data-bs-toggle="dropdown" aria-expanded="false" data-select="GREY">
                Default (Grey)
              </button>
              <ul class="dropdown-menu project-colors-list">
                <li data-color="GREY">Default (Grey)</li>
                <li data-color="BLUE">Blue</li>
                <li data-color="PURPLE">Purple</li>
                <li data-color="PINK">Pink</li>
                <li data-color="RED">Red</li>
                <li data-color="ORANGE">Orange</li>
                <li data-color="YELLOW">Yellow</li>
                <li data-color="GREEN">Green</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button class="project-submit-btn" type="submit">Add Project</button>
            <button class="project-cancel-btn" type="button" data-bs-dismiss="modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `)

  let content = container.querySelector('.project-colors')
  let color = container.querySelector('[name="project-color"]')
  let btn = content.querySelector('.color-select-btn')

  content.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
      btn.dataset.select = item.dataset.color
      btn.textContent = item.textContent
      color.value = item.dataset.color
    })
  })

  return container
}

const getProjectAlert = function(modal) {
  let container = modal.querySelector('.modal-body')
  
  if (!container.querySelector('.alert')) {
    container.insertAdjacentHTML('beforeend', `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
          <symbol id="exclamation-triangle-fill" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </symbol>
        </svg>  
        <div>This project already exists</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `)
  }
}

const loadProjectForm = function(body) {
  body.insertAdjacentElement('beforeend', getProjectForm())

  let container = document.querySelector('.form-container')
  let content = container.querySelector('.modal')
  let form = content.querySelector('form')

  content.id = 'project.id'
  form.addEventListener('submit', submitProjectForm)

  Event.publish('MODAL-REQUEST', container)
}

const loadProjectEdit = function(project) {
  document.body.insertAdjacentElement('beforeend', getProjectForm())

  let container = document.querySelector('.form-container')
  let content = container.querySelector('.modal')
  let color = content.querySelector(`li[data-color="${project.color}"]`)
  let btn = content.querySelector('.color-select-btn')

  content.id = `project-edit-form`
  btn.textContent = color.textContent

  content.querySelector('form').dataset.id = project.id
  content.querySelector('[name="project-name"]').value = project.name
  content.querySelector('[name="project-color"]').value = project.color

  let form = content.querySelector('form')
  form.addEventListener('submit', submitProjectEdit)

  Event.publish('MODAL-REQUEST', container)
}

const submitProjectForm = function(e) {
  e.preventDefault()
  
  let modal = e.target.closest('.modal')
  let name = e.target.querySelector('[name="project-name"]').value
  let color = e.target.querySelector('[name="project-color"]').value

  if (Project.has(name)) {
    getProjectAlert(modal)
  } else {
    bootstrap.Modal.getInstance(modal).hide()
    Event.publish('PROJECT-SUBMIT', { name, color, tasks: [] })    
  }
}

const submitProjectEdit = function(e) {
  e.preventDefault()

  let modal = e.target.closest('.modal')
  bootstrap.Modal.getInstance(modal).hide()

  Event.publish('PROJECT-EDIT-SUBMIT', {
    id: e.target.closest('form').dataset.id,
    name: e.target.querySelector('[name="project-name"]').value,
    color: e.target.querySelector('[name="project-color"]').value
  })
}

const getConfirmForm = function() {
  let container = document.createElement('div')

  container.classList.add('confirmation-container')
  container.insertAdjacentHTML('afterbegin', `
    <div class="modal fade" tabindex="-1" id="confirmation-form">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5>Confirm</h5>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <form class="confirmation-form">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
              <button type="submit" class="btn btn-primary confirm-delete-btn">Yes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `)

  return container
}

const loadConfirmation = function(project) {
  document.body.insertAdjacentElement('beforeend', getConfirmForm())

  let container = document.querySelector('.confirmation-container')
  let content = container.querySelector('#confirmation-form')
  let tasks = project.tasks.filter(t => t.status == false).length
  
  content.querySelector('.modal-body').innerHTML = `
    <p>${project.name} has ${tasks} incomplete task${tasks == 1 ? '' : 's'}.</p>
    <p>Do you still want to delete ${project.name}?</p>
  `

  let form = content.querySelector('form')
  form.addEventListener('submit', () => {
    Event.publish('PROJECT-DELETE-CONFIRMED', project)
  })

  Event.publish('MODAL-REQUEST', container)
}

const getTaskForm = function() {
  let projects = Project.storage()
  let page = document.querySelector('.tasks-list')
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

  let date = form.querySelector('[name="task-date"')
  date.defaultValue = format(new Date(), 'yyyy-MM-dd')
  console.log(date.defaultValue)

  projects.forEach(project => {
    form.querySelector('select').insertAdjacentHTML('beforeend', `
      <option value="${project.name}">${project.name}</option>
    `)

    if (project.id == page.dataset.id) {
      form.querySelector(`[value="${project.name}"]`).selected = true
    }
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
    page: getPage(document.querySelector('.tasks-list').dataset.id), 
    task: { 
      name: e.target.querySelector('[name="task-name"]').value, 
      date: e.target.querySelector('[name="task-date"]').value, 
      project: e.target.querySelector('[name="task-project"]').value, 
      status: false, 
      id: uuidv4() }
  })
}

const loadTaskEdit = function({ page, task }) {
  let item = page.querySelector(`[data-id="${task.id}"]`)

  item.removeChild(item.querySelector('.task-content'))
  item.insertAdjacentElement('beforeend', getTaskForm())
  item.querySelector('[name="task-name"]').value = task.name
  item.querySelector('[name="task-date"]').value = task.date
  item.querySelector('[name="task-project"]').value = task.project

  let submit = item.querySelector('.task-submit-btn')
  let cancel = item.querySelector('.task-cancel-btn')

  submit.textContent = 'Edit Task'
  submit.closest('form').addEventListener('submit', submitTaskEdit)
  cancel.addEventListener('click', closeTaskForm)
}

const submitTaskEdit = function(e) {
  e.preventDefault()

  let current = document.querySelector('.tasks-list').dataset.id
  let task = e.target.closest('.task-item')

  Event.publish('TASK-EDIT-SUBMIT', {
    page: getPage(current), 
    task: {
      name: e.target.querySelector('[name="task-name"]').value,
      date: e.target.querySelector('[name="task-date"]').value,
      project: e.target.querySelector('[name="task-project"]').value,
      status: false,
      id: task.dataset.id
    }
  })
}

export const closeTaskForm = function(e) {
  let content = document.querySelector('.tasks-list')
  let form = e.target.closest('form')

  form.parentNode.removeChild(form)
  Event.publish('TASKS-REQUEST', content)
}

const Form = function() {
  Event.subscribe('PROJECT-FORM-REQUEST', loadProjectForm)
  Event.subscribe('PROJECT-EDIT-REQUEST', loadProjectEdit)
  Event.subscribe('PROJECT-CONFIRM-REQUEST', loadConfirmation)
  Event.subscribe('TASK-FORM-REQUEST', loadTaskForm)
  Event.subscribe('TASK-EDIT-REQUEST', loadTaskEdit)
}

export default Form()