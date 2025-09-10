'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function AddRecord() {
  const { isAuthenticated } = useAuth()
  const { addRecord } = useData()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    mac: '',
    name: '',
    phone: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const validateMacAddress = (mac: string): boolean => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    return macRegex.test(mac)
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'mac') {
      // Format MAC address while typing
      const cleanValue = value.replace(/[^a-fA-F0-9]/g, '') // Remove non-hex characters
      let formattedValue = ''
      
      for (let i = 0; i < cleanValue.length && i < 12; i++) {
        if (i > 0 && i % 2 === 0) {
          formattedValue += ':'
        }
        formattedValue += cleanValue[i]
      }
      
      setFormData(prev => ({ ...prev, [name]: formattedValue.toUpperCase() }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validate form
    const newErrors: Record<string, string> = {}

    if (!formData.mac.trim()) {
      newErrors.mac = 'MAC address is required'
    } else if (!validateMacAddress(formData.mac)) {
      newErrors.mac = 'Please enter a valid MAC address (e.g., 00:11:22:33:44:55)'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    // Add record
    try {
      await addRecord(formData)
      setFormData({ mac: '', name: '', phone: '' })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error adding record:', error)
      setErrors({ general: error.message || 'Failed to add record' })
    }

    setIsLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Record</h1>
          <p className="text-gray-600 mt-2">
            Add a new ad record with MAC address, name, and phone number.
          </p>
        </div>

        {showSuccess && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Record added successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Record Details</CardTitle>
            <CardDescription>
              Enter the information for the new ad record
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="mac" className="text-sm font-medium text-gray-700">
                  MAC Address
                </label>
                <Input
                  id="mac"
                  name="mac"
                  type="text"
                  placeholder="00:11:22:33:44:55"
                  value={formData.mac}
                  onChange={handleInputChange}
                  className={`font-mono ${errors.mac ? 'border-red-500' : ''}`}
                  maxLength={17}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.mac && (
                  <p className="text-sm text-red-600">{errors.mac}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter contact name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Adding Record...' : 'Add Record'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormData({ mac: '', name: '', phone: '' })}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}