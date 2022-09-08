import Event from './event'
import { format } from 'date-fns'

const View = function(root) {
  root.innerHTML = `
    <section class="nav">
      <nav class="nav-pages">
        <button class="nav-page-btn" data-id="inbox" data-title="Inbox">Inbox</button>
        <button class="nav-page-btn" data-id="today" data-title="Today's Tasks">Today</button>
        <button class="nav-page-btn" data-id="upcoming" data-title="Upcoming Tasks">Upcoming</button>
      </nav>
      <nav class="nav-projects">
        <div class="nav-projects-title">Projects</div>
        <div class="nav-projects-list"></div>
      </nav>
    </section>
    <section class="main">
      <div class="main-toolbar">
        <div class="page-title"></div>
        <div class="current-date"></div>
      </div>
      <main class="main-tasks">
        <div class="main-tasks-list"></div>
      </main>
    </section>
  `

  let date = root.querySelector('.current-date')
  let pages = root.querySelectorAll('.nav-page-btn')
  
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