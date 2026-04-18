// src/pages/ServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usdToRwf } from '../utils/currency';
import { 
  TrendingUp, Code, Briefcase, Edit, 
  Star, Clock, Shield, CreditCard,
  ChevronRight, CheckCircle, Award, Users,
  Zap, Globe
} from 'lucide-react';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching services...');
      
      // Simple query without filters first
      const { data, error } = await supabase
        .from('mentorship_services')
        .select('id, title, category, slug, short_description, price_hourly, price_package, price_fixed, features, timeline, rating, review_count, is_active');

      console.log('Raw response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        setFetchError(error.message);
      } else {
        // Filter active services client-side
        const activeServices = (data || []).filter(s => s.is_active === true);
        console.log('Active services:', activeServices);
        setServices(activeServices);
      }

      // Fetch testimonials  
      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('*');
      setTestimonials((testimonialsData || []).filter(t => t.is_active));
    } catch (error) {
      console.error('Fetch error:', error);
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Services I Offer
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Choose the path that fits your goals and budget
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

      {/* Category Filter */}
      <section className="container mx-auto px-4 py-8">
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

      {/* Debug Info */}
      <section className="container mx-auto px-4">
        <div className="mb-4 p-4 bg-yellow-100 rounded text-sm">
          <p>Total services: {services.length}</p>
          <p>Filtered services: {filteredServices.length}</p>
          <p>Selected category: {selectedCategory}</p>
          <p>Service categories: {services.map(s => s.category).join(', ')}</p>
          {fetchError && <p className="text-red-600 mt-2">Error: {fetchError}</p>}
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-8">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services found for this category.</p>
            <p className="text-gray-400 text-sm mt-2">Try selecting &quot;All Services&quot; or check the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Card Header */}
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

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6">{service.short_description}</p>

                  {/* Features */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      What&apos;s Included
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

                  {/* Timeline */}
                  {service.timeline && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                      <Clock className="w-4 h-4" />
                      <span>Typical timeline: {service.timeline}</span>
                    </div>
                  )}

                  {/* Payment Methods */}
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
                    <CreditCard className="w-4 h-4" />
                    <span>MTN Mobile Money</span>
                    <span>•</span>
                    <span>Airtel Money</span>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/apply/mentorship?service=${service.slug}`}
                      className="flex-1 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Apply Now
                    </Link>
                    <Link
                      to={`/services/${service.slug}`}
                      className="flex-1 text-center border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                    >
                      Learn More
                      <ChevronRight className="w-4 h-4 inline ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Indicators */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Me?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              I&apos;m committed to providing high-quality service and ensuring your success
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

export default ServicesPage;
