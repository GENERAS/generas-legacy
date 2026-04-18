import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  CheckCircle, XCircle, Star, Play, Pause, ExternalLink,
  Image, Mic, TrendingUp, Users, Building, Briefcase,
  Loader2, MessageSquare, Flag, CheckSquare
} from 'lucide-react';

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [playingAudio, setPlayingAudio] = useState(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, [filter]);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', filter)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ 
          status: 'approved', 
          approved_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      loadTestimonials();
    } catch (err) {
      console.error('Error approving testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      loadTestimonials();
    } catch (err) {
      console.error('Error rejecting testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeature = async (id, currentFeatured) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: !currentFeatured })
        .eq('id', id);

      if (error) throw error;
      loadTestimonials();
    } catch (err) {
      console.error('Error featuring testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTestimonials();
    } catch (err) {
      console.error('Error deleting testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleAudio = (url) => {
    if (playingAudio?.url === url) {
      playingAudio.audio.pause();
      setPlayingAudio(null);
    } else {
      if (playingAudio) playingAudio.audio.pause();
      const audio = new Audio(url);
      audio.play();
      setPlayingAudio({ url, audio });
      audio.onended = () => setPlayingAudio(null);
    }
  };

  const calculateGrowth = (before, after) => {
    if (!before || !after) return null;
    return (((after - before) / before) * 100).toFixed(1);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {testimonials.filter(t => t.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-400">Pending</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {testimonials.filter(t => t.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-400">Approved</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {testimonials.filter(t => t.is_featured).length}
          </div>
          <div className="text-sm text-gray-400">Featured</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {testimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / (testimonials.length || 1).toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Avg Rating</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className={`bg-slate-800/50 rounded-xl border ${
              testimonial.is_featured ? 'border-amber-500/50' : 'border-slate-700'
            } overflow-hidden`}
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg font-bold">
                    {testimonial.client_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{testimonial.client_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Building className="w-4 h-4" />
                      {testimonial.client_company || 'No company'}
                      {testimonial.client_position && ` - ${testimonial.client_position}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(testimonial.status)}
                  {testimonial.is_featured && (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm border border-amber-500/30">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Project Info */}
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
                  <Briefcase className="w-4 h-4" />
                  {testimonial.project_title}
                </div>
                <p className="text-sm text-gray-400">{testimonial.project_description}</p>
                <div className="flex gap-4 mt-3 text-sm">
                  {testimonial.project_link && (
                    <a
                      href={testimonial.project_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Site
                    </a>
                  )}
                  {testimonial.demo_link && (
                    <a
                      href={testimonial.demo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Demo
                    </a>
                  )}
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="flex items-start gap-2">
                <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                <p className="text-gray-300 flex-1">{testimonial.testimonial_text}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < (testimonial.rating || 5)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Screenshots */}
              {testimonial.project_screenshots?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {testimonial.project_screenshots.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTestimonial(testimonial)}
                      className="flex-shrink-0 relative w-32 h-24 rounded-lg overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Screenshot ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Voice Messages */}
              <div className="flex gap-2">
                {testimonial.voice_message_en && (
                  <button
                    onClick={() => toggleAudio(testimonial.voice_message_en)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      playingAudio?.url === testimonial.voice_message_en
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {playingAudio?.url === testimonial.voice_message_en ? (
                      <><Pause className="w-4 h-4" /> Stop EN</>
                    ) : (
                      <><Play className="w-4 h-4" /> Play EN</>
                    )}
                  </button>
                )}
                {testimonial.voice_message_rw && (
                  <button
                    onClick={() => toggleAudio(testimonial.voice_message_rw)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      playingAudio?.url === testimonial.voice_message_rw
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {playingAudio?.url === testimonial.voice_message_rw ? (
                      <><Pause className="w-4 h-4" /> Stop RW</>
                    ) : (
                      <><Play className="w-4 h-4" /> Play RW</>
                    )}
                  </button>
                )}
              </div>

              {/* Business Impact */}
              {(testimonial.clients_before || testimonial.revenue_before) && (
                <div className="grid grid-cols-2 gap-4 bg-slate-900/30 rounded-lg p-4">
                  {testimonial.clients_before && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Clients:</span>
                      <span className="text-green-400 font-medium">
                        +{calculateGrowth(testimonial.clients_before, testimonial.clients_after)}%
                      </span>
                    </div>
                  )}
                  {testimonial.revenue_before && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Revenue:</span>
                      <span className="text-green-400 font-medium">
                        +{calculateGrowth(testimonial.revenue_before, testimonial.revenue_after)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                {testimonial.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(testimonial.id)}
                      disabled={actionLoading === testimonial.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 rounded-lg transition"
                    >
                      {actionLoading === testimonial.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(testimonial.id)}
                      disabled={actionLoading === testimonial.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 rounded-lg transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
                
                {testimonial.status === 'approved' && (
                  <button
                    onClick={() => handleFeature(testimonial.id, testimonial.is_featured)}
                    disabled={actionLoading === testimonial.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      testimonial.is_featured
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                )}

                <button
                  onClick={() => handleDelete(testimonial.id)}
                  disabled={actionLoading === testimonial.id}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/50 text-red-400 rounded-lg transition ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p>No {filter} testimonials found.</p>
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
