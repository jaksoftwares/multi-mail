import React, { useState, useRef } from 'react';
import { Send, Paperclip, Image, Bold, Italic, Link, List, AlignLeft, Save, Users, FileText } from 'lucide-react';
import { EmailData, Contact, Template, AppSettings } from '../types';
import { EmailService, replaceTemplateVariables, validateEmail } from '../utils/emailService';

interface ComposeProps {
  contacts: Contact[];
  templates: Template[];
  onSend: (email: EmailData) => void;
  settings: AppSettings;
}

const Compose: React.FC<ComposeProps> = ({ contacts, templates, onSend, settings }) => {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setSending] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [recipientInput, setRecipientInput] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const [sendingProgress, setSendingProgress] = useState<{
    isActive: boolean;
    sent: number;
    total: number;
    errors: string[];
  }>({ isActive: false, sent: 0, total: 0, errors: [] });

  const handleAddRecipient = (email: string) => {
    if (email && validateEmail(email) && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
      setRecipientInput('');
    } else if (email && !validateEmail(email)) {
      alert('Please enter a valid email address');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSelectContacts = (selectedContacts: Contact[]) => {
    const emails = selectedContacts.map(c => c.email);
    setRecipients([...new Set([...recipients, ...emails])]);
    setShowContactPicker(false);
  };

  const handleSelectTemplate = (template: Template) => {
    setSubject(template.subject);
    setContent(template.content);
    setShowTemplatePicker(false);
  };

  const handleSend = async () => {
    if (!recipients.length || !subject || !content) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate all recipients
    const invalidEmails = recipients.filter(email => !validateEmail(email));
    if (invalidEmails.length > 0) {
      alert(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    setSending(true);
    setSendingProgress({ isActive: true, sent: 0, total: recipients.length, errors: [] });
    
    try {
      const emailService = EmailService.getInstance();
      
      // Process template variables for each recipient
      const processedEmails = recipients.map(email => {
        const contact = contacts.find(c => c.email === email);
        const variables = {
          name: contact?.name || email.split('@')[0],
          email: email,
          company: contact?.company || 'your company',
          sender_name: settings.senderName || 'Team',
          sender_email: settings.senderEmail || settings.smtpUser,
          phone: '(555) 123-4567', // You could add this to settings
          // Add more variables as needed
        };
        
        return {
          email,
          subject: replaceTemplateVariables(subject, variables),
          content: replaceTemplateVariables(content, variables)
        };
      });

      // Send emails in batches
      let totalSent = 0;
      let totalErrors: string[] = [];
      
      for (let i = 0; i < processedEmails.length; i += settings.batchSize) {
        const batch = processedEmails.slice(i, i + settings.batchSize);
        
        for (const emailData of batch) {
          try {
            const result = await emailService.sendEmail(
              [emailData.email],
              emailData.subject,
              emailData.content,
              settings
            );
            
            if (result.success) {
              totalSent++;
            } else {
              totalErrors.push(`${emailData.email}: ${result.error}`);
            }
            
            setSendingProgress(prev => ({
              ...prev,
              sent: totalSent,
              errors: totalErrors
            }));
            
          } catch (error) {
            totalErrors.push(`${emailData.email}: ${error}`);
          }
        }
        
        // Delay between batches
        if (i + settings.batchSize < processedEmails.length) {
          await new Promise(resolve => setTimeout(resolve, settings.delayBetweenBatches));
        }
      }
      
      // Create email record
      const emailData: EmailData = {
        id: '',
        subject,
        content,
        recipients,
        sender: settings.senderEmail || 'user@example.com',
        timestamp: '',
        status: totalErrors.length === 0 ? 'sent' : (totalSent > 0 ? 'sent' : 'failed'),
        replies: [],
        isHtml: true
      };

      onSend(emailData);
      
      // Show results
      if (totalErrors.length > 0) {
        alert(`Sent ${totalSent}/${recipients.length} emails successfully. ${totalErrors.length} failed.`);
      } else {
        alert(`All ${totalSent} emails sent successfully!`);
      }
      
    } catch (error) {
      alert(`Error sending emails: ${error}`);
    }
    
    // Reset form
    setRecipients([]);
    setSubject('');
    setContent('');
    setSending(false);
    setSendingProgress({ isActive: false, sent: 0, total: 0, errors: [] });
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Compose Email</h1>
        <p className="text-gray-600 mt-2">Create and send professional emails to your contacts</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          {/* Recipients */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Recipients</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowContactPicker(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Users className="w-4 h-4" />
                  <span>Select Contacts</span>
                </button>
                <button
                  onClick={() => setShowTemplatePicker(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <FileText className="w-4 h-4" />
                  <span>Use Template</span>
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {recipients.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {email}
                  <button
                    onClick={() => handleRemoveRecipient(email)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="email"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRecipient(recipientInput);
                  }
                }}
              />
              <button
                onClick={() => handleAddRecipient(recipientInput)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="border-b border-gray-200">
          <div className="flex items-center space-x-2 p-4 bg-gray-50">
            <button
              onClick={() => formatText('bold')}
              className="p-2 rounded hover:bg-gray-200"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 rounded hover:bg-gray-200"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 rounded hover:bg-gray-200"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('justifyLeft')}
              className="p-2 rounded hover:bg-gray-200"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <div className="border-l border-gray-300 h-6"></div>
            <button className="p-2 rounded hover:bg-gray-200">
              <Link className="w-4 h-4" />
            </button>
            <button className="p-2 rounded hover:bg-gray-200">
              <Image className="w-4 h-4" />
            </button>
            <button className="p-2 rounded hover:bg-gray-200">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div
            ref={contentRef}
            contentEditable
            onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
            className="min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            style={{ whiteSpace: 'pre-wrap' }}
            placeholder="Write your email content here..."
          />
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px]"
            >
              <Send className="w-4 h-4" />
              <span>
                {sendingProgress.isActive 
                  ? `Sending ${sendingProgress.sent}/${sendingProgress.total}` 
                  : isLoading 
                    ? 'Preparing...' 
                    : 'Send Email'
                }
              </span>
            </button>
          </div>
        </div>
        
        {/* Sending Progress */}
        {sendingProgress.isActive && (
          <div className="p-4 bg-blue-50 border-t border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Sending Progress</span>
              <span className="text-sm text-blue-700">
                {sendingProgress.sent} of {sendingProgress.total} sent
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(sendingProgress.sent / sendingProgress.total) * 100}%` }}
              ></div>
            </div>
            {sendingProgress.errors.length > 0 && (
              <div className="mt-2 text-sm text-red-600">
                {sendingProgress.errors.length} errors occurred
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Picker Modal */}
      {showContactPicker && (
        <ContactPickerModal
          contacts={contacts}
          onSelect={handleSelectContacts}
          onClose={() => setShowContactPicker(false)}
        />
      )}

      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <TemplatePickerModal
          templates={templates}
          onSelect={handleSelectTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
};

// Contact Picker Modal Component
const ContactPickerModal: React.FC<{
  contacts: Contact[];
  onSelect: (contacts: Contact[]) => void;
  onClose: () => void;
}> = ({ contacts, onSelect, onClose }) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  const handleToggleContact = (contact: Contact) => {
    setSelectedContacts(prev => 
      prev.some(c => c.id === contact.id)
        ? prev.filter(c => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Select Contacts</h2>
        <div className="space-y-2 mb-6">
          {contacts.map((contact) => (
            <label key={contact.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={selectedContacts.some(c => c.id === contact.id)}
                onChange={() => handleToggleContact(contact)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-gray-500">{contact.email}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => onSelect(selectedContacts)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Select ({selectedContacts.length})
          </button>
        </div>
      </div>
    </div>
  );
};

// Template Picker Modal Component
const TemplatePickerModal: React.FC<{
  templates: Template[];
  onSelect: (template: Template) => void;
  onClose: () => void;
}> = ({ templates, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Select Template</h2>
        <div className="space-y-3 mb-6">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Compose;