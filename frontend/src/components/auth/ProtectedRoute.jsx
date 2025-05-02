import React from 'react'
import { useAuth } from './AuthProvider'
import { Outlet } from 'react-router-dom';

function ProtectedRoute({allowedRoles}) {
    const {currentUser} = useAuth();
    if(currentUser === undefined)
        return <div>Loading...</div>
    

    if(currentUser === null || (allowedRoles && !allowedRoles.includes(currentUser.role)))
    {   console.log(currentUser)
        return <div>Permission denied</div>
    }
  return <Outlet/>;
}

export default ProtectedRoute