import React from 'react'
import { NavLink } from 'react-router-dom'

function Dashboard() {
  return (
    <div>
      <li><NavLink to="/add-product" end> Add product </NavLink></li>
      <li><NavLink to="/products" end> products </NavLink></li>
    </div>
  )
}

export default Dashboard