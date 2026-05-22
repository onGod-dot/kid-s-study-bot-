'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import LoadingScreen from '@/components/LoadingScreen'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
      <div style={{ visibility: loaded ? 'visible' : 'hidden' }}>
        {children}
      </div>
      <Toaster position="top-right" />
    </>
  )
}
