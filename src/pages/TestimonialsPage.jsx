import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Star, Play, Pause, ExternalLink, Image as ImageIcon, Mic, 
  TrendingUp, Users, CheckCircle, Plus, X,
  MessageSquare, Building2, Briefcase, Globe,
  ChevronLeft, ChevronRight, Quote, Trophy, Target,
  Zap, Crown, ThumbsUp, Share2, Bell, Filter,
  Search, ChevronDown, Sparkles, Award, Rocket,
  Heart
} from 'lucide-react';
import TestimonialSubmissionForm from '../components/testimonials/TestimonialSubmissionForm';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [filter, setFilter] = useState('all');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    loadTestimonials();
    loadRecentActivity();
  }, [filter]);

  // Auto-rotate featured testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      const featured = testimonials.filter(t => t.is_featured);
      if (featured.length > 1) {
        setFeaturedIndex(prev => (prev + 1) % featured.length);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials]);

  const loadTestimonials = async () => {
    try {
      let query = supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('submitted_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('project_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    const { data } = await supabase
      .from('testimonials')
      .select('client_name, submitted_at, project_type')
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false })
      .limit(5);
    setRecentSubmissions(data || []);
  };

  const toggleAudio = (audioUrl, lang) => {
    if (playingAudio?.url === audioUrl) {
      playingAudio.audio.pause();
      setPlayingAudio(null);
    } else {
      if (playingAudio) {
        playingAudio.audio.pause();
      }
      const audio = new Audio(audioUrl);
      audio.play();
      setPlayingAudio({ url: audioUrl, audio, lang });
      audio.onended = () => setPlayingAudio(null);
    }
  };

  const calculateGrowth = (before, after) => {
    if (!before || !after) return null;
    const growth = ((after - before) / before) * 100;
    return growth.toFixed(1);
  };

  const projectTypes = [
    { id: 'all', label: 'All Projects', icon: Briefcase, count: testimonials.length },
    { id: 'website', label: 'Websites', icon: Globe, count: testimonials.filter(t => t.project_type === 'website').length },
    { id: 'web_app', label: 'Web Apps', icon: Rocket, count: testimonials.filter(t => t.project_type === 'web_app').length },
    { id: 'mobile_app', label: 'Mobile Apps', icon: Globe, count: testimonials.filter(t => t.project_type === 'mobile_app').length },
    { id: 'trading_bot', label: 'Trading Bots', icon: TrendingUp, count: testimonials.filter(t => t.project_type === 'trading_bot').length },
    { id: 'other', label: 'Other', icon: Briefcase, count: testimonials.filter(t => t.project_type === 'other').length },
  ];

  // Quick Actions
  const quickActions = [
    { icon: Plus, label: 'Add Review', color: 'blue', onClick: () => setShowSubmissionForm(true) },
    { icon: Share2, label: 'Share', color: 'purple', onClick: () => handleShare() },
    { icon: MessageSquare, label: 'WhatsApp', color: 'green', onClick: () => window.open('https://wa.me/0794144738?text=Hi! I saw your testimonials page.', '_blank') },
  ];

  // Stats calculation
  const avgRating = testimonials.length > 0 
    ? (testimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / testimonials.length).toFixed(1)
    : '0.0';
  const growthCount = testimonials.filter(t => t.clients_after > t.clients_before).length;
  const voiceCount = testimonials.filter(t => t.voice_message_en || t.voice_message_rw).length;
  const featuredCount = testimonials.filter(t => t.is_featured).length;

  // Filter testimonials based on search
  const filteredTestimonials = testimonials.filter(t => 
    t.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.testimonial_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Featured testimonials for carousel
  const featuredTestimonials = testimonials.filter(t => t.is_featured);
  const currentFeatured = featuredTestimonials[featuredIndex] || featuredTestimonials[0];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Client Success Stories',
        text: 'Check out these amazing client testimonials!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading success stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* TOP NAVIGATION BAR */}
      <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Success Stories
                </h1>
                <p className="text-xs text-gray-500">{testimonials.length} happy clients</p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-gray-400">Rating:</span>
                <span className="font-bold text-white">{avgRating}/5</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-gray-400">Growth:</span>
                <span className="font-bold text-white">{growthCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-purple-500" />
                <span className="text-gray-400">Featured:</span>
                <span className="font-bold text-white">{featuredCount}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmissionForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center gap-2 text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition"
            >
              <Plus className="w-4 h-4" />
              Share Your Story
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Sticky Navigation */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* Project Type Filter */}
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Filter className="w-3 h-3" /> Categories
                </h3>
                <div className="space-y-1">
                  {projectTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setFilter(type.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                          filter === type.id
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                            : 'hover:bg-slate-800 text-gray-400'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </span>
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full">{type.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={action.onClick}
                      className="p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition group"
                    >
                      <action.icon className={`mx-auto mb-1 text-${action.color}-400 group-hover:scale-110 transition`} />
                      <span className="text-xs text-gray-300">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Tags */}
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Trending
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Growth', 'Success', 'Trading', 'Website', 'App', 'Revenue'].map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-800 rounded-lg text-xs text-gray-400 hover:bg-slate-700 hover:text-white cursor-pointer transition">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-7 space-y-6">

            {/* FEATURED TESTIMONIAL CAROUSEL */}
            {currentFeatured && (
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border border-slate-700 overflow-hidden">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Featured Story
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  {/* Screenshot */}
                  {currentFeatured.project_screenshot ? (
                    <div 
                      className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer group"
                      onClick={() => setSelectedTestimonial(currentFeatured)}
                    >
                      <img 
                        src={currentFeatured.project_screenshot} 
                        alt={currentFeatured.project_title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl aspect-video bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
                      <Quote className="w-16 h-16 text-blue-500/30" />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold">
                        {currentFeatured.client_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{currentFeatured.client_name}</h3>
                        {currentFeatured.client_company && (
                          <p className="text-sm text-gray-400">{currentFeatured.client_company}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(currentFeatured.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-bold text-blue-400 mb-2">{currentFeatured.project_title}</h4>
                      <p className="text-gray-300 line-clamp-4">"{currentFeatured.testimonial_text}"</p>
                    </div>
                    
                    {/* Impact Stats */}
                    {(currentFeatured.clients_before !== null || currentFeatured.revenue_before !== null) && (
                      <div className="flex gap-4">
                        {currentFeatured.clients_before !== null && (
                          <div className="bg-green-500/20 px-4 py-2 rounded-lg">
                            <span className="text-green-400 font-bold text-lg">+{calculateGrowth(currentFeatured.clients_before, currentFeatured.clients_after)}%</span>
                            <p className="text-xs text-green-300">Client Growth</p>
                          </div>
                        )}
                        {currentFeatured.revenue_before !== null && (
                          <div className="bg-blue-500/20 px-4 py-2 rounded-lg">
                            <span className="text-blue-400 font-bold text-lg">+{calculateGrowth(currentFeatured.revenue_before, currentFeatured.revenue_after)}%</span>
                            <p className="text-xs text-blue-300">Revenue Impact</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Carousel Navigation */}
                    {featuredTestimonials.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setFeaturedIndex(prev => prev === 0 ? featuredTestimonials.length - 1 : prev - 1)}
                          className="p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex gap-1">
                          {featuredTestimonials.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setFeaturedIndex(idx)}
                              className={`w-2 h-2 rounded-full transition ${
                                idx === featuredIndex ? 'bg-blue-500' : 'bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <button 
                          onClick={() => setFeaturedIndex(prev => (prev + 1) % featuredTestimonials.length)}
                          className="p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="sticky top-20 z-40">
              <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl p-4 border border-slate-800">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search testimonials by client, project, or keyword..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                </div>
                
                {/* Expandable Filters */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-sm text-gray-500 mb-3">Filter by project type:</p>
                    <div className="flex flex-wrap gap-2">
                      {projectTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setFilter(type.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-2 ${
                              filter === type.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                Showing <span className="text-white font-semibold">{filteredTestimonials.length}</span> of {testimonials.length} testimonials
              </p>
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Testimonials Feed */}
            <div className="space-y-4">
              {filteredTestimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  onMouseEnter={() => setHoveredCard(testimonial.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`bg-slate-900/50 rounded-2xl p-5 border transition-all duration-300 ${
                    hoveredCard === testimonial.id 
                      ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' 
                      : 'border-slate-800'
                  } ${testimonial.is_featured ? 'ring-1 ring-amber-500/30' : ''}`}
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-xl font-bold">
                        {testimonial.client_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{testimonial.client_name}</h3>
                            {testimonial.is_featured && (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>
                          {testimonial.client_company && (
                            <p className="text-sm text-gray-400">{testimonial.client_company}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(testimonial.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      
                      {/* Project Info */}
                      <div className="mb-3">
                        <span className="text-blue-400 font-medium">{testimonial.project_title}</span>
                        <p className="text-sm text-gray-400">{testimonial.project_description}</p>
                      </div>
                      
                      {/* Testimonial Text */}
                      <p className="text-gray-300 mb-4">"{testimonial.testimonial_text}"</p>
                      
                      {/* Screenshot & Actions Row */}
                      <div className="flex items-start gap-4">
                        {testimonial.project_screenshot && (
                          <div 
                            className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group"
                            onClick={() => setSelectedTestimonial(testimonial)}
                          >
                            <img
                              src={testimonial.project_screenshot}
                              alt={testimonial.project_title}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex-1 flex flex-wrap items-center gap-2">
                          {/* Voice Messages */}
                          {(testimonial.voice_message_en || testimonial.voice_message_rw) && (
                            <>
                              {testimonial.voice_message_en && (
                                <button
                                  onClick={() => toggleAudio(testimonial.voice_message_en, 'en')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition ${
                                    playingAudio?.url === testimonial.voice_message_en
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                  }`}
                                >
                                  {playingAudio?.url === testimonial.voice_message_en ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                  <Mic className="w-3 h-3" /> EN
                                </button>
                              )}
                              {testimonial.voice_message_rw && (
                                <button
                                  onClick={() => toggleAudio(testimonial.voice_message_rw, 'rw')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition ${
                                    playingAudio?.url === testimonial.voice_message_rw
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                  }`}
                                >
                                  {playingAudio?.url === testimonial.voice_message_rw ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                  <Mic className="w-3 h-3" /> RW
                                </button>
                              )}
                            </>
                          )}
                          
                          {/* Impact Stats */}
                          {testimonial.clients_before !== null && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> +{calculateGrowth(testimonial.clients_before, testimonial.clients_after)}% Clients
                            </span>
                          )}
                          {testimonial.revenue_before !== null && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> +{calculateGrowth(testimonial.revenue_before, testimonial.revenue_after)}% Revenue
                            </span>
                          )}
                          
                          {/* Links */}
                          {testimonial.project_link && (
                            <a
                              href={testimonial.project_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
                            >
                              <Globe className="w-3 h-3" /> Live Site
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredTestimonials.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">No testimonials found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                <button 
                  onClick={() => {setSearchQuery(''); setFilter('all');}}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR - Sticky */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              {/* Live Activity Feed */}
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live Activity
                </h3>
                <div className="space-y-3">
                  {recentSubmissions.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold">
                        {sub.client_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 truncate">{sub.client_name} shared a story</p>
                        <p className="text-xs text-gray-500">{sub.project_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Impact Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Avg Rating</span>
                    <span className="font-bold text-amber-400">{avgRating}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Growth Stories</span>
                    <span className="font-bold text-green-400">{growthCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Voice Reviews</span>
                    <span className="font-bold text-purple-400">{voiceCount}</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-4 border border-blue-500/30">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-400" />
                  Share Your Story
                </h3>
                <p className="text-sm text-gray-400 mb-3">Have you worked with me? Share your experience!</p>
                <button
                  onClick={() => setShowSubmissionForm(true)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
                >
                  Submit Testimonial
                </button>
              </div>

              {/* Top Industries */}
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Top Industries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Website', 'Trading', 'Mobile App', 'Web App'].map((industry) => (
                    <span key={industry} className="px-2 py-1 bg-slate-800 rounded-lg text-xs text-gray-400">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB for Submit */}
      <button
        onClick={() => setShowSubmissionForm(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition hover:scale-110"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Share Your Success Story</h2>
              <button
                onClick={() => setShowSubmissionForm(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <TestimonialSubmissionForm 
                onSuccess={() => {
                  setShowSubmissionForm(false);
                  loadTestimonials();
                }}
                onCancel={() => setShowSubmissionForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedTestimonial && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTestimonial(null)}
        >
          <div className="max-w-4xl max-h-[90vh]">
            <img
              src={selectedTestimonial.project_screenshot}
              alt={selectedTestimonial.project_title}
              className="max-w-full max-h-[85vh] rounded-lg"
            />
            <p className="text-center mt-4 text-gray-300">
              {selectedTestimonial.project_title} - {selectedTestimonial.client_name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
