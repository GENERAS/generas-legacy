// src/components/admin/ProjectInquiriesManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Briefcase, Eye, Mail, Phone, DollarSign, 
  Clock, CheckCircle, XCircle, MessageCircle,
  Search, Filter, RefreshCw, ExternalLink
} from 'lucide-react';

const ProjectInquiriesManager = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('project_inquiries')
        .update({ status: status, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
      fetchInquiries();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'deposit_paid': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'new': return 'New Inquiry';
      case 'quoted': return 'Quote Sent';
      case 'deposit_paid': return 'Deposit Paid';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (filter !== 'all' && inq.status !== filter) return false;
    if (searchTerm && !inq.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !inq.email?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !inq.inquiry_id?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    inProgress: inquiries.filter(i => i.status === 'in_progress').length,
    completed: inquiries.filter(i => i.status === 'completed').length,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Project Inquiries</h1>
        <p className="text-gray-600 mt-1">Manage client project requests and proposals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Inquiries</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">New</p>
          <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'new', 'quoted', 'in_progress', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {f === 'in_progress' ? 'In Progress' : f}
              </button>
            ))}
          </div>
          <button
            onClick={fetchInquiries}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No project inquiries found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{inquiry.full_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                        {getStatusText(inquiry.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {inquiry.project_type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {inquiry.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {inquiry.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {inquiry.budget_range}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={inquiry.status}
                      onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="new">New</option>
                      <option value="quoted">Quote Sent</option>
                      <option value="deposit_paid">Deposit Paid</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => setSelectedInquiry(selectedInquiry?.id === inquiry.id ? null : inquiry)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedInquiry?.id === inquiry.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Project Details</h4>
                        <p className="text-sm text-gray-900 mb-2">
                          <span className="font-medium text-gray-700">Name:</span> {inquiry.project_name || 'Not specified'}
                        </p>
                        <p className="text-sm text-gray-900 mb-2">
                          <span className="font-medium text-gray-700">Timeline:</span> {inquiry.timeline}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium text-gray-700">Description:</span>
                        </p>
                        <p className="text-sm text-gray-900 mt-1">{inquiry.description}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Requirements</h4>
                        <div className="flex flex-wrap gap-1">
                          {inquiry.requirements?.map((req, i) => (
                            <span key={i} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                              {req}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Quick Actions</h4>
                          <div className="flex gap-2">
                            <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline text-sm">
                              Send Email
                            </a>
                            <span className="text-gray-300">|</span>
                            <a href={`tel:${inquiry.phone}`} className="text-blue-600 hover:underline text-sm">
                              Call Client
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectInquiriesManager;