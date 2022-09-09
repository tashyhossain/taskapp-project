import Event from './event'
import { format } from 'date-fns'

const View = function(root) {
  root.innerHTML = `
    <section class="nav">
      <nav class="pages">
        <button class="page-btn" data-id="inbox" data-title="Inbox">Inbox</button>
        <button class="page-btn" data-id="today" data-title="Today's Tasks">Today</button>
        <button class="page-btn" data-id="upcoming" data-title="Upcoming Tasks">Upcoming</button>
      </nav>
      <nav class="projects">
        <div class="projects-title">Projects</div>
        <div class="projects-list"></div>
      </nav>
    </section>
    <section class="main">
      <div class="main-toolbar">
        <div class="page-title"></div>
        <div class="current-date"></div>
      </div>
      <main class="tasks">
        <div class="tasks-list"></div>
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