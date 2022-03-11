import './assets/style.css'
import './assets/style.scss'
import { Collapse } from 'bootstrap'
import app from './modules/app'
import page from './modules/page'
import tasks from './modules/tasks'
import pubsub from './modules/pubsub'
import Storage from './modules/storage'


const initialize = (function() {
  Storage.get('projects')
  Storage.get('tasks')
  pubsub.publish('PAGE-REQUEST', 'today')
  pubsub.publish('PROJECT-ADDED', Storage.get('projects'))
})()


