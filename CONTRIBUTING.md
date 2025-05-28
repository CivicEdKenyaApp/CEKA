# Contributing to CEKA

Thank you for your interest in contributing to CEKA! This document provides guidelines and information for contributors.

## 🌟 Welcome Contributors!

CEKA is built by and for the community. Whether you're a developer, designer, educator, civic advocate, or simply a concerned citizen, there's a place for you in our community.

---

## 🎯 Ways to Contribute

### 🔧 Technical Contributions
- **Frontend Development** - React components, UI/UX improvements
- **Backend Development** - API endpoints, database optimization
- **Mobile Development** - React Native app improvements
- **DevOps** - CI/CD, deployment, infrastructure
- **Testing** - Unit tests, integration tests, manual testing
- **Security** - Security audits, vulnerability fixes

### 🎨 Design Contributions
- **UI/UX Design** - User interface improvements
- **Visual Design** - Icons, illustrations, branding
- **Accessibility** - Making CEKA usable for everyone
- **User Research** - Understanding user needs and behaviors

### 📝 Content Contributions
- **Civic Education** - Articles, guides, educational materials
- **Translation** - Swahili translations and other Kenyan languages
- **Documentation** - Technical docs, user guides, tutorials
- **Content Review** - Fact-checking, editing, proofreading

### 🤝 Community Contributions
- **Community Management** - Discord/forum moderation
- **Outreach** - Social media, partnerships, events
- **User Support** - Helping users with questions and issues
- **Testing** - Beta testing, bug reporting, feedback

---

## 🚀 Getting Started

### Prerequisites
- **Git** - Version control
- **Node.js** (v18+) - JavaScript runtime
- **npm or yarn** - Package manager
- **Code Editor** - VS Code recommended
- **GitHub Account** - For contributing code

### Development Setup

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/CEKA.git
   cd CEKA
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   npm install
   
   # Copy environment variables
   cp .env.example .env
   
   # Start development server
   npm run dev
   ```

3. **Verify Setup**
   - Open http://localhost:5173
   - Create a test account
   - Navigate through the app

### 🌿 Branch Strategy

We use a simplified Git workflow:

```
main (production-ready code)
 ├── feature/legislative-tracker-improvements
 ├── fix/authentication-bug
 ├── docs/api-documentation
 └── content/swahili-translations
```

**Branch Naming:**
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `content/description` - Content updates
- `refactor/description` - Code refactoring

---

## 📋 Contribution Process

### 1. Find or Create an Issue
- Check [existing issues](https://github.com/CivicEdKenyaApp/CEKA/issues)
- Create a new issue if needed
- Comment on issues you'd like to work on
- Wait for assignment (to avoid duplicate work)

### 2. Create Your Branch
```bash
# Ensure you're on main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes
- Follow our [coding standards](#-coding-standards)
- Write clear, descriptive commit messages
- Test your changes thoroughly
- Update documentation if needed

### 4. Commit Your Work
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add legislative bill filtering by category

- Add dropdown filter for bill categories
- Implement category-based API endpoint
- Update UI to show active filter state
- Add tests for filtering functionality

Closes #123"
```

### 5. Push and Create Pull Request
```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference to related issues
- Screenshots for UI changes
- Testing instructions

### 6. Code Review Process
- Maintainers will review your PR
- Address feedback and requested changes
- Once approved, your code will be merged

---

## 🎨 Coding Standards

### General Principles
- **Readability** - Code should be self-documenting
- **Consistency** - Follow existing patterns
- **Performance** - Consider mobile users with slow connections
- **Accessibility** - Ensure features work for all users
- **Security** - Never commit sensitive data

### JavaScript/TypeScript
```typescript
// ✅ Good
interface BillFilter {
  category: string;
  status: 'active' | 'passed' | 'rejected';
  dateRange?: DateRange;
}

const filterBills = async (filter: BillFilter): Promise<Bill[]> => {
  try {
    const response = await api.getBills(filter);
    return response.data;
  } catch (error) {
    logger.error('Failed to filter bills:', error);
    throw new Error('Unable to fetch bills');
  }
};

// ❌ Avoid
function filterBills(f) {
  return api.getBills(f).then(r => r.data);
}
```

### React Components
```tsx
// ✅ Good - Functional component with TypeScript
interface BillCardProps {
  bill: Bill;
  onFollow: (billId: string) => void;
  isFollowed?: boolean;
}

export const BillCard: React.FC<BillCardProps> = ({ 
  bill, 
  onFollow, 
  isFollowed = false 
}) => {
  const handleFollow = useCallback(() => {
    onFollow(bill.id);
  }, [bill.id, onFollow]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {bill.title}
      </h3>
      <p className="text-gray-600 mt-2">
        {bill.summary}
      </p>
      <button
        onClick={handleFollow}
        className={`mt-4 px-4 py-2 rounded-md transition-colors ${
          isFollowed 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label={isFollowed ? 'Unfollow bill' : 'Follow bill'}
      >
        {isFollowed ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};
```

### CSS/Tailwind
- Use Tailwind utility classes consistently
- Create reusable component classes for complex styling
- Ensure responsive design (mobile-first)
- Follow accessibility guidelines (contrast, focus states)

```css
/* ✅ Good - Reusable button styles */
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md 
         hover:bg-blue-700 focus:outline-none focus:ring-2 
         focus:ring-blue-500 focus:ring-offset-2 
         disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Mobile-first responsive */
.bill-grid {
  @apply grid grid-cols-1 gap-4 
         sm:grid-cols-2 
         lg:grid-cols-3 
         xl:grid-cols-4;
}
```

---

## 🧪 Testing Guidelines

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test BillCard.test.tsx
```

### Writing Tests

**Unit Tests (Components)**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BillCard } from './BillCard';

describe('BillCard', () => {
  const mockBill = {
    id: '1',
    title: 'Test Bill',
    summary: 'A test bill for testing purposes',
    status: 'active' as const,
  };

  it('renders bill information correctly', () => {
    render(<BillCard bill={mockBill} onFollow={() => {}} />);
    
    expect(screen.getByText('Test Bill')).toBeInTheDocument();
    expect(screen.getByText('A test bill for testing purposes')).toBeInTheDocument();
  });

  it('calls onFollow when follow button is clicked', () => {
    const handleFollow = jest.fn();
    render(<BillCard bill={mockBill} onFollow={handleFollow} />);
    
    fireEvent.click(screen.getByText('Follow'));
    expect(handleFollow).toHaveBeenCalledWith('1');
  });
});
```

**API Tests**
```typescript
import request from 'supertest';
import app from '../app';

describe('Bills API', () => {
  it('should return filtered bills', async () => {
    const response = await request(app)
      .get('/api/bills')
      .query({ category: 'health' })
      .expect(200);

    expect(response.body).toHaveProperty('bills');
    expect(Array.isArray(response.body.bills)).toBe(true);
  });
});
```

---

## 📱 Mobile & Accessibility Guidelines

### Mobile-First Design
- Design for mobile screens first (320px+)
- Use responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Test on actual devices when possible
- Optimize for touch interactions (minimum 44px touch targets)

### Accessibility Requirements
- **Semantic HTML** - Use appropriate HTML elements
- **ARIA Labels** - Provide screen reader context
- **Keyboard Navigation** - Ensure all features work with keyboard
- **Color Contrast** - Meet WCAG AA standards (4.5:1)
- **Focus States** - Visible focus indicators for all interactive elements

```tsx
// ✅ Accessible component example
<button
  className="btn-primary"
  onClick={handleSubmit}
  disabled={isLoading}
  aria-label="Submit civic education feedback"
  aria-describedby="submit-help-text"
>
  {isLoading ? (
    <>
      <LoadingSpinner aria-hidden="true" />
      <span className="sr-only">Submitting...</span>
      Submit
    </>
  ) : (
    'Submit Feedback'
  )}
</button>
```

---

## 🌍 Internationalization (i18n)

### Adding Translations

CEKA supports multiple languages. To add translations:

1. **Add translation keys to language files:**
```json
// src/locales/en.json
{
  "bills": {
    "title": "Legislative Bills",
    "filter_by_category": "Filter by Category",
    "follow_bill": "Follow Bill",
    "status": {
      "active": "Active",
      "passed": "Passed",
      "rejected": "Rejected"
    }
  }
}

// src/locales/sw.json (Swahili)
{
  "bills": {
    "title": "Mswada wa Sheria",
    "filter_by_category": "Chuja kwa Kategoria",
    "follow_bill": "Fuata Mswada",
    "status": {
      "active": "Hai",
      "passed": "Imepita",
      "rejected": "Imekataliwa"
    }
  }
}
```

2. **Use translations in components:**
```tsx
import { useTranslation } from 'react-i18next';

const BillsPage = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('bills.title')}</h1>
      <select aria-label={t('bills.filter_by_category')}>
        {/* options */}
      </select>
    </div>
  );
};
```

### Translation Guidelines
- **Context Matters** - Provide context for translators
- **Gender Neutral** - Use inclusive language where possible
- **Cultural Sensitivity** - Consider cultural differences
- **Consistency** - Maintain consistent terminology

---

## 📊 Content Guidelines

### Civic Education Content
- **Accuracy** - All information must be factually correct
- **Neutrality** - Present information objectively
- **Accessibility** - Use clear, simple language
- **Sources** - Cite reliable sources
- **Updates** - Keep information current

### Content Creation Process
1. **Research** - Gather information from reliable sources
2. **Draft** - Write clear, engaging content
3. **Review** - Have content reviewed by civic experts
4. **Edit** - Revise for clarity and accuracy
5. **Translate** - Provide Swahili translations
6. **Publish** - Add to the app with proper metadata

### Fact-Checking Standards
- Use official government sources when possible
- Cross-reference with multiple reliable sources
- Include publication dates and update frequencies
- Flag outdated or disputed information

---

## 🔒 Security Guidelines

### Security Best Practices
- **Never commit secrets** - Use environment variables
- **Validate input** - Sanitize all user inputs
- **Use HTTPS** - Encrypt data in transit
- **Secure authentication** - Implement proper auth flows
- **Regular updates** - Keep dependencies current

### Reporting Security Issues
If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. Email security@ceka.app immediately
3. Include detailed description and reproduction steps
4. We'll respond within 24 hours
5. We'll work with you to fix the issue

### Common Security Pitfalls to Avoid
```typescript
// ❌ Don't do this - SQL injection risk
const query = `SELECT * FROM bills WHERE title = '${userInput}'`;

// ✅ Do this - Use parameterized queries
const bills = await Bill.find({ 
  title: { $regex: new RegExp(escapeRegex(userInput), 'i') } 
});

// ❌ Don't do this - XSS risk
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Do this - Safe rendering
<div>{sanitizedContent}</div>
```

---

## 🤝 Community Guidelines

### Code of Conduct
We are committed to providing a welcoming and inclusive experience for everyone. We expect all community members to:

- **Be respectful** - Treat others with kindness and respect
- **Be inclusive** - Welcome people of all backgrounds
- **Be constructive** - Focus on building solutions
- **Be patient** - Help others learn and grow
- **Be accountable** - Take responsibility for your actions

### Communication Channels
- **GitHub Issues** - Technical discussions and bug reports
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat and collaboration
- **Email** - Private or sensitive matters

### Conflict Resolution
If conflicts arise:
1. Try to resolve directly with the person involved
2. Contact a maintainer if direct resolution fails
3. Serious violations will be handled by the core team
4. We reserve the right to remove harmful content or ban users

---

## 🏆 Recognition

We believe in recognizing contributions to our community:

### Contributor Levels
- **First-time Contributors** - Special welcome and mentoring
- **Regular Contributors** - Listed in our contributors file
- **Core Contributors** - Recognized on our website and social media
- **Maintainers** - Trusted with review and merge privileges

### Ways We Say Thanks
- GitHub contributor recognition
- Social media shout-outs
- Conference speaking opportunities
- Reference letters for job applications
- Exclusive contributor swag

---

## 📞 Getting Help

### Before Asking for Help
1. Check the [documentation](https://docs.ceka.app)
2. Search [existing issues](https://github.com/CivicEdKenyaApp/CEKA/issues)
3. Look through [GitHub discussions](https://github.com/CivicEdKenyaApp/CEKA/discussions)

### How to Ask Good Questions
- **Be specific** - Describe exactly what you're trying to do
- **Provide context** - Share relevant code, error messages, screenshots
- **Show your work** - What have you already tried?
- **Use clear titles** - Help others understand your question quickly

### Where to Get Help
- **Technical Issues** - GitHub Issues
- **General Questions** - GitHub Discussions
- **Real-time Help** - Discord community
- **Private Matters** - Email civiceducationkenya@gmail.com

---

## 🚀 Next Steps

Ready to contribute? Here's what to do next:

1. **⭐ Star the repository** - Show your support
2. **🍴 Fork the project** - Create your own copy
3. **📋 Find an issue** - Look for "good first issue" labels
4. **💬 Introduce yourself** - Say hi in our Discord or Discussions
5. **🔧 Make your first contribution** - Start small and build up

### Good First Issues
Look for issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - We need community help
- `documentation` - Improve our docs
- `translation` - Help with Swahili content

---

## 📚 Additional Resources

### Learning Resources
- **React** - [React Documentation](https://react.dev/)
- **TypeScript** - [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **Tailwind CSS** - [Tailwind Documentation](https://tailwindcss.com/docs)
- **Testing** - [Testing Library](https://testing-library.com/)
- **Git** - [Git Handbook](https://guides.github.com/introduction/git-handbook/)

### Civic Tech Resources
- **Code for Kenya** - [codefor.co.ke](https://codefor.co.ke/)
- **Open Government Partnership** - [opengovpartnership.org](https://www.opengovpartnership.org/)
- **Civic Tech Guide** - [civictech.guide](https://civictech.guide/)

### CEKA-Specific Resources
- **Project Roadmap** - [GitHub Projects](https://github.com/CivicEdKenyaApp/CEKA/projects)
- **API Documentation** - [docs.ceka.app/api](https://docs.ceka.app/api)
- **Design System** - [docs.ceka.app/design](https://docs.ceka.app/design)

---

## 🙏 Thank You

Thank you for considering contributing to CEKA! Every contribution, no matter how small, makes a difference in empowering Kenyan citizens with civic knowledge and tools for democratic participation.

Together, we're building something bigger than code - we're building informed, engaged communities that can drive positive change.

**Welcome to the CEKA community! 🇰🇪**

---

*Last updated: May 2025*
*For questions about this guide, please [open an issue](https://github.com/CivicEdKenyaApp/CEKA/issues/new) or email civiceducationkenya@gmail.com*
