// src/pages/ServicePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usdToRwf } from '../utils/currency';
import { 
  TrendingUp, Code, Briefcase, Edit, Star, Clock, Shield, CreditCard,
  ChevronRight, CheckCircle, Award, Users, Zap, Globe, Search,
  User, AlertCircle, Upload, Copy, Check,
  DollarSign, ChevronLeft, Sparkles,
  XCircle, MessageCircle, FileText, Mail
} from 'lucide-react';

const ServicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const urlServiceSlug = params.get('service');
  const urlTab = params.get('tab');

  // Main tab state
  const [activeTab, setActiveTab] = useState(urlTab || 'browse');

  // Browse Services state
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Apply state
  const [selectedService, setSelectedService] = useState(null);
  const [applyStep, setApplyStep] = useState(1);
  const [applyLoading, setApplyLoading] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [applyError, setApplyError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: 'Rwanda',
    how_heard: '',
    skill_level: 'beginner',
    trading_goals: [],
    interested_markets: [],
    weekly_hours: '3-5',
    current_challenges: '',
    goals: '',
    selected_payment_method: 'mtn',
    payment_screenshot: null,
    sender_phone: '',
  });

  // Track Application state
  const [applications, setApplications] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [trackTab, setTrackTab] = useState('mentorship');
  const [searchEmail, setSearchEmail] = useState('');
  const [searched, setSearched] = useState(false);

  // Initialize
  useEffect(() => {
    fetchServicesAndTestimonials();
    if (urlServiceSlug) {
      setActiveTab('apply');
      fetchServiceForApply(urlServiceSlug);
    }
  }, []);

  // Fetch services and testimonials
  const fetchServicesAndTestimonials = async () => {
    try {
      const { data: servicesData } = await supabase
        .from('mentorship_services')
        .select('id, title, category, slug, short_description, price_hourly, price_package, price_fixed, features, timeline, rating, review_count, is_active');
      
      const activeServices = (servicesData || []).filter(s => s.is_active === true);
      setServices(activeServices);

      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('*');
      setTestimonials((testimonialsData || []).filter(t => t.is_active));
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch specific service for apply form
  const fetchServiceForApply = async (slug) => {
    try {
      let query = supabase.from('mentorship_services').select('*');
      if (slug) {
        query = query.eq('slug', slug);
      } else {
        query = query.eq('category', 'trading').limit(1);
      }
      const { data, error } = await query.single();
      if (error) throw error;
      setSelectedService(data);
      generateReferenceCode(data);
    } catch (error) {
      console.error('Error fetching service:', error);
    }
  };

  const generateReferenceCode = (service) => {
    if (service) {
      const refCode = `BTC-${service.category.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;
      setReferenceCode(refCode);
    }
  };

  // Apply form handlers
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    generateReferenceCode(service);
    setActiveTab('apply');
    setApplyStep(1);
    setSubmitted(false);
    setApplyError('');
  };

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setFormData(prev => ({ ...prev, payment_screenshot: file }));
    } else {
      alert('File must be less than 5MB');
    }
  };

  const uploadScreenshot = async () => {
    if (!formData.payment_screenshot) return null;
    try {
      const fileExt = formData.payment_screenshot.name.split('.').pop();
      const fileName = `${referenceCode}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('applications')
        .upload(filePath, formData.payment_screenshot);
      
      if (uploadError) return null;
      
      const { data: { publicUrl } } = supabase.storage
        .from('applications')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async () => {
    setApplyLoading(true);
    setApplyError('');
    
    try {
      const amount = selectedService?.price_hourly || 0;
      let screenshotUrl = null;
      if (formData.payment_screenshot) {
        screenshotUrl = await uploadScreenshot();
      }
      
      const applicationData = {
        application_id: referenceCode,
        service_id: selectedService?.id,
        service_title: selectedService?.title,
        package_type: 'hourly',
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        how_heard: formData.how_heard,
        skill_level: formData.skill_level,
        trading_goals: formData.trading_goals,
        interested_markets: formData.interested_markets,
        weekly_hours: formData.weekly_hours,
        current_challenges: formData.current_challenges,
        goals: formData.goals,
        selected_payment_method: formData.selected_payment_method,
        payment_reference: referenceCode,
        payment_screenshot_url: screenshotUrl,
        payment_amount: amount,
        payment_status: formData.payment_screenshot ? 'awaiting_verification' : 'pending_payment',
        status: 'new',
        form_step: 3,
        submitted_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('mentorship_applications')
        .insert([applicationData])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setApplicationId(data[0].id);
        setSubmitted(true);
      }
    } catch (error) {
      setApplyError(`Error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setApplyLoading(false);
    }
  };

  const copyReference = (ref) => {
    navigator.clipboard.writeText(ref || referenceCode);
    alert('Reference code copied!');
  };

  // Track Application handlers
  const searchApplications = async () => {
    if (!searchEmail) {
      alert('Please enter your email address');
      return;
    }
    
    setLoadingTrack(true);
    setSearched(true);
    
    try {
      const { data: mentorshipData } = await supabase
        .from('mentorship_applications')
        .select('*')
        .eq('email', searchEmail)
        .order('submitted_at', { ascending: false });
      
      const { data: projectData } = await supabase
        .from('project_inquiries')
        .select('*')
        .eq('email', searchEmail)
        .order('created_at', { ascending: false });
      
      setApplications(mentorshipData || []);
      setInquiries(projectData || []);
    } catch (error) {
      console.error('Error searching:', error);
      alert('Error searching applications. Please try again.');
    } finally {
      setLoadingTrack(false);
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

  // Helpers
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'trading': return <TrendingUp className="w-8 h-8" />;
      case 'development': return <Code className="w-8 h-8" />;
      case 'business': return <Briefcase className="w-8 h-8" />;
      case 'blog': return <Edit className="w-8 h-8" />;
      default: return <Zap className="w-8 h-8" />;
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'trading': return 'from-green-500 to-emerald-600';
      case 'development': return 'from-blue-500 to-indigo-600';
      case 'business': return 'from-purple-500 to-pink-600';
      case 'blog': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Services', icon: <Zap className="w-4 h-4" /> },
    { id: 'trading', name: 'Trading', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'development', name: 'Development', icon: <Code className="w-4 h-4" /> },
    { id: 'business', name: 'Business', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'blog', name: 'Blog Writing', icon: <Edit className="w-4 h-4" /> },
  ];

  // Render Functions
  const renderHero = () => (
    <section className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Stop Struggling. Start Winning.
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            Escape bad courses. Ditch the overwhelm. Get real mentorship that actually gets you results.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>100% Guaranteed</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>100+ Students</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
    </section>
  );

  const renderTabs = () => (
    <div className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-center gap-1 md:gap-4">
          {[
            { id: 'browse', label: 'Browse Services', icon: Sparkles },
            { id: 'apply', label: 'Get Help', icon: Edit },
            { id: 'track', label: 'Track Application', icon: Search },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 md:px-8 py-4 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBrowseServices = () => {
    if (loadingServices) {
      return (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {/* Category Filter */}
        <section className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-4">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No services found for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`bg-gradient-to-r ${getCategoryColor(service.category)} p-6 text-white`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-xl p-2 backdrop-blur-sm">
                          {getCategoryIcon(service.category)}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{service.title}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{service.rating || 4.9}</span>
                            <span className="text-white/80 text-sm">({service.review_count || 0} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {service.price_hourly && (
                          <>
                            <div className="text-2xl font-bold">${service.price_hourly} <span className="text-sm font-normal text-white/60">({usdToRwf(service.price_hourly).toLocaleString()} RWF)</span></div>
                            <div className="text-sm text-white/80">/hour</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 mb-6">{service.short_description}</p>

                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        What's Included
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {service.features?.slice(0, 4).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {service.timeline && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Clock className="w-4 h-4" />
                        <span>Typical timeline: {service.timeline}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleServiceSelect(service)}
                        className="flex-1 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Apply Now
                      </button>
                      <button
                        onClick={() => navigate(`/services/${service.slug}`)}
                        className="flex-1 text-center border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                      >
                        Learn More
                        <ChevronRight className="w-4 h-4 inline ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">What Students Say</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Join hundreds of successful students who transformed their careers
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.slice(0, 3).map((testimonial, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{testimonial.author_name}</p>
                        <p className="text-sm text-gray-500">{testimonial.author_title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trust Indicators */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Me?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                I'm committed to providing high-quality service and ensuring your success
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Satisfaction Guaranteed</h3>
                <p className="text-sm text-gray-600">Full refund if not satisfied after first session</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Quick Response</h3>
                <p className="text-sm text-gray-600">Payment verification within 24 hours</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Remote Sessions</h3>
                <p className="text-sm text-gray-600">Available worldwide via video call</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Proven Track Record</h3>
                <p className="text-sm text-gray-600">100+ successful students and projects</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  const renderApply = () => {
    if (submitted) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Application Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Your application has been received. I will verify your payment within 24 hours.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-3">Application Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Service:</span> {selectedService?.title}</p>
                <p><span className="text-gray-500">Reference Code:</span> <code className="bg-gray-200 px-2 py-1 rounded">{referenceCode}</code></p>
                <p><span className="text-gray-500">Status:</span> <span className="text-yellow-600">Awaiting Verification</span></p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setApplyStep(1);
                  setFormData({
                    full_name: '',
                    email: '',
                    phone: '',
                    country: 'Rwanda',
                    how_heard: '',
                    skill_level: 'beginner',
                    trading_goals: [],
                    interested_markets: [],
                    weekly_hours: '3-5',
                    current_challenges: '',
                    goals: '',
                    selected_payment_method: 'mtn',
                    payment_screenshot: null,
                    sender_phone: '',
                  });
                  setActiveTab('track');
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Track Your Application
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setApplyStep(1);
                  setActiveTab('browse');
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 font-semibold"
              >
                Browse More Services
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto">
        {!selectedService ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Please select a service first to apply</p>
            <button
              onClick={() => setActiveTab('browse')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 text-center text-sm ${
                      applyStep >= s ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    Step {s}
                  </div>
                ))}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${(applyStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Selected Service Card */}
            <div className={`bg-gradient-to-r ${getCategoryColor(selectedService.category)} p-4 rounded-xl text-white mb-6`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{selectedService.title}</h3>
                  <p className="text-white/80 text-sm">{selectedService.short_description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${selectedService.price_hourly}</div>
                  <div className="text-sm text-white/80">/hour</div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 md:p-8">
                {applyError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-700">{applyError}</p>
                    </div>
                  </div>
                )}

                {/* Step 1: Personal Info */}
                {applyStep === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0788 123 456"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Rwanda">Rwanda</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Burundi">Burundi</option>
                        <option value="DRC">DRC</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Ghana">Ghana</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Goals */}
                {applyStep === 2 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Your Goals & Experience</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Experience Level *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['beginner', 'intermediate', 'advanced'].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, skill_level: level }))}
                            className={`py-3 px-3 rounded-lg border font-medium capitalize transition-all ${
                              formData.skill_level === level
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How many hours can you commit per week? *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['1-3', '3-5', '5+'].map(hours => (
                          <button
                            key={hours}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, weekly_hours: hours }))}
                            className={`py-3 px-3 rounded-lg border font-medium transition-all ${
                              formData.weekly_hours === hours
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {hours} hours
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What are your goals? *
                      </label>
                      <textarea
                        name="goals"
                        value={formData.goals}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="What do you want to achieve through this mentorship?"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Challenges (Optional)
                      </label>
                      <textarea
                        name="current_challenges"
                        value={formData.current_challenges}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="What challenges are you currently facing?"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {applyStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Payment</h2>
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Payment Instructions
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Send <strong className="text-blue-600 text-lg">${selectedService?.price_hourly}</strong> <span className="text-sm text-gray-600">({usdToRwf(selectedService?.price_hourly).toLocaleString()} RWF)</span> to:
                      </p>
                      <div className="space-y-3 text-sm bg-white rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-yellow-700">M</span>
                          </div>
                          <div>
                            <p className="font-medium">MTN Mobile Money</p>
                            <p className="text-gray-500">0788 123 456</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-red-700">A</span>
                          </div>
                          <div>
                            <p className="font-medium">Airtel Money</p>
                            <p className="text-gray-500">0788 123 456</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-100 p-3 rounded-lg mt-4">
                        <p className="font-semibold text-yellow-800 text-sm">Reference Code (Important!):</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm font-mono bg-yellow-200 px-2 py-1 rounded flex-1">{referenceCode}</code>
                          <button 
                            onClick={copyReference} 
                            className="p-2 bg-white rounded hover:bg-gray-100 transition-colors"
                            title="Copy reference code"
                          >
                            <Copy className="w-4 h-4 text-yellow-700" />
                          </button>
                        </div>
                        <p className="text-xs text-yellow-700 mt-2">
                          Include this code in your payment description
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Payment Screenshot *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Upload a screenshot of your payment confirmation (Max 5MB)
                        </p>
                      </div>
                      {formData.payment_screenshot && (
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          File selected: {formData.payment_screenshot.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  {applyStep > 1 ? (
                    <button
                      onClick={() => setApplyStep(applyStep - 1)}
                      className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <ChevronLeft className="w-4 h-4 inline mr-1" />
                      Back
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                  )}
                  
                  {applyStep < 3 ? (
                    <button
                      onClick={() => setApplyStep(applyStep + 1)}
                      className="ml-auto px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 inline ml-1" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={applyLoading || !formData.payment_screenshot}
                      className="ml-auto px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {applyLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderTrack = () => {
    if (!searched) {
      return (
        <div className="max-w-md mx-auto">
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
                disabled={loadingTrack}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loadingTrack ? 'Searching...' : 'Track My Application'}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500">
                Don't have an application yet?
                <button
                  onClick={() => setActiveTab('browse')}
                  className="text-blue-600 ml-1 hover:underline font-medium"
                >
                  Apply for Mentorship
                </button>
                {' '}or{' '}
                <button
                  onClick={() => navigate('/hire')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Hire for a Project
                </button>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setSearched(false)}
            className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            New Search
          </button>
          <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
          <p className="text-gray-600">Email: {searchEmail}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setTrackTab('mentorship')}
            className={`px-6 py-3 font-medium transition-all ${
              trackTab === 'mentorship'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Mentorship ({applications.length})
          </button>
          <button
            onClick={() => setTrackTab('projects')}
            className={`px-6 py-3 font-medium transition-all ${
              trackTab === 'projects'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Project Inquiries ({inquiries.length})
          </button>
        </div>

        {loadingTrack ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : trackTab === 'mentorship' && applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No mentorship applications found for this email</p>
            <button
              onClick={() => setActiveTab('browse')}
              className="mt-4 text-blue-600 hover:underline font-medium"
            >
              Apply for Mentorship →
            </button>
          </div>
        ) : trackTab === 'projects' && inquiries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No project inquiries found for this email</p>
            <button
              onClick={() => navigate('/hire')}
              className="mt-4 text-blue-600 hover:underline font-medium"
            >
              Hire for a Project →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mentorship Applications */}
            {trackTab === 'mentorship' && applications.map((app) => {
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
                        <span className="text-xs text-gray-600 font-medium">Reference Code</span>
                        <code className="block font-mono text-sm font-semibold text-gray-900">{app.application_id}</code>
                      </div>
                      <button
                        onClick={() => copyReference(app.application_id)}
                        className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-4 h-4" />
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
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm font-medium">Payment Details</span>
                        </div>
                        <p className="text-sm text-gray-900">Amount: <strong className="text-gray-900">${app.payment_amount} ({usdToRwf(app.payment_amount).toLocaleString()} RWF)</strong></p>
                        <p className="text-sm text-gray-900">Method: <strong className="text-gray-900">{app.selected_payment_method?.toUpperCase()}</strong></p>
                        <p className="text-sm text-gray-900">Status: <strong className={
                          app.payment_status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                        }>{app.payment_status}</strong></p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">Your Information</span>
                        </div>
                        <p className="text-sm text-gray-900 font-semibold">{app.full_name}</p>
                        <p className="text-sm text-gray-900">{app.email}</p>
                        <p className="text-sm text-gray-900">{app.phone}</p>
                      </div>
                    </div>

                    {/* Goals & Challenges */}
                    {app.goals && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-900">
                          <strong className="text-blue-800">Your Goals:</strong> {app.goals}
                        </p>
                      </div>
                    )}
                    {app.current_challenges && (
                      <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-900">
                          <strong className="text-yellow-800">Your Challenges:</strong> {app.current_challenges}
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
                            onClick={() => handleServiceSelect(services.find(s => s.id === app.service_id))}
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
            {trackTab === 'projects' && inquiries.map((inquiry) => (
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {renderHero()}
      {renderTabs()}
      
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'browse' && renderBrowseServices()}
        {activeTab === 'apply' && renderApply()}
        {activeTab === 'track' && renderTrack()}
      </div>
    </div>
  );
};

export default ServicePage;
