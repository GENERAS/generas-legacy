// src/pages/ApplyMentorshipPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usdToRwf } from '../utils/currency';
import { 
  User, Mail, Phone, Target, Award, Clock, DollarSign,
  ChevronLeft, ChevronRight, Upload, Copy, Check,
  AlertCircle, Globe, Briefcase, Code, TrendingUp, Edit
} from 'lucide-react';

const ApplyMentorshipPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const serviceSlug = params.get('service');
  const selectedPackageParam = params.get('package');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState(null);
  const [referenceCode, setReferenceCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form data
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

  useEffect(() => {
    fetchService();
  }, [serviceSlug]);

  const fetchService = async () => {
    try {
      console.log('Fetching service with slug:', serviceSlug);
      
      let query = supabase.from('mentorship_services').select('*');
      
      if (serviceSlug) {
        query = query.eq('slug', serviceSlug);
      } else {
        query = query.eq('category', 'trading').limit(1);
      }
      
      const { data, error } = await query.single();
      
      if (error) {
        console.error('Error fetching service:', error);
        setErrorMessage('Could not load service. Please try again.');
        return;
      }
      
      console.log('Service loaded:', data);
      setService(data);
      
      // Generate reference code
      const refCode = `BTC-${data.category.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;
      setReferenceCode(refCode);
      console.log('Reference code generated:', refCode);
      
    } catch (error) {
      console.error('Fetch service error:', error);
      setErrorMessage('Error loading service. Please refresh the page.');
    }
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
      console.log('File selected:', file.name);
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
      
      console.log('Uploading screenshot to:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('applications')
        .upload(filePath, formData.payment_screenshot);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('applications')
        .getPublicUrl(filePath);
      
      console.log('Screenshot uploaded, URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Upload function error:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      console.log('Starting form submission...');
      console.log('Form data:', formData);
      console.log('Service:', service);
      console.log('Reference code:', referenceCode);
      
      // Calculate amount
      let amount = service?.price_hourly;
      if (selectedPackageParam === 'package' && service?.price_package) {
        amount = service.price_package;
      } else if (selectedPackageParam === 'fixed' && service?.price_fixed) {
        amount = service.price_fixed;
      }
      
      console.log('Amount calculated:', amount);
      
      // Upload screenshot if exists
      let screenshotUrl = null;
      if (formData.payment_screenshot) {
        console.log('Uploading screenshot...');
        screenshotUrl = await uploadScreenshot();
        console.log('Screenshot URL result:', screenshotUrl);
      }
      
      // Prepare the data for insertion
      const applicationData = {
        application_id: referenceCode,
        service_id: service?.id,
        service_title: service?.title,
        package_type: selectedPackageParam || 'hourly',
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
      
      console.log('Inserting application with data:', applicationData);
      
      // Insert application
      const { data, error } = await supabase
        .from('mentorship_applications')
        .insert([applicationData])
        .select();
      
      if (error) {
        console.error('Supabase insert error DETAILS:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        
        // Show specific error message
        if (error.code === '42P01') {
          setErrorMessage('Database table not found. Please run the SQL setup.');
        } else if (error.code === '23505') {
          setErrorMessage('Duplicate application. Please try again.');
        } else {
          setErrorMessage(`Database error: ${error.message}`);
        }
        return;
      }
      
      console.log('Insert successful! Response:', data);
      
      if (data && data[0]) {
        setApplicationId(data[0].id);
        setSubmitted(true);
        console.log('Application submitted successfully. ID:', data[0].id);
      } else {
        console.error('No data returned from insert');
        setErrorMessage('Application was saved but no ID returned. Please contact support.');
      }
      
    } catch (error) {
      console.error('CRITICAL - Submission error:', error);
      console.error('Error stack:', error.stack);
      setErrorMessage(`Error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyReference = () => {
    navigator.clipboard.writeText(referenceCode);
    alert('Reference code copied!');
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (!service && !errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
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
              <p><span className="text-gray-500">Service:</span> {service?.title}</p>
              <p><span className="text-gray-500">Reference Code:</span> <code className="bg-gray-200 px-2 py-1 rounded">{referenceCode}</code></p>
              <p><span className="text-gray-500">Status:</span> <span className="text-yellow-600">Awaiting Verification</span></p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Track Your Application
          </button>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <p className="text-sm text-gray-500 mb-4">Check the browser console (F12) for more details.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
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
                Step {s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Apply for {service?.title}
            </h1>
            <p className="text-gray-500 mb-6">
              Fill out the form below to get started
            </p>

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0788 123 456"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Goals */}
            {step === 2 && (
              <div className="space-y-5">
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
                        className={`py-2 px-3 rounded-lg border font-medium capitalize ${
                          formData.skill_level === level
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        {level}
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg !bg-white !text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What do you want to achieve through this mentorship?"
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
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
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg !bg-white !text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What challenges are you currently facing that you need help with?"
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Payment Instructions</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Send <strong>${service?.price_hourly}</strong> ({usdToRwf(service?.price_hourly).toLocaleString()} RWF) to:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>MTN Mobile Money:</strong> 0788 123 456</p>
                    <p><strong>Airtel Money:</strong> 0788 123 456</p>
                    <div className="bg-yellow-50 p-2 rounded">
                      <p className="font-semibold">Reference Code:</p>
                      <code className="text-sm font-mono">{referenceCode}</code>
                      <button onClick={copyReference} className="ml-2 text-blue-600 text-sm">Copy</button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Payment Screenshot *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a screenshot of your payment confirmation</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700"
                >
                  Back
                </button>
              )}
              
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto px-8 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyMentorshipPage;