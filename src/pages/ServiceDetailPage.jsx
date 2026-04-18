// src/pages/ServiceDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usdToRwf } from '../utils/currency';
import { 
  CheckCircle, Clock, Award, Shield, CreditCard, Star,
  Users, TrendingUp, Code, Briefcase, Edit, ChevronRight,
  Calendar, MessageCircle, Download, Zap, Heart, Share2,
  ArrowRight, Sparkles, Target, BarChart3, LineChart, BookOpen,
  Monitor, GitBranch, Server, Database, Layout, Smartphone,
  Lightbulb, Rocket, TrendingUp as Trending, DollarSign,
  FileText, Search, Image, PenTool, Send
} from 'lucide-react';

// Service-specific content database
const serviceContent = {
  'trading-mentorship': {
    tagline: 'Learn to trade from a profitable trader who actually trades',
    whatYoullLearn: [
      { title: 'Technical Analysis', desc: 'Candlesticks, indicators, patterns, chart reading' },
      { title: 'Risk Management', desc: 'Position sizing, stop-loss, take-profit rules' },
      { title: 'Trading Psychology', desc: 'Discipline, emotions control, journaling habits' },
      { title: 'Strategy Development', desc: 'Backtesting, optimization, edge finding' },
      { title: 'Live Trading Sessions', desc: 'Watch me trade, ask questions in real-time' },
      { title: 'Market Analysis', desc: 'Daily/weekly market breakdowns and setups' }
    ],
    packages: [
      { name: '1-Hour Session', price: 50, desc: 'Single private mentorship session' },
      { name: '5-Session Package', price: 225, desc: 'Save $25 - Most popular' },
      { name: '10-Session Package', price: 400, desc: 'Save $100 - Best value' },
      { name: 'Monthly Mentorship', price: 300, desc: '8 sessions + chat support' }
    ],
    whoIsItFor: [
      'Beginners who want to avoid common mistakes',
      'Intermediate traders not seeing consistent profits',
      'Anyone wanting a proven profitable strategy',
      'Traders struggling with discipline and psychology'
    ],
    testimonials: [
      { text: 'BTC GUY helped me go from losing to consistent 5% monthly', author: 'John M.' },
      { text: 'Finally understand risk management. Game changer!', author: 'Sarah K.' },
      { text: 'Went from breakeven to profitable in 3 months', author: 'Mike R.' }
    ],
    timeline: '4-12 weeks',
    format: 'Video call, recorded for replay',
    payment: 'MTN Mobile Money, Airtel Money, Bank Transfer'
  },
  'dev-mentorship': {
    tagline: 'Level up your coding skills with expert guidance',
    whatYoullLearn: [
      { title: 'Clean Code Practices', desc: 'Maintainable, readable, scalable code' },
      { title: 'Modern Frameworks', desc: 'React, Node.js, Next.js, TypeScript' },
      { title: 'System Design', desc: 'Architecture, databases, scalability' },
      { title: 'Git Workflow', desc: 'Branching, PRs, collaboration, CI/CD' },
      { title: 'Deployment & DevOps', desc: 'Vercel, Docker, cloud basics' },
      { title: 'Performance', desc: 'Optimization, debugging, monitoring' }
    ],
    packages: [
      { name: '1-Hour Session', price: 45, desc: 'Single coding/mentorship session' },
      { name: '5-Session Package', price: 200, desc: 'Save $25' },
      { name: 'Monthly Mentorship', price: 300, desc: '8 sessions + code reviews' }
    ],
    whoIsItFor: [
      'Junior developers wanting to advance',
      'Self-taught coders seeking structure',
      'Career changers entering tech',
      'Students preparing for interviews'
    ],
    testimonials: [
      { text: 'Got promoted to Senior Developer after 3 months', author: 'Sarah K.' },
      { text: 'Finally understand system design. Landed FAANG offer!', author: 'Michael R.' },
      { text: 'Best investment in my coding career', author: 'David L.' }
    ],
    timeline: '8-16 weeks',
    format: 'Live coding, code reviews, project-based learning',
    payment: 'MTN Mobile Money, Airtel Money, Bank Transfer'
  },
  'business-consulting': {
    tagline: 'Strategic guidance for your business growth',
    whatYoullLearn: [
      { title: 'Business Strategy', desc: 'Planning, positioning, competitive advantage' },
      { title: 'Marketing Planning', desc: 'Digital marketing, content, funnels' },
      { title: 'Operations', desc: 'Process optimization, automation, systems' },
      { title: 'Financial Planning', desc: 'Budgeting, forecasting, cash flow' },
      { title: 'Growth Hacking', desc: 'Scalable acquisition, retention tactics' },
      { title: 'Team Building', desc: 'Hiring, culture, leadership development' }
    ],
    packages: [
      { name: '1-Hour Consultation', price: 75, desc: 'Strategic advisory session' },
      { name: 'Strategy Package', price: 350, desc: '5 sessions + written roadmap' },
      { name: 'Growth Partnership', price: 600, desc: 'Monthly retainer (8 sessions)' }
    ],
    whoIsItFor: [
      'Startup founders seeking direction',
      'Small business owners scaling up',
      'Entrepreneurs needing fresh perspective',
      'Teams looking to optimize operations'
    ],
    testimonials: [
      { text: 'Increased revenue by 40% in 6 months', author: 'Alex T.' },
      { text: 'Streamlined operations, saved 20 hours per week', author: 'Lisa M.' },
      { text: 'Finally have a clear growth roadmap', author: 'James W.' }
    ],
    process: [
      'Discovery call (free, 15 min)',
      'Assessment and analysis',
      'Strategy development',
      'Implementation roadmap',
      'Ongoing support and check-ins'
    ],
    timeline: 'Ongoing (flexible)',
    format: 'Video call, written deliverables',
    payment: 'MTN Mobile Money, Airtel Money, Bank Transfer'
  },
  'blog-writing': {
    tagline: 'Professional blog content that drives traffic',
    whatYoullLearn: [
      { title: 'SEO-Optimized Content', desc: 'Keywords, meta tags, internal linking' },
      { title: 'Keyword Research', desc: 'Included with every article' },
      { title: 'Engaging Structure', desc: 'Headlines, hooks, readability' },
      { title: 'Fact-Checking', desc: 'Citations, sources, accuracy' },
      { title: 'Image Sourcing', desc: 'Royalty-free, optimized images' },
      { title: 'Meta Descriptions', desc: 'Click-worthy search snippets' }
    ],
    packages: [
      { name: '500 Words', price: 25, desc: 'Short blog post/article' },
      { name: '1000 Words', price: 45, desc: 'Standard blog post' },
      { name: '1500 Words', price: 65, desc: 'In-depth article' },
      { name: '2000+ Words', price: 0, desc: 'Contact for custom quote' }
    ],
    whoIsItFor: [
      'Business owners needing consistent content',
      'Agencies outsourcing writing',
      'Blog owners wanting organic growth',
      'SEO professionals needing quality content'
    ],
    process: [
      'Topic discussion and keyword research',
      'Outline approval',
      'First draft (3-5 days)',
      'Revisions (up to 2 rounds)',
      'Final delivery with images'
    ],
    niches: ['Technology', 'Finance / Trading', 'Business / Marketing', 'Lifestyle'],
    timeline: '3-5 days per post',
    format: 'Google Doc + images, ready to publish',
    payment: '50% upfront, 50% on delivery'
  }
};

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(0);

  useEffect(() => {
    fetchService();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_services')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContent = () => {
    return serviceContent[slug] || serviceContent['trading-mentorship'];
  };

  const getCategoryIcon = () => {
    switch(service?.category) {
      case 'trading': return <TrendingUp className="w-12 h-12" />;
      case 'development': return <Code className="w-12 h-12" />;
      case 'business': return <Briefcase className="w-12 h-12" />;
      case 'blog': return <Edit className="w-12 h-12" />;
      default: return <Zap className="w-12 h-12" />;
    }
  };

  const getCategoryColor = () => {
    switch(service?.category) {
      case 'trading': return 'from-green-600 to-emerald-600';
      case 'development': return 'from-blue-600 to-indigo-600';
      case 'business': return 'from-purple-600 to-pink-600';
      case 'blog': return 'from-orange-600 to-red-600';
      default: return 'from-blue-600 to-indigo-600';
    }
  };

  const getDefaultProcess = () => [
    { title: 'Apply & Describe Your Goals', desc: 'Fill out the application form with your information and what you want to achieve.' },
    { title: 'Make Payment', desc: 'Send payment via MTN/Airtel with your unique reference code.' },
    { title: 'Verification (24 hours)', desc: 'I verify your payment in my mobile money app.' },
    { title: 'Schedule & Start', desc: 'We schedule your first session and begin your journey.' }
  ];

  const content = getContent();
  const currentPackage = content.packages[selectedPackage];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Not Found</h2>
          <Link to="/service" className="text-blue-600 hover:underline">Back to Services</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 rounded-xl p-2 backdrop-blur-sm">
                {getCategoryIcon()}
              </div>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                {service.service_type === 'mentorship' ? 'Mentorship' : service.service_type === 'hiring' ? 'Hiring' : 'Consulting'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {service.title}
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl">
              {content.tagline}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={`/apply/mentorship?service=${service.slug}`}
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Apply Now
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Book Free Call
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                What You'll {service.category === 'blog' ? 'Get' : 'Learn'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.whatYoullLearn.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 ml-7">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Who Is It For */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Who This Is For
              </h2>
              <div className="space-y-3">
                {content.whoIsItFor.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">{idx + 1}</span>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Past {service.category === 'blog' ? 'Client' : 'Student'} Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.testimonials.map((testimonial, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 italic mb-3">"{testimonial.text}"</p>
                    <p className="text-sm text-gray-500 font-medium">— {testimonial.author}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Process */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {service.category === 'business' ? 'Consulting Process' : 'How It Works'}
              </h2>
              <div className="space-y-4">
                {(content.process || ['Apply & Describe Your Goals', 'Make Payment', 'Verification (24 hours)', 'Schedule & Start']).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Niches - Only for blog writing */}
            {content.niches && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Edit className="w-6 h-6 text-orange-600" />
                  Sample Niches I Write For
                </h2>
                <div className="flex flex-wrap gap-2">
                  {content.niches.map((niche, idx) => (
                    <span key={idx} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                      {niche}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">How long is each session?</h3>
                  <p className="text-gray-600">Standard sessions are 1 hour. Package sessions can be adjusted based on your needs.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">What if I need to reschedule?</h3>
                  <p className="text-gray-600">You can reschedule up to 24 hours before the session without penalty.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Do you offer refunds?</h3>
                  <p className="text-gray-600">Yes! If you're not satisfied after the first session, I'll provide a full refund.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Are sessions recorded?</h3>
                  <p className="text-gray-600">Yes, all sessions are recorded and shared with you for replay.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Pricing Card */}
            <div className="bg-white rounded-2xl shadow-xl sticky top-24 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Choose Your Plan</h3>
              
              {/* Package Selector */}
              <div className="space-y-2 mb-6">
                {content.packages.map((pkg, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPackage(idx)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedPackage === idx
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">{pkg.name}</span>
                      <span className="font-bold text-blue-600">
                        {pkg.price > 0 ? `$${pkg.price} (${usdToRwf(pkg.price).toLocaleString()} RWF)` : 'Quote'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{pkg.desc}</p>
                  </button>
                ))}
              </div>

              <Link
                to={`/apply/mentorship?service=${service.slug}&package=${selectedPackage}`}
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 mb-4"
              >
                Apply Now
              </Link>

              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Timeline: <strong>{content.timeline}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Format: <strong>{content.format}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment: <strong>{content.payment}</strong></span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Satisfaction Guaranteed</span>
                </div>
                <p className="text-sm text-green-600">
                  {service.category === 'blog' 
                    ? 'Unlimited revisions until you are satisfied'
                    : 'Not satisfied after first session? Full refund.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;