import { createContext, useContext, useState, useEffect, useCallback } from 'react'

import { API_URL } from '../config'

const API_ENDPOINT = `${API_URL}/api`

const VehicleContext = createContext(null)

// Helper to get current user from localStorage
const getCurrentUser = () => {
  try {
    const auth = localStorage.getItem('autoVaultAuth')
    return auth ? JSON.parse(auth) : null
  } catch {
    return null
  }
}

export function VehicleProvider({ children }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(getCurrentUser())

  // Fetch vehicles whenever user changes
  const fetchVehicles = useCallback(async (userId) => {
    if (!userId) {
      setVehicles([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_ENDPOINT}/vehicles?userId=${userId}`)
      const data = await res.json()
      setVehicles(data)
    } catch (err) {
      console.error('Failed to load vehicles:', err)
      setVehicles([])
    }
    setLoading(false)
  }, [])

  // Re-fetch when user state changes
  useEffect(() => {
    fetchVehicles(user?.userId)
  }, [user?.userId, fetchVehicles])

  // Called by Login.jsx after successful login/register
  const loginUser = (userData) => {
    localStorage.setItem('autoVaultAuth', JSON.stringify({
      authenticated: true,
      userId: userData.userId,
      username: userData.username
    }))
    setUser({
      authenticated: true,
      userId: userData.userId,
      username: userData.username
    })
  }

  const addVehicle = async (v) => {
    if (!user?.userId) return null

    const res = await fetch(`${API_ENDPOINT}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...v, userId: user.userId })
    })
    const newVehicle = await res.json()
    setVehicles(prev => [...prev, newVehicle])
    return newVehicle.id
  }

  const updateVehicle = async (id, data) => {
    if (!user?.userId) return

    const vehicle = vehicles.find(v => v.id === id)
    const updated = { ...vehicle, ...data }

    await fetch(`${API_ENDPOINT}/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updated, userId: user.userId })
    })

    setVehicles(prev => prev.map(v => v.id === id ? updated : v))
  }

  const deleteVehicle = async (id) => {
    if (!user?.userId) return

    await fetch(`${API_ENDPOINT}/vehicles/${id}?userId=${user.userId}`, { method: 'DELETE' })
    setVehicles(prev => prev.filter(v => v.id !== id))
  }

  const getVehicle = (id) => vehicles.find(v => v.id === id)

  const logout = () => {
    localStorage.removeItem('autoVaultAuth')
    setUser(null)
    setVehicles([])
  }

  return (
    <VehicleContext.Provider value={{ vehicles, loading, user, loginUser, addVehicle, updateVehicle, deleteVehicle, getVehicle, logout }}>
      {children}
    </VehicleContext.Provider>
  )
}

export function useVehicles() {
  const ctx = useContext(VehicleContext)
  if (!ctx) throw new Error('useVehicles must be used within VehicleProvider')
  return ctx
}
