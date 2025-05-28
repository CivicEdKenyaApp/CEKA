# 🇰🇪 CEKA – Civic Education Kenya App

**CEKA** (Civic Education Kenya App) is a community-led open-source platform built to bridge the civic knowledge gap and empower Kenyan citizens with accessible, accurate, and engaging civic education.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-❤️-red.svg)](https://github.com/CivicEdKenyaApp/CEKA)
[![Community Driven](https://img.shields.io/badge/Community-Driven-green.svg)](#-contributing)

---

## 🌍 Why CEKA?

CEKA is a civic tech project built **for the people, by the people**. In a democracy, informed citizens are empowered citizens. We aim to:

- **Bridge Knowledge Gaps** - Make civic education accessible, engaging, and easy to understand
- **Promote Transparency** - Provide clear, verified information about governance and civic processes  
- **Inspire Action** - Connect citizens with tools and opportunities for meaningful civic participation
- **Foster Community** - Create spaces for constructive civic dialogue and collaboration
- **Enable Global Impact** - Serve as a template for civic education initiatives worldwide

### 🎯 Core Features

- **📊 Legislative Tracker** - Follow bills, laws, and legislative processes with AI-powered summaries
- **📚 Resource Hub** - Access civic education materials, articles, and interactive content
- **🤝 Community Portal** - Engage in discussions and connect with like-minded citizens
- **🎓 Interactive Learning** - Take quizzes and track your civic knowledge progress
- **🌐 Multilingual Support** - Available in English and Swahili
- **📱 Offline Access** - Download resources for use without internet connectivity
- **🔍 Anonymous Contributions** - Submit legislative insights and resources for community benefit

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/CivicEdKenyaApp/CEKA.git
cd CEKA
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Copy the example environment file and add your configuration:
```bash
cp .env.example .env
```

Update `.env` with your credentials:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API (for AI features)
VITE_OPENAI_API_KEY=your_openai_api_key

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string
```

> 🔐 **Security Note**: Never commit your `.env` file. It's already included in `.gitignore`.

### 4. Run the Development Server
```bash
npm run dev
```

Your app should be running at [http://localhost:5173](http://localhost:5173)

### 5. Build for Production
```bash
npm run build
```

---

## 🧠 Technology Stack

### Frontend
- **[React 18](https://react.dev/)** - Modern UI library with hooks and concurrent features
- **[Next.js](https://nextjs.org/)** - Full-stack React framework with SSR/SSG
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vite](https://vitejs.dev/)** - Fast build tool and development server

### Backend
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment
- **[Express.js](https://expressjs.com/)** - Web application framework
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database for flexible data storage
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling

### AI & Services
- **[OpenAI API](https://openai.com/api/)** - Content summarization and categorization
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service for authentication and real-time features

### Deployment
- **[Vercel](https://vercel.com/)** - Frontend hosting with edge functions
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Cloud database hosting
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD pipeline

---

## 🛠️ Contributing

We welcome all collaborators — **developers, designers, educators, civic advocates, and citizens**! CEKA thrives on community contributions.

### How to Contribute

1. **Fork the repository**
   ```bash
   git fork https://github.com/CivicEdKenyaApp/CEKA.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow our [coding standards](CONTRIBUTING.md#coding-standards)
   - Write clear commit messages
   - Add tests for new features

4. **Test your changes**
   ```bash
   npm run test
   npm run lint
   ```

5. **Submit a pull request**
   - Provide a clear description of your changes
   - Reference any related issues
   - Include screenshots for UI changes

### 🎯 Areas Where We Need Help

- **🔧 Development** - Frontend components, backend APIs, database optimization
- **🎨 Design** - UI/UX improvements, accessibility enhancements
- **📝 Content** - Civic education materials, translations (Swahili, other Kenyan languages)
- **🧪 Testing** - Manual testing, automated test writing
- **📚 Documentation** - API docs, user guides, contribution guidelines
- **🌍 Localization** - Translation and cultural adaptation

### 📋 Contributor Guidelines

- **Code of Conduct**: Be respectful, inclusive, and constructive
- **Quality Standards**: Write clean, well-documented, and tested code
- **Civic Mission**: Ensure contributions align with civic education goals
- **Accessibility**: Make features usable by people of all abilities
- **Mobile-First**: Prioritize mobile experience for Kenyan users

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📦 Deployment

CEKA is designed for easy deployment across multiple platforms:

### Frontend Deployment
- **[Vercel](https://vercel.com/)** (Recommended)
- **[Netlify](https://netlify.com/)**
- **[GitHub Pages](https://pages.github.com/)**

### Backend Deployment
- **[Railway](https://railway.app/)**
- **[Heroku](https://heroku.com/)**
- **[AWS](https://aws.amazon.com/)**

### Database
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** (Recommended)
- **[Supabase](https://supabase.com/)**

See our [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

---

## 📊 Project Structure

```
CEKA/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper functions
│   ├── services/           # API and external services
│   └── types/              # TypeScript type definitions
├── server/
│   ├── routes/             # API endpoints
│   ├── models/             # Database models
│   ├── middleware/         # Express middleware
│   └── services/           # Server-side services
├── public/                 # Static assets
├── docs/                   # Documentation
└── tests/                  # Test files
```

---

## 🔒 Security & Privacy

CEKA takes user privacy and security seriously:

- **🔐 Secure Authentication** - JWT-based authentication with secure password hashing
- **🛡️ Data Protection** - User data is encrypted and stored securely
- **👤 Anonymous Contributions** - Users can contribute without revealing identity
- **🔍 Content Moderation** - AI-powered moderation with human oversight
- **📊 Privacy-First Analytics** - No personal data tracking or sharing

For security issues, please email: [security@ceka.app](mailto:security@ceka.app)

---

## 🌐 Community & Support

### Get Help
- **📖 Documentation**: [docs.ceka.app](https://docs.ceka.app)
- **💬 Discussions**: [GitHub Discussions](https://github.com/CivicEdKenyaApp/CEKA/discussions)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/CivicEdKenyaApp/CEKA/issues)
- **📧 Email**: [civiceducationkenya@gmail.com](mailto:civiceducationkenya@gmail.com)

### Stay Connected
- **📱 Instagram**: [@civiceducationke](https://instagram.com/civiceducationke)
- **🐦 Twitter**: [@CEKAApp](https://twitter.com/CEKAApp)
- **💼 LinkedIn**: [CEKA Project](https://linkedin.com/company/ceka-app)

### Support the Project
CEKA is entirely community-funded. Your support helps us:
- Maintain servers and infrastructure
- Develop new features
- Create educational content
- Support community events

**[☕ Buy Me A Coffee](https://ko-fi.com/civiceducationkenya)** | **[💝 GitHub Sponsors](https://github.com/sponsors/CivicEdKenyaApp)**

> Every contribution, no matter how small, makes a difference! 🙏

---

## 📄 License & Legal

### Open Source License
This project is licensed under the **[MIT License](LICENSE)** - see the LICENSE file for details.

**What this means:**
- ✅ **Commercial Use** - Use CEKA in commercial projects
- ✅ **Modification** - Modify and adapt the code
- ✅ **Distribution** - Share and redistribute freely
- ✅ **Private Use** - Use for private/internal projects
- ✅ **Patent Grant** - Protection from patent claims

**Requirements:**
- 📄 **License Notice** - Include the MIT license in distributions
- 📝 **Copyright Notice** - Credit the original authors

### Content Licensing
Educational content is licensed under **[Creative Commons CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)**

### Trademark
"CEKA" and the CEKA logo are trademarks of the CEKA Project. See [TRADEMARK.md](TRADEMARK.md) for usage guidelines.

---

## 🗺️ Roadmap

### Phase 1: Core Platform (Q2 2025) ✅
- [x] Basic legislative tracker
- [x] Resource hub with offline access
- [x] User authentication
- [x] Mobile-responsive design

### Phase 2: AI Integration (Q3 2025) 🚧
- [ ] AI-powered content summarization
- [ ] Anonymous contribution processing
- [ ] Personalized content recommendations
- [ ] Automated content categorization

### Phase 3: Community Features (Q4 2025) 📅
- [ ] Discussion forums
- [ ] Petition and campaign tools
- [ ] Volunteer opportunity matching
- [ ] Event management system

### Phase 4: Scale & Impact (2026) 🚀
- [ ] Multi-country adaptation
- [ ] Advanced analytics dashboard
- [ ] Government partnership integrations
- [ ] Educational institution partnerships

See our [detailed roadmap](https://github.com/CivicEdKenyaApp/CEKA/projects) for specific milestones and progress.

---

## 🙏 Acknowledgments

CEKA exists thanks to the contributions of:

- **👥 Contributors** - Developers, designers, and civic advocates who build CEKA
- **🏛️ Civic Organizations** - Partners who provide expertise and guidance
- **🎓 Educational Institutions** - Schools and universities that use and improve CEKA
- **💰 Supporters** - Individuals and organizations that fund development
- **🇰🇪 Kenyan Citizens** - The community that CEKA serves and learns from

### Special Thanks
- Open source communities that inspire civic technology
- Democracy and transparency advocates worldwide
- The next generation of Kenyan civic leaders

---

## 📈 Impact Metrics

Since launch, CEKA has:
- 📊 **X,XXX Active Users** across Kenya
- 📚 **XXX Civic Resources** in our database  
- 🏛️ **XXX Bills Tracked** in our legislative tracker
- 🤝 **XXX Community Contributions** from citizens
- 🌍 **XX Countries** exploring CEKA adaptation

*Updated monthly - see [impact dashboard](https://ceka.app/impact) for real-time metrics.*

---

<div align="center">

**Built with ❤️ for Kenya and democracy worldwide**

[🌟 Star this repo](https://github.com/CivicEdKenyaApp/CEKA) | [🍴 Fork for your country](https://github.com/CivicEdKenyaApp/CEKA/fork) | [📧 Get in touch](mailto:civiceducationkenya@gmail.com)

---

*"The best way to predict the future is to create it." - Peter Drucker*

</div>
