import React, { useState, useEffect } from 'react'
import { Users, Mail, Send, TrendingUp } from 'lucide-react'
import { blink } from '../blink/client'

interface DashboardOverviewProps {
  user: any
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalTemplates: 0,
    totalCampaigns: 0,
    totalSent: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [contacts, templates, campaigns, recipients] = await Promise.all([
          blink.db.contacts.list({ where: { userId: user.id } }),
          blink.db.emailTemplates.list({ where: { userId: user.id } }),
          blink.db.campaigns.list({ where: { userId: user.id } }),
          blink.db.campaignRecipients.list({ where: { userId: user.id } })
        ])

        setStats({
          totalContacts: contacts.length,
          totalTemplates: templates.length,
          totalCampaigns: campaigns.length,
          totalSent: recipients.length
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [user.id])

  const statCards = [
    {
      title: 'Total Contacts',
      value: stats.totalContacts,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Email Templates',
      value: stats.totalTemplates,
      icon: Mail,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Campaigns',
      value: stats.totalCampaigns,
      icon: Send,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Emails Sent',
      value: stats.totalSent,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user.email?.split('@')[0] || 'User'}!
        </h2>
        <p className="text-gray-600">
          Here's what's happening with your email marketing campaigns today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                  <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Mail className="h-4 w-4 mr-2" />
              Compose New Email
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Users className="h-4 w-4 mr-2" />
              Add Contacts
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-3"></div>
              Platform initialized successfully
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="h-2 w-2 bg-blue-400 rounded-full mr-3"></div>
              Ready to start building your email campaigns
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="h-2 w-2 bg-purple-400 rounded-full mr-3"></div>
              Add your first contact to get started
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}