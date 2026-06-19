# 🎓 EduAgent AI

> **"Your impact is human. Let us handle the data."**
>
> EduAgent is a next-generation AI co-pilot for teachers. It manages operational noise, reads classroom energy, suggests local analogies, and handles real-time translations—allowing educators to lead classrooms with confidence, connection, and heart.

---

## ✨ Features

- 🎙️ **Live Classroom Companion ("Jarvis for Teachers")**
  - **Class Energy Analytics**: Real-time tracking of student engagement (e.g., alert when energy drops).
  - **Local Analogy Generator**: Suggests localized analogies on-the-fly (e.g., comparing Mitochondria to a city's power plant).
  - **Multilingual Support**: Real-time suggestion to switch language context based on student needs (e.g., transition to Hindi).
  - **Attention Recovery**: Prompts attention-grabbing actions like quick polls or movement breaks.

- 🎥 **Virtual Classrooms (LiveKit Integration)**
  - Powered by **LiveKit WebRTC**, offering crystal-clear video & audio.
  - Multi-party video grid, participant tiles, and active speaker highlighting.
  - Integrated live classroom chat for real-time questions and feedback.
  - Admin/Teacher roles equipped with room moderation permissions.

- 📊 **Session History & AI Insights**
  - Complete list of past meeting archives.
  - Overall engagement metrics and average classroom scores.
  - Detailed student-level logs (e.g., "Emily Watson demonstrated full mastery of factoring").
  - AI-generated summaries and personalized homework/assignment recommendations.

- 🔒 **Secure Workspace Portal**
  - Interactive dashboard to create, join, and manage classroom sessions.
  - Firebase Authentication supporting email/password registration and Google Sign-in.
  - Dual Mode fallback: Runs in mock mode if Firebase keys are missing, allowing zero-setup local exploration.

---

## 🎨 Theme & Visual Identity

EduAgent features a premium, state-of-the-art dark design system built with custom glassmorphism and smooth micro-animations.

- **Background & Deep Colors**: `#121318` & `#090A0F` (Dark night aesthetic)
- **Signature Gradient**: Linear sweep of `#A07CFE` (Amethyst) ➔ `#FE8495` (Soft Rose) ➔ `#FFD270` (Amber Gold)
- **Primary & Secondary Accents**: `#cfbcff` (Soft lavender) & `#ffb2ba` (Soft salmon)
- **UI Elements**: Glassmorphic cards (`glass-card`) utilizing backdrop blur (`24px`), glowing outlines, hover lift effects, and pulsing states.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (utilizing React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS for animations
- **Real-Time Video**: [LiveKit React SDK](https://livekit.io/) & `livekit-server-sdk`
- **Database & Auth**: [Firebase v12](https://firebase.google.com/) (Auth, Firestore)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & CSS keyframes

---

## 📁 Project Structure

```text
edutech/
├── app/
│   ├── api/
│   │   └── livekit/token/route.ts  # LiveKit JWT Token generator
│   ├── classroom/
│   │   └── [roomId]/page.tsx      # Video room and WebRTC session
│   ├── components/
│   │   ├── ui/                    # Shared styling primitives
│   │   ├── AuthModal.tsx          # Login & Signup handler
│   │   ├── HeroSection.tsx        # Responsive landing page layout
│   │   ├── LiveClassroomSection.tsx # Teacher co-pilot feed view
│   │   ├── VideoRoom.tsx          # Multi-party LiveKit component
│   │   └── ...                    # Section-specific components
│   ├── context/
│   │   └── AuthContext.tsx        # Firebase auth state provider
│   ├── dashboard/
│   │   └── page.tsx               # Main teacher control workspace
│   ├── profile/
│   │   └── page.tsx               # Session archives & analytics
│   ├── globals.css                # Tailwind v4 directives & animations
│   └── page.tsx                   # Landing page
├── Firebaseconfig.ts              # Firebase Client SDK initializer
├── next.config.ts                 # Next.js configurations
├── package.json                   # Project dependencies & scripts
└── tsconfig.json                  # TypeScript configurations
```

---

## 🚀 Getting Started

Follow these steps to set up and run EduAgent locally.

### 1. Prerequisites
- **Node.js**: `v18+` or `v20+` recommended.
- **Firebase Project**: Set up a Firebase project and enable Authentication (Email & Google) and Cloud Firestore.
- **LiveKit Cloud or Self-Hosted Instance**: Obtain a LiveKit server URL, API key, and Secret.

### 2. Environment Configuration
Create a `.env` file in the root directory (or update the existing one) with the following variables:

```env
# Firebase Client Configurations
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your_measurement_id"

# LiveKit Server & Client Configurations
LIVEKIT_URL="wss://your-livekit-project.livekit.cloud"
LIVEKIT_API_KEY="your_livekit_api_key"
LIVEKIT_API_SECRET="your_livekit_api_secret"
NEXT_PUBLIC_LIVEKIT_URL="wss://your-livekit-project.livekit.cloud"
```

> [!NOTE]
> **Developer Mock Mode:** If Firebase configurations are omitted from the `.env` file, the application automatically enters **Developer Mode**, mimicking database operations and authentications in `localStorage`. This allows developers to explore the UI immediately.

### 3. Installation
Install the project dependencies using `npm`:

```bash
npm install
```

### 4. Running the Development Server
Start the Next.js development server:

```bash
npm run dev
```

The application will be running on [http://localhost:8000](http://localhost:8000).

### 5. Building for Production
To build an optimized bundle for production:

```bash
npm run build
npm run start
```

---

## 📝 License

This project is private and proprietary. All rights reserved.
