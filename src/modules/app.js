import Event from './event'
import Project from './project'
import Task from './task'
import { getPage, getProjectPage } from './page'

const addProject = function(project) {
  Project.add(project)
  Event.publish('PAGE-REQUEST', getProjectPage(project))
}

const editProject = function(project) {
  let tasks = Project.storage().find(p => p.id == project.id).tasks

  tasks.forEach(task => {
    task.project = project.name
  })

  project.tasks = tasks
  Project.save(project)
  Event.publish('PAGE-REQUEST', getProjectPage(project))
}

const checkProject = function(project) {
  let tasks = project.tasks

  if (tasks.length == 0 || tasks.every(t => t.status)) {
    Event.publish('PROJECT-DELETE-CONFIRMED', project)
  } else {
    Event.publish('PROJECT-CONFIRM-REQUEST', project)
  }
}

const deleteProject = function(project) {
  Project.delete(project)
  Event.publish('PAGE-REQUEST', getPage('today'))
}

const addTask = function({ page, task }) {
  Task.add(task)
  Event.publish('PAGE-REQUEST', page)
}

const markTask = function({ page, task, status }) {
  Task.mark(task, status)
  Event.publish('PAGE-REQUEST', getPage(page))
}

const editTask = function({ page, task}) {
  Task.edit(task)
  Event.publish('PAGE-REQUEST', page)
}

const deleteTask = function(task) {
  let project = Project.storage().find(p => p.name == task.project)
  let page = document.querySelector('.tasks-list').dataset.id

  Task.delete(project, task)
  Event.publish('PAGE-REQUEST', getPage(page))
}

const App = function() {
  Event.subscribe('PROJECT-SUBMIT', addProject)
  Event.subscribe('PROJECT-EDIT-SUBMIT', editProject)
  Event.subscribe('PROJECT-DELETE-REQUEST', checkProject)
  Event.subscribe('PROJECT-DELETE-CONFIRMED', deleteProject)
  Event.subscribe('TASK-SUBMIT', addTask)
  Event.subscribe('TASK-EDIT-SUBMIT', editTask)
  Event.subscribe('TASK-CHECK-REQUEST', markTask)
  Event.subscribe('TASK-DELETE-REQUEST', deleteTask)
}

export default App()