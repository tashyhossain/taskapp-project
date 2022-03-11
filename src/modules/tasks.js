import { v4 as uuidv4 } from 'uuid'
import { format, isToday, isAfter } from 'date-fns'
import { append, create } from './helpers'
import pubsub from './pubsub'

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

const ALLTASKS = [
  new Task('test1', 'project1', new Date(Date.now())),
  new Task('test2', 'inbox', new Date(2022, 1, 2)),
  new Task('test3', 'project2', new Date(2022, 2, 3)),
  new Task('test4', 'inbox', new Date(2022, 3, 4))
]

const listify = function(dom, tasks) {
  let list = create('ul')
  tasks.forEach(task => {
    let item = create('li')
    item.textContent = task.name + '-' + format(task.date, 'EE MM dd yyyy')
    append(list, item)
  })
  return append(dom, list)
}

const inbox = function(dom) {
  let tasks = ALLTASKS.filter(t => t.project == 'inbox')
  listify(dom, tasks)
}

const today = function(dom) {
  let tasks = ALLTASKS.filter(t => isToday(t.date))
  listify(dom, tasks)
}

const upcoming = function(dom) {
  let tasks = ALLTASKS.filter(t => isAfter(t.date, Date.now()))
  listify(dom, tasks)
}

const structurer = function() {
  pubsub.subscribe('INBOX-RENDER', inbox)
  pubsub.subscribe('TODAY-RENDER', today)
  pubsub.subscribe('UPCOMING-RENDER', upcoming)
}

export default structurer()