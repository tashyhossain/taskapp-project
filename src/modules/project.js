import { v4 as uuidv4 } from 'uuid'

export default class Project {
  static storage() {
    return JSON.parse(localStorage.getItem('task-app-projects') || '[]')
  }

  static set(projects) {
    localStorage.setItem('task-app-projects', JSON.stringify(projects))
  }

  static has(project) {
    return Project.storage().some(p => p.name.toLowerCase() == project.toLowerCase())
  }

  static add(project) {
    let projects = Project.storage()
    
    project.id = uuidv4()
    projects.push(project)

    Project.set(projects)
  }

  static save(project) {
    let projects = Project.storage()
    let current = projects.find(p => p.id == project.id)

    current.name = project.name
    current.color = project.color
    current.tasks = project.tasks

    Project.set(projects)
  }
  
  static delete(project) {
    let projects = Project.storage()
    let deleted = projects.filter(p => p.id != project.id)

    Project.set(deleted)
  }
}