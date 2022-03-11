import pubsub from './pubsub'

export const append = function(parent, ...children) {
  for (let child of children) {
    parent.appendChild(child)
  }

  return parent
}

export const create = function(type, id, ...children) {
  const element = document.createElement(type)
  
  if (id) element.id = id
  for (let child of children) {
    if (typeof child != 'string') append(element, child)
    else append(element, document.createTextNode(child))
  }

  return element
}

export const wipe = function(node) {
  node.childNodes.forEach(child => {
    node.removeChild(child)
  })

  return node
}

export const compress = function(name) {
  return name.replace(/\s+/g, '-').toLowerCase()
}