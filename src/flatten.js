const data = [
  [
    'Hockey',
    [
      ['NHL', ['Calgary Flames', 'Vancouver Canucks', 'LA Kings']],
      ['Finish Elite League', ['Jukurit', 'KalPa']],
    ],
  ],
  [
    'Football',
    [
      ['NFL', ['Carolina Panths', 'Green Bay Packers', 'Chicago Bears']],
      ['CFL', ['BC Lions', 'Calgary Stampeders']],
    ],
  ],
]

/**
 *
 * @param {string[]} options
 * @param {null|string[]} parent
 * @returns {Object[]}
 */
export const flatten = (options, parent = null) =>
  options.reduce((arr, inputOption) => {
    const [name, value] = inputOption
    const reachedMaxLevel = typeof value === 'string'

    const option = {
      name: reachedMaxLevel ? inputOption : name,
      checked: true,
      parents: parent ? [...parent.parents, parent.name] : [],
      level: parent ? parent.level + 1 : 0,
      partial: false,
      visible: true,
      disabled: false,
    }

    arr.push(option)

    if (reachedMaxLevel === false) {
      arr.push(...flatten(value, option))
    }

    return arr
  }, [])
