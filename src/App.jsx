// import { useState } from 'react'
import './App.css'
import MultiSelect from './MultiSelect.jsx'
import { data } from './data.js'

function App() {
  return (
    <div className="App">
      <MultiSelect data={data} />
    </div>
  )
}

export default App
