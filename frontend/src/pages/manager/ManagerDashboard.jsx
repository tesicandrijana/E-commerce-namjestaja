import React from 'react'
import { NavLink } from 'react-router-dom'

function ManagerDashboard() {
  return (
    <div>
      <h1>Dobrodošao menadžeru!</h1> {/* NOVO */}
      <p>Ovo je menadžerska kontrolna tabla.</p> {/* NOVO */}
      <li><NavLink to="/add-product" end> Add product </NavLink></li>
      <li><NavLink to="/products" end> products </NavLink></li>
    </div>
  )
}

export default ManagerDashboard
