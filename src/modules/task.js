import Project from './project'

export default class Task {
  static storage() {
    return Project.storage().flatMap(p => p.tasks)
  }

  static add(task) {
    let projects = Project.storage()
    let current = projects.find(p => p.name == task.project)

    current.tasks = [task, ...current.tasks]
    Project.save(current)
  }

  static delete(project, task) {
    project.tasks = project.tasks.filter(t => t.id != task.id)
    Project.save(project)
  }

  static mark(task, status) {
    let project = Project.storage().find(p => p.name == task.project)
    let current = project.tasks.find(t => t.id == task.id)

    current.status = !status
    Project.save(project)
  }

  static move(task) {
    let projects = Project.storage()
    let current = Task.storage().find(t => t.id == task.id)
    let start = projects.find(p => p.name == current.project)

    task.status = current.status
    Task.delete(start, task)
    Task.add(task)

    return task
  }

  static edit(task) {
    let project = Project.storage().find(p => p.name == task.project)
    let current = project.tasks.find(t => t.id == task.id)

    if (!current) {
      task = Task.move(task)
      Task.edit(task)
    } else {
      current.name = task.name
      current.date = task.date
      current.priority = task.priority

      Project.save(project)
    }
    
  }
}