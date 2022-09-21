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
            <input type="text" name="project-name" id="project-name-input" required>
            <label for="project-color-input">Color:</label>
            <input type="hidden" name="project-color" id="project-color-input">
            <div class="dropdown project-colors">
              <button type="button" class="selection-display color-select-btn" data-bs-toggle="dropdown" aria-expanded="false"></button>
              <ul class="dropdown-menu selection-list project-colors-list">
                <li class="selection-item" data-color="GREY">
                  <span class="selection-color"></span>
                  <span class="selection-name">Grey</span>
                </li>
                <li class="selection-item" data-color="BLUE">
                  <span class="selection-color"></span>
                  <span class="selection-name">Blue</span>
                </li>
                <li class="selection-item" data-color="PURPLE">
                  <span class="selection-color"></span>
                  <span class="selection-name">Purple</span>  
                </li>
                <li class="selection-item" data-color="PINK">
                  <span class="selection-color"></span>
                  <span class="selection-name">Pink</span> 
                </li>
                <li class="selection-item" data-color="RED">
                  <span class="selection-color"></span>
                  <span class="selection-name">Red</span> 
                </li>
                <li class="selection-item" data-color="ORANGE">
                  <span class="selection-color"></span>
                  <span class="selection-name">Orange</span> 
                </li>
                <li class="selection-item" data-color="YELLOW">
                  <span class="selection-color"></span>
                  <span class="selection-name">Yellow</span> 
                </li>
                <li class="selection-item" data-color="GREEN">
                  <span class="selection-color"></span>
                  <span class="selection-name">Green</span> 
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

  let colorInput = container.querySelector('[name="project-color"]')
  let colorSelect = container.querySelector('.color-select-btn')

  if (!colorSelect.dataset.color) colorSelect.dataset.color = 'GREY'
  colorInput.value = colorSelect.dataset.color

  let content = container.querySelector('.project-colors-list')

  content.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
      colorSelect.dataset.color = item.dataset.color
      colorSelect.innerHTML = item.innerHTML

      colorInput.value = item.dataset.color
    })
  })

  let colorClone = content.querySelector(`li[data-color="${colorSelect.dataset.color}"]`)
  colorSelect.innerHTML = colorClone.innerHTML

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

  let colorSelect = form.querySelector('.color-select-btn')
  colorSelect.dataset.value = project.color

  let colorClone = form.querySelector(`li[data-color="${colorSelect.dataset.color}"]`)
  colorSelect.innerHTML = colorClone.innerHTML

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
      <input type="text" name="task-name" required>
      <input type="date" name="task-date">
      <input type="hidden" name="task-priority">
      <input type="hidden" name="task-project">
      <div class="dropdown task-priorities">
        <button type="button" class="btn selection-display priority-select-btn" data-bs-toggle="dropdown" aria-expanded="false"></button>
        <ul class="dropdown-menu selection-list task-priority-list">
          <li class="selection-item" data-value="0">
            <span class="selection-icon"><i class="bi bi-fire"></i></span>
            <span class="selection-name">Set Priority</span>
          </li>
          <li class="selection-item" data-value="1">
            <span class="selection-icon"><i class="bi bi-fire"></i></span>
            <span class="selection-name">Low</span>
          </li>
          <li class="selection-item" data-value="2">
            <span class="selection-icon"><i class="bi bi-fire"></i></span>
            <span class="selection-name">Mid</span>
          </li>
          <li class="selection-item" data-value="3">
            <span class="selection-icon"><i class="bi bi-fire"></i></span>
            <span class="selection-name">High</span>
          </li>
          <li class="selection-item" data-value="4">
            <span class="selection-icon"><i class="bi bi-fire"></i></span>
            <span class="selection-name">Urgent</span>
          </li>
        </ul>
      </div>
      <div class="dropdown task-projects">
        <button type="button" class="btn selection-display project-select-btn" data-bs-toggle="dropdown" aria-expanded="false"></button>
        <ul class="dropdown-menu selection-list task-project-list"></ul>
      </div>
      <button class="task-submit-btn" type="submit">Add Task</button>
      <button class="task-cancel-btn" type="button">Cancel</button>
    </form>
  `)

  let date = form.querySelector('[name="task-date"]')
  date.defaultValue = format(new Date(), 'yyyy-MM-dd')

  Project.storage().forEach(project => {
    let list = form.querySelector('.task-project-list')

    list.insertAdjacentHTML('beforeend', `
      <li class="selection-item" data-value="${project.name}" data-color="${project.color}" data-id="${project.id}">
        ${project.name == 'inbox' ? '<span class="selection-icon"><i class="bi bi-inbox"></i></span'
                                  : '<span class="selection-color"></span>'}
        <span class="selection-name">${project.name}</span>
      </li>
    `)
  })

  let projects = form.querySelectorAll('.task-project-list li')
  projects.forEach(project => {
    let select = form.querySelector('.project-select-btn')
    let input = form.querySelector('[name="task-project"]')

    project.addEventListener('click', () => {
      input.value = project.dataset.value
      select.dataset.value = project.dataset.value
      select.dataset.color = project.dataset.color

      select.innerHTML = project.innerHTML
    })
  })

  let priorities = form.querySelectorAll('.task-priority-list li')
  let priority = form.querySelector('.priority-select-btn')

  priorities.forEach(item => {
    let input = form.querySelector('[name="task-priority"]')

    item.addEventListener('click', () => {
      input.value = item.dataset.value
      priority.dataset.value = item.dataset.value
      
      priority.innerHTML = item.innerHTML
    })
  })

  if (!priority.dataset.value) priority.dataset.value = 0
  priority.innerHTML = form.querySelector(`li[data-value="0"]`).innerHTML

  return form
}

const loadTaskForm = function(container) {
  container.insertAdjacentElement('afterbegin', getTaskForm())

  let form = container.querySelector('form')
  let cancel = form.querySelector('.task-cancel-btn')

  let page = document.querySelector('.tasks-list').dataset.id
  let projectInput = form.querySelector('[name="task-project"]')
  let priorityInput = form.querySelector('[name="task-priority"]')
  let projects = [...form.querySelectorAll('.task-project-list li')]
  let project = form.querySelector('.project-select-btn')
  let template = projects.find(p => p.dataset.id == page)

  if (!template) {
    template = projects.find(p => p.dataset.id == 'inbox')
  }

  project.dataset.value = template.dataset.value
  project.dataset.color = template.dataset.color
  project.dataset.id = template.dataset.id
  project.innerHTML = template.innerHTML

  projectInput.value = template.dataset.value
  priorityInput.value = 0

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
  item.querySelector('[name="task-priority"]').value = task.priority
  item.querySelector('[name="task-project"]').value = task.project

  let priority = item.querySelector('.priority-select-btn')
  let priorityTemplate = item.querySelector(`li[data-value="${task.priority}"]`)

  priority.dataset.value = task.priority
  priority.innerHTML = priorityTemplate.innerHTML

  let project = item.querySelector('.project-select-btn')
  let projectTemplate = item.querySelector(`li[data-value="${task.project}"]`)

  project.dataset.value = task.project
  project.dataset.color = projectTemplate.dataset.color
  project.innerHTML = projectTemplate.innerHTML

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
      priority: e.target.querySelector('[name="task-priority"]').value,
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