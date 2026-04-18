# GENERAS Legacy Portfolio

A comprehensive personal portfolio and business platform built with React, Vite, and Supabase. Tracks the journey from Nursery School to Infinity as a Full-Stack Developer, Crypto & Forex Trader, and Entrepreneur.

## Features

### Core Pages
- **Home** - Landing page with hero section, stats overview, and skills matrix
- **Academic Journey** - Educational timeline and achievements
- **Projects** - Portfolio showcase with filtering and search
- **Trading Dashboard** - Real-time trading analytics with PnL charts
- **Testimonials** - Client reviews and success stories
- **Community** - Followers and supporters hub
- **Blog** - Technical articles and insights
- **Services** - Mentorship, consulting, and hiring options
- **Admin Panel** - Content management and analytics

### Technical Features
- **Code Splitting** - Lazy-loaded pages for optimal performance
- **PWA Support** - Offline functionality with service worker
- **Mobile-First** - Responsive design optimized for all devices
- **Real-time Data** - Supabase integration for live updates
- **Authentication** - Role-based access (User/Admin)
- **Optimized for Low Bandwidth** - Minimal bundle size, inline SVGs

## Tech Stack

- **Frontend**: React 19, React Router 7, Tailwind CSS 4
- **Build Tool**: Vite 8 with aggressive optimization
- **Database**: Supabase (PostgreSQL + Realtime)
- **Icons**: Inline SVG components (no external icon libraries)
- **Charts**: Recharts (lazy-loaded)
- **State**: React Context + Hooks

## Project Structure

```
src/
├── pages/              # Route components (21 pages)
│   ├── HomePage.jsx
│   ├── AcademicPage.jsx
│   ├── ProjectsPage.jsx
│   ├── TradingPage.jsx
│   ├── TestimonialsPage.jsx
│   ├── CommunityPage.jsx
│   ├── BlogPage.jsx
│   ├── ServicePage.jsx
│   ├── HiringPage.jsx
│   ├── AdminPage.jsx
│   └── ...
├── components/
│   ├── common/        # Header, Footer, Layout, WhatsAppButton
│   ├── hero/          # LivingHero component
│   ├── skills/        # SkillsMatrix component
│   ├── admin/         # Admin dashboard components
│   ├── blogs/         # Blog section components
│   ├── contact/       # Contact form
│   ├── testimonials/  # Testimonial display
│   └── trading/       # Trading charts
├── context/           # AuthContext for authentication
├── lib/               # Supabase client
└── utils/             # Helper functions
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd btcguylegacy
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start development server
```bash
npm run dev
```

5. Open http://localhost:5173

### Build for Production
```bash
npm run build
```

## Performance Optimizations

- **Code Splitting**: All pages loaded via React.lazy()
- **Manual Chunks**: Vendor libraries split into separate bundles
- **Service Worker**: Caching for offline access
- **Inline SVGs**: No external icon library dependencies
- **Lazy Loading**: Recharts only loaded when needed
- **Tree Shaking**: Dead code elimination

## Database Setup

SQL files for Supabase schema:
- `database-setup.sql` - Core tables
- `testimonials-schema.sql` - Testimonials system
- `supporters-schema-update.sql` - Supporters/followers
- `notifications-table.sql` - User notifications
- `storage-bucket-*.sql` - File storage setup

## Contact

- **Email**: generaskagiraneza@gmail.com
- **Location**: Kigali, Rwanda
- **WhatsApp**: +250 794 144 738

## License

© 2024 Kagiraneza Generas. All rights reserved.

---

*Tracking my journey from Nursery to Infinity*
