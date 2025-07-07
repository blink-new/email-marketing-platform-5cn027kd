import React, { useState } from 'react'
import { Mail, Users, Send, BarChart3, Settings, Menu, X } from 'lucide-react'
import { ContactsTab } from './ContactsTab'
import { EmailComposer } from './EmailComposer'
import { CampaignsTab } from './CampaignsTab'
import { DashboardOverview } from './DashboardOverview'
import { useIsMobile } from '../hooks/use-mobile'

interface DashboardProps {
  user: any
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  const navigation = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'contacts', name: 'Contacts', icon: Users },
    { id: 'compose', name: 'Compose', icon: Mail },
    { id: 'campaigns', name: 'Campaigns', icon: Send },
    { id: 'settings', name: 'Settings', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview user={user} />
      case 'contacts':
        return <ContactsTab user={user} />
      case 'compose':
        return <EmailComposer user={user} />
      case 'campaigns':
        return <CampaignsTab user={user} />
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.email}</h3>
                  <p className="text-sm text-gray-500">Account settings</p>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <DashboardOverview user={user} />
    }
  }

  // Mobile Layout - Uses fixed positioned sidebar with overlay
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">EmailPro</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Mobile main content */}
        <div className="flex flex-col min-h-screen">
          {/* Mobile top bar */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 sm:px-6">
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="flex-1 text-center">
                  <h2 className="text-xl font-semibold text-gray-900 capitalize">
                    {activeTab === 'overview' ? 'Dashboard' : activeTab}
                  </h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile page content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    )
  }

  // Desktop Layout - Uses grid layout with fixed sidebar
  return (
    <div className="min-h-screen bg-gray-50 grid grid-cols-[256px_1fr]">
      {/* Desktop sidebar */}
      <aside className="bg-white shadow-lg">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">EmailPro</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Desktop main content */}
      <main className="flex flex-col">
        {/* Desktop top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {activeTab === 'overview' ? 'Dashboard' : activeTab}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop page content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}