import { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  Send, 
  Settings, 
  FileText,
  Plus,
  
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Compose from './components/Compose';
import Contacts from './components/Contacts';
import Templates from './components/Templates';
import SentEmails from './components/SentEmails';
import SettingsPanel from './components/SettingsPanel';
import { EmailData, Contact, Template, AppSettings } from './types';
import { loadFromStorage, saveToStorage } from './utils/storage';
import { getDefaultContacts } from './constants/contacts';
import { getDefaultTemplates } from './constants/templates';



function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    senderName: '',
    senderEmail: '',
    replyToEmail: '',
    enableSSL: true,
    enableTracking: true,
    batchSize: 50,
    delayBetweenBatches: 5000
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedEmails = loadFromStorage('dmm-emails', []);
    const savedContacts = loadFromStorage('dmm-contacts', []);
    const savedTemplates = loadFromStorage('dmm-templates', []);
    const savedSettings = loadFromStorage('dmm-settings', settings);
    
    // Initialize with sample data if empty
    setEmails(savedEmails);
    setContacts(savedContacts.length > 0 ? savedContacts : getDefaultContacts());
    setTemplates(savedTemplates.length > 0 ? savedTemplates : getDefaultTemplates());
    setSettings(savedSettings);
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    saveToStorage('dmm-emails', emails);
  }, [emails]);

  useEffect(() => {
    saveToStorage('dmm-contacts', contacts);
  }, [contacts]);

  useEffect(() => {
    saveToStorage('dmm-templates', templates);
  }, [templates]);

  useEffect(() => {
    saveToStorage('dmm-settings', settings);
  }, [settings]);

  const handleSendEmail = (emailData: EmailData) => {
    const newEmail = {
      ...emailData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'sent' as const,
      replies: []
    };
    setEmails(prev => [newEmail, ...prev]);
  };

  const handleAddContact = (contact: Omit<Contact, 'id'>) => {
    const newContact = {
      ...contact,
      id: Date.now().toString()
    };
    setContacts(prev => [...prev, newContact]);
  };

  const handleUpdateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    ));
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const handleSaveTemplate = (template: Omit<Template, 'id'>) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString()
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleUpdateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ));
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Mail },
    { id: 'compose', label: 'Compose', icon: Plus },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'sent', label: 'Sent Emails', icon: Send },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard emails={emails} contacts={contacts} templates={templates} />;
      case 'compose':
        return (
          <Compose 
            contacts={contacts} 
            templates={templates} 
            onSend={handleSendEmail}
            settings={settings}
          />
        );
      case 'contacts':
        return (
          <Contacts 
            contacts={contacts}
            onAdd={handleAddContact}
            onUpdate={handleUpdateContact}
            onDelete={handleDeleteContact}
          />
        );
      case 'templates':
        return (
          <Templates 
            templates={templates}
            onSave={handleSaveTemplate}
            onUpdate={handleUpdateTemplate}
            onDelete={handleDeleteTemplate}
          />
        );
      case 'sent':
        return <SentEmails emails={emails} />;
      case 'settings':
        return (
          <SettingsPanel 
            settings={settings}
            onUpdate={setSettings}
          />
        );
      default:
        return <Dashboard emails={emails} contacts={contacts} templates={templates} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dovepeak</h1>
              <p className="text-sm text-gray-500">Multi-Mail</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;