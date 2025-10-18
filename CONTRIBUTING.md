# 🤝 Contributing to Personal Budget Management System

Thank you for your interest in contributing to our project! This document provides guidelines and information for contributors.

## 📋 **Table of Contents**

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Coding Standards](#coding-standards)

## 📜 **Code of Conduct**

This project follows a code of conduct that we expect all contributors to follow. Please be respectful, inclusive, and constructive in all interactions.

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Java 17+
- Docker and Docker Compose
- Git

### **Fork and Clone**
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/personal-budget-v2.git
cd personal-budget-v2

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/personal-budget-v2.git
```

## 🛠️ **Development Setup**

### **1. Environment Configuration**
```bash
# Copy environment template
cp env.example .env

# Edit configuration for development
nano .env
```

### **2. Start Development Environment**
```bash
# Using Docker (Recommended)
docker-compose -f docker-compose.dev.yml up -d

# Or run locally
# Backend
cd backend && ./mvnw spring-boot:run

# Frontend (in another terminal)
cd frontend && npm install && npm run dev
```

### **3. Verify Setup**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Database: localhost:5432

## 📝 **Contributing Guidelines**

### **Types of Contributions**
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🧪 Test additions
- 🎨 UI/UX improvements
- ⚡ Performance optimizations

### **Before You Start**
1. Check existing issues and pull requests
2. Create an issue for significant changes
3. Discuss major changes with maintainers
4. Ensure your changes align with project goals

## 🔄 **Pull Request Process**

### **1. Create a Feature Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### **2. Make Your Changes**
- Write clean, readable code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed

### **3. Commit Your Changes**
```bash
# Use conventional commit messages
git commit -m "feat: add new transaction filtering"
git commit -m "fix: resolve mobile layout issue"
git commit -m "docs: update API documentation"
```

### **4. Push and Create PR**
```bash
git push origin feature/your-feature-name
# Create pull request on GitHub
```

### **5. PR Review Process**
- Automated tests must pass
- Code review by maintainers
- Address feedback promptly
- Keep PR focused and atomic

## 🐛 **Issue Reporting**

### **Before Creating an Issue**
- Search existing issues
- Check if it's already reported
- Verify it's not a duplicate

### **Issue Template**
```markdown
**Bug Report / Feature Request**

**Description**
Clear description of the issue or feature request.

**Steps to Reproduce** (for bugs)
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. Windows 10, macOS 12]
- Browser: [e.g. Chrome 91, Firefox 89]
- Version: [e.g. 2.0.1]

**Additional Context**
Any other context about the problem.
```

## 📏 **Coding Standards**

### **Frontend (React/TypeScript)**
```typescript
// Use functional components with hooks
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<Type>(initialValue);
  
  // Custom hooks
  const { data, loading } = useCustomHook();
  
  return (
    <Box>
      {/* JSX content */}
    </Box>
  );
};

// Export as default
export default MyComponent;
```

### **Backend (Java/Spring Boot)**
```java
@RestController
@RequestMapping("/api/transactions")
@Validated
public class TransactionController {
    
    private final TransactionService transactionService;
    
    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions() {
        // Implementation
    }
}
```

### **General Guidelines**
- Use meaningful variable and function names
- Write self-documenting code
- Add comments for complex logic
- Follow existing patterns and conventions
- Keep functions small and focused

## 🧪 **Testing**

### **Frontend Testing**
```bash
cd frontend
npm test                    # Run unit tests
npm run test:coverage       # Coverage report
npm run test:e2e           # End-to-end tests
```

### **Backend Testing**
```bash
cd backend
mvn test                    # Run all tests
mvn test -Dtest=*IntegrationTest  # Integration tests only
```

### **Test Requirements**
- New features must include tests
- Bug fixes should include regression tests
- Maintain or improve test coverage
- Write meaningful test descriptions

## 📚 **Documentation**

### **Code Documentation**
- Document public APIs
- Add JSDoc comments for complex functions
- Update README for new features
- Include usage examples

### **Commit Messages**
Use conventional commit format:
```
type(scope): description

feat(auth): add JWT token refresh
fix(ui): resolve mobile layout issue
docs(api): update endpoint documentation
test(transactions): add unit tests for filtering
```

## 🔍 **Code Review Checklist**

### **For Contributors**
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log or debug code
- [ ] Performance considerations addressed

### **For Reviewers**
- [ ] Code is readable and maintainable
- [ ] Logic is correct and efficient
- [ ] Security implications considered
- [ ] UI/UX changes are appropriate
- [ ] Breaking changes documented

## 🚀 **Release Process**

### **Version Numbering**
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### **Release Steps**
1. Update version numbers
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Create GitHub release
6. Deploy to production

## 💡 **Ideas for Contributions**

### **Good First Issues**
- Fix typos in documentation
- Add missing unit tests
- Improve error messages
- Add loading states
- Optimize images

### **Advanced Contributions**
- New chart types
- Advanced filtering options
- Performance optimizations
- Security improvements
- Mobile app features

## 📞 **Getting Help**

- **GitHub Discussions**: For questions and ideas
- **Issues**: For bug reports and feature requests
- **Discord/Slack**: For real-time chat (if available)
- **Email**: For private matters

## 🎉 **Recognition**

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- GitHub contributors page

Thank you for contributing to Personal Budget Management System! 🚀
