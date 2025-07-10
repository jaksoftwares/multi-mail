import React, { useState } from 'react';
import { Save, TestTube, Shield, Globe, Clock, Users, Mail } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('smtp');
  const [formData, setFormData] = useState(settings);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = () => {
    onUpdate(formData);
    alert('Settings saved successfully!');
  };

  const handleTestConnection = async () => {
    setTestResult(null);
    // Simulate testing connection
    setTimeout(() => {
      if (formData.smtpHost && formData.smtpUser && formData.smtpPassword) {
        setTestResult({ success: true, message: 'Connection successful!' });
      } else {
        setTestResult({ success: false, message: 'Please fill in all required fields' });
      }
    }, 1000);
  };

  const tabs = [
    { id: 'smtp', label: 'SMTP Settings', icon: Mail },
    { id: 'sender', label: 'Sender Info', icon: Users },
    { id: 'delivery', label: 'Delivery', icon: Clock },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your email settings and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'smtp' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host *</label>
                    <input
                      type="text"
                      value={formData.smtpHost}
                      onChange={(e) => setFormData({...formData, smtpHost: e.target.value})}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port *</label>
                    <input
                      type="number"
                      value={formData.smtpPort}
                      onChange={(e) => setFormData({...formData, smtpPort: parseInt(e.target.value)})}
                      placeholder="587"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                    <input
                      type="text"
                      value={formData.smtpUser}
                      onChange={(e) => setFormData({...formData, smtpUser: e.target.value})}
                      placeholder="your-email@gmail.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <input
                      type="password"
                      value={formData.smtpPassword}
                      onChange={(e) => setFormData({...formData, smtpPassword: e.target.value})}
                      placeholder="your-app-password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.enableSSL}
                      onChange={(e) => setFormData({...formData, enableSSL: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable SSL/TLS</span>
                  </label>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleTestConnection}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <TestTube className="w-4 h-4" />
                    <span>Test Connection</span>
                  </button>
                  {testResult && (
                    <div className={`px-4 py-2 rounded-lg text-sm ${
                      testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {testResult.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sender' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sender Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sender Name</label>
                    <input
                      type="text"
                      value={formData.senderName}
                      onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                      placeholder="Your Name or Company"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sender Email</label>
                    <input
                      type="email"
                      value={formData.senderEmail}
                      onChange={(e) => setFormData({...formData, senderEmail: e.target.value})}
                      placeholder="noreply@yourcompany.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reply-To Email</label>
                    <input
                      type="email"
                      value={formData.replyToEmail}
                      onChange={(e) => setFormData({...formData, replyToEmail: e.target.value})}
                      placeholder="support@yourcompany.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch Size</label>
                    <input
                      type="number"
                      value={formData.batchSize}
                      onChange={(e) => setFormData({...formData, batchSize: parseInt(e.target.value)})}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of emails to send at once</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delay Between Batches (ms)</label>
                    <input
                      type="number"
                      value={formData.delayBetweenBatches}
                      onChange={(e) => setFormData({...formData, delayBetweenBatches: parseInt(e.target.value)})}
                      min="1000"
                      step="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Delay between batches to avoid rate limiting</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security & Privacy</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.enableTracking}
                      onChange={(e) => setFormData({...formData, enableTracking: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable email tracking</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6">Track email opens and clicks</p>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Security Notice</h4>
                  <p className="text-sm text-yellow-700">
                    This application stores all data locally in your browser. Make sure to backup your settings and data regularly.
                    For production use, consider using environment variables for sensitive information like passwords.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;