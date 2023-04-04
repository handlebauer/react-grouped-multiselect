import React, { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import produce from 'immer'

import { shallowEqualSortedArrays } from '@hbauer/convenience-functions'

import { flatten } from './flatten.js'

function Check() {
  return (
    <span className="check-container">
      <span className="check">
        <svg
          viewBox="64 64 896 896"
          focusable="false"
          data-icon="check"
          width="1em"
          height="1em"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"></path>
        </svg>
      </span>
    </span>
  )
}

function PartialCheck({ colour }) {
  return (
    <span className="check-container partial">
      <span className="check">
        <svg
          viewBox="0 0 100 100"
          width="0.5em"
          height="0.5em"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="50" />
        </svg>{' '}
      </span>
    </span>
  )
}

function Option({
  name,
  level,
  checked,
  partial,
  visible,
  disabled,
  handleClick,
}) {
  const optionBoxContainerClasses = clsx(
    'option-box-container',
    level === 0 && 'group',
    checked && 'selected',
    partial && 'partial',
    !visible && 'hidden',
    disabled && 'disabled'
  )

  return (
    <div
      className={optionBoxContainerClasses}
      onClick={handleClick(name, !checked)}
    >
      {/* <input
        type="checkbox"
        checked={checked}
        className="option-box"
        value={name}
        onChange={handleChange}
      /> */}
      <label
        className="option-control"
        htmlFor={name}
        style={{ marginLeft: `${level === 0 ? '8px' : level * 20}px` }}
      >
        {name}
      </label>
      {partial ? <PartialCheck /> : <Check />}
    </div>
  )
}

export default function MultiSelect({ data }) {
  const flattenedData = flatten(data).map((opt, i) => ({ index: i, ...opt }))

  const [isOpen, setIsOpen] = useState(true)
  const [options, setOptions] = useState(flattenedData)
  const optionsContainerRef = useRef()

  const handleMouseDown = event => {
    const isInteractionOutside =
      optionsContainerRef.current &&
      !optionsContainerRef.current.contains(event.target)
    if (isInteractionOutside) {
      setIsOpen(false)
    }
  }

  const handleKeyDown = event => {
    event.preventDefault()
    // if (event.key === 'ArrowDown') {
    // event.preventDefault()
    //   focusNextOption()
    // } else if (event.key === 'ArrowUp') {
    //   event.preventDefault()
    //   focusPrevOption()
    // } else if (event.key === ' ') {
    //   event.preventDefault()
    //   toggleFocusedOption()
    // } else if (event.key === 'Enter') {
    //   event.preventDefault()
    //   toggleFocusedOption()
    // }
  }

  useEffect(() => {
    optionsContainerRef.current.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [optionsContainerRef])

  const handleOptionClick = (name, wasChecked) => _ => {
    const selected = options.find(opt => opt.name === name)

    const targetIndexes = [selected.index]
    const targetPartialIndexes = []

    if (wasChecked === true) {
      function findParentIndexes(current, indexes = []) {
        if (current.parents.length === 0) {
          return indexes
        }

        const directSiblingsChecked = options
          .filter(
            opt =>
              opt.name !== current.name &&
              opt.level === current.level &&
              shallowEqualSortedArrays(opt.parents, current.parents)
          )
          .every(sibling => sibling.checked)

        // const allSiblingsChecked = options
        //   .filter(
        //     opt =>
        //       opt.name !== current.name &&
        //       opt.level === current.level &&
        //       current.parents.at(0) === opt.parents.at(0)
        //   )
        //   .every(sibling => sibling.checked)

        if (directSiblingsChecked) {
          // if (directSiblingsChecked || allSiblingsChecked) {
          const parentName = current.parents.at(-1)
          const parent = options.find(opt => opt.name === parentName)
          return findParentIndexes(parent, [parent.index, ...indexes])
        }

        return indexes
      }

      targetIndexes.push(...findParentIndexes(selected))
    } else {
      function getParentIndexes(current, indexes = []) {
        if (current.parents.length === 0) {
          return indexes
        }
        const parentName = current.parents.at(-1)
        const parent = options.find(opt => opt.name === parentName)
        return [parent.index, ...getParentIndexes(parent, indexes)]
      }
      targetPartialIndexes.push(...getParentIndexes(selected))

      const parentIndexes = options
        .filter(opt => selected.parents.includes(opt.name))
        .map(opt => opt.index)
      targetIndexes.push(...parentIndexes)
    }

    const descendentIndexes = options
      .filter(opt => opt.parents.includes(selected.name))
      .map(opt => opt.index)

    targetIndexes.push(...descendentIndexes)

    setOptions(
      produce(draft => {
        targetIndexes.forEach(index => {
          draft[index].checked = wasChecked
          draft[index].partial = false
        })
        targetPartialIndexes.forEach(index => {
          draft[index].partial = true
        })
      })
    )
  }

  // const handleOptionChange = event => {
  //   const { value: name, checked } = event.target

  //   const selected = options.find(opt => opt.name === name)

  //   const targetIndexes = [selected.index]

  //   if (checked === true) {
  //     function findParentIndexes(current, indexes = []) {
  //       if (current.parents.length === 0) {
  //         return indexes
  //       }

  //       const directSiblingsChecked = options
  //         .filter(
  //           opt =>
  //             opt.name !== current.name &&
  //             opt.level === current.level &&
  //             shallowEqualSortedArrays(opt.parents, current.parents)
  //         )
  //         .every(sibling => sibling.checked)

  //       const allSiblingsChecked = options
  //         .filter(
  //           opt =>
  //             opt.name !== current.name &&
  //             opt.level === current.level &&
  //             current.parents.at(0) === opt.parents.at(0)
  //         )
  //         .every(sibling => sibling.checked)

  //       if (directSiblingsChecked || allSiblingsChecked) {
  //         const parentName = current.parents.at(-1)
  //         const parent = options.find(opt => opt.name === parentName)
  //         return findParentIndexes(parent, [parent.index, ...indexes])
  //       }

  //       return indexes
  //     }

  //     targetIndexes.push(...findParentIndexes(selected))
  //   } else {
  //     const parentIndexes = options
  //       .filter(opt => selected.parents.includes(opt.name))
  //       .map(opt => opt.index)
  //     targetIndexes.push(...parentIndexes)
  //   }

  //   const descendentIndexes = options
  //     .filter(opt => opt.parents.includes(selected.name))
  //     .map(opt => opt.index)

  //   targetIndexes.push(...descendentIndexes)

  //   setOptions(
  //     produce(draft =>
  //       targetIndexes.forEach(index => (draft[index].checked = checked))
  //     )
  //   )
  // }

  const handleSearchChange = event => {
    const value = event.target.value.toLowerCase().trim()
    const searchMatches = options.filter(
      opt => opt.name.toLowerCase().indexOf(value) !== -1
    )
    const searchMatchDescendents = options.filter(opt => {
      const isDescendent = searchMatches.some(searchMatch =>
        opt.parents.includes(searchMatch.name)
      )

      const isNotDuplicate = searchMatches.every(
        searchMatch => searchMatch.index !== opt.index
      )

      return isDescendent && isNotDuplicate
    })

    const searchMatchAncestorIndexes = options
      .filter(opt => {
        const isAncestor = searchMatches.some(searchMatch =>
          searchMatch.parents.includes(opt.name)
        )

        const isNotDuplicate = searchMatches.every(
          searchMatch => searchMatch.index !== opt.index
        )

        return isAncestor && isNotDuplicate
      })
      .map(ancestor => ancestor.index)

    const searchMatchIndexes = searchMatches
      .concat(searchMatchDescendents)
      .map(searchMatch => searchMatch.index)

    setOptions(
      produce(draft => {
        draft.forEach(opt => {
          const isMatch = searchMatchIndexes.includes(opt.index)
          const isAncestor = searchMatchAncestorIndexes.includes(opt.index)
          opt.visible = isAncestor || isMatch
          opt.disabled = isAncestor
        })
      })
    )
  }

  return (
    <div className="grouped-multi-select">
      <input
        type="search"
        className="select-box"
        onChange={handleSearchChange}
        onClick={() => setIsOpen(!isOpen)}
      />
      <div
        ref={optionsContainerRef}
        className={`options-container open-${isOpen}`}
      >
        {options.some(opt => opt.visible) ? (
          options.map(item => (
            <Option
              key={item.name}
              {...item}
              // handleChange={handleOptionChange}
              handleClick={handleOptionClick}
            />
          ))
        ) : (
          <div className="option-box-container">
            <label className="option-control" style={{ marginLeft: '8px' }}>
              No results, sorry!
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
