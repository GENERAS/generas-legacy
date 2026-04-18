import { Link } from 'react-router-dom';
import { FaArrowRight, FaCode, FaChartLine, FaBriefcase } from 'react-icons/fa';

// Clean, compact Hero with name and clear value prop
const LivingHero = () => {
  return (
    <div className="relative w-full overflow-hidden bg-slate-950">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/10 to-slate-950" />
      
      {/* Content - Compact padding */}
      <div className="relative z-10 container mx-auto px-4 py-10 md:py-14">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Name - Small, elegant */}
          <p className="text-sm md:text-base text-gray-500 mb-3 tracking-wide uppercase">
            Generas Kagiraneza
          </p>
          
          {/* Big Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            Turn Your <span className="text-blue-400">Ideas</span> Into <span className="text-amber-400">Revenue</span>
          </h1>
          
          {/* Big Subheadline */}
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-400 mb-8 leading-relaxed max-w-3xl mx-auto">
            Stop struggling with unreliable developers and losing trades. 
            Get battle-tested solutions that actually grow your business.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/hire-me"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-lg"
            >
              Start Your Project <FaArrowRight className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
            </Link>
            
            <Link
              to="/service"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition font-semibold text-lg"
            >
              Get Mentorship
            </Link>
          </div>
          
          {/* Simple status row */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FaCode className="w-4 h-4 text-blue-400" style={{ width: '16px', height: '16px' }} />
              <span>Full-Stack Developer</span>
            </div>
            <div className="flex items-center gap-2">
              <FaChartLine className="w-4 h-4 text-purple-400" style={{ width: '16px', height: '16px' }} />
              <span>Crypto & Forex Trader</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBriefcase className="w-4 h-4 text-emerald-400" style={{ width: '16px', height: '16px' }} />
              <span>Entrepreneur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivingHero;
