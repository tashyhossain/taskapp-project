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
      <div class="modal-dialog modal-sm">
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
              <button type="button" class="dropdown-toggle color-select-btn" data-bs-toggle="dropdown" aria-expanded="false">
              </button>
              <ul class="dropdown-menu project-colors-list">
                <li data-color="GREY">
                  <span class="color-sample"></span>
                  <span class="color-name">Grey</span>
                </li>
                <li data-color="BLUE">
                  <span class="color-sample"></span>
                  <span class="color-name">Blue</span>
                </li>
                <li data-color="PURPLE">
                  <span class="color-sample"></span>
                  <span class="color-name">Purple</span>  
                </li>
                <li data-color="PINK">
                  <span class="color-sample"></span>
                  <span class="color-name">Pink</span> 
                </li>
                <li data-color="RED">
                  <span class="color-sample"></span>
                  <span class="color-name">Red</span> 
                </li>
                <li data-color="ORANGE">
                  <span class="color-sample"></span>
                  <span class="color-name">Orange</span> 
                </li>
                <li data-color="YELLOW">
                  <span class="color-sample"></span>
                  <span class="color-name">Yellow</span> 
                </li>
                <li data-color="GREEN">
                  <span class="color-sample"></span>
                  <span class="color-name">Green</span> 
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary project-submit-btn" type="submit">Add Project</button>
            <button class="btn btn-secondary project-cancel-btn" type="button" data-bs-dismiss="modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `)

  let input = container.querySelector('[name="project-color"]')
  let selection = container.querySelector('.color-select-btn')

  if (!selection.dataset.color) selection.dataset.color = 'GREY'
  input.value = selection.dataset.color

  let content = container.querySelector('.project-colors-list')

  content.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
      selection.dataset.color = item.dataset.color
      selection.innerHTML = item.innerHTML

      input.value = item.dataset.color
    })
  })

  selection.innerHTML = content.querySelector(`li[data-color="${selection.dataset.color}"]`).innerHTML

  return container
}

const getProjectAlert = function(modal) {
  let container = modal.querySelector('.modal-body')
  
  if (!container.querySelector('.alert')) {
    container.insertAdjacentHTML('beforeend', `
      <div class="alert alert-danger alert-dismissible fade show" role="alert"> 
        <div><i class="bi bi-exclamation-triangle-fill"></i> This project already exists</div>
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
  let form = content.querySelector('form')

  content.id = 'project-edit-form'
  form.dataset.id = project.id

  let name = form.querySelector('[name="project-name"]')
  let color = form.querySelector('[name="project-color"]')

  name.value = project.name
  color.value = project.color

  let selection = form.querySelector('.color-select-btn')
  selection.dataset.value = project.color

  let template = form.querySelector(`li[data-color="${selection.dataset.color}"]`)
  selection.innerHTML = template.innerHTML

  form.addEventListener('submit', submitProjectEdit)
  Event.publish('MODAL-REQUEST', container)
}

const submitProjectForm = function(e) {
  e.preventDefault()
  
  let modal = e.target.closest('.modal')
  let name = e.target.querySelector('[name="project-name"]')
  let color = e.target.querySelector('[name="project-color"]')

  if (Project.has(name.value)) {
    getProjectAlert(modal)
  } else {
    bootstrap.Modal.getInstance(modal).hide()
    Event.publish('PROJECT-SUBMIT', { 
      name: name.value, 
      color: color.value, 
      tasks: [] 
    })    
  }
}

const submitProjectEdit = function(e) {
  e.preventDefault()

  let modal = e.target.closest('.modal')
  bootstrap.Modal.getInstance(modal).hide()

  console.log(e.target.querySelector('[name="project-color"]').value)
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
  let form = document.createElement('div')

  form.classList.add('tasks-form-container')
  form.insertAdjacentHTML('afterbegin', `
    <form class="task-form">
      <input type="text" name="task-name">
      <input type="date" name="task-date">
      <input type="hidden" name="task-priority">
      <input type="hidden" name="task-project">
      <div class="dropdown task-priorities">
        <button type="button" class="btn priority-select-btn" data-bs-toggle="dropdown" aria-expanded="false">
        </button>
        <ul class="dropdown-menu task-priority-list">
          <li data-value="0">
            <span class="priority-icon"><i class="bi bi-fire"></i></span>
            <span class="priority-name">Set Priority</span>
          </li>
          <li data-value="1">
            <span class="priority-icon"><i class="bi bi-fire"></i></span>
            <span class="priority-name">Low</span>
          </li>
          <li data-value="2">
            <span class="priority-icon"><i class="bi bi-fire"></i></span>
            <span class="priority-name">Mid</span>
          </li>
          <li data-value="3">
            <span class="priority-icon"><i class="bi bi-fire"></i></span>
            <span class="priority-name">High</span>
          </li>
          <li data-value="4">
            <span class="priority-icon"><i class="bi bi-fire"></i></span>
            <span class="priority-name">Urgent</span>
          </li>
        </ul>
      </div>
      <div class="dropdown task-projects">
        <button type="button" class="btn project-select-btn" data-bs-toggle="dropdown" aria-expanded="false">
        </button>
        <ul class="dropdown-menu task-project-list">
        </ul>
      </div>
      <button class="task-submit-btn" type="submit">Add Task</button>
      <button class="task-cancel-btn" type="button">Cancel</button>
    </form>
  `)

  let date = form.querySelector('[name="task-date"')
  date.defaultValue = format(new Date(), 'yyyy-MM-dd')

  let priorities = form.querySelectorAll('.task-priority-list li')
  let priority = form.querySelector('.priority-select-btn')

  if (!priority.dataset.value) priority.dataset.value = 0
  form.querySelector('[name="task-priority"]').value = 0

  priorities.forEach(item => {
    let input = form.querySelector('[name="task-priority"]')

    item.addEventListener('click', () => {
      priority.dataset.value = item.dataset.value
      priority.innerHTML = item.innerHTML

      input.value = item.dataset.value
    })
  })

  let template = form.querySelector(`li[data-value="${priority.dataset.value}"]`)
  priority.innerHTML = template.innerHTML

  let projects = Project.storage()
  let project = form.querySelector('.project-select-btn')

  projects.forEach(p => {
    let list = form.querySelector('.task-project-list')

    list.insertAdjacentHTML('beforeend', `
      <li data-value="${p.name}" data-color="${p.color}">
        <span class="project-color">
          ${p.name == 'inbox' ? '<i class="bi bi-inbox"></i>'
                              : ''}
        </span>
        <span class="project-name">${p.name}</span>
      </li>
    `)

    let item = list.querySelector(`li[data-value="${p.name}"]`)
    let input = form.querySelector('[name="task-project"]')

    item.addEventListener('click', () => {
      project.dataset.value = item.dataset.value
      project.dataset.color = item.dataset.color
      project.innerHTML = item.innerHTML

      input.value = item.dataset.value
    })

    let page = document.querySelector('.tasks-list')
    let template = form.querySelector(`li[data-value="${p.name}"]`)

    if (p.id == page.dataset.id) {
      project.dataset.value = p.name
      project.innerHTML = template.innerHTML

      input.value = p.name
    } else {
      project.dataset.value = 'inbox'
      project.innerHTML = template.innerHTML

      input.value = 'inbox'
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

  let page = document.querySelector('.tasks-list').dataset.id

  Event.publish('TASK-SUBMIT', { 
    page: getPage(page), 
    task: { 
      name: e.target.querySelector('[name="task-name"]').value, 
      date: e.target.querySelector('[name="task-date"]').value, 
      priority: e.target.querySelector('[name="task-priority"]').value,
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
  item.querySelector('[name="task-priority"').value = task.priority
  item.querySelector('[name="task-project"]').value = task.project

  let priority = item.querySelector('.priority-select-btn')
  priority.dataset.value = task.priority

  let template = item.querySelector(`li[data-value="${priority.dataset.value}"]`)
  priority.innerHTML = template.innerHTML

  let project = item.querySelector('.project-select-btn')

  project.dataset.value = task.project
  Event.publish('PROJECT-SELECT-REQUEST', { form: item, btn: priority })

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
      priority: e.target.querySelector('[name="task-priority"').value,
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