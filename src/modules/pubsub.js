const pubsub = function(events) {
  return {
    subscribe: function(name, handler) {
      console.log(`SUBSCRIBE: subscription made to ${name}`)
      events[name] = events[name] || []
      events[name].push(handler)
    },
    unsubscribe: function(name, handler) {
      if (events[name]) {
        events[name] = events[name].filter(h => h != handler)
      }
    },
    publish: function(name, data) {
      if (events[name]) {
        console.log(`PUBLISH: ${name} published ${data}`)
        events[name].forEach(handler => handler(data))
      }
    }
  }
}

export default pubsub({})