import Event from './event'
import { format } from 'date-fns'

const View = function(root) {
  root.innerHTML = `
    <section class="nav">
      <header class="app-title">
        <div class="h2">task.it</div>
      </header>
      <nav class="pages">
        <button class="page-btn" data-id="inbox" data-title="Inbox">
          <span class="page-icon"><i class="bi bi-inbox"></i></span>
          <span class="page-name">Inbox</span>
          <span class="page-etc selection-etc"></span>
        </button>
        <button class="page-btn" data-id="today" data-title="Today's Tasks">
          <span class="page-icon"><i class="bi bi-intersect"></i></span>
          <span class="page-name">Today</span>
          <span class="page-etc selection-etc"></span>
        </button>
        <button class="page-btn" data-id="upcoming" data-title="Upcoming Tasks">
          <span class="page-icon"><i class="bi bi-calendar"></i></span>
          <span class="page-name">Upcoming</span>
          <span class="page-etc selection-etc"></span>
        </button>
        <button class="projects-btn" data-id="project" data-bs-toggle="collapse" data-bs-target="#project-list" aria-expanded="false" aria-controls="project-list">
          <span class="page-icon"><i class="bi bi-folder"></i></span>
          <span class="page-name">Projects</span>
          <span class="page-etc"><i class="bi bi-chevron-down"></i></span>
        </button>
      </nav>
      <nav class="projects">
        <div class="projects-list collapse" id="project-list"></div>
      </nav>
    </section>
    <section class="main container px-lg-5 px-md-5 py-2">
      <div class="nav-toggle hide">
        <i class="bi bi-list"></i>
      </div>
      <header class="toolbar container px-lg-5 py-lg-4 px-md-4 py-md-4 px-sm-5 py-sm-4">
        <div class="app-info">
          <div class="page-title"></div>
          <div class="current-date"></div>
        </div>
      </header>
      <main class="tasks container px-lg-5 px-md-4 px-sm-5">
        <div class="tasks-list container px-0 py-2"></div>
      </main>
    </section>
  `
  
  let date = root.querySelector('.current-date')
  let pages = root.querySelectorAll('.page-btn')
  
  date.innerHTML = `
    <span class="current-day">${format(new Date(), 'EEEE')}</span>
    ${format(new Date(), 'MMMM do, yyyy')}
  `

  pages.forEach(page => {
    page.addEventListener('click', () => {
      Event.publish('PAGE-REQUEST', { 
        id: page.dataset.id, 
        title: page.dataset.title 
      })
    })
  })

  let project = document.querySelector('.projects-btn .page-etc')
  let target = document.querySelector('.projects-list')

  target.addEventListener('hide.bs.collapse', () => {
    project.classList.remove('open')
  })

  target.addEventListener('show.bs.collapse', () => {
    project.classList.add('open')
  })

  Event.subscribe('MOBILE-VIEW-REQUEST', MobileView)
}

const MobileView = function(root) {
  let toggle = root.querySelector('.nav-toggle')
  let nav = root.querySelector('.nav')
  let pages = root.querySelectorAll('.page-btn')
  let projects = root.querySelectorAll('.project-btn-container')
  console.log(projects)

  toggle.classList.remove('hide')
  toggle.setAttribute('data-bs-toggle', 'offcanvas')
  toggle.setAttribute('data-bs-target', '#nav-sidebar')
  toggle.setAttribute('aria-controls', 'nav-sidebar')

  nav.classList.add('offcanvas-sm', 'offcanvas-start')
  nav.id = 'nav-sidebar'
  nav.tabIndex = '-1'
  nav.setAttribute('aria-labelledby', 'navSidebarLabel')

  let btns = [...pages, ...projects]

  btns.forEach(btn => {
    btn.setAttribute('data-bs-dismiss', 'offcanvas')
    btn.setAttribute('data-bs-target', '#nav-sidebar')
  })
}

export default View