import Event from './event'
import { format } from 'date-fns'

const View = function(root) {
  root.innerHTML = `
    <section class="nav">
      <header class="app-title">
        <div class="h2">task.it</div>
      </header>
      <nav class="pages">
        <button class="btn page-btn" data-id="inbox" data-title="Inbox">
          <span class="page-icon"><i class="bi bi-inbox"></i></span>
          <span class="page-name">Inbox</span>
          <span class="page-etc selection-etc"></span>
        </button>
        <button class="btn page-btn" data-id="today" data-title="Today's Tasks">
          <span class="page-icon"><i class="bi bi-intersect"></i></span>
          <span class="page-name">Today</span>
          <span class="page-etc selection-etc"></span>
        </button>
        <button class="btn page-btn" data-id="upcoming" data-title="Upcoming Tasks">
          <span class="page-icon"><i class="bi bi-calendar"></i></span>
          <span class="page-name">Upcoming</span>
          <span class="page-etc selection-etc"></span>
        </button>
        <button class="btn projects-btn" data-bs-toggle="collapse" data-bs-target="#project-list" aria-expanded="false" aria-controls="project-list">
          <span class="page-icon"><i class="bi bi-folder"></i></span>
          <span class="page-name">Project</span>
          <span class="page-etc"><i class="bi bi-caret-down-fill"></i></span>
        </button>
      </nav>
      <nav class="projects">
        <div class="collapse projects-list" id="project-list"></div>
      </nav>
    </section>
    <section class="main container px-lg-5 px-md-5 py-2">
      <header class="toolbar container px-5 py-4">
        <div class="app-info">
          <div class="page-title"></div>
          <div class="current-date"></div>
        </div>
      </header>
      <main class="tasks container px-5">
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
}

export default View