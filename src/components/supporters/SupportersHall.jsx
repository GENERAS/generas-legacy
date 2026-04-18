import { useState } from 'react';
import { 
  FaGem, FaMedal, FaTrophy, FaStar, FaInstagram, 
  FaTwitter, FaFacebook, FaLinkedin, FaGlobe, 
  FaPhone, FaTimes, FaExternalLinkAlt 
} from 'react-icons/fa';
import { usdToRwf } from '../../utils/currency';

// Prize tiers based on amount paid
const PRIZE_TIERS = {
  platinum: { 
    name: 'Platinum', 
    icon: FaGem, 
    color: 'text-purple-400', 
    bg: 'bg-purple-600/20', 
    border: 'border-purple-500',
    minAmount: 100,
    emoji: '💎'
  },
  gold: { 
    name: 'Gold', 
    icon: FaTrophy, 
    color: 'text-amber-400', 
    bg: 'bg-amber-600/20', 
    border: 'border-amber-500',
    minAmount: 51,
    emoji: '🏆'
  },
  silver: { 
    name: 'Silver', 
    icon: FaMedal, 
    color: 'text-gray-300', 
    bg: 'bg-gray-600/20', 
    border: 'border-gray-500',
    minAmount: 11,
    emoji: '🥈'
  },
  bronze: { 
    name: 'Bronze', 
    icon: FaStar, 
    color: 'text-amber-700', 
    bg: 'bg-amber-900/20', 
    border: 'border-amber-700',
    minAmount: 1,
    emoji: '⭐'
  }
};

const getTier = (amount) => {
  if (amount >= 100) return PRIZE_TIERS.platinum;
  if (amount >= 51) return PRIZE_TIERS.gold;
  if (amount >= 11) return PRIZE_TIERS.silver;
  return PRIZE_TIERS.bronze;
};

// Social link component
const SocialLink = ({ icon: Icon, url, label, color }) => {
  if (!url) return null;
  
  const getFullUrl = (platform, handle) => {
    switch(platform) {
      case 'instagram': return handle.startsWith('http') ? handle : `https://instagram.com/${handle.replace('@', '')}`;
      case 'twitter': return handle.startsWith('http') ? handle : `https://twitter.com/${handle.replace('@', '')}`;
      case 'facebook': return handle.startsWith('http') ? handle : `https://facebook.com/${handle}`;
      case 'linkedin': return handle.startsWith('http') ? handle : `https://linkedin.com/in/${handle}`;
      default: return url;
    }
  };

  const fullUrl = getFullUrl(label.toLowerCase(), url);

  return (
    <a 
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition ${color}`}
    >
      <Icon size={16} />
      <span className="text-sm">{label}</span>
      <FaExternalLinkAlt size={10} className="opacity-50" />
    </a>
  );
};

// Individual supporter card
const SupporterCard = ({ supporter, tier, onClick }) => {
  const TierIcon = tier.icon;
  
  return (
    <div 
      onClick={() => onClick(supporter)}
      className={`${tier.bg} ${tier.border} border rounded-xl p-4 cursor-pointer hover:scale-105 transition transform`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${tier.bg.replace('/20', '')}`}>
          {supporter.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold text-white">{supporter.name}</h4>
          <div className={`flex items-center gap-2 ${tier.color} mt-1`}>
            <TierIcon size={16} />
            <span className="font-semibold">{tier.name}</span>
            <span className="text-gray-400">• ${supporter.amount || supporter.cups} ({usdToRwf(supporter.amount || supporter.cups).toLocaleString()} RWF)</span>
          </div>
        </div>
      </div>
      
      {supporter.message && (
        <p className="mt-3 text-gray-300 italic text-sm pl-2 border-l-2 border-gray-600">
          "{supporter.message}"
        </p>
      )}
      
      {/* Quick social preview */}
      {(supporter.instagram || supporter.twitter || supporter.linkedin) && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {supporter.instagram && <FaInstagram className="text-pink-500" size={16} />}
          {supporter.twitter && <FaTwitter className="text-blue-400" size={16} />}
          {supporter.facebook && <FaFacebook className="text-blue-600" size={16} />}
          {supporter.linkedin && <FaLinkedin className="text-blue-500" size={16} />}
          {supporter.website && <FaGlobe className="text-green-500" size={16} />}
          {supporter.phone && <FaPhone className="text-green-500" size={16} />}
        </div>
      )}
    </div>
  );
};

// Profile Modal
const SupporterProfileModal = ({ supporter, onClose }) => {
  if (!supporter) return null;
  
  const tier = getTier(supporter.amount || supporter.cups || 1);
  const TierIcon = tier.icon;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className={`${tier.bg} ${tier.border} border rounded-2xl max-w-md w-full p-6 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 ${tier.bg.replace('/20', '')}`}>
            {supporter.name?.charAt(0) || '?'}
          </div>
          <h2 className="text-2xl font-bold text-white">{supporter.name}</h2>
          <div className={`flex items-center justify-center gap-2 ${tier.color} mt-2`}>
            <TierIcon size={20} />
            <span className="font-bold">{tier.name} Supporter</span>
          </div>
          <p className="text-gray-400 mt-1">${supporter.amount || supporter.cups} ({usdToRwf(supporter.amount || supporter.cups).toLocaleString()} RWF) donated</p>
        </div>

        {/* Message */}
        {supporter.message && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <p className="text-gray-300 italic text-center">"{supporter.message}"</p>
          </div>
        )}

        {/* Social Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide text-center">Connect</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <SocialLink 
              icon={FaInstagram} 
              url={supporter.instagram} 
              label="Instagram" 
              color="text-pink-500" 
            />
            <SocialLink 
              icon={FaTwitter} 
              url={supporter.twitter} 
              label="Twitter" 
              color="text-blue-400" 
            />
            <SocialLink 
              icon={FaFacebook} 
              url={supporter.facebook} 
              label="Facebook" 
              color="text-blue-600" 
            />
            <SocialLink 
              icon={FaLinkedin} 
              url={supporter.linkedin} 
              label="LinkedIn" 
              color="text-blue-500" 
            />
          </div>
          
          {supporter.website && (
            <a 
              href={supporter.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-green-500 transition"
            >
              <FaGlobe />
              <span>Visit Website</span>
              <FaExternalLinkAlt size={10} className="opacity-50" />
            </a>
          )}
          
          {supporter.phone && (
            <a 
              href={`tel:${supporter.phone}`}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-green-500 transition"
            >
              <FaPhone />
              <span>{supporter.phone}</span>
            </a>
          )}
        </div>

        {/* Email (if public) */}
        {supporter.email && (
          <div className="mt-4 pt-4 border-t border-slate-700 text-center">
            <a 
              href={`mailto:${supporter.email}`}
              className="text-gray-400 hover:text-white transition text-sm"
            >
              {supporter.email}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Supporters Hall Component
export default function SupportersHall({ supporters }) {
  const [selectedSupporter, setSelectedSupporter] = useState(null);

  if (supporters.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <FaTrophy className="text-5xl mx-auto mb-3 opacity-50" />
        <p>Be the first to become a supporter!</p>
      </div>
    );
  }

  // Group supporters by tier
  const platinum = supporters.filter(s => (s.amount || s.cups || 0) >= 100);
  const gold = supporters.filter(s => {
    const amt = s.amount || s.cups || 0;
    return amt >= 51 && amt < 100;
  });
  const silver = supporters.filter(s => {
    const amt = s.amount || s.cups || 0;
    return amt >= 11 && amt < 51;
  });
  const bronze = supporters.filter(s => {
    const amt = s.amount || s.cups || 0;
    return amt >= 1 && amt < 11;
  });

  const renderTier = (supportersList, tierKey) => {
    if (supportersList.length === 0) return null;
    const tier = PRIZE_TIERS[tierKey];

    return (
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-5 flex items-center gap-2">
          <span className="text-3xl">{tier.emoji}</span>
          <span className={tier.color}>{tier.name} Supporters</span>
          <span className="text-sm text-gray-500 font-normal">
            (${tier.minAmount}+)
          </span>
        </h3>
        
        <div className={`grid gap-4 ${
          tierKey === 'platinum' || tierKey === 'gold' 
            ? 'grid-cols-1 md:grid-cols-2' 
            : tierKey === 'silver' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
        }`}>
          {supportersList.map(s => (
            <SupporterCard 
              key={s.id} 
              supporter={s} 
              tier={tier}
              onClick={setSelectedSupporter}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderTier(platinum, 'platinum')}
      {renderTier(gold, 'gold')}
      {renderTier(silver, 'silver')}
      {renderTier(bronze, 'bronze')}

      <SupporterProfileModal 
        supporter={selectedSupporter}
        onClose={() => setSelectedSupporter(null)}
      />
    </div>
  );
}
