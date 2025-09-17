import React from 'react'
import ReactDOM from 'react-dom/client'
import Homepage from './HomePage'
import './index.css'  // ← Make sure this line exists

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Homepage />
  </React.StrictMode>,
)