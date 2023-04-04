const data = {
  Hockey: {
    NHL: {
      'Calgary Flames': true,
      'Vancouver Canucks': true,
      'LA Kings': true,
    },
    'Finish Elite League': { Jukurit: true, KalPa: true },
  },
  Football: {
    NFL: {
      'Carolina Panths': true,
      'Green Bay Packers': true,
      'Chicago Bears': true,
    },
    CFL: { 'BC Lions': true, 'Calgary Stampeders': true },
  },
}

const typeOf = operand =>
  Object.prototype.toString.call(operand).slice(8, -1).toLowerCase()

function getParentValues(obj, arr = []) {
  arr.push(obj.value)
  if (obj.parent) {
    getParentValues(obj.parent, arr)
  }
  return arr
}

const flatten = (options, parent = null) =>
  Object.keys(options).reduce((acc, key) => {
    const value = options[key]
    let option = null

    if (typeOf(value) === 'object') {
      option = {
        value: key,
        isParent: true,
        ...(parent
          ? {
              isChild: true,
              parent: [
                ...(parent.parent ? [...parent.parent] : []),
                parent.value,
              ],
              level: parent.level + 1,
            }
          : { isChild: false, level: 0 }),
      }
      acc.push(...[option, ...flatten(value, option)])
    } else {
      option = {
        value: key,
        isParent: false,
        isChild: true,
        parent: [...(parent.parent ? [...parent.parent] : []), parent.value],
        level: parent.level + 1,
      }
      acc.push(option)
    }

    return acc
  }, [])

console.time('flatten')
flatten(data)
console.timeEnd('flatten')

const prettyPrintFlattened = arr => {
  const pad = '   '
  arr.forEach(item =>
    console.log(
      pad.repeat(item.level) +
        (item.level > 0 ? `• ${item.value}` : item.value) +
        '\n'
    )
  )
}

// console.log()
// console.log()
// prettyPrintFlattened(flatten(data))
// console.log()
// console.log()
// console.log(flatten(data))
