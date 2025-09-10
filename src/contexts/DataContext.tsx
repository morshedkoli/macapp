'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface AdRecord {
  id: string
  name: string
  mac: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

interface DataContextType {
  records: AdRecord[]
  loading: boolean
  error: string | null
  addRecord: (record: Omit<AdRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
  updateRecord: (id: string, record: Partial<Omit<AdRecord, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  refreshRecords: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<AdRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/records')
      
      if (!response.ok) {
        throw new Error('Failed to fetch records')
      }
      
      const data = await response.json()
      const formattedRecords = data.map((record: any) => ({
        ...record,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt)
      }))
      
      setRecords(formattedRecords)
    } catch (error) {
      console.error('Error fetching records:', error)
      setError('Failed to load records')
    } finally {
      setLoading(false)
    }
  }

  // Load records on mount
  useEffect(() => {
    fetchRecords()
  }, [])

  const addRecord = async (newRecord: Omit<AdRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add record')
      }

      const createdRecord = await response.json()
      const formattedRecord = {
        ...createdRecord,
        createdAt: new Date(createdRecord.createdAt),
        updatedAt: new Date(createdRecord.updatedAt)
      }
      
      setRecords(prev => [formattedRecord, ...prev])
    } catch (error: any) {
      console.error('Error adding record:', error)
      setError(error.message)
      throw error
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete record')
      }

      setRecords(prev => prev.filter(record => record.id !== id))
    } catch (error: any) {
      console.error('Error deleting record:', error)
      setError(error.message)
      throw error
    }
  }

  const updateRecord = async (id: string, updatedData: Partial<Omit<AdRecord, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setError(null)
      const response = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update record')
      }

      const updatedRecord = await response.json()
      const formattedRecord = {
        ...updatedRecord,
        createdAt: new Date(updatedRecord.createdAt),
        updatedAt: new Date(updatedRecord.updatedAt)
      }
      
      setRecords(prev => 
        prev.map(record => 
          record.id === id ? formattedRecord : record
        )
      )
    } catch (error: any) {
      console.error('Error updating record:', error)
      setError(error.message)
      throw error
    }
  }

  const refreshRecords = async () => {
    await fetchRecords()
  }

  return (
    <DataContext.Provider value={{ 
      records, 
      loading, 
      error, 
      addRecord, 
      deleteRecord, 
      updateRecord, 
      refreshRecords 
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}