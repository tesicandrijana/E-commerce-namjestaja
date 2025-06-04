import React, { createContext, useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'

const AuthContext = createContext(undefined)

export default function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState()
    const [token, setToken] = useState()
    

    async function fetchUser() {
        try {

            const response = await axios.get("http://localhost:8000/users/me", {
                withCredentials: true
            });
            const user = response.data;

            setCurrentUser(user);
            return user;
        } catch {
            setCurrentUser(null);
        }
    }
    useEffect(() => {
        fetchUser();
    }, [])

    async function handleLogin(data) {
        return axios.post("http://localhost:8000/users/login", data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
    })
    .then((r) => {
        console.log(r)
        return fetchUser(); 
    })
    .catch((e) => {
        console.log(e)
        setCurrentUser(null);
        return null;
    });
}

    async function handleLogout() {
        const res = await axios.post("http://localhost:8000/users/logout", {}, {
            withCredentials: true
        });
        setCurrentUser(null);
    }

    return <AuthContext.Provider value={{
        currentUser,
        handleLogin,
        handleLogout
    }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)


    if (context === undefined) {
        throw new Error('UseAuth must be used inside AuthProvider')
    }
    return context;
}