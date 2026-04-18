// src/components/admin/MentorshipManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { sendPaymentVerifiedEmail } from '../../utils/emailService';
import { 
  Users, CheckCircle, XCircle, Clock, Eye, 
  Download, Search, Filter, Calendar, MessageCircle,
  DollarSign, Phone, Mail, AlertCircle, RefreshCw,
  ChevronDown, ChevronUp, ExternalLink, Image
} from 'lucide-react';

const MentorshipManager = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, verified, new
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('all'); // all, trading, development, business, blog
  const [verificationData, setVerificationData] = useState({
    reference_number: '',
    amount: '',
    sender_phone: '',
    notes: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    new: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Fetch from all service-specific tables
      const tables = [
        { name: 'trading_applications', service: 'Trading' },
        { name: 'dev_applications', service: 'Development' },
        { name: 'business_applications', service: 'Business' },
        { name: 'blog_applications', service: 'Blog' },
        { name: 'mentorship_applications', service: 'Mentorship' }
      ];

      const allApps = [];
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .order('submitted_at', { ascending: false });

        if (error) {
          console.error(`Error fetching from ${table.name}:`, error);
          continue;
        }

        // Add service type and table source to each application
        if (data) {
          const appsWithMetadata = data.map(app => ({
            ...app,
            service_type: table.service,
            table_source: table.name
          }));
          allApps.push(...appsWithMetadata);
        }
      }

      // Sort all applications by submitted_at
      allApps.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      
      setApplications(allApps);
      calculateStats(allApps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps) => {
    const newApps = apps.filter(a => a.status === 'new').length;
    const pendingPayment = apps.filter(a => a.payment_status === 'pending_payment').length;
    const pendingVerification = apps.filter(a => a.payment_status === 'awaiting_verification').length;
    const verified = apps.filter(a => a.payment_status === 'verified').length;
    const completed = apps.filter(a => a.status === 'completed').length;
    const totalRevenue = apps.reduce((sum, a) => sum + (a.payment_amount || 0), 0);

    setStats({
      total: apps.length,
      new: newApps,
      pending: pendingPayment + pendingVerification,
      verified: verified,
      completed: completed,
      totalRevenue: totalRevenue
    });
  };

  const updateApplicationStatus = async (id, tableSource, status, paymentStatus = null) => {
    try {
      const updateData = {
        status: status,
        ...(paymentStatus && { payment_status: paymentStatus }),
        ...(paymentStatus === 'verified' && { payment_verified_at: new Date().toISOString() })
      };

      const { error } = await supabase
        .from(tableSource)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      // Log verification
      if (paymentStatus === 'verified') {
        await supabase
          .from('payment_verifications')
          .insert({
            application_type: selectedApp?.service_type?.toLowerCase() || 'mentorship',
            application_id: id,
            reference_number: verificationData.reference_number,
            amount: verificationData.amount,
            sender_phone: verificationData.sender_phone,
            notes: verificationData.notes,
            verified_at: new Date().toISOString()
          });
      }

      fetchApplications();
      setShowVerificationModal(false);
      setVerificationData({ reference_number: '', amount: '', sender_phone: '', notes: '' });
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const verifyPayment = async (app) => {
    setSelectedApp(app);
    setSelectedTable(app.table_source);
    setVerificationData({
      reference_number: app.payment_reference || '',
      amount: app.payment_amount?.toString() || '',
      sender_phone: '',
      notes: ''
    });
    setShowVerificationModal(true);
  };

  const confirmVerification = async () => {
    if (!selectedApp || !selectedTable) return;
    
    setVerifyingId(selectedApp.id);
    await updateApplicationStatus(selectedApp.id, selectedTable, 'in_review', 'verified');
    setVerifyingId(null);
    
    // Send payment verified email to user
    await sendPaymentVerifiedEmail({
      email: selectedApp.email,
      full_name: selectedApp.full_name,
      service_title: selectedApp.service_type + ' Mentorship',
      amount: selectedApp.payment_amount,
      reference_code: selectedApp.application_id
    });
  };

  const rejectPayment = async (app) => {
    if (window.confirm('Are you sure you want to reject this payment?')) {
      await updateApplicationStatus(app.id, app.table_source, 'rejected', 'failed');
    }
  };

  const markAsContacted = async (app) => {
    await updateApplicationStatus(app.id, app.table_source, 'contacted');
  };

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === 'verified') return 'bg-green-100 text-green-800';
    if (paymentStatus === 'awaiting_verification') return 'bg-yellow-100 text-yellow-800';
    if (paymentStatus === 'pending_payment') return 'bg-gray-100 text-gray-800';
    if (status === 'new') return 'bg-blue-100 text-blue-800';
    if (status === 'contacted') return 'bg-purple-100 text-purple-800';
    if (status === 'in_progress') return 'bg-indigo-100 text-indigo-800';
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (app) => {
    if (app.payment_status === 'verified') return 'Payment Verified';
    if (app.payment_status === 'awaiting_verification') return 'Awaiting Verification';
    if (app.payment_status === 'pending_payment') return 'Payment Pending';
    if (app.status === 'new') return 'New Application';
    if (app.status === 'contacted') return 'Contacted';
    if (app.status === 'in_progress') return 'In Progress';
    if (app.status === 'completed') return 'Completed';
    if (app.status === 'rejected') return 'Rejected';
    return app.status;
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'pending') {
      return app.payment_status === 'awaiting_verification' || app.payment_status === 'pending_payment';
    }
    if (filter === 'verified') return app.payment_status === 'verified';
    if (filter === 'new') return app.status === 'new';
    if (filter === 'completed') return app.status === 'completed' || app.payment_status === 'verified';
    if (filter === 'all') return true;
    return true;
  }).filter(app => 
    app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.application_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mentorship Manager</h1>
        <p className="text-gray-600 mt-1">Manage applications, verify payments, and track progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Verification</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">New</p>
              <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-teal-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'new', 'pending', 'verified', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  filter === f 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={fetchApplications}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No applications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              {/* Application Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{app.full_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status, app.payment_status)}`}>
                        {getStatusText(app)}
                      </span>
                      {app.payment_status === 'verified' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Payment Verified
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {app.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {app.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${app.payment_amount} - {app.service_title}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(app.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {app.payment_status === 'awaiting_verification' && (
                      <>
                        <button
                          onClick={() => verifyPayment(app)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Verify Payment
                        </button>
                        <button
                          onClick={() => rejectPayment(app)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {app.status === 'new' && app.payment_status === 'verified' && (
                      <button
                        onClick={() => markAsContacted(app)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Mark as Contacted
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {selectedApp?.id === app.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedApp?.id === app.id && (
                <div className="p-5 bg-gray-50 border-b border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Info */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        User Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-900"><span className="text-gray-600 font-medium">Country:</span> {app.country || 'Not specified'}</p>
                        <p className="text-gray-900"><span className="text-gray-600 font-medium">How heard:</span> {app.how_heard || 'Not specified'}</p>
                        <p className="text-gray-900"><span className="text-gray-600 font-medium">Skill level:</span> {app.skill_level || 'Not specified'}</p>
                        <p className="text-gray-900"><span className="text-gray-600 font-medium">Weekly hours:</span> {app.weekly_hours || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Goals */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Goals & Interests</h4>
                      <div className="space-y-2 text-sm">
                        {app.trading_goals && app.trading_goals.length > 0 && (
                          <div>
                            <p className="text-gray-600 font-medium">Trading Goals:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {app.trading_goals.map((goal, i) => (
                                <span key={i} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  {goal}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {app.interested_markets && app.interested_markets.length > 0 && (
                          <div>
                            <p className="text-gray-600 font-medium">Interested Markets:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {app.interested_markets.map((market, i) => (
                                <span key={i} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  {market}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {app.goals && (
                          <div>
                            <p className="text-gray-600 font-medium">Additional Goals:</p>
                            <p className="mt-1 text-gray-900">{app.goals}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Payment Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-900"><span className="text-gray-600 font-medium">Method:</span> <span className="text-gray-900 font-semibold">{app.selected_payment_method?.toUpperCase()}</span></p>
                        <p className="text-gray-900"><span className="text-gray-600 font-medium">Reference:</span> <code className="bg-gray-200 px-2 py-0.5 rounded text-gray-900">{app.payment_reference}</code></p>
                        <p className="text-gray-900"><span className="text-gray-600 font-medium">Amount:</span> <span className="text-gray-900 font-semibold">${app.payment_amount}</span></p>
                        {app.payment_screenshot_url && (
                          <div>
                            <p className="text-gray-500 mb-1">Screenshot:</p>
                            <a 
                              href={app.payment_screenshot_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Image className="w-4 h-4" />
                              View Screenshot
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Admin Notes</h4>
                      <textarea
                        placeholder="Add notes about this application..."
                        className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400"
                        rows="3"
                        defaultValue={app.admin_notes || ''}
                        onBlur={async (e) => {
                          await supabase
                            .from(app.table_source)
                            .update({ admin_notes: e.target.value })
                            .eq('id', app.id);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Verify Payment</h2>
            <p className="text-gray-600 mb-4">
              Verify payment for <strong>{selectedApp.full_name}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Reference *
                </label>
                <input
                  type="text"
                  value={verificationData.reference_number}
                  onChange={(e) => setVerificationData({...verificationData, reference_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter transaction reference from MTN/Airtel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid *
                </label>
                <input
                  type="number"
                  value={verificationData.amount}
                  onChange={(e) => setVerificationData({...verificationData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender's Phone Number
                </label>
                <input
                  type="text"
                  value={verificationData.sender_phone}
                  onChange={(e) => setVerificationData({...verificationData, sender_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0788XXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Notes
                </label>
                <textarea
                  value={verificationData.notes}
                  onChange={(e) => setVerificationData({...verificationData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="Any additional notes about this verification..."
                />
              </div>

              <div className="bg-yellow-50 rounded-lg p-3 text-sm">
                <p className="text-yellow-800">
                  ⚠️ Make sure you have checked this transaction in your MTN/Airtel app before verifying.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={confirmVerification}
                  disabled={verifyingId === selectedApp.id}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {verifyingId === selectedApp.id ? 'Verifying...' : 'Confirm Verification'}
                </button>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipManager;