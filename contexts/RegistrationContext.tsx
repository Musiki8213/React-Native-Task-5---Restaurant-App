import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react'

export interface RegistrationData {
  email: string
  password: string
  full_name: string
  phone: string
  address: string
}

const defaultData: RegistrationData = {
  email: '',
  password: '',
  full_name: '',
  phone: '',
  address: '',
}

interface RegistrationContextType {
  data: RegistrationData
  setEmailPassword: (email: string, password: string) => void
  setProfileDetails: (full_name: string, phone: string, address: string) => void
  clearRegistration: () => void
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined)

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegistrationData>(defaultData)

  const setEmailPassword = useCallback((email: string, password: string) => {
    setData((prev) => ({ ...prev, email, password }))
  }, [])

  const setProfileDetails = useCallback((name: string, contact: string, address: string) => {
    setData((prev) => ({ ...prev, name, contact, address }))
  }, [])

  const clearRegistration = useCallback(() => {
    setData(defaultData)
  }, [])

  return (
    <RegistrationContext.Provider
      value={{ data, setEmailPassword, setProfileDetails, clearRegistration }}
    >
      {children}
    </RegistrationContext.Provider>
  )
}

export function useRegistration() {
  const context = useContext(RegistrationContext)
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider')
  }
  return context
}
