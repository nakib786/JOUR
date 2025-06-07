# 🌸 Kahani Roz — A Story Every Day

**Kahani Roz** is a beautiful, modern storytelling platform built with **Next.js** and **Firebase**, where people can share inspiring, raw, real-life journal entries. Viewers can anonymously react, comment, and filter through daily stories that reflect hope, struggle, and truth.

![Kahani Roz Preview](https://via.placeholder.com/800x400/f43f5e/ffffff?text=Kahani+Roz+-+A+Story+Every+Day)

## 🏗️ Architecture

**Hybrid Deployment Strategy (100% Free):**
- **Frontend**: Vercel/Netlify (Free hosting - 100GB bandwidth/month)
- **Database**: Firebase Firestore (Free tier - 50K reads, 20K writes/day)
- **Authentication**: Firebase Auth (Free tier - unlimited users)
- **API Routes**: Serverless functions (Free tier - 100GB-hours/month)

**💰 Total Cost: $0/month** for most applications!

## ✨ Features

### 🔍 Frontend (User-Facing)
- 📜 **Latest Journal Feed** — Displays most recent entries first with beautiful card layouts
- 📅 **Date Range Filter** — Search journal entries by any custom date range
- 🏷️ **Tag Filter** — Filter stories by hashtags like `#healing`, `#hope`, `#growth`
- 🔍 **Smart Search** — Search by title, content, or tags with real-time filtering
- 💬 **Anonymous Commenting** — Anyone can leave supportive comments without logging in
- ❤️ **Reactions** — Like, Hug, Support buttons on each post with real-time counts
- 🌗 **Dark Mode Support** — Beautiful dark/light theme toggle with system preference detection
- 📲 **Fully Responsive** — Optimized for mobile, tablet, and desktop experiences
- 🎨 **Modern UI** — Clean, accessible design with smooth animations and gradients

### 🔐 Backend (Admin-Facing)
- ✍️ **Post Story** — Rich text editor with live preview for creating journal entries
- 🎭 **Mood Tracking** — Select and display current emotional state with each post
- 🏷️ **Tag Management** — Easy hashtag system for categorizing stories
- 👀 **Live Preview** — See exactly how your story will look before publishing
- 📊 **Analytics Ready** — Built-in structure for tracking engagement and reach

## 🚀 Quick Deploy

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=.next
```

### Option 3: Use Deploy Scripts
```bash
# For Vercel
chmod +x deploy-vercel.sh
./deploy-vercel.sh

# For Netlify
chmod +x deploy-netlify.sh
./deploy-netlify.sh
```

## 🛠️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/kahani-roz.git
   cd kahani-roz
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Create a Firebase project
   - Enable Firestore and Authentication
   - Copy your config to `.env.local`

4. **Environment Variables** (`.env.local`):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
kahani-roz/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # Reusable UI components
│   │   ├── Navigation.tsx  # Main navigation
│   │   ├── PostCard.tsx    # Story card component
│   │   └── FilterPanel.tsx # Filtering interface
│   ├── lib/               # Utilities and configurations
│   │   └── firebase.ts    # Firebase setup
│   └── types/             # TypeScript type definitions
│       └── index.ts       # Main types
├── public/                # Static assets
└── PROJECT_CHECKLIST.md  # Development progress tracker
```

## 🎨 Key Components

### PostCard
Interactive story cards featuring:
- Mood indicators with color coding
- Reaction buttons (Like, Hug, Support)
- Expandable comment sections
- Hashtag highlighting
- Responsive design

### FilterPanel
Advanced filtering system with:
- Real-time search
- Tag-based filtering
- Date range selection
- Quick filter presets
- Clear all functionality

### Navigation
Beautiful header featuring:
- Animated logo with gradient text
- Dark mode toggle
- Responsive mobile menu
- Smooth scroll effects

## 🔮 Firestore Data Structure

```javascript
// Posts Collection
posts: {
  postId: {
    title: string,
    content: string,
    date: timestamp,
    tags: array<string>,
    reactions: {
      like: number,
      hug: number,
      support: number
    },
    mood: string,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

// Comments Subcollection
posts/{postId}/comments: {
  commentId: {
    text: string,
    createdAt: timestamp,
    ipHash: string // for spam prevention
  }
}
```

## 🎯 Current Status

✅ **Phase 1**: Project Setup & Infrastructure  
✅ **Phase 2**: Core Frontend Components  
🚧 **Phase 3**: Authentication & Admin Features (In Progress)  
⏳ **Phase 4**: Data Management & Features  
⏳ **Phase 5**: Polish & Deployment  

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the power of storytelling and human connection
- Built with love for those who need a safe space to share their journey
- Special thanks to the mental health community for their courage in sharing

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check our [FAQ](docs/FAQ.md)
- Join our community discussions

---

**Remember**: Every story matters. Every voice deserves to be heard. 💙

Made with ❤️ for the storytelling community
