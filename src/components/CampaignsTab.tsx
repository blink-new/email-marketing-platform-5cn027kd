import React, { useState, useEffect } from 'react'
import { Send, Calendar, Users, Eye, BarChart } from 'lucide-react'
import { blink } from '../blink/client'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import toast from 'react-hot-toast'

interface Campaign {
  id: string
  name: string
  subject: string
  content: string
  status: string
  sentAt: string
  createdAt: string
  userId: string
}

interface CampaignRecipient {
  id: string
  campaignId: string
  contactId: string
  sentAt: string
}

interface Contact {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface CampaignsTabProps {
  user: any
}

export function CampaignsTab({ user }: CampaignsTabProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [user.id])

  const fetchData = async () => {
    try {
      const [campaignsResult, recipientsResult, contactsResult] = await Promise.all([
        blink.db.campaigns.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        }),
        blink.db.campaignRecipients.list({
          where: { userId: user.id }
        }),
        blink.db.contacts.list({
          where: { userId: user.id }
        })
      ])

      setCampaigns(campaignsResult)
      setRecipients(recipientsResult)
      setContacts(contactsResult)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load campaigns')
    }
  }

  const getCampaignRecipients = (campaignId: string) => {
    return recipients.filter(r => r.campaignId === campaignId)
  }

  const getCampaignContacts = (campaignId: string) => {
    const campaignRecipients = getCampaignRecipients(campaignId)
    return contacts.filter(c => campaignRecipients.some(r => r.contactId === c.id))
  }

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setIsDetailsOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Campaigns</h2>
        <p className="text-gray-600">Track and manage your email marketing campaigns</p>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipients.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.length > 0 ? '100%' : '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No campaigns yet</p>
              <p className="text-sm text-gray-400">
                Create your first email campaign to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => {
            const campaignRecipients = getCampaignRecipients(campaign.id)
            // const campaignContacts = getCampaignContacts(campaign.id)

            return (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {campaign.name}
                        </h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        Subject: {campaign.subject}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{campaignRecipients.length} recipients</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {campaign.sentAt 
                              ? `Sent ${new Date(campaign.sentAt).toLocaleDateString()}`
                              : `Created ${new Date(campaign.createdAt).toLocaleDateString()}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(campaign)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Campaign Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedCampaign.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedCampaign.status)}`}>
                      {selectedCampaign.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Recipients:</span>
                    <span className="ml-2">{getCampaignRecipients(selectedCampaign.id).length}</span>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{new Date(selectedCampaign.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">Sent:</span>
                    <span className="ml-2">
                      {selectedCampaign.sentAt 
                        ? new Date(selectedCampaign.sentAt).toLocaleDateString()
                        : 'Not sent'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Email Subject:</h4>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedCampaign.subject}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Email Content:</h4>
                <div className="text-sm bg-gray-50 p-3 rounded max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedCampaign.content}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recipients:</h4>
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {getCampaignContacts(selectedCampaign.id).map((contact) => (
                    <div key={contact.id} className="p-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-blue-600">
                            {contact.firstName ? contact.firstName[0] : contact.email[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {contact.firstName && contact.lastName
                              ? `${contact.firstName} ${contact.lastName}`
                              : contact.firstName || contact.lastName || 'No name'}
                          </div>
                          <div className="text-xs text-gray-500">{contact.email}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}