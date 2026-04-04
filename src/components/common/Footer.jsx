// import { Link } from 'react-router-dom'
// import { FaCrown, FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa'

// export default function Footer() {
//   return (
//     <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
//       {/* 3D Cube Section - Clean Solid Design */}
//       <div className="cube-container">
//         <div className="cube">
//           <div className="cube-face front">
//             <i className="fab fa-node-js"></i>
//             <h4>Backend Systems</h4>
//             <p>Node.js, APIs, Databases</p>
//           </div>
//           <div className="cube-face back">
//             <i className="fab fa-react"></i>
//             <h4>Frontend Frameworks</h4>
//             <p>React, Vue, Modern JS</p>
//           </div>
//           <div className="cube-face right">
//             <i className="fas fa-chart-line"></i>
//             <h4>Trading Algorithms</h4>
//             <p>Forex & Crypto Systems</p>
//           </div>
//           <div className="cube-face left">
//             <i className="fas fa-coins"></i>
//             <h4>Blockchain Apps</h4>
//             <p>Web3, Smart Contracts</p>
//           </div>
//           <div className="cube-face top">
//             <i className="fas fa-palette"></i>
//             <h4>UI/UX Design</h4>
//             <p>Intuitive Interfaces</p>
//           </div>
//           <div className="cube-face bottom">
//             <i className="fas fa-sync-alt"></i>
//             <h4>Integration</h4>
//             <p>Cross-Domain Solutions</p>
//           </div>
//         </div>
//       </div>

//       {/* Main Footer Content */}
//       <div className="container mx-auto px-4 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           {/* Brand Column */}
//           <div>
//             <Link to="/" className="flex items-center gap-3 mb-4">
//               <FaCrown className="text-2xl text-amber-500" />
//               <h1 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent">
//                 BTC GUY Legacy
//               </h1>
//             </Link>
//             <p className="text-gray-400 text-sm mb-4">
//               Tracking my journey from Nursery School to Infinity. Developer | Trader | Entrepreneur
//             </p>
//             <div className="flex gap-3">
//               <a href="#" className="text-gray-400 hover:text-white transition">
//                 <FaGithub size={20} />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white transition">
//                 <FaLinkedin size={20} />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white transition">
//                 <FaTwitter size={20} />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white transition">
//                 <FaEnvelope size={20} />
//               </a>
//             </div>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h3 className="font-semibold mb-4">Quick Links</h3>
//             <ul className="space-y-2 text-sm">
//               <li><Link to="/academic" className="text-gray-400 hover:text-white transition">Academic Journey</Link></li>
//               <li><Link to="/projects" className="text-gray-400 hover:text-white transition">Project Portfolio</Link></li>
//               <li><Link to="/trading" className="text-gray-400 hover:text-white transition">Trading Dashboard</Link></li>
//               <li><Link to="/community" className="text-gray-400 hover:text-white transition">Community</Link></li>
//               <li><Link to="/hire-me" className="text-gray-400 hover:text-white transition">Hire Me</Link></li>
//             </ul>
//           </div>

//           {/* Resources */}
//           <div>
//             <h3 className="font-semibold mb-4">Resources</h3>
//             <ul className="space-y-2 text-sm">
//               <li><Link to="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
//               <li><Link to="/videos" className="text-gray-400 hover:text-white transition">Videos</Link></li>
//               <li><Link to="/certificates" className="text-gray-400 hover:text-white transition">Certificates</Link></li>
//               <li><Link to="/supporters" className="text-gray-400 hover:text-white transition">Supporters</Link></li>
//               <li><Link to="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
//             </ul>
//           </div>

//           {/* Contact Info */}
//           <div>
//             <h3 className="font-semibold mb-4">Connect</h3>
//             <ul className="space-y-2 text-sm">
//               <li className="text-gray-400">Email: generaskagiraneza@gmail.com</li>
//               <li className="text-gray-400">Location: Kigali, Rwanda</li>
//               <li className="text-gray-400">Available for: Mentorship & Projects</li>
//             </ul>
//           </div>
//         </div>

//         <div className="border-t border-slate-800 mt-8 pt-8 text-center text-gray-500 text-sm">
//           <p>&copy; {new Date().getFullYear()} Kagiraneza Generas. All rights reserved.</p>
//           <p className="mt-1">Tracking my journey from Nursery to Infinity</p>
//         </div>
//       </div>

//       {/* CSS for Clean Solid Cube - No Glass, No Borders on Edges */}
//       <style>{`
//         .cube-container {
//           width: 100%;
//           height: 280px;
//           position: relative;
//           perspective: 1000px;
//           background: transparent;
//         }

//         .cube {
//           width: 180px;
//           height: 180px;
//           position: relative;
//           transform-style: preserve-3d;
//           transform: rotateX(-15deg) rotateY(-15deg);
//           animation: rotateCube 20s infinite linear;
//           margin: 0 auto;
//           top: 50px;
//         }

//         @keyframes rotateCube {
//           0% { transform: rotateX(-15deg) rotateY(0deg); }
//           100% { transform: rotateX(-15deg) rotateY(360deg); }
//         }

//         .cube-face {
//           position: absolute;
//           width: 180px;
//           height: 180px;
//           background: #1e293b;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           text-align: center;
//         }

//         .cube-face i {
//           font-size: 2.5rem;
//           margin-bottom: 12px;
//         }

//         .cube-face h4 {
//           color: white;
//           font-size: 0.9rem;
//           font-weight: 600;
//           margin-bottom: 5px;
//         }

//         .cube-face p {
//           color: #94a3b8;
//           font-size: 0.7rem;
//         }

//         .cube-face.front {
//           transform: translateZ(90px);
//           background: #1e293b;
//         }
//         .cube-face.front i { color: #00D4FF; }

//         .cube-face.back {
//           transform: rotateY(180deg) translateZ(90px);
//           background: #1e293b;
//         }
//         .cube-face.back i { color: #9D4EDD; }

//         .cube-face.right {
//           transform: rotateY(90deg) translateZ(90px);
//           background: #1e293b;
//         }
//         .cube-face.right i { color: #00FF88; }

//         .cube-face.left {
//           transform: rotateY(-90deg) translateZ(90px);
//           background: #1e293b;
//         }
//         .cube-face.left i { color: #FF6B00; }

//         .cube-face.top {
//           transform: rotateX(90deg) translateZ(90px);
//           background: #1e293b;
//         }
//         .cube-face.top i { color: #FFD700; }

//         .cube-face.bottom {
//           transform: rotateX(-90deg) translateZ(90px);
//           background: #1e293b;
//         }
//         .cube-face.bottom i { color: #FF4444; }

//         @media (max-width: 768px) {
//           .cube-container { height: 220px; }
//           .cube { width: 130px; height: 130px; top: 45px; }
//           .cube-face { width: 130px; height: 130px; }
//           .cube-face.front { transform: translateZ(65px); }
//           .cube-face.back { transform: rotateY(180deg) translateZ(65px); }
//           .cube-face.right { transform: rotateY(90deg) translateZ(65px); }
//           .cube-face.left { transform: rotateY(-90deg) translateZ(65px); }
//           .cube-face.top { transform: rotateX(90deg) translateZ(65px); }
//           .cube-face.bottom { transform: rotateX(-90deg) translateZ(65px); }
//           .cube-face i { font-size: 1.8rem !important; }
//           .cube-face h4 { font-size: 0.7rem !important; }
//           .cube-face p { font-size: 0.55rem !important; }
//         }

//         @media (max-width: 576px) {
//           .cube-container { height: 180px; }
//           .cube { width: 100px; height: 100px; top: 40px; }
//           .cube-face { width: 100px; height: 100px; }
//           .cube-face.front { transform: translateZ(50px); }
//           .cube-face.back { transform: rotateY(180deg) translateZ(50px); }
//           .cube-face.right { transform: rotateY(90deg) translateZ(50px); }
//           .cube-face.left { transform: rotateY(-90deg) translateZ(50px); }
//           .cube-face.top { transform: rotateX(90deg) translateZ(50px); }
//           .cube-face.bottom { transform: rotateX(-90deg) translateZ(50px); }
//           .cube-face i { font-size: 1.3rem !important; }
//           .cube-face h4 { font-size: 0.6rem !important; }
//           .cube-face p { font-size: 0.45rem !important; }
//         }
//       `}</style>

//       {/* Font Awesome for icons */}
//       <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
//     </footer>
//   )
// }

import { Link } from 'react-router-dom'
import { FaCrown, FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaYoutube, FaInstagram, FaTiktok, FaDiscord, FaTelegram } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Footer Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform rotate-12">
              <FaCrown className="text-3xl text-white transform -rotate-12" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent">
            GENERAS Legacy
          </h2>
          <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
            Tracking my journey from Nursery School to Infinity. Developer | Trader | Entrepreneur
          </p>
        </div>

        {/* Social Links - ALL platforms */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-110">
            <FaGithub size={20} />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110">
            <FaLinkedin size={20} />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all duration-300 hover:scale-110">
            <FaTwitter size={20} />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-110">
            <FaYoutube size={20} />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all duration-300 hover:scale-110">
            <FaInstagram size={20} />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all duration-300 hover:scale-110">
            <FaTiktok size={20} />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:scale-110">
            <FaDiscord size={20} />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-blue-400 hover:text-white transition-all duration-300 hover:scale-110">
            <FaTelegram size={20} />
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-green-600 hover:text-white transition-all duration-300 hover:scale-110">
            <FaEnvelope size={20} />
          </a>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h3 className="font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><Link to="/academic" className="text-gray-400 hover:text-blue-400 transition text-sm">Academic Journey</Link></li>
              <li><Link to="/projects" className="text-gray-400 hover:text-blue-400 transition text-sm">Project Portfolio</Link></li>
              <li><Link to="/trading" className="text-gray-400 hover:text-blue-400 transition text-sm">Trading Dashboard</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-blue-400 transition text-sm">Community</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/hire-me" className="text-gray-400 hover:text-blue-400 transition text-sm">Hire Me</Link></li>
              <li><Link to="/mentorship" className="text-gray-400 hover:text-blue-400 transition text-sm">Mentorship</Link></li>
              <li><Link to="/consulting" className="text-gray-400 hover:text-blue-400 transition text-sm">Consulting</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-blue-400 transition text-sm">Blog</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/certificates" className="text-gray-400 hover:text-blue-400 transition text-sm">Certificates</Link></li>
              <li><Link to="/supporters" className="text-gray-400 hover:text-blue-400 transition text-sm">Supporters</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-blue-400 transition text-sm">FAQ</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition text-sm">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">Email: generaskagiraneza@gmail.com</li>
              <li className="text-gray-400 text-sm">Location: Kigali, Rwanda</li>
              <li className="text-gray-400 text-sm">Available for: Mentorship & Projects</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Kagiraneza Generas. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Tracking my journey from Nursery to Infinity
          </p>
        </div>
      </div>

      {/* 3D Cube - Exactly like reference */}
      <div className="cube-container">
        <div className="cube">
          <div className="cube-face front">
            <i className="fab fa-node-js"></i>
            <h4>Backend Systems</h4>
            <p>Node.js, APIs, Databases</p>
          </div>
          <div className="cube-face back">
            <i className="fab fa-react"></i>
            <h4>Frontend Frameworks</h4>
            <p>React, Vue, Modern JS</p>
          </div>
          <div className="cube-face right">
            <i className="fas fa-chart-line"></i>
            <h4>Trading Algorithms</h4>
            <p>Forex & Crypto Systems</p>
          </div>
          <div className="cube-face left">
            <i className="fas fa-coins"></i>
            <h4>Blockchain Apps</h4>
            <p>Web3, Smart Contracts</p>
          </div>
          <div className="cube-face top">
            <i className="fas fa-palette"></i>
            <h4>UI/UX Design</h4>
            <p>Intuitive Interfaces</p>
          </div>
          <div className="cube-face bottom">
            <i className="fas fa-sync-alt"></i>
            <h4>Integration</h4>
            <p>Cross-Domain Solutions</p>
          </div>
        </div>
      </div>

      {/* CSS for Cube - Exactly from reference */}
      <style>{`
        .cube-container {
          width: 100%;
          height: 280px;
          position: relative;
          perspective: 1000px;
          background: transparent;
          margin-top: 20px;
        }

        .cube {
          width: 180px;
          height: 180px;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateX(-15deg) rotateY(-15deg);
          animation: rotateCube 20s infinite linear;
          margin: 0 auto;
          top: 50px;
        }

        @keyframes rotateCube {
          0% { transform: rotateX(-15deg) rotateY(0deg); }
          100% { transform: rotateX(-15deg) rotateY(360deg); }
        }

        .cube-face {
          position: absolute;
          width: 180px;
          height: 180px;
          background: #1e293b;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .cube-face i {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }

        .cube-face h4 {
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .cube-face p {
          color: #94a3b8;
          font-size: 0.7rem;
        }

        .cube-face.front {
          transform: translateZ(90px);
          background: #1e293b;
        }
        .cube-face.front i { color: #00D4FF; }

        .cube-face.back {
          transform: rotateY(180deg) translateZ(90px);
          background: #1e293b;
        }
        .cube-face.back i { color: #9D4EDD; }

        .cube-face.right {
          transform: rotateY(90deg) translateZ(90px);
          background: #1e293b;
        }
        .cube-face.right i { color: #00FF88; }

        .cube-face.left {
          transform: rotateY(-90deg) translateZ(90px);
          background: #1e293b;
        }
        .cube-face.left i { color: #FF6B00; }

        .cube-face.top {
          transform: rotateX(90deg) translateZ(90px);
          background: #1e293b;
        }
        .cube-face.top i { color: #FFD700; }

        .cube-face.bottom {
          transform: rotateX(-90deg) translateZ(90px);
          background: #1e293b;
        }
        .cube-face.bottom i { color: #FF4444; }

        @media (max-width: 768px) {
          .cube-container { height: 220px; }
          .cube { width: 130px; height: 130px; top: 45px; }
          .cube-face { width: 130px; height: 130px; }
          .cube-face.front { transform: translateZ(65px); }
          .cube-face.back { transform: rotateY(180deg) translateZ(65px); }
          .cube-face.right { transform: rotateY(90deg) translateZ(65px); }
          .cube-face.left { transform: rotateY(-90deg) translateZ(65px); }
          .cube-face.top { transform: rotateX(90deg) translateZ(65px); }
          .cube-face.bottom { transform: rotateX(-90deg) translateZ(65px); }
          .cube-face i { font-size: 1.8rem !important; }
          .cube-face h4 { font-size: 0.7rem !important; }
          .cube-face p { font-size: 0.55rem !important; }
        }

        @media (max-width: 576px) {
          .cube-container { height: 180px; }
          .cube { width: 100px; height: 100px; top: 40px; }
          .cube-face { width: 100px; height: 100px; }
          .cube-face.front { transform: translateZ(50px); }
          .cube-face.back { transform: rotateY(180deg) translateZ(50px); }
          .cube-face.right { transform: rotateY(90deg) translateZ(50px); }
          .cube-face.left { transform: rotateY(-90deg) translateZ(50px); }
          .cube-face.top { transform: rotateX(90deg) translateZ(50px); }
          .cube-face.bottom { transform: rotateX(-90deg) translateZ(50px); }
          .cube-face i { font-size: 1.3rem !important; }
          .cube-face h4 { font-size: 0.6rem !important; }
          .cube-face p { font-size: 0.45rem !important; }
        }
      `}</style>

      {/* Font Awesome for cube icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </footer>
  )
}