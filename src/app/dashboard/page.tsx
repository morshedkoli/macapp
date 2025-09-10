'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Database, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { isAuthenticated } = useAuth()
  const { records, loading } = useData()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const stats = [
    {
      title: 'Total Records',
      value: records.length,
      description: 'Ad records in database',
      icon: Database,
    },
    {
      title: 'Recent Records',
      value: records.filter(record => {
        const dayAgo = new Date()
        dayAgo.setDate(dayAgo.getDate() - 1)
        return record.createdAt > dayAgo
      }).length,
      description: 'Added in last 24 hours',
      icon: TrendingUp,
    },
    {
      title: 'Unique Names',
      value: new Set(records.map(r => r.name)).size,
      description: 'Distinct contact names',
      icon: Users,
    },
    {
      title: 'Active Today',
      value: records.filter(record => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return record.createdAt >= today
      }).length,
      description: 'Records added today',
      icon: BarChart3,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to the admin dashboard. Here&apos;s an overview of your ad records.
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">Loading dashboard...</div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {records.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                No records found. Start by adding your first ad record.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Use the &quot;Add Record&quot; page to create your first entry with MAC address, name, and phone number.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest ad records added to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {records
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .slice(0, 5)
                  .map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{record.name}</p>
                        <p className="text-sm text-gray-600">{record.mac}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
        </>
        )}
      </div>
    </DashboardLayout>
  )
}