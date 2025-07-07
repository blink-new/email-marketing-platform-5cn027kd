import React, { useState, useEffect } from 'react'
import { Send, Save, Users, Eye } from 'lucide-react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Checkbox } from './ui/checkbox'
import toast from 'react-hot-toast'

interface Contact {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface EmailComposerProps {
  user: any
}

export function EmailComposer({ user }: EmailComposerProps) {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectContactsOpen, setSelectContactsOpen] = useState(false)

  useEffect(() => {
    fetchContacts()
  }, [user.id])

  const fetchContacts = async () => {
    try {
      const result = await blink.db.contacts.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setContacts(result)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

  const handleSaveTemplate = async () => {
    if (!subject || !content) {
      toast.error('Subject and content are required')
      return
    }

    try {
      const templateData = {
        id: crypto.randomUUID(),
        subject,
        content,
        userId: user.id,
        createdAt: new Date().toISOString()
      }

      await blink.db.emailTemplates.create(templateData)
      toast.success('Email template saved successfully!')
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    }
  }

  const handleSendEmail = async () => {
    if (!subject || !content) {
      toast.error('Subject and content are required')
      return
    }

    if (selectedContacts.size === 0) {
      toast.error('Please select at least one contact')
      return
    }

    setIsSending(true)
    
    try {
      // Create campaign
      const campaignData = {
        id: crypto.randomUUID(),
        name: `Campaign - ${subject}`,
        subject,
        content,
        userId: user.id,
        status: 'sent',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      await blink.db.campaigns.create(campaignData)

      // Create campaign recipients
      const recipientPromises = Array.from(selectedContacts).map(contactId => {
        const recipientData = {
          id: crypto.randomUUID(),
          campaignId: campaignData.id,
          contactId,
          userId: user.id,
          sentAt: new Date().toISOString()
        }
        return blink.db.campaignRecipients.create(recipientData)
      })

      await Promise.all(recipientPromises)

      // Simulate sending emails (in a real app, you would use Blink's email service)
      const selectedContactsList = contacts.filter(c => selectedContacts.has(c.id))
      
      // Send emails using Blink's notification service
      for (const contact of selectedContactsList) {
        try {
          await blink.notifications.email({
            to: contact.email,
            subject: subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">${subject}</h2>
                <div style="white-space: pre-wrap; line-height: 1.6;">${content}</div>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                  This email was sent from EmailPro. 
                  ${contact.firstName ? `Hi ${contact.firstName}!` : 'Hello!'}
                </p>
              </div>
            `,
            text: content
          })
        } catch (emailError) {
          console.error(`Failed to send email to ${contact.email}:`, emailError)
        }
      }

      toast.success(`Email campaign sent to ${selectedContacts.size} contacts!`)
      
      // Reset form
      setSubject('')
      setContent('')
      setSelectedContacts(new Set())
      
    } catch (error) {
      console.error('Error sending emails:', error)
      toast.error('Failed to send emails')
    } finally {
      setIsSending(false)
    }
  }

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts)
    if (checked) {
      newSelected.add(contactId)
    } else {
      newSelected.delete(contactId)
    }
    setSelectedContacts(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(contacts.map(c => c.id)))
    } else {
      setSelectedContacts(new Set())
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Compose Email</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Email Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    placeholder="Enter your email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your email content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleSaveTemplate} variant="outline" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                  
                  <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Email Preview</DialogTitle>
                      </DialogHeader>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="bg-white rounded p-4 shadow-sm">
                          <h3 className="font-semibold text-lg mb-4">{subject || 'No Subject'}</h3>
                          <div className="whitespace-pre-wrap text-gray-700">
                            {content || 'No content'}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recipients</span>
                  <span className="text-sm font-normal text-gray-500">
                    {selectedContacts.size} selected
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Dialog open={selectContactsOpen} onOpenChange={setSelectContactsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Select Contacts
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Select Recipients</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {contacts.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            No contacts available. Add some contacts first.
                          </p>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2 border-b pb-2">
                              <Checkbox
                                id="select-all"
                                checked={selectedContacts.size === contacts.length}
                                onCheckedChange={handleSelectAll}
                              />
                              <Label htmlFor="select-all" className="font-medium">
                                Select All ({contacts.length})
                              </Label>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                              {contacts.map((contact) => (
                                <div key={contact.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={contact.id}
                                    checked={selectedContacts.has(contact.id)}
                                    onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                                  />
                                  <Label htmlFor={contact.id} className="flex-1 cursor-pointer">
                                    <div className="text-sm">
                                      {contact.firstName && contact.lastName
                                        ? `${contact.firstName} ${contact.lastName}`
                                        : contact.firstName || contact.lastName || 'No name'}
                                    </div>
                                    <div className="text-xs text-gray-500">{contact.email}</div>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {selectedContacts.size > 0 && (
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">Selected Contacts:</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {contacts
                          .filter(c => selectedContacts.has(c.id))
                          .map(contact => (
                            <div key={contact.id} className="text-xs text-gray-600">
                              {contact.firstName && contact.lastName
                                ? `${contact.firstName} ${contact.lastName}`
                                : contact.firstName || contact.lastName || 'No name'} 
                              - {contact.email}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleSendEmail}
                    disabled={isSending || !subject || !content || selectedContacts.size === 0}
                    className="w-full"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}