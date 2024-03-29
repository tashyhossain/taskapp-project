import Event from './event'
import Project from './project'
import { Modal } from 'bootstrap'
import { getPage } from './page'
import { v4 as uuidv4 } from 'uuid'
import { format, isToday, isTomorrow, parseISO, startOfTomorrow } from 'date-fns'

const getProjectForm = function() {
  let container = document.createElement('div')
  
  container.classList.add('form-container')
  container.insertAdjacentHTML('afterbegin', `
    <div class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <form class="modal-content project-form" id="project-form" autocomplete="off">
          <div class="modal-header">
            <h5 class="modal-title">Add Project</h5>
          </div>
          <div class="modal-body">
            <label for="project-name-input">Name:</label>
            <input type="text" name="project-name" id="project-name-input" required>
            <label for="project-color-input">Color:</label>
            <input type="hidden" name="project-color" id="project-color-input">
            <div class="dropdown" id="project-colors">
              <button type="button" class="selection-display" id="color-select-btn" data-bs-toggle="dropdown" aria-expanded="false"></button>
              <ul class="dropdown-menu selection-list" id="project-colors-list">
                <li class="selection-item" data-color="GREY">
                  <span class="selection-color"></span>
                  <span class="selection-name">Grey</span>
                </li>
                <li class="selection-item" data-color="LBLUE">
                  <span class="selection-color"></span>
                  <span class="selection-name">Light Blue</span>
                </li>
                <li class="selection-item" data-color="BLUE">
                  <span class="selection-color"></span>
                  <span class="selection-name">Blue</span>
                </li>
                <li class="selection-item" data-color="PURPLE">
                  <span class="selection-color"></span>
                  <span class="selection-name">Purple</span>  
                </li>
                <li class="selection-item" data-color="VIOLET">
                  <span class="selection-color"></span>
                  <span class="selection-name">Violet</span>  
                </li>
                <li class="selection-item" data-color="LAVENDER">
                  <span class="selection-color"></span>
                  <span class="selection-name">Lavender</span>
                </li>
                <li class="selection-item" data-color="PINK">
                  <span class="selection-color"></span>
                  <span class="selection-name">Pink</span> 
                </li>
                <li class="selection-item" data-color="PEACH">
                  <span class="selection-color"></span>
                  <span class="selection-name">Peach</span>
                </li>
                <li class="selection-item" data-color="BERRY">
                  <span class="selection-color"></span>
                  <span class="selection-name">Berry</span>
                </li>
                <li class="selection-item" data-color="RED">
                  <span class="selection-color"></span>
                  <span class="selection-name">Red</span> 
                </li>
                <li class="selection-item" data-color="SUNSET">
                  <span class="selection-color"></span>
                  <span class="selection-name">Sunset</span> 
                </li>
                <li class="selection-item" data-color="ORANGE">
                  <span class="selection-color"></span>
                  <span class="selection-name">Orange</span> 
                </li>
                <li class="selection-item" data-color="CLAY">
                  <span class="selection-color"></span>
                  <span class="selection-name">Clay</span>
                </li>
                <li class="selection-item" data-color="CIDER">
                  <span class="selection-color"></span>
                  <span class="selection-name">Cider</span>
                </li>
                <li class="selection-item" data-color="YELLOW">
                  <span class="selection-color"></span>
                  <span class="selection-name">Yellow</span> 
                </li>
                <li class="selection-item" data-color="OLIVE">
                  <span class="selection-color"></span>
                  <span class="selection-name">Olive</span> 
                </li>
                <li class="selection-item" data-color="LIME">
                  <span class="selection-color"></span>
                  <span class="selection-name">Lime</span> 
                </li>
                <li class="selection-item" data-color="GREEN">
                  <span class="selection-color"></span>
                  <span class="selection-name">Green</span> 
                </li>
                <li class="selection-item" data-color="MINT">
                  <span class="selection-color"></span>
                  <span class="selection-name">Mint</span> 
                </li>
                <li class="selection-item" data-color="TEAL">
                  <span class="selection-color"></span>
                  <span class="selection-name">Teal</span> 
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer project-form-tools">
            <button id="project-submit-btn" type="submit">Add Project</button>
            <button id="project-cancel-btn" type="button" data-bs-dismiss="modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `)

  let colorInput = container.querySelector('[name="project-color"]')
  let colorSelect = container.querySelector('#color-select-btn')

  if (!colorSelect.dataset.color) colorSelect.dataset.color = 'GREY'
  colorInput.value = colorSelect.dataset.color

  let list = container.querySelector('#project-colors-list')

  list.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
      colorSelect.dataset.color = item.dataset.color
      colorSelect.innerHTML = item.innerHTML

      colorInput.value = item.dataset.color
    })
  })

  let colorClone = list.querySelector(`li[data-color="${colorSelect.dataset.color}"]`)
  colorSelect.innerHTML = colorClone.innerHTML

  return container
}

const getProjectAlert = function(modal) {
  let container = modal.querySelector('.modal-body')
  
  if (!container.querySelector('.alert')) {
    container.insertAdjacentHTML('beforeend', `
      <div class="project-warning alert alert-warning alert-dismissible fade show" role="alert"> 
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

  form.addEventListener('submit', event => {
    event.preventDefault()
    Event.publish('PROJECT-FORM-SUBMIT-REQUEST', event.target)
  })

  Event.publish('MODAL-REQUEST', container)
}

const loadProjectEdit = function(project) {
  document.body.insertAdjacentElement('beforeend', getProjectForm())

  let container = document.querySelector('.form-container')
  let content = container.querySelector('.modal')
  let form = content.querySelector('form')

  form.dataset.id = project.id

  let name = form.querySelector('[name="project-name"]')
  let color = form.querySelector('[name="project-color"]')

  name.value = project.name
  color.value = project.color

  let colorSelect = form.querySelector('#color-select-btn')
  colorSelect.dataset.color = project.color

  let colorClone = form.querySelector(`li[data-color="${colorSelect.dataset.color}"]`)
  colorSelect.innerHTML = colorClone.innerHTML

  form.addEventListener('submit', event => {
    event.preventDefault()
    Event.publish('PROJECT-EDIT-SUBMIT-REQUEST', event.target)
  })

  Event.publish('MODAL-REQUEST', container)
}

const submitProjectForm = function(form) {
  let modal = form.closest('.modal')
  let name = form.querySelector('[name="project-name"]')
  let color = form.querySelector('[name="project-color"]')

  if (Project.has(name.value)) {
    getProjectAlert(modal)
  } else {
    Modal.getInstance(modal).hide()
    Event.publish('PROJECT-SUBMIT', { 
      name: name.value, 
      color: color.value, 
      tasks: [] 
    })    
  }
}

const submitProjectEdit = function(form) {
  let modal = form.closest('.modal')

  Modal.getInstance(modal).hide()

  Event.publish('PROJECT-EDIT-SUBMIT', {
    id: form.dataset.id,
    name: form.querySelector('[name="project-name"]').value,
    color: form.querySelector('[name="project-color"]').value
  })
}

const getConfirmForm = function() {
  let container = document.createElement('div')

  container.classList.add('confirmation-container')
  container.insertAdjacentHTML('afterbegin', `
    <div class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5>Confirm Delete</h5>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <form class="confirmation-form">
              <button type="button" id="confirm-no-btn" data-bs-dismiss="modal">No</button>
              <button type="submit" id="confirm-delete-btn">Yes</button>
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
  let content = container.querySelector('.modal')
  let tasks = project.tasks.filter(t => t.status == false)
  
  content.querySelector('.modal-body').innerHTML = `
    <p><b>${project.name}</b> has ${tasks.length} incomplete task${tasks.length == 1 ? '' : 's'}.</p>
    <p>Do you still want to delete <b>${project.name}</b>?</p>
  `

  let form = content.querySelector('form')
  form.addEventListener('submit', () => {
    Event.publish('PROJECT-DELETE-CONFIRMED', project)
  })

  Event.publish('MODAL-REQUEST', container)
}

const loadTaskDate = function({ container, date }) {
  let label

  if (isToday(parseISO(date))) {
    label = 'Today'
  } else if (isTomorrow(parseISO(date))) {
    label = 'Tomorrow'
  } else {
    label = format(parseISO(date), 'MMM dd')
  }

  container.textContent = label
}

const getTemplate = function(current, template) {
  if (template.dataset.value) {
    current.dataset.value = template.dataset.value
  }

  if (template.dataset.color) {
    current.dataset.color = template.dataset.color
  }

  if (template.dataset.id) {
    current.dataset.id = template.dataset.id
  }

  current.innerHTML = template.innerHTML
}

const getTaskForm = function() {
  let form = document.createElement('div')

  form.classList.add('task-form-container')
  form.insertAdjacentHTML('afterbegin', `
    <form id="task-form" autocomplete="off">
      <div class="task-form-content">
        <div class="task-form-details">
          <input type="text" name="task-name" placeholder="Task name" required>
          <textarea name="task-desc" placeholder="Description"></textarea>
        </div>
        <div class="task-form-etc">
          <div class="task-form-place">
            <div class="task-form-date">
              <span class="selection-icon">
                <input type="date" name="task-date">
              </span>
              <span class="selection-name task-form-date-display"></span>
            </div>
            <input type="hidden" name="task-project">
            <div class="dropdown" id="task-projects">
              <button type="button" class="task-project-btn selection-display" id="project-select-btn" data-bs-toggle="dropdown" aria-expanded="false"></button>
              <ul class="dropdown-menu selection-list" id="task-project-list"></ul>
            </div>
          </div>
          <div class="task-form-sort">
            <input type="hidden" name="task-priority">
            <div class="dropdown task-priorities">
              <button type="button" class="task-priority-btn selection-display" id="priority-select-btn" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="selection-icon"><i class="bi bi-fire"></i></span>
              </button>
              <ul class="dropdown-menu selection-list" id="task-priority-list">
                <li class="selection-item" data-value="0">
                  <span class="selection-icon"><i class="bi bi-fire"></i></span>
                  <span class="selection-name">None</span>
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
          </div>
        </div>
      </div>
      <div class="task-form-tools">
        <button id="task-submit-btn" type="submit">Add Task</button>
        <button id="task-cancel-btn" type="button">Cancel</button>
      </div>
    </form>
  `)

  let date = form.querySelector('[name="task-date"]')
  let display = form.querySelector('.task-form-date-display')
  let page = document.querySelector('.tasks-list')

  if (page.dataset.id !== 'upcoming') {
    date.defaultValue = format(new Date(), 'yyyy-MM-dd')
  } else {
    date.defaultValue = format(startOfTomorrow(), 'yyyy-MM-dd')
  }

  date.addEventListener('change', () => {
    Event.publish('TASK-DATE-REQUEST', { container: display, date: date.value })  
  })

  Event.publish('TASK-DATE-REQUEST', { container: display, date: date.value })  

  Project.storage().forEach(project => {
    let list = form.querySelector('#task-project-list')

    list.insertAdjacentHTML('beforeend', `
      <li class="selection-item" data-value="${project.name}" data-color="${project.color}" data-id="${project.id}">
        ${project.name == 'inbox' ? `<span class="selection-icon"><i class="bi bi-inbox"></i></span>
                                     <span class="selection-name">${project.name}</span>`
                                  : `<span class="selection-color"></span>
                                     <span class="selection-name" title="${project.name}">
                                      ${project.name.substring(0, 15)}${project.name.length > 15 ? '...' : ''}
                                     </span>`}
      </li>
    `)
  })

  let projects = form.querySelectorAll('#task-project-list li')
  let project = form.querySelector('#project-select-btn')
  let projectInput = form.querySelector('[name="task-project"]')

  projects.forEach(template => {
    template.addEventListener('click', () => {
      getTemplate(project, template)
      
      projectInput.value = template.dataset.value
    })
  })

  let priorities = form.querySelectorAll('#task-priority-list li')
  let priority = form.querySelector('#priority-select-btn')
  let priorityInput = form.querySelector('[name="task-priority"]')

  priorities.forEach(template => {
    template.addEventListener('click', () => {
      getTemplate(priority, template)
      priority.removeChild(priority.querySelector('.selection-name'))

      priorityInput.value = template.dataset.value
    })
  })

  if (!priority.dataset.value) priority.dataset.value = 0

  return form
}

const loadTaskForm = function(container) {
  container.insertAdjacentElement('afterbegin', getTaskForm())

  let page = document.querySelector('.tasks-list')
  let form = container.querySelector('form')
  let cancel = form.querySelector('#task-cancel-btn')

  let projectInput = form.querySelector('[name="task-project"]')
  let priorityInput = form.querySelector('[name="task-priority"]')
  let projects = [...form.querySelectorAll('#task-project-list li')]
  let project = form.querySelector('#project-select-btn')
  let template = projects.find(p => p.dataset.id === page.dataset.id)

  if (!template) {
    template = projects.find(p => p.dataset.id == 'inbox')
  }

  getTemplate(project, template)

  projectInput.value = template.dataset.value
  priorityInput.value = 0

  form.addEventListener('submit', event => {
    event.preventDefault()
    Event.publish('TASK-FORM-SUBMIT-REQUEST', event.target)
  })

  cancel.addEventListener('click', () => {
    Event.publish('CLOSE-FORM-REQUEST', form)
  })
}

const submitTaskForm = function(form) {
  let page = document.querySelector('.tasks-list').dataset.id

  Event.publish('TASK-SUBMIT', { 
    page: getPage(page), 
    task: { 
      name: form.querySelector('[name="task-name"]').value, 
      desc: form.querySelector('[name="task-desc"]').value,
      date: form.querySelector('[name="task-date"]').value, 
      priority: form.querySelector('[name="task-priority"]').value,
      project: form.querySelector('[name="task-project"]').value, 
      status: false, 
      id: uuidv4() 
    }
  })
}

const loadTaskEdit = function({ page, task }) {
  let item = page.querySelector(`[data-id="${task.id}"]`)
  let current = item.querySelector('.task-wrapper')

  item.removeChild(current)
  item.insertAdjacentElement('beforeend', getTaskForm())
  item.querySelector('[name="task-name"]').value = task.name
  item.querySelector('[name="task-desc"]').value = task.desc
  item.querySelector('[name="task-date"]').value = task.date
  item.querySelector('[name="task-priority"]').value = task.priority
  item.querySelector('[name="task-project"]').value = task.project

  let date = item.querySelector('.task-form-date-display')
  
  Event.publish('TASK-DATE-REQUEST', { container: date, date: task.date })  

  let priority = item.querySelector('#priority-select-btn')
  let priorityTemplate = item.querySelector(`li[data-value="${task.priority}"]`)

  priority.dataset.value = task.priority
  priority.innerHTML = priorityTemplate.innerHTML
  priority.removeChild(priority.querySelector('.selection-name'))

  let project = item.querySelector('#project-select-btn')
  let projectTemplate = item.querySelector(`li[data-value="${task.project}"]`)

  getTemplate(project, projectTemplate)

  let submit = item.querySelector('#task-submit-btn')
  let cancel = item.querySelector('#task-cancel-btn')

  submit.textContent = 'Edit Task'

  submit.closest('form').addEventListener('submit', event => {
    event.preventDefault()
    Event.publish('TASK-EDIT-SUBMIT-REQUEST', event.target)
  })

  cancel.addEventListener('click', () => {
    Event.publish('CLOSE-EDIT-REQUEST', {
      form: submit.closest('form'),
      content: current
    })
  })
}

const submitTaskEdit = function(form) {
  let page = document.querySelector('.tasks-list').dataset.id
  let task = form.closest('.task-item')

  Event.publish('TASK-EDIT-SUBMIT', {
    page: getPage(page), 
    task: {
      name: form.querySelector('[name="task-name"]').value,
      desc: form.querySelector('[name="task-desc"]').value,
      date: form.querySelector('[name="task-date"]').value,
      priority: form.querySelector('[name="task-priority"]').value,
      project: form.querySelector('[name="task-project"]').value,
      status: false,
      id: task.dataset.id
    }
  })
}

const closeTaskForm = function(form) {
  let container = document.querySelector('.tasks-list')

  container.removeChild(form.parentNode)
  Event.publish('TASK-BTN-REQUEST', container)
}

const closeTaskEdit = function({ form, content }) {
  let container = form.closest('.task-item')

  container.removeChild(form.parentNode)
  container.appendChild(content)
}

const Form = function() {
  Event.subscribe('PROJECT-FORM-REQUEST', loadProjectForm)
  Event.subscribe('PROJECT-EDIT-REQUEST', loadProjectEdit)
  Event.subscribe('PROJECT-FORM-SUBMIT-REQUEST', submitProjectForm)
  Event.subscribe('PROJECT-EDIT-SUBMIT-REQUEST', submitProjectEdit)
  Event.subscribe('PROJECT-CONFIRM-REQUEST', loadConfirmation)
  Event.subscribe('TASK-FORM-REQUEST', loadTaskForm)
  Event.subscribe('TASK-EDIT-REQUEST', loadTaskEdit)
  Event.subscribe('TASK-DATE-REQUEST', loadTaskDate)
  Event.subscribe('TASK-FORM-SUBMIT-REQUEST', submitTaskForm)
  Event.subscribe('TASK-EDIT-SUBMIT-REQUEST', submitTaskEdit)
  Event.subscribe('CLOSE-FORM-REQUEST', closeTaskForm)
  Event.subscribe('CLOSE-EDIT-REQUEST', closeTaskEdit)
}

export default Form()