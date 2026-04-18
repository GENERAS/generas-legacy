import { useState } from 'react';
import { Send, User, Mail, Phone, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { sendContactFormConfirmation, sendAdminContactNotification } from '../../utils/emailService';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if Resend is configured
      const apiKey = import.meta.env.VITE_RESEND_API_KEY;
      
      if (!apiKey || apiKey === 'your_resend_api_key') {
        // Development mode: log to console instead of sending email
        console.log('=== CONTACT FORM SUBMISSION (localhost mode) ===');
        console.log('Name:', formData.name);
        console.log('Email:', formData.email);
        console.log('Phone:', formData.phone || 'Not provided');
        console.log('Message:', formData.message);
        console.log('================================================');
        console.log('To enable real emails, add VITE_RESEND_API_KEY to your .env file');
        
        // Simulate success for UI testing
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setLoading(false);
        return;
      }

      // Send confirmation to user
      const userResult = await sendContactFormConfirmation(formData);
      
      // Send notification to admin
      const adminResult = await sendAdminContactNotification(formData);

      if (userResult.success && adminResult.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        console.error('Email send failed:', { userResult, adminResult });
        setError('Failed to send message. Please try again or contact via WhatsApp.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl p-8 border border-slate-700 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Help is on the Way!</h3>
        <p className="text-gray-400 mb-4">
          I've got your message! Whether it's a tech problem, trading confusion, or business challenge — I'll get you an answer within 24-48 hours.
        </p>
        <p className="text-sm text-gray-500">
          A confirmation email has been sent to {formData.email || 'your email'}.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl p-6 md:p-8 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Need Help?</h2>
          <p className="text-gray-400 text-sm">Stuck on something? Tell me your problem — I'll solve it.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone (Optional)
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="+250 7XX XXX XXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            placeholder="Describe your challenge, problem, or what you need help with..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Get Help Now
            </>
          )}
        </button>
      </form>
    </div>
  );
}
