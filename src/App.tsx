import React, { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Dashboard } from './components/Dashboard'
import { LoadingSpinner } from './components/LoadingSpinner'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to EmailPro</h1>
          <p className="text-gray-600">Please sign in to access your email marketing platform</p>
        </div>
      </div>
    )
  }

  return <Dashboard user={user} />
}

export default App