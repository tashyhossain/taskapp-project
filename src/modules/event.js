const Event = function(cache = {}) {
  return {
    publish: function(event, data) {
      console.log(`PUBLISH: ${event} with ${data}`)
      if (cache[event]) {
        cache[event].forEach(e => {
          e(data)
        })
      }
    },
    
    subscribe: function(event, handler) {
      console.log(`SUBSCRIBE: ${event} for ${handler}`)
      cache[event] = cache[event] || []
      cache[event].push(handler)
    }
  }
}

export default Event()