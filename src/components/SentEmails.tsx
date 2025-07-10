import React, { useState } from 'react';
import { Search, Filter, Mail, Calendar, Users, Eye, Reply, Trash2 } from 'lucide-react';
import { EmailData } from '../types';
import { EmailService, EmailResponse } from '../utils/emailService';

interface SentEmailsProps {
  emails: EmailData[];
}

const SentEmails: React.FC<SentEmailsProps> = ({ emails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
  const [responses, setResponses] = useState<EmailResponse[]>([]);

  // Load responses when component mounts
  React.useEffect(() => {
    const emailService = EmailService.getInstance();
    setResponses(emailService.getResponses());

    // Listen for new responses
    const handleNewResponse = (event: CustomEvent) => {
      setResponses(prev => [...prev, event.detail]);
    };

    window.addEventListener('newEmailResponse', handleNewResponse as EventListener);
    
    return () => {
      window.removeEventListener('newEmailResponse', handleNewResponse as EventListener);
    };
  }, []);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipients.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || email.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return '✓';
      case 'pending': return '⏳';
      case 'failed': return '✗';
      default: return '?';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sent Emails</h1>
          <p className="text-gray-600 mt-2">Track and manage your sent email campaigns</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Emails List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredEmails.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter ? 'Try adjusting your search or filter' : 'Your sent emails will appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEmails.map((email) => (
              <div key={email.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{email.subject}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                        {getStatusIcon(email.status)} {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{email.recipients.length} recipients</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(email.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>From: {email.sender}</span>
                      </div>
                    </div>

                    {(email.replies.length > 0 || getEmailResponses(email.id).length > 0) && (
                      <div className="flex items-center space-x-1 text-sm text-blue-600">
                        <Reply className="w-4 h-4" />
                        <span>{email.replies.length + getEmailResponses(email.id).length} responses</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedEmail(email)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <EmailDetailModal
          email={selectedEmail}
          responses={getEmailResponses(selectedEmail.id)}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  );

  function getEmailResponses(emailId: string): EmailResponse[] {
    return responses.filter(response => response.emailId === emailId);
  }
};

// Email Detail Modal Component
const EmailDetailModal: React.FC<{
  email: EmailData;
  responses: EmailResponse[];
  onClose: () => void;
}> = ({ email, responses, onClose }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'responses'>('content');

  const handleMarkAsRead = (responseId: string) => {
    const emailService = EmailService.getInstance();
    emailService.markResponseAsRead(responseId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Email Details</h2>
          <div className="flex items-center space-x-4">
            {responses.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    activeTab === 'content' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Content
                </button>
                <button
                  onClick={() => setActiveTab('responses')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    activeTab === 'responses' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Responses ({responses.length})
                </button>
              </div>
            )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {activeTab === 'content' && (
          <div className="space-y-6">
          {/* Email Header */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{email.subject}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">From:</span>
                <span className="ml-2 text-gray-600">{email.sender}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Sent:</span>
                <span className="ml-2 text-gray-600">{new Date(email.timestamp).toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                  {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Recipients:</span>
                <span className="ml-2 text-gray-600">{email.recipients.length}</span>
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Recipients</h4>
            <div className="max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {email.recipients.map((recipient, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    {recipient}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Email Content */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Content</h4>
            <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              {email.isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: email.content }} />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{email.content}</pre>
              )}
            </div>
          </div>
          </div>
        )}

        {activeTab === 'responses' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Email Responses</h3>
            {responses.length === 0 ? (
              <div className="text-center py-8">
                <Reply className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No responses yet</p>
                <p className="text-sm text-gray-400">Responses will appear here when recipients reply</p>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((response) => (
                  <div 
                    key={response.id} 
                    className={`border rounded-lg p-4 ${
                      response.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{response.sender}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          response.responseType === 'reply' ? 'bg-green-100 text-green-800' :
                          response.responseType === 'bounce' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {response.responseType.replace('_', ' ')}
                        </span>
                        {!response.isRead && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {new Date(response.timestamp).toLocaleString()}
                        </span>
                        {!response.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(response.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-800 mb-2">{response.subject}</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{response.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
          {/* Replies */}
          {email.replies.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Replies ({email.replies.length})</h4>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {email.replies.map((reply) => (
                  <div key={reply.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{reply.sender}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(reply.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{reply.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentEmails;