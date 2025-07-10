import React from 'react';
import { Mail, Users, FileText, Send, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { EmailData, Contact, Template } from '../types';
import { EmailService } from '../utils/emailService';

interface DashboardProps {
  emails: EmailData[];
  contacts: Contact[];
  templates: Template[];
}

const Dashboard: React.FC<DashboardProps> = ({ emails, contacts, templates }) => {
  const [responses, setResponses] = React.useState(0);
  
  React.useEffect(() => {
    const emailService = EmailService.getInstance();
    setResponses(emailService.getResponses().length);
    
    const handleNewResponse = () => setResponses(emailService.getResponses().length);
    window.addEventListener('newEmailResponse', handleNewResponse);
    return () => window.removeEventListener('newEmailResponse', handleNewResponse);
  }, []);

  const totalEmails = emails.length;
  const totalContacts = contacts.length;
  const totalTemplates = templates.length;
  const recentEmails = emails.slice(0, 5);
  const activeContacts = contacts.filter(c => c.isActive).length;

  const stats = [
    {
      label: 'Total Emails Sent',
      value: totalEmails,
      icon: Send,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      label: 'Active Contacts',
      value: activeContacts,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      label: 'Email Templates',
      value: totalTemplates,
      icon: FileText,
      color: 'bg-purple-500',
      change: '+3%'
    },
    {
      label: 'Success Rate',
      value: responses > 0 ? `${Math.round((responses / totalEmails) * 100)}%` : '98.5%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: responses > 0 ? `${responses} responses` : '+2.1%'
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your email campaigns.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Emails */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Emails</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all
              </button>
            </div>
            {recentEmails.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No emails sent yet</p>
                <p className="text-sm text-gray-400">Your recent emails will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEmails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        email.status === 'sent' ? 'bg-green-100' : 
                        email.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {email.status === 'sent' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : email.status === 'failed' ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{email.subject}</p>
                        <p className="text-sm text-gray-500">{email.recipients.length} recipients</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(email.timestamp).toLocaleDateString()}
                      </p>
                      <p className={`text-sm font-medium ${
                        email.status === 'sent' ? 'text-green-600' : 
                        email.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Compose Email</span>
              </button>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Add Contacts</span>
              </button>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Create Template</span>
              </button>
            </div>
          </div>

          {/* Contact Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Contacts</span>
                <span className="font-medium">{totalContacts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Contacts</span>
                <span className="font-medium text-green-600">{activeContacts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inactive Contacts</span>
                <span className="font-medium text-gray-500">{totalContacts - activeContacts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;