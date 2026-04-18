// src/pages/HiringPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sendProjectInquiryEmail, sendAdminProjectInquiryEmail } from '../utils/emailService';
import { usdToRwf } from '../utils/currency';
import { 
  Globe, Smartphone, Bot, Code, CheckCircle, 
  Clock, DollarSign, MessageCircle, Send, 
  ArrowRight, Shield, Star, Users, Calendar,
  ChevronRight, Briefcase, Rocket, Zap, Mail, User, Phone, AlertCircle
} from 'lucide-react';

const HiringPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');
  
  const [formData, setFormData] = useState({
    // Step 1: Project Details
    project_type: '',
    project_name: '',
    description: '',
    budget_range: '',
    timeline: '',
    requirements: [],
    
    // Step 2: Contact Info
    full_name: '',
    email: '',
    phone: '',
    company: '',
    
    // Step 3: Additional
    reference: '',
    how_found: '',
    additional_info: '',
  });

  const projectTypes = [
    { 
      id: 'website', 
      name: 'Website', 
      icon: <Globe className="w-8 h-8" />,
      description: 'Business, portfolio, e-commerce, or landing page',
      price: 'Starting at $500 (' + usdToRwf(500).toLocaleString() + ' RWF)',
      timeline: '2-4 weeks'
    },
    { 
      id: 'webapp', 
      name: 'Web Application', 
      icon: <Code className="w-8 h-8" />,
      description: 'Dashboard, SaaS, admin panel, or custom tool',
      price: 'Starting at $1,500 (' + usdToRwf(1500).toLocaleString() + ' RWF)',
      timeline: '4-8 weeks'
    },
    { 
      id: 'mobile', 
      name: 'Mobile App', 
      icon: <Smartphone className="w-8 h-8" />,
      description: 'iOS, Android, or cross-platform app',
      price: 'Starting at $2,000 (' + usdToRwf(2000).toLocaleString() + ' RWF)',
      timeline: '6-10 weeks'
    },
    { 
      id: 'trading-bot', 
      name: 'Trading Bot', 
      icon: <Bot className="w-8 h-8" />,
      description: 'Automated trading, signals, or analytics',
      price: 'Starting at $1,000 (' + usdToRwf(1000).toLocaleString() + ' RWF)',
      timeline: '3-6 weeks'
    }
  ];

  const budgetRanges = [
    '$500 - $1,000',
    '$1,000 - $2,500',
    '$2,500 - $5,000',
    '$5,000 - $10,000',
    '$10,000+'
  ];

  const timelines = [
    'ASAP (1-2 weeks)',
    'Within a month',
    '1-3 months',
    '3-6 months',
    'Flexible'
  ];

  const requirementsList = [
    'Responsive Design',
    'User Authentication',
    'Payment Integration',
    'Admin Dashboard',
    'API Integration',
    'Database Design',
    'Real-time Features',
    'Push Notifications',
    'SEO Optimization',
    'Analytics Dashboard'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generateInquiryId = () => {
    return `HIRING-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    console.log('🔍 DEBUG - Starting form submission...');
    console.log('🔍 DEBUG - FormData:', JSON.stringify(formData, null, 2));
    
    try {
      const inquiryIdGen = generateInquiryId();
      console.log('🔍 DEBUG - Generated inquiry ID:', inquiryIdGen);
      
      const insertData = {
        inquiry_id: inquiryIdGen,
        project_type: formData.project_type,
        project_name: formData.project_name,
        description: formData.description,
        budget_range: formData.budget_range,
        timeline: formData.timeline,
        requirements: formData.requirements,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || null,
        status: 'new',
      };
      
      console.log('🔍 DEBUG - Insert data:', JSON.stringify(insertData, null, 2));
      
      console.log('🔍 DEBUG - Attempting insert to project_inquiries...');
      
      const { data, error } = await supabase
        .from('project_inquiries')
        .insert([insertData])
        .select()
        .single();
      
      console.log('🔍 DEBUG - Supabase response:', { data, error });
      
      if (error) {
        console.error('🔴 SUBMISSION ERROR:', error);
        console.error('🔴 Error code:', error.code);
        console.error('🔴 Error message:', error.message);
        console.error('🔴 Error details:', error.details);
        throw error;
      }
      
      setInquiryId(inquiryIdGen);
      setSubmitted(true);
      
      // Send confirmation email to user
      await sendProjectInquiryEmail({
        full_name: formData.full_name,
        email: formData.email,
        project_type: formData.project_type,
        inquiry_id: inquiryIdGen
      });
      
      // Send notification to admin
      await sendAdminProjectInquiryEmail({
        full_name: formData.full_name,
        project_type: formData.project_type,
        budget_range: formData.budget_range,
        timeline: formData.timeline,
        email: formData.email,
        phone: formData.phone,
        description: formData.description
      });
      
    } catch (error) {
      console.error('🔴 CRITICAL ERROR:', error);
      console.error('🔴 Error stack:', error.stack);
      
      let errorMsg = 'There was an error submitting your inquiry.';
      
      if (error.code === '42P01') {
        errorMsg = 'Database table not found. Please contact support.';
      } else if (error.code === '23505') {
        errorMsg = 'Duplicate entry detected. Please try again.';
      } else if (error.code === '23502') {
        errorMsg = 'Missing required field. Please fill in all required fields.';
      } else if (error.code === '42501') {
        errorMsg = 'Permission denied. Please refresh the page and try again.';
      } else if (error.message) {
        errorMsg = `Error: ${error.message}`;
      }
      
      alert(errorMsg + ' (Check console for details)');
    } finally {
      setLoading(false);
    }
  };

  const [stepErrors, setStepErrors] = useState({});

  const validateStep1 = () => {
    const errors = {};
    if (!formData.project_type) errors.project_type = 'Please select a project type';
    if (!formData.project_name.trim()) errors.project_name = 'Project name is required';
    if (!formData.description.trim()) errors.description = 'Project description is required';
    if (!formData.budget_range) errors.budget_range = 'Please select a budget range';
    if (!formData.timeline) errors.timeline = 'Please select a timeline';
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    
    console.log(`🔍 DEBUG - Moving from step ${step} to step ${step + 1}`);
    console.log('🔍 DEBUG - Current formData:', JSON.stringify(formData, null, 2));
    
    setStep(step + 1);
    setStepErrors({});
  };

  const prevStep = () => {
    console.log(`🔍 DEBUG - Moving from step ${step} to step ${step - 1}`);
    console.log('🔍 DEBUG - Current formData:', JSON.stringify(formData, null, 2));
    
    setStep(step - 1);
    setStepErrors({});
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Inquiry Submitted!</h1>
          <p className="text-gray-900 mb-6">
            Thank you for reaching out! I'll review your project and get back to you within 24 hours.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Inquiry Details</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-900"><span className="text-gray-600 font-medium">Inquiry ID:</span> <code className="bg-gray-200 px-2 py-1 rounded text-gray-900">{inquiryId}</code></p>
              <p className="text-gray-900"><span className="text-gray-600 font-medium">Project Type:</span> <span className="text-gray-900">{formData.project_type}</span></p>
              <p className="text-gray-900"><span className="text-gray-600 font-medium">Next Steps:</span> <span className="text-gray-900">I'll contact you within 24 hours to discuss details</span></p>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/services')}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50"
            >
              Browse Services
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Let's Solve Your Problem</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Stuck with tech? Overwhelmed by courses that don't work? I fix problems and deliver results.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 text-center text-sm ${
                  step >= s ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {s === 1 && 'Project Details'}
                {s === 2 && 'Contact Info'}
                {s === 3 && 'Review'}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Project Details */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What problem can I solve?</h2>
            <p className="text-gray-600 mb-6">Pick what you need — I'll handle the hard part and deliver results</p>

            {/* Project Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {projectTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData(prev => ({ ...prev, project_type: type.id }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.project_type === type.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      formData.project_type === type.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-gray-600">{type.price}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600">{type.timeline}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Project Details Form */}
            <div className="space-y-5">
              {stepErrors.project_type && (
                <p className="text-red-600 text-sm flex items-center gap-1 bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />{stepErrors.project_type}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Project Name *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <input
                    type="text"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 ${stepErrors.project_name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    placeholder="Enter your project name"
                    required
                  />
                </div>
                {stepErrors.project_name && <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{stepErrors.project_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Project Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 ${stepErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Describe your project in detail. What problem does it solve? What features do you need? Who are the users?"
                  required
                />
                {stepErrors.description && <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{stepErrors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Budget Range *
                  </label>
                  <select
                    name="budget_range"
                    value={formData.budget_range}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${stepErrors.budget_range ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    required
                  >
                    <option value="">Select budget range</option>
                    {budgetRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                  {stepErrors.budget_range && <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{stepErrors.budget_range}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Timeline *
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${stepErrors.timeline ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    required
                  >
                    <option value="">Select timeline</option>
                    {timelines.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {stepErrors.timeline && <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{stepErrors.timeline}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Key Requirements (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {requirementsList.map(req => (
                    <label key={req} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="requirements"
                        value={req}
                        checked={formData.requirements.includes(req)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-600">{req}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t">
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How can I reach you?</h2>
            <p className="text-gray-600 mb-6">I'll contact you within 24 hours to discuss your project</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 ${stepErrors.full_name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    placeholder="Enter your full name"
                    autoComplete="off"
                    data-testid="full-name-input"
                    required
                  />
                </div>
                {stepErrors.full_name && <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{stepErrors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 ${stepErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    placeholder="your.email@example.com"
                    autoComplete="off"
                    data-testid="email-input"
                    required
                  />
                </div>
                {stepErrors.email && <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{stepErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 ${stepErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    placeholder="0788 123 456"
                    autoComplete="off"
                    data-testid="phone-input"
                    required
                  />
                </div>
                {stepErrors.phone && <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{stepErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Company Name (optional)
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Your company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  How did you find me?
                </label>
                <select
                  name="how_found"
                  value={formData.how_found}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="">Select an option</option>
                  <option value="google">Google Search</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="github">GitHub</option>
                  <option value="friend">Friend/Colleague</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={prevStep}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
              >
                Review
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Inquiry</h2>
            <p className="text-gray-600 mb-6">Please review all information before submitting</p>

            <div className="space-y-6">
              {/* Project Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-blue-600" />
                  Project Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900"><span className="text-gray-600 font-medium">Type:</span> <span className="text-gray-900 font-semibold">{formData.project_type}</span></p>
                  <p className="text-gray-900"><span className="text-gray-600 font-medium">Name:</span> <span className="text-gray-900 font-semibold">{formData.project_name}</span></p>
                  <p className="text-gray-900"><span className="text-gray-600 font-medium">Budget:</span> <span className="text-gray-900 font-semibold">{formData.budget_range}</span></p>
                  <p className="text-gray-900"><span className="text-gray-600 font-medium">Timeline:</span> <span className="text-gray-900 font-semibold">{formData.timeline}</span></p>
                  {formData.requirements.length > 0 && (
                    <div>
                      <p className="text-gray-600 font-medium">Requirements:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.requirements.map(req => (
                          <span key={req} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900"><span className="text-gray-600 font-medium">Name:</span> <span className="text-gray-900 font-semibold">{formData.full_name || 'Not provided'}</span></p>
                  <p className="text-gray-900"><span className="text-gray-600 font-medium">Email:</span> <span className="text-gray-900 font-semibold">{formData.email || 'Not provided'}</span></p>
                  <p className="text-gray-900"><span className="text-gray-600 font-medium">Phone:</span> <span className="text-gray-900 font-semibold">{formData.phone || 'Not provided'}</span></p>
                  {formData.company && <p className="text-gray-900"><span className="text-gray-600 font-medium">Company:</span> <span className="text-gray-900 font-semibold">{formData.company}</span></p>}
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Project Description</h3>
                <p className="text-sm text-gray-900 leading-relaxed">{formData.description}</p>
              </div>

              {/* Trust Badges */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">100% Confidential</p>
                  <p className="text-sm text-gray-600">Your project ideas and information are safe with me</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={prevStep}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Submitting...' : 'Submit Inquiry'}
                {!loading && <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiringPage;