export default class Storage {
  static set(key, value) {
    return localStorage.setItem(key, JSON.stringify(value))
  }

  static get(key) {
    return localStorage.getItem(key) 
           ? JSON.parse(localStorage.getItem(key))
           : Storage.set(key, [])
  }

  static clear() {
    return localStorage.clear()
  }
}

