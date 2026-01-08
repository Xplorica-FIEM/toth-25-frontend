# 🏆 Treasure Hunt - TOTH 25 Frontend

Modern Next.js frontend for the college treasure hunt game with QR scanning, real-time leaderboards, and admin management.

**🌐 Live App:** https://toth-25-frontend.vercel.app

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Installation & Setup](#-installation--setup)
5. [Environment Variables](#-environment-variables)
6. [Pages & Routes](#-pages--routes)
7. [Components](#-components)
8. [API Integration](#-api-integration)
9. [Vercel Deployment](#-vercel-deployment)

---

## 🎯 Features

### User Features
- ✅ **3-Step Registration Flow** - Email/Password → OTP Verification → Profile Completion
- ✅ **QR Code Scanner** - Real-time camera scanning with @zxing/browser
- ✅ **Time-Based Leaderboard** - Ranked by riddles scanned and fastest completion time
- ✅ **Dashboard** - View game progress, scanned riddles, and completion time
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Dark/Light Mode Ready** - Modern UI with Tailwind CSS 4

### Admin Features
- ✅ **Riddle Management** - Create, edit, delete riddles with order numbers
- ✅ **Meme Riddles** - Separate meme riddle system with image upload & QR generation
- ✅ **User Management** - View all users, toggle admin roles, view stats
- ✅ **Dashboard Analytics** - Overview of users, riddles, and game statistics
- ✅ **Leaderboard Filtering** - Filter rankings by department

### Technical Features
- ✅ **JWT Authentication** - Token-based auth with automatic refresh
- ✅ **Protected Routes** - Middleware for auth and profile completion checks
- ✅ **API Integration** - Clean API wrapper with error handling
- ✅ **Real-time Updates** - Automatic data refresh on scans
- ✅ **Turbopack Support** - Next.js 16 with Turbopack for faster builds

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16.0.8 (Pages Router)
- **Styling:** Tailwind CSS 4
- **QR Scanner:** @zxing/browser
- **QR Generator:** qrcode (for admin meme riddles)
- **Icons:** lucide-react
- **State Management:** Zustand + localStorage
- **HTTP Client:** Native fetch API
- **Deployment:** Vercel
- **TypeScript:** For type safety (tsconfig.json)

---

## 📁 Project Structure

```
toth-25-frontend/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── AdminLayout.jsx   # Admin panel layout wrapper
│   │   ├── ConfirmModal.jsx  # Confirmation modal component
│   │   ├── RiddleTemplate.jsx # Riddle display template
│   │   └── scan.jsx          # QR scanner component
│   │
│   ├── constants/
│   │   └── departments.js    # College departments list
│   │
│   ├── store/
│   │   └── adminStore.js     # Zustand state managemen
│   │   └── departments.js    # College departments list
│   │
│   ├── pages/
│   │   ├── _app.js           # Next.js app wrapper
│   │   ├── _document.js      # Custom document
│   │   ├── index.js          # Landing page (redirects)
│   │   ├── landing.jsx       # Main landing page
│   │   ├── login.jsx         # Login page
│   │   ├── register.jsx      # Registration (Step 1)
│   │   ├── veridashboard.jsx      # Admin dashboard overview
│   │       ├── riddles.jsx        # Riddle list management
│   │       ├── riddles/
│   │       │   ├── create.jsx     # Create/Edit riddle form
│   │       │   └── [id].jsx       # Edit riddle by ID
│   │       ├── meme-riddles.jsx   # Meme riddle management
│   │       ├── index.jsx          # Admin home (redirects)
│   │       ├── dashboard.jsx      # Admin dashboard overview
│   │       ├── riddles.jsx        # Riddle list management
│   │       ├── riddles/
│   │       │   └── create.jsx     # Create/Edit riddle form
│   │       ├── users.jsx          # User management
│   │       ├── leaderboard.jsx    # Leaderboard with filters
│   │       └── statistics.jsx     # Statistics and analytics
│   │
│   ├── styles/
│   │   └── globals.css       # Global styles + Tailwind
│   │
│   └── utils/
│       ├── api.js            # API wrapper functions
│       └── auth.js           # Auth utilities (token management)
│
├── .env.local                # Environment variables
├── next.config.mjs           # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS config
├── postcss.config.mjs        # PostCSS config
└── package.json              # Dependencies

```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+ (v20+ recommended)
- npm or yarn
- Backend API running (local or deployed)

### Step 1: Clone Repository
```bash
git clone https://github.com/saikattanti/toth-25-frontend.git
cd toth-25-frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create `.env.local` file:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
# or for production:
# NEXT_PUBLIC_BACKEND_URL=https://toth-25-backend.vercel.app
```

### Step 4: Run Development Server
```bash
npm run dev
```

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API URL (Required)
NEXT_PUBLIC_BACKEND_URL=https://toth-25-backend.vercel.app

# For local development:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## 📄 Pages & Routes

### Public Routes

| Route | Description | Purpose |
|-------|-------------|---------|
| `/` | Index Page | Redirects to landing page |
| `/landing` | Landing Page | Welcome screen with login/register options |
| `/login` | Login Page | User authentication |
| `/register` | Registration (Step 1) | Email and password setup |
| `/verifyotp` | OTP Verification (Step 2) | Email verification with 4-digit code |
| `/completeprofile` | Profile Completion (Step 3) | Full name, roll number, department |
/dashboard` | Admin Dashboard | Admin only |
| `/admin/riddles` | Riddle Management | Admin only |
| `/admin/riddles/create` | Create/Edit Riddle | Admin only |
| `/admin/riddles/[id]` | Edit Specific Riddle | Admin only |
| `/admin/meme-riddles` | Meme Riddle Management
|-------|-------------|--------------|
| `/dashboard` | User Dashboard | All users |
| `/admin` | Admin Home | Admin only (redirects to dashboard) |
| `/admin/dashboard` | Admin Dashboard | Admin only |
| `/admin/riddles` | Riddle Management | Admin only |
| `/admin/riddles/create` | Create/Edit Riddle | Admin only |
| `/admin/users` | User Management | Admin only |
| `/admin/leaderboard` | Leaderboard View | Admin only |
| `/admin/statistics` | Statistics & Analytics | Admin only |

---

## 🧩 Components

### `scan.jsx` - QR Scanner Component
**Location:** `src/components/scan.jsx`

**Features:**
- Supports both regular riddles and meme riddles (6-char alphanumeric)
- Displays riddle name, puzzle text, and order number
- Shows meme riddles in treasure hunt themed modal
- Parses riddle ID from QR codes
- Displays riddle name, puzzle text, and order number
- Shows scan timestamp
- Error handling for invalid QR codes

**Usage:**
```jsx
import QRScanner from '@/components/scan';

<QRScanner 
  onScanSuccess={(riddle) => console.log(riddle)}
  onScanError={(error) => console.error(error)}
/>
```

**API Integration:**
```javascript
// Scans QR code with riddleId
POST /api/scan
Body: { riddleId: 1 }

Response: {
  success: true,
  riddle: {
    id: 1,
    riddleName: "The Beginning",
    puzzleText: "I speak without a mouth...",
    orderNumber: 1
  },
  isFirstScan: true
}
```

### `AdminLayout.jsx` - Admin Panel Layout
**Location:** `src/components/AdminLayout.jsx`

**Features:**
- Sidebar navigation with icons
- Dashboard, Users, Riddles, Leaderboard, Statistics links
- Logout functionality
- Responsive mobile menu
- Active route highlighting

### `ProtectedRoute.jsx` - Route Protection HOC
**Location:** `src/components/ProtectedRoute.jsx`

**Features:**
- Checks if user is authenticated
- Redirects to login if no token
- Checks if profile is completed
- Admin-only route protection
- Handles loading states

**Usage:**
```jsx
import ProtectedRoute from '@/components/ProtectedRoute';

<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>
```

---

## 🔌 API Integration

### API Wrapper - `utils/api.js`

All API endpoints use the `/api` prefix for Vercel serverless compatibility.

**Base Configuration:**
```javascript
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// All requests automatically include JWT token from localStorage
Authorization: Bearer <token>
```

### Auth Endpoints

```javascript
// Register (Step 1)
POST /api/auth/register
Body: { email, password, confirmPassword }

// Verify OTP (Step 2)
POST /api/auth/verify-otp
Body: { email, otp }

// Complete Profile (Step 3)
POST /api/auth/complete-profile
Body: { email, fullName, classRollNo, phoneNumber, department }

// Login
POST /api/auth/login
Body: { email, password }

// Get Current User
GET /api/auth/me
```

### Game Endpoints

```javascript
// Scan QR Code
POST /api/scan
Body: { riddleId: 1 }

// Get Game Progress
GET /api/game/progress

// Get My Scans
GET /api/game/my-scans
```

### Leaderboard Endpoints

```javascript
// Get Leaderboard (with optional department filter)
GET /api/leaderboard?department=Computer%20Science

// Leaderboard is ranked by:
// 1. uniqueRiddles (descending)
// 2. completionTime (ascending - fastest wins)
```

### Admin Endpoints

```javascript
// Get All Riddles
GET /api/admin/riddles

// Create Riddle
POST /api/admin/riddles
Body: { riddleName, puzzleText, orderNumber }

// Update Riddle
PUT /api/admin/riddles/:id
Body: { riddleName, puzzleText, orderNumber, isActive }

// Delete Riddle
DELETE /api/admin/riddles/:id

// Get All Users
GET /api/admin/users

// Toggle Admin Status
PUT /api/admin/users/:id/toggle-admin

// Get Dashboard Stats
GET /api/admin/stats
```

---

## 🚀 Vercel Deployment

### Prerequisites
- Vercel account (free tier works)
- GitHub repository connected
- Backend API deployed

### Deployment Steps

1. **Connect Repository to Vercel**
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   In Vercel Dashboard → Project Settings → Environment Variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://toth-25-backend.vercel.app
   ```

3. **Build Settings** (Auto-detected)
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Get your live URL: `https://your-project.vercel.app`

### Automatic Deployments
- Every push to `main` branch triggers automatic deployment
- Pull requests get preview deployments
- Production deployments require approval

### Important Configuration

**next.config.mjs:**
```javascript
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},  // Required for Next.js 16
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "moduleResolution": "bundler",  // Updated for Next.js 16
    "jsx": "react-jsx"
  }
}
```

---

## 🎨 Key Changes & Updates

### Recent Updates (Dec 2024)

1. **Simplified Riddle System**
   - ❌ Removed: Encryption, points, hints, solutions
   - ✅ Added: Simple riddleName, puzzleText, orderNumber structure

2. **Time-Based Leaderboard**
   - Ranking now based on:
     - Primary: Number of unique riddles scanned (desc)
     - Secondary: Completion time in minutes (asc - fastest wins)
   - Removed points-based system

3. **API Route Updates**
   - All routes now use `/api` prefix for Vercel serverless
   - Updated from `/auth/login` → `/api/auth/login`
   - All components and pages updated accordingly

4. **QR Scanner Simplification**
   - QR codes now contain simple riddleId (e.g., `1`, `2`, `3`)
   - Removed encryption/decryption logic
   - Direct riddle access after scan

5. **Next.js 16 Compatibility**
   - Added `turbopack: {}` configuration
   - Updated TypeScript config for modern module resolution
   - Removed deprecated options

6. **UI/UX Improvements**
   - Cleaner admin interfaces
   - Real-time scan feedback
   - Responsive design optimizations

---

## 🧪 Testing & Development

### Local Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing Flow

1. **Registration Flow**
   - Register with email/password
   - Check email for OTP (4 digits)
   - Verify OTP
   - Complete profile with details

2. **Scanning Flow**
   - Login to dashboard
   - Click "Scan QR Code"
   - Allow camera permissions
   - Scan riddle QR code (riddleId: 1, 2, 3, etc.)
   - View riddle details
   - Check updated progress

3. **Admin Flow**
   - Login as admin
   - Access admin dashboard
   - Create/edit/delete riddles
   - View user statistics
   - Manage user roles

### Demo Credentials

**Admin Account:**
```
Email: admin@college.edu
Password: admin123
```

**Test Users:**
```
alice.johnson@college.edu / password123
bob.smith@college.edu / password123
```

---

## 📦 Dependencies

### Core Dependencies
```json
{
  "next": "16.0.8",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@zxing/browser": "^0.1.5",
  "lucide-react": "^0.469.0",
  "tailwindcss": "^4.0.14"
}
```

### Dev Dependencies
```json
{
  "typescript": "^5",
  "@types/node": "^20",
  "@types/react": "^19",
  "postcss": "^8",
  "eslint": "^9",
  "eslint-config-next": "^16.0.8"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is part of TOTH 25 - College Treasure Hunt Event.

---

## 🔗 Links

- **Live Frontend:** https://toth-25-frontend.vercel.app
- **Backend API:** https://toth-25-backend.vercel.app
- **Backend Repo:** https://github.com/saikattanti/toth-25-backend
- **Frontend Repo:** https://github.com/saikattanti/toth-25-frontend

---

## 💡 Support

For issues or questions:
1. Check existing GitHub issues
2. Create new issue with detailed description
3. Include screenshots if applicable

---

**Built with ❤️ for TOTH 25 College Treasure Hunt**

