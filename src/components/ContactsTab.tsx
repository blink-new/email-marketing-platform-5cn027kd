import React, { useState, useEffect } from 'react'
import { Plus, Search, Mail, Edit2, Trash2 } from 'lucide-react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import toast from 'react-hot-toast'

interface Contact {
  id: string
  email: string
  firstName: string
  lastName: string
  userId: string
  createdAt: string
}

interface ContactsTabProps {
  user: any
}

export function ContactsTab({ user }: ContactsTabProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [newContact, setNewContact] = useState({
    email: '',
    firstName: '',
    lastName: ''
  })

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
      toast.error('Failed to load contacts')
    }
  }

  const handleAddContact = async () => {
    if (!newContact.email) {
      toast.error('Email is required')
      return
    }

    try {
      const contactData = {
        id: crypto.randomUUID(),
        email: newContact.email,
        firstName: newContact.firstName,
        lastName: newContact.lastName,
        userId: user.id,
        createdAt: new Date().toISOString()
      }

      await blink.db.contacts.create(contactData)
      setContacts([contactData, ...contacts])
      setNewContact({ email: '', firstName: '', lastName: '' })
      setIsAddingContact(false)
      toast.success('Contact added successfully!')
    } catch (error) {
      console.error('Error adding contact:', error)
      toast.error('Failed to add contact')
    }
  }

  const handleUpdateContact = async () => {
    if (!editingContact) return

    try {
      const updatedContact = {
        ...editingContact,
        updatedAt: new Date().toISOString()
      }

      await blink.db.contacts.update(editingContact.id, updatedContact)
      setContacts(contacts.map(c => c.id === editingContact.id ? updatedContact : c))
      setEditingContact(null)
      toast.success('Contact updated successfully!')
    } catch (error) {
      console.error('Error updating contact:', error)
      toast.error('Failed to update contact')
    }
  }

  const handleDeleteContact = async (id: string) => {
    try {
      await blink.db.contacts.delete(id)
      setContacts(contacts.filter(c => c.id !== id))
      toast.success('Contact deleted successfully!')
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast.error('Failed to delete contact')
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
        <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Contact</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={newContact.firstName}
                  onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={newContact.lastName}
                  onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddContact} className="flex-1">
                  Add Contact
                </Button>
                <Button variant="outline" onClick={() => setIsAddingContact(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No contacts found matching your search' : 'No contacts yet'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {!searchTerm && 'Add your first contact to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {contact.firstName ? contact.firstName[0] : contact.email[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contact.firstName && contact.lastName
                              ? `${contact.firstName} ${contact.lastName}`
                              : contact.firstName || contact.lastName || 'No name'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingContact(contact)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          {editingContact && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingContact.email}
                  onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={editingContact.firstName}
                  onChange={(e) => setEditingContact({ ...editingContact, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={editingContact.lastName}
                  onChange={(e) => setEditingContact({ ...editingContact, lastName: e.target.value })}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleUpdateContact} className="flex-1">
                  Update Contact
                </Button>
                <Button variant="outline" onClick={() => setEditingContact(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}