// src/pages/ClientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usdToRwf } from '../utils/currency';
import { 
  CheckCircle, Clock, XCircle, Eye, Calendar,
  MessageCircle, Mail, Phone, ChevronRight,
  FileText, DollarSign, User, Briefcase, TrendingUp,
  Search, AlertCircle, RefreshCw, Download, Send
} from 'lucide-react';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mentorship');
  const [searchEmail, setSearchEmail] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const searchApplications = async () => {
    if (!searchEmail) {
      alert('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setSearched(true);
    
    try {
      // Search mentorship applications
      const { data: mentorshipData, error: mentorshipError } = await supabase
        .from('mentorship_applications')
        .select('*')
        .eq('email', searchEmail)
        .order('submitted_at', { ascending: false });
      
      if (mentorshipError) throw mentorshipError;
      
      // Search project inquiries
      const { data: projectData, error: projectError } = await supabase
        .from('project_inquiries')
        .select('*')
        .eq('email', searchEmail)
        .order('created_at', { ascending: false });
      
      if (projectError) throw projectError;
      
      setApplications(mentorshipData || []);
      setInquiries(projectData || []);
      
    } catch (error) {
      console.error('Error searching:', error);
      alert('Error searching applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status, paymentStatus) => {
    if (paymentStatus === 'verified') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (paymentStatus === 'awaiting_verification') return <Clock className="w-5 h-5 text-yellow-500" />;
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'rejected') return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-blue-500" />;
  };

  const getStatusText = (app) => {
    if (app.payment_status === 'verified') return 'Payment Verified - Ready to Start';
    if (app.payment_status === 'awaiting_verification') return 'Awaiting Payment Verification';
    if (app.payment_status === 'pending_payment') return 'Payment Pending';
    if (app.status === 'completed') return 'Completed';
    if (app.status === 'in_progress') return 'In Progress';
    if (app.status === 'contacted') return 'Contacted - Session Scheduling';
    if (app.status === 'rejected') return 'Application Rejected';
    return 'Application Received';
  };

  const getProgressSteps = (app) => {
    const steps = [
      { name: 'Application Submitted', key: 'submitted', completed: true },
      { name: 'Payment Verification', key: 'payment', completed: app.payment_status === 'verified' },
      { name: 'Session Scheduling', key: 'contacted', completed: app.status === 'contacted' || app.status === 'in_progress' },
      { name: 'Mentorship Complete', key: 'completed', completed: app.status === 'completed' },
    ];
    
    let currentStep = 0;
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].completed) break;
      currentStep = i + 1;
    }
    
    return { steps, currentStep };
  };

  const copyReference = (ref) => {
    navigator.clipboard.writeText(ref);
    alert('Reference code copied!');
  };

  if (!searched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Track Your Application</h1>
            <p className="text-gray-600 mb-6">
              Enter your email address to check the status of your mentorship application or project inquiry.
            </p>
            
            <div className="space-y-4">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && searchApplications()}
              />
              
              <button
                onClick={searchApplications}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Track My Application
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500">
                Don't have an application yet? 
                <button
                  onClick={() => navigate('/services')}
                  className="text-blue-600 ml-1 hover:underline"
                >
                  Apply for Mentorship
                </button>
                {' '}or{' '}
                <button
                  onClick={() => navigate('/hire')}
                  className="text-blue-600 hover:underline"
                >
                  Hire for a Project
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setSearched(false)}
            className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-1"
          >
            ← New Search
          </button>
          <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
          <p className="text-gray-600">Email: {searchEmail}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('mentorship')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'mentorship'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Mentorship ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'projects'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Project Inquiries ({inquiries.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'mentorship' && applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No mentorship applications found for this email</p>
            <button
              onClick={() => navigate('/services')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Apply for Mentorship →
            </button>
          </div>
        ) : activeTab === 'projects' && inquiries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No project inquiries found for this email</p>
            <button
              onClick={() => navigate('/hire')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Hire for a Project →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mentorship Applications */}
            {activeTab === 'mentorship' && applications.map((app) => {
              const { steps, currentStep } = getProgressSteps(app);
              
              return (
                <div key={app.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h2 className="text-xl font-semibold">{app.service_title || 'Mentorship Application'}</h2>
                        <p className="text-blue-100 text-sm mt-1">Applied on {new Date(app.submitted_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                        {getStatusIcon(app.status, app.payment_status)}
                        <span className="text-sm">{getStatusText(app)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Reference Code */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="text-xs text-gray-500">Reference Code</span>
                        <code className="block font-mono text-sm font-semibold">{app.application_id}</code>
                      </div>
                      <button
                        onClick={() => copyReference(app.application_id)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Copy
                      </button>
                    </div>

                    {/* Progress Tracker */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-4">Application Progress</h3>
                      <div className="relative">
                        <div className="flex justify-between mb-2">
                          {steps.map((step, idx) => (
                            <div key={idx} className="text-center flex-1">
                              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                                step.completed 
                                  ? 'bg-green-500 text-white' 
                                  : idx < currentStep 
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-400'
                              }`}>
                                {step.completed || idx < currentStep ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  <span className="text-sm">{idx + 1}</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600">{step.name}</p>
                            </div>
                          ))}
                        </div>
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                          <div 
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${(currentStep / steps.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm font-medium">Payment Details</span>
                        </div>
                        <p className="text-sm">Amount: <strong>${app.payment_amount} ({usdToRwf(app.payment_amount).toLocaleString()} RWF)</strong></p>
                        <p className="text-sm">Method: <strong>{app.selected_payment_method?.toUpperCase()}</strong></p>
                        <p className="text-sm">Status: <strong className={
                          app.payment_status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                        }>{app.payment_status}</strong></p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">Your Information</span>
                        </div>
                        <p className="text-sm">{app.full_name}</p>
                        <p className="text-sm">{app.email}</p>
                        <p className="text-sm">{app.phone}</p>
                      </div>
                    </div>

                    {/* Goals */}
                    {app.goals && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Your Goals:</strong> {app.goals}
                        </p>
                      </div>
                    )}

                    {/* What's Next */}
                    {app.payment_status === 'verified' && app.status !== 'completed' && (
                      <div className="bg-green-50 rounded-lg p-3 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-800">Payment Verified!</p>
                          <p className="text-sm text-green-700 mt-1">
                            I will contact you within 24 hours to schedule your first session. 
                            If you haven't heard from me, please reach out via WhatsApp or email.
                          </p>
                        </div>
                      </div>
                    )}

                    {app.payment_status === 'awaiting_verification' && (
                      <div className="bg-yellow-50 rounded-lg p-3 flex items-start gap-3">
                        <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-800">Awaiting Verification</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Your payment is being verified. This usually takes less than 24 hours.
                            You'll receive an email once verified.
                          </p>
                        </div>
                      </div>
                    )}

                    {app.payment_status === 'pending_payment' && (
                      <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-800">Complete Your Payment</p>
                          <p className="text-sm text-blue-700 mt-1">
                            Use reference code <strong>{app.application_id}</strong> to complete your payment.
                          </p>
                          <button
                            onClick={() => navigate(`/apply/mentorship?service=${app.service_id}`)}
                            className="mt-2 text-sm text-blue-600 font-semibold hover:underline"
                          >
                            Complete Payment →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Contact Support */}
                    <div className="border-t pt-4 mt-4 flex flex-wrap gap-3">
                      <a
                        href="mailto:generaskagiraneza@gmail.com"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <Mail className="w-4 h-4" />
                        Email Support
                      </a>
                      <a
                        href="https://wa.me/250788123456"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Project Inquiries */}
            {activeTab === 'projects' && inquiries.map((inquiry) => (
              <div key={inquiry.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h2 className="text-xl font-semibold capitalize">{inquiry.project_type} Project</h2>
                      <p className="text-purple-100 text-sm mt-1">Submitted on {new Date(inquiry.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                      {inquiry.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : inquiry.status === 'in_progress' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                      <span className="text-sm capitalize">{inquiry.status}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-gray-800 mb-2">{inquiry.project_name || 'Project'}</h3>
                  <p className="text-gray-600 text-sm mb-3">{inquiry.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600 font-medium">Budget Range</p>
                      <p className="text-sm font-semibold text-gray-900">{inquiry.budget_range}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600 font-medium">Timeline</p>
                      <p className="text-sm font-semibold text-gray-900">{inquiry.timeline}</p>
                    </div>
                  </div>

                  {inquiry.requirements && inquiry.requirements.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {inquiry.requirements.map((req, i) => (
                          <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      <strong>Inquiry ID:</strong> {inquiry.inquiry_id}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Status:</strong> {
                        inquiry.status === 'new' ? 'I will review and respond within 24 hours' :
                        inquiry.status === 'quoted' ? 'Quote has been sent to your email' :
                        inquiry.status === 'in_progress' ? 'Project is in development' :
                        inquiry.status === 'completed' ? 'Project completed!' :
                        'Application received'
                      }
                    </p>
                  </div>

                  <div className="border-t pt-4 mt-3 flex gap-3">
                    <a
                      href="mailto:generaskagiraneza@gmail.com"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Mail className="w-4 h-4" />
                      Email Support
                    </a>
                    <a
                      href="https://wa.me/250788123456"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;