'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Edit, Calendar, Phone, Monitor, Save, X } from 'lucide-react'

export default function Records() {
  const { isAuthenticated } = useAuth()
  const { records, updateRecord, loading, error } = useData()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'macAddress'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({ name: '', mac: '', phone: '' })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const filteredRecords = records
    .filter(record => 
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone.includes(searchTerm)
    )
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'macAddress':
          comparison = a.mac.localeCompare(b.mac)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleSort = (field: 'name' | 'date' | 'macAddress') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const validateMacAddress = (mac: string): boolean => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    return macRegex.test(mac)
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  }

  const handleEdit = (record: any) => {
    setEditingId(record.id)
    setEditData({ name: record.name, mac: record.mac, phone: record.phone })
    setEditErrors({})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({ name: '', mac: '', phone: '' })
    setEditErrors({})
  }

  const handleSaveEdit = async () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!editData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!editData.mac.trim()) {
      newErrors.mac = 'MAC address is required'
    } else if (!validateMacAddress(editData.mac)) {
      newErrors.mac = 'Please enter a valid MAC address'
    }

    if (!editData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhoneNumber(editData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors)
      return
    }

    try {
      await updateRecord(editingId!, editData)
      setEditingId(null)
      setEditData({ name: '', mac: '', phone: '' })
      setEditErrors({})
    } catch (error: any) {
      setEditErrors({ general: error.message || 'Failed to update record' })
    }
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setEditData(prev => ({ ...prev, [name]: formattedValue.toUpperCase() }))
    } else {
      setEditData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error when user starts typing
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ad Records</h1>
          <p className="text-gray-600 mt-2">
            View and manage all ad records in the system.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Records List</CardTitle>
                <CardDescription>
                  {filteredRecords.length} of {records.length} records
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">Loading records...</div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">
                  {records.length === 0 ? 'No records found' : 'No matching records found'}
                </div>
                <p className="text-gray-600 text-sm">
                  {records.length === 0 
                    ? 'Start by adding your first ad record.' 
                    : 'Try adjusting your search criteria.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sort buttons */}
                <div className="flex flex-wrap gap-2 pb-4 border-b">
                  <span className="text-sm text-gray-600 mr-2">Sort by:</span>
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('date')}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant={sortBy === 'name' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant={sortBy === 'macAddress' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('macAddress')}
                  >
                    <Monitor className="h-3 w-3 mr-1" />
                    MAC {sortBy === 'macAddress' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Button>
                </div>

                {/* Records list */}
                <div className="space-y-3">
                  {filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {editingId === record.id ? (
                        // Edit mode
                        <div className="space-y-4">
                          {editErrors.general && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-600">{editErrors.general}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                              <Input
                                name="name"
                                value={editData.name}
                                onChange={handleEditInputChange}
                                className={editErrors.name ? 'border-red-500' : ''}
                                placeholder="Enter name"
                              />
                              {editErrors.name && (
                                <p className="text-xs text-red-600 mt-1">{editErrors.name}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
                              <Input
                                name="mac"
                                value={editData.mac}
                                onChange={handleEditInputChange}
                                className={`font-mono ${editErrors.mac ? 'border-red-500' : ''}`}
                                placeholder="00:11:22:33:44:55"
                                maxLength={17}
                                style={{ textTransform: 'uppercase' }}
                              />
                              {editErrors.mac && (
                                <p className="text-xs text-red-600 mt-1">{editErrors.mac}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                              <Input
                                name="phone"
                                value={editData.phone}
                                onChange={handleEditInputChange}
                                className={editErrors.phone ? 'border-red-500' : ''}
                                placeholder="+1 (555) 123-4567"
                              />
                              {editErrors.phone && (
                                <p className="text-xs text-red-600 mt-1">{editErrors.phone}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-4">
                              <h3 className="font-medium text-gray-900">{record.name}</h3>
                              <span className="text-sm text-gray-500">
                                {record.createdAt.toLocaleDateString()} at {record.createdAt.toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Monitor className="h-4 w-4" />
                                <span className="font-mono">{record.mac}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="h-4 w-4" />
                                <span>{record.phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(record)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}