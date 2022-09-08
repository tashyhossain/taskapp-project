import Event from './event'
import { format } from 'date-fns'

const View = function(root) {
  root.innerHTML = `
    <section class="nav">
      <nav class="nav__pages">
        <button class="nav__page-btn" data-id="inbox" data-title="Inbox">Inbox</button>
        <button class="nav__page-btn" data-id="today" data-title="Today's Tasks">Today</button>
        <button class="nav__page-btn" data-id="upcoming" data-title="Upcoming Tasks">Upcoming</button>
      </nav>
      <nav class="nav__projects">
        <div class="nav__projects-title">Projects</div>
        <div class="nav__projects-list"></div>
        
      </nav>
    </section>
    <section class="main">
      <div class="main__toolbar">
        <div class="main__page-title"></div>
        <div class="main__current-date"></div>
      </div>
      <main class="main__content">

        <div class="main__tasks"></div>
      </main>
    </section>
  `

  let date = root.querySelector('.main__current-date')
  let pages = root.querySelectorAll('.nav__page-btn')
  
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