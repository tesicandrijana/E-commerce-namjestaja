import React, {createContext, useContext, useEffect, useState} from 'react'
import axios from 'axios'

const AuthContext = createContext(undefined)

export default function AuthProvider ({children}) {
    const [currentUser, setCurrentUser] = useState()
    const [token, setToken] = useState()

    axios.defaults.baseURL = "http://localhost:8000";

    async function fetchUser(){
        try{
            const token = localStorage.getItem("token");
            setToken(token);
            const response = await axios.get("http://localhost:8000/users/me",{
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
            console.log(response);
            const user = response.data;

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            setCurrentUser(user);
            return user;
        }catch{
            setCurrentUser(null);
        }
    } 
    useEffect(()=> {
        fetchUser();
    }, [])

    async function handleLogin(data){
        try{
            const response = await axios.post("http://localhost:8000/users/login",data, {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
              })
            
            localStorage.setItem("token", response.data.access_token);
            const user = await fetchUser();
            setCurrentUser(user);

            return user;
        }catch{
            setCurrentUser(null)
        }
    }

    async function handleLogout(){
        setCurrentUser(null);
        localStorage.clear();
    }

    return <AuthContext.Provider value = {{
        currentUser,
        handleLogin,
        handleLogout
    }}>{children}</AuthContext.Provider>
}

export function useAuth(){
    const context = useContext(AuthContext)

    
    if(context === undefined){
        throw new Error('UseAuth must be used inside AuthProvider')
    }
    return context;
}