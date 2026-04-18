import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  User, Building, Briefcase, Star, Mic, MicOff,
  Upload, Link, Image as ImageIcon, TrendingUp,
  CheckCircle, Loader2, MessageSquare, Send
} from 'lucide-react';

export default function TestimonialSubmissionForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_company: '',
    client_position: '',
    project_title: '',
    project_description: '',
    project_type: 'website',
    project_link: '',
    demo_link: '',
    testimonial_text: '',
    rating: 5,
    clients_before: '',
    clients_after: '',
    revenue_before: '',
    revenue_after: ''
  });

  const [screenshots, setScreenshots] = useState([]);
  const [voiceEN, setVoiceEN] = useState(null);
  const [voiceRW, setVoiceRW] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Voice recording states
  const [recordingEN, setRecordingEN] = useState(false);
  const [recordingRW, setRecordingRW] = useState(false);
  const mediaRecorderEN = useRef(null);
  const mediaRecorderRW = useRef(null);
  const audioChunksEN = useRef([]);
  const audioChunksRW = useRef([]);

  const projectTypes = [
    { id: 'website', label: 'Website' },
    { id: 'web_app', label: 'Web Application' },
    { id: 'mobile_app', label: 'Mobile App' },
    { id: 'trading_bot', label: 'Trading Bot' },
    { id: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate numeric fields to prevent overflow
    if (['clients_before', 'clients_after'].includes(name)) {
      const num = parseInt(value);
      if (value && (num < 0 || num > 999999999)) {
        setError(`${name} must be between 0 and 999,999,999`);
        return;
      }
    }
    if (['revenue_before', 'revenue_after'].includes(name)) {
      const num = parseFloat(value);
      if (value && (num < 0 || num > 999999999999)) {
        setError(`${name} must be between 0 and 999,999,999,999`);
        return;
      }
    }
    
    setError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 screenshots allowed');
      return;
    }
    setScreenshots(files);
    setError('');
  };

  const startRecording = async (lang) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        if (lang === 'en') {
          setVoiceEN(blob);
          setRecordingEN(false);
        } else {
          setVoiceRW(blob);
          setRecordingRW(false);
        }
      };

      mediaRecorder.start();

      if (lang === 'en') {
        mediaRecorderEN.current = mediaRecorder;
        audioChunksEN.current = chunks;
        setRecordingEN(true);
      } else {
        mediaRecorderRW.current = mediaRecorder;
        audioChunksRW.current = chunks;
        setRecordingRW(true);
      }
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = (lang) => {
    if (lang === 'en' && mediaRecorderEN.current) {
      mediaRecorderEN.current.stop();
      mediaRecorderEN.current.stream.getTracks().forEach(track => track.stop());
    } else if (lang === 'rw' && mediaRecorderRW.current) {
      mediaRecorderRW.current.stop();
      mediaRecorderRW.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Try to create bucket if it doesn't exist
  const ensureBucketExists = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'testimonials');
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket('testimonials', {
          public: true
        });
        if (error && !error.message.includes('already exists')) {
          console.error('Failed to create bucket:', error);
        }
      }
    } catch (err) {
      console.error('Bucket check error:', err);
    }
  };

  const uploadFile = async (file, folder) => {
    if (!file) return null;

    // Ensure bucket exists before upload
    await ensureBucketExists();

    const fileExt = file.name ? file.name.split('.').pop() : 'webm';
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('testimonials')
      .upload(filePath, file);

    if (error) {
      // If bucket doesn't exist, return a placeholder/fallback
      if (error.message.includes('Bucket not found')) {
        console.warn('Testimonials bucket not found. File will not be uploaded.');
        return null;
      }
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('testimonials')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload screenshots
      const screenshotUrls = await Promise.all(
        screenshots.map(file => uploadFile(file, 'screenshots'))
      );

      // Upload voice messages
      const voiceEnUrl = voiceEN ? await uploadFile(voiceEN, 'voice-messages') : null;
      const voiceRwUrl = voiceRW ? await uploadFile(voiceRW, 'voice-messages') : null;

      // Prepare testimonial data - safely parse numbers
      const testimonialData = {
        ...formData,
        project_screenshot: screenshotUrls[0] || null,
        project_screenshots: screenshotUrls.filter(Boolean),
        voice_message_en: voiceEnUrl,
        voice_message_rw: voiceRwUrl,
        clients_before: formData.clients_before ? Math.min(parseInt(formData.clients_before), 999999999) : null,
        clients_after: formData.clients_after ? Math.min(parseInt(formData.clients_after), 999999999) : null,
        revenue_before: formData.revenue_before ? Math.min(parseFloat(formData.revenue_before), 999999999999) : null,
        revenue_after: formData.revenue_after ? Math.min(parseFloat(formData.revenue_after), 999999999999) : null,
        status: 'pending'
      };

      const { error: insertError } = await supabase
        .from('testimonials')
        .insert([testimonialData]);

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      if (err.message.includes('Bucket not found')) {
        setError('Storage not configured. Please run the SQL in storage-bucket-testimonials.sql in your Supabase dashboard, or submit without files for now.');
      } else {
        setError('Failed to submit testimonial: ' + err.message);
      }
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition ${
              s <= step ? 'bg-blue-500' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Client Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            About You
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Name *</label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                name="client_email"
                value={formData.client_email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
                <Building className="w-4 h-4" />
                Company
              </label>
              <input
                type="text"
                name="client_company"
                value={formData.client_company}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Your Company"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                Position
              </label>
              <input
                type="text"
                name="client_position"
                value={formData.client_position}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="CEO, Founder, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
              <Star className="w-4 h-4" />
              Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className={`p-2 rounded-lg transition ${
                    star <= formData.rating
                      ? 'text-amber-400 bg-amber-500/20'
                      : 'text-gray-600 bg-slate-800'
                  }`}
                >
                  <Star className={`w-6 h-6 ${star <= formData.rating ? 'fill-amber-400' : ''}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Project Info */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            Project Details
          </h3>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Project Title *</label>
            <input
              type="text"
              name="project_title"
              value={formData.project_title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="E-commerce Platform"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Project Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {projectTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, project_type: type.id }))}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    formData.project_type === type.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Project Description</label>
            <textarea
              name="project_description"
              value={formData.project_description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="What was built? Features, scope, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
                <Link className="w-4 h-4" />
                Live Website Link
              </label>
              <input
                type="url"
                name="project_link"
                value={formData.project_link}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
                <Link className="w-4 h-4" />
                Demo Link (Optional)
              </label>
              <input
                type="url"
                name="demo_link"
                value={formData.demo_link}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://demo.example.com"
              />
            </div>
          </div>

          {/* Screenshots */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
              <ImageIcon className="w-4 h-4" />
              Project Screenshots (Max 5)
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-blue-500/50 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleScreenshotUpload}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-gray-500" />
                <span className="text-sm text-gray-400">
                  {screenshots.length > 0
                    ? `${screenshots.length} file(s) selected`
                    : 'Click to upload screenshots'}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Testimonial & Impact */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Your Testimonial & Impact
          </h3>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Your Testimonial *</label>
            <textarea
              name="testimonial_text"
              value={formData.testimonial_text}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Share your experience working with me. What did you like? What results did you see?"
            />
          </div>

          {/* Voice Messages */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voice Testimonial (Optional but powerful!)
            </h4>

            {/* English Voice */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">English Voice Message</span>
                {voiceEN && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Recorded
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => recordingEN ? stopRecording('en') : startRecording('en')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  recordingEN
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : voiceEN
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                }`}
              >
                {recordingEN ? (
                  <><MicOff className="w-4 h-4" /> Stop Recording</>
                ) : voiceEN ? (
                  <><CheckCircle className="w-4 h-4" /> Recorded ✓</>
                ) : (
                  <><Mic className="w-4 h-4" /> Record in English</>
                )}
              </button>
            </div>

            {/* Kinyarwanda Voice */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Kinyarwanda Voice Message</span>
                {voiceRW && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Recorded
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => recordingRW ? stopRecording('rw') : startRecording('rw')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  recordingRW
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : voiceRW
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {recordingRW ? (
                  <><MicOff className="w-4 h-4" /> Stop Recording</>
                ) : voiceRW ? (
                  <><CheckCircle className="w-4 h-4" /> Recorded ✓</>
                ) : (
                  <><Mic className="w-4 h-4" /> Record in Kinyarwanda</>
                )}
              </button>
            </div>
          </div>

          {/* Business Impact */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Business Impact (Optional)
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Clients Before</label>
                <input
                  type="number"
                  name="clients_before"
                  value={formData.clients_before}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Clients After</label>
                <input
                  type="number"
                  name="clients_after"
                  value={formData.clients_after}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Monthly Revenue Before ($)</label>
                <input
                  type="number"
                  name="revenue_before"
                  value={formData.revenue_before}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Monthly Revenue After ($)</label>
                <input
                  type="number"
                  name="revenue_after"
                  value={formData.revenue_after}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-slate-700">
        <button
          type="button"
          onClick={step === 1 ? onCancel : prevStep}
          className="px-6 py-2 text-gray-400 hover:text-white transition"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-5 h-5" /> Submit Testimonial</>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your testimonial will be reviewed before being published. Thank you for sharing your story!
      </p>
    </form>
  );
}
