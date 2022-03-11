import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'

export const ALLTASKS = localStorage.getItem('tasks')
                        ? JSON.parse(localStorage.getItem('tasks'))
                        : []

export const ALLPROJECTS = localStorage.getItem('projects')
                           ? JSON.parse(localStorage.getItem('projects'))
                           : []

export class Task {
  // constructor(name, desc, date, project, priority) {
  //   this.name = name
  //   this.desc = desc
  //   this.date = date
  //   this.project = project
  //   this.priority = priority
  // }

  constructor(name, project, date) {
    this.name = name
    this.project = project
    this.date = date
  }

  get id() {
    return uuidv4()
  }

}

export class Project {
  constructor(name) {
    this.name = name
    this.tasks = []
  }
}

Project.prototype.add = function(task) {
  this.tasks.push(task)
}


// FORM

const fields = `
  <div id="form-wrapper">
    <input type="text" name="task" placeholder="eg. Water Plants">
    <input type="text" name="project" placeholder="Project">
    <input type="date" name="date">
    <input type="submit">
  </div>
`

const formBuild = function() {
  let form = create('form')
  form.autocomplete = 'off'
  form.insertAdjacentHTML('afterbegin', fields)

  let date = form.querySelector('input[name="date"]')
  date.value = format(Date.now(), 'yyyy-MM-dd')

  form.addEventListener('submit', addTask)

  return form
}

const addProject = function(project) {
  ALLPROJECTS.push(project)
  localStorage.setItem('projects', JSON.stringify(ALLPROJECTS))
  console.log(ALLPROJECTS)
}

const addTask = function(e) {
  e.preventDefault()
  let fields = [...e.target.querySelectorAll('input')]
                .filter(i => i.type != 'submit')
                .map(i => i.value)
  ALLTASKS.push(new Task(...fields))
  localStorage.setItem('tasks', JSON.stringify(ALLTASKS))

  let project = e.target.querySelector('input[name="project"]').value
  addProject(new Project(project))
}

export default formBuild()

// const fields = `
//   <div id="form-wrapper">
//     <div id="task-info">
//       <input type="text" name="task" placeholder="eg. Water Plants">
//       <input type="text" name="desc" placeholder="Description">
//     </div>
//     <div id="task-sort">
//       <input type="hidden" name="schedule" value="">
//       <input type="button" name="schedule-btn" value="Today">
//       <input type="hidden" name="project" value="Inbox">
//       <input type="button" name="project-btn" value="Project">
//       <input type="hidden" name="priority" value="">
//       <input type="button" name="priority-btn" value="Priority">
//     </div>
//   </div>
//   <div id="form-actions">
//     <input type="submit" name="submit" value="Add task">
//     <input type="button" name="cancel" value="Cancel">
//   </div>
// `
// const formBuild = function() {
//   let form = create('form')
//   form.autocomplete = 'off'
//   form.insertAdjacentHTML('afterbegin', fields)
//   form.addEventListener('submit', addTask)

//   let schedule = form.querySelector('input[name="schedule-btn"]')
//   schedule.addEventListener('click', scheduler)

//   let project = form.querySelector('input[name="project-btn"]')
//   project.addEventListener('click', sorter)

//   let priority = form.querySelector('input[name="priority-btn"]')
//   priority.addEventListener('click', grader)

//   return form
// }

// const addTask = function(e) {
//   e.preventDefault()
//   let fields = [...e.target.querySelectorAll('input')]
//                .filter(i => i.type != 'submit' && i.type != 'button')
//                .map(i => i.value)
//   ALLTASKS.push(new Task(...fields))
//   console.log(ALLTASKS)
// }

// const scheduler = function(e) {
//   let date = e.target.parentNode.querySelector('input[name="schedule"]')

// }

// const sorter = function(e) {
//   let date = e.target.parentNode.querySelector('input[name="schedule"]')
// }

// const grader = function(e) {
//   let priority = e.target.parentNode.querySelector('input[name="priority"]')
// }

// export default formBuild()



// HELPERS

export const create = function(type, id, ...children) {
  const element = document.createElement(type)
  if (id) element.id = id
  for (let child of children) {
    if (typeof child != 'string') element.appendChild(child)
    else element.appendChild(document.createTextNode(child))
  }

  return element
}

export const append = function(parent, ...children) {
  for (let child of children) {
    parent.appendChild(child)
  }

  return parent
}

export const remove = function(node) {
  node.childNodes.forEach(child => {
    node.removeChild(child)
  })

  return node
}

export const createBtn = function(name) {
  let btn = create('button', `${name}-btn`, name)
  btn.addEventListener('click', () => {
    pubsub.publish(`PAGECLICKED`, name.toLowerCase())
  })

  return btn
}


// RENDER

export const listify = function(tasks) {
  let list = document.createElement('ul')
  for (let task of tasks) {
    let item = document.createElement('li')
    item.textContent = task.name + ' ' + task.date
    append(list, item)
  }

  return list
}

export const renderDate = function() {
  let today = create('div', 'current-date')
  let day = create('span', null, format(Date.now(), 'EEEE'))
  let date = document.createTextNode(format(Date.now(), 'MMMM do yyyy'))

  append(today, day, date)
  return today
}

const renderPage = function(page) {
  let title = document.querySelector('#page-title')
  let main = document.querySelector('main')
  let tasklist = create('div', `${page}-tasks`)
  tasklist.classList.add('tasklist')

  let inbox = () => {
    let tasks = ALLTASKS.filter(t => t.project == 'Inbox')
    title.textContent = 'Inbox'
    append(tasklist, listify(tasks))
    return tasklist
  }
  
  let today = () => {
    let tasks = ALLTASKS.filter(t => isToday(parseISO(t.date)))
    title.textContent = 'Today\'s Tasks'
    append(tasklist, listify(tasks))
    return tasklist
  }

  let upcoming = () => {
    let tasks = ALLTASKS.filter(t => isAfter(parseISO(t.date), Date.now()))
    title.textContent = 'Upcoming Tasks'
    append(tasklist, listify(tasks))
    return tasklist
  }

  if (page == 'inbox') inbox()
  if (page == 'today') today()
  if (page == 'upcoming') upcoming()

  remove(main)
  append(main, tasklist)
}

const renderProject = function(projects) {
  let nav = document.querySelectorAll('nav')
  let title = document.querySelector('#page-title')
  // projects.forEach(project => {
  //   let btn = createBtn(project)
  //   append(nav, btn)
  // })

  // return nav
  console.log(nav, 'nav')
}

const render = function() {
  pubsub.subscribe('PAGECLICKED', renderPage)
  renderProject(ALLPROJECTS)
}

export default render()


// DOM MARKUP

const initialize = (function() {
  append(app, form)
  append(document.body, app)
  pubsub.publish('PAGECLICKED', 'today')
})()