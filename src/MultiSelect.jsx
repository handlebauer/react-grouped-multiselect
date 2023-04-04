import React, { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import produce from 'immer'

import { shallowEqualSortedArrays } from '@hbauer/convenience-functions'

import { flatten } from './flatten.js'

import Circle from './Circle.jsx'
import Check from './Check.jsx'

function Option({
  index,
  name,
  level,
  visibleSportsLength,
  checked,
  partial,
  visible,
  disabled,
  handleClick,
  optionBoxContainerRefs,
}) {
  const optionBoxContainerClasses = clsx(
    'option-box-container',
    level === 0 && 'group',
    checked && 'selected',
    partial && 'partial',
    !visible && 'hidden',
    disabled && 'disabled'
  )

  const optionBoxContainerOuterClasses = clsx(
    'option-box-container-outer',
    level === 0 && 'group',
    !visible && 'hidden',
    visibleSportsLength === 1 && 'single-group'
  )

  return (
    <div className={optionBoxContainerOuterClasses}>
      <hr />
      <div
        className={optionBoxContainerClasses}
        tabIndex={index}
        onClick={handleClick(name, !checked)}
        ref={element => {
          return (optionBoxContainerRefs.current[index] = element)
        }}
      >
        <label
          className="option-control"
          htmlFor={name}
          style={{ marginLeft: `${level === 0 ? '8px' : level * 20}px` }}
        >
          {name}
        </label>
        {partial ? <Circle /> : <Check />}
      </div>
    </div>
  )
}

export default function MultiSelect({ data }) {
  const flattenedData = flatten(data).map((opt, i) => ({ index: i, ...opt }))

  const [isOpen, setIsOpen] = useState(true)
  const [options, setOptions] = useState(flattenedData)
  const [searchValue, setSearchValue] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(0)
  const searchRef = useRef(null)
  const optionsContainerRef = useRef(null)
  const optionBoxContainerRefs = useRef(new Array(options.length).fill(null))

  const handleMouseDown = event => {
    const isInteractionOutside =
      optionsContainerRef.current &&
      !optionsContainerRef.current.contains(event.target)
    if (isInteractionOutside) {
      setIsOpen(false)
    }
  }

  const handleOptionSelect = (name, wasChecked) => _ => {
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

  useEffect(() => {
    const handleKeyDown = event => {
      if (
        (event.key === 'ArrowDown' || event.key === 'Tab') &&
        focusedIndex < options.length - 1
      ) {
        event.preventDefault()
        setFocusedIndex(focusedIndex + 1)
      } else if (event.key === 'ArrowUp' && focusedIndex > -1) {
        event.preventDefault()
        setFocusedIndex(focusedIndex - 1)
      } else if (
        focusedIndex >= 0 &&
        (event.key === ' ' || event.key === 'Enter')
      ) {
        event.preventDefault()
        const option = options[focusedIndex]
        handleOptionSelect(option.name, !option.checked)()
      } else if (event.key.match(/^[a-zA-Z0-9]$/)) {
        setFocusedIndex(-1)
      }
    }

    if (focusedIndex === -1) {
      searchRef.current.focus()
    } else {
      const currentOptionBoxContainerRef =
        optionBoxContainerRefs.current[focusedIndex]
      if (currentOptionBoxContainerRef) {
        currentOptionBoxContainerRef.focus()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [focusedIndex, optionBoxContainerRefs, handleOptionSelect, searchRef])

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

  const visibleSportsLength = options.filter(
    opt => opt.level === 0 && opt.visible
  ).length

  return (
    <div className="grouped-multi-select">
      <input
        type="search"
        className="select-box"
        onChange={handleSearchChange}
        placeholder="Search sports/leagues/teams"
        onClick={event => {
          setFocusedIndex(-1)
          setIsOpen(true)
        }}
        tabIndex="-1"
        ref={searchRef}
      />
      <div
        ref={optionsContainerRef}
        className={`options-container open-${isOpen}`}
      >
        {options.some(opt => opt.visible) ? (
          options.map(item => (
            <Option
              key={item.index}
              {...item}
              optionBoxContainerRefs={optionBoxContainerRefs}
              visibleSportsLength={visibleSportsLength}
              handleClick={handleOptionSelect}
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
