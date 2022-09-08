import Event from './event'
import Project from './project'
import Task from './task'
import { getPage, getTaskForm, closeTaskForm } from './page'

const addProject = function(project) {
  Project.add(project)
  Event.publish('PAGE-REQUEST', { id: project.id, title: `Project: ${project.name}` })
}

const addTask = function({ page, task }) {
  Task.add(task)
  Event.publish('PAGE-REQUEST', page)
}

const markTask = function({ page, task, status }) {
  Task.mark(task, status)
  Event.publish('PAGE-REQUEST', getPage(page.dataset.id))
}

const editTask = function({ page, task }) {
  let item = page.querySelector(`[data-id="${task.id}"]`)

  item.removeChild(item.querySelector('.task-content'))
  item.insertAdjacentElement('beforeend', getTaskForm())
  item.querySelector('[name="task-name"]').value = task.name
  item.querySelector('[name="task-date"]').value = task.date
  item.querySelector('[name="task-project"]').value = task.project

  let submit = item.querySelector('.main__tasks-add-btn')
  let cancel = item.querySelector('.main__tasks-cancel-btn')

  submit.textContent = 'Edit Task'
  submit.closest('form').addEventListener('submit', submitTaskEdit)
  cancel.addEventListener('click', closeTaskForm)
}

const submitTaskEdit = function(e) {
  e.preventDefault()

  let current = document.querySelector('.main__tasks').dataset.id
  let task = e.target.closest('.task-item')

  Task.edit({
    name: e.target.querySelector('[name="task-name"]').value,
    date: e.target.querySelector('[name="task-date"]').value,
    project: e.target.querySelector('[name="task-project"]').value,
    status: false,
    id: task.dataset.id
  })

  Event.publish('PAGE-REQUEST', getPage(current))
}

const deleteTask = function(task) {
  let current = document.querySelector('.main__tasks').dataset.id
  let project = Project.storage().find(p => p.name == task.project)

  Task.delete(project, task)
  Event.publish('PAGE-REQUEST', getPage(current))
}

const App = function() {
  Event.subscribe('PROJECT-SUBMIT', addProject)
  Event.subscribe('TASK-SUBMIT', addTask)
  Event.subscribe('TASK-CHECK-REQUEST', markTask)
  Event.subscribe('TASK-EDIT-REQUEST', editTask)
  Event.subscribe('TASK-DELETE-REQUEST', deleteTask)
}

export default App()