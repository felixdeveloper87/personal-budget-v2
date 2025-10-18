# 💰 Personal Budget Management System

<div align="center">

![Personal Budget](https://img.shields.io/badge/Personal%20Budget-v2.0-blue?style=for-the-badge&logo=wallet&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**A modern, full-stack personal finance management application with advanced analytics and intuitive user experience.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-green?style=for-the-badge&logo=vercel&logoColor=white)](https://your-demo-link.com)
[![Documentation](https://img.shields.io/badge/Documentation-Complete-blue?style=for-the-badge&logo=gitbook&logoColor=white)](#documentation)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)

</div>

---

## 🚀 **Overview**

Personal Budget Management System is a comprehensive financial tracking application that empowers users to take control of their finances through intuitive interfaces, powerful analytics, and automated insights. Built with modern web technologies and containerized for seamless deployment.

### ✨ **Key Features**

- 📊 **Interactive Dashboard** - Real-time financial overview with customizable widgets
- 💳 **Transaction Management** - Easy income/expense tracking with smart categorization
- 📈 **Advanced Analytics** - Visual charts and insights for spending patterns
- 🔄 **Installment Plans** - Automated payment tracking and management
- 🔍 **Smart Search** - Advanced filtering and search capabilities
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile
- 🌙 **Dark/Light Mode** - Beautiful themes with smooth transitions
- 🔐 **Secure Authentication** - JWT-based security with role management

---

## 🛠️ **Technology Stack**

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI Framework |
| **TypeScript** | 5.6.2 | Type Safety |
| **Chakra UI** | 2.10.9 | Component Library |
| **Vite** | 5.4.8 | Build Tool |
| **Recharts** | 2.15.4 | Data Visualization |
| **Framer Motion** | 11.18.2 | Animations |
| **Axios** | 1.7.7 | HTTP Client |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Spring Boot** | 3.3.3 | Application Framework |
| **Java** | 17 | Programming Language |
| **Spring Security** | 6.x | Authentication & Authorization |
| **Spring Data JPA** | 3.x | Data Persistence |
| **PostgreSQL** | 16 | Database |
| **Maven** | 3.x | Dependency Management |

### **DevOps & Deployment**
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy & static serving |
| **VPS** | Production hosting |
| **GitHub Actions** | CI/CD (optional) |

---

## 📸 **Screenshots**

<div align="center">

### 🏠 **Dashboard Overview**
![Dashboard](docs/screenshots/dashboard.png)

### 📊 **Analytics & Charts**
![Analytics](docs/screenshots/analytics.png)

### 📱 **Mobile Responsive**
![Mobile](docs/screenshots/mobile.png)

</div>

---

## 🚀 **Quick Start**

### **Prerequisites**
- Docker & Docker Compose
- Git
- Node.js 18+ (for local development)
- Java 17+ (for local development)

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/personal-budget-v2.git
cd personal-budget-v2
```

### **2. Environment Setup**
```bash
# Copy environment template
cp env.example .env

# Edit configuration (optional for development)
nano .env
```

### **3. Start with Docker (Recommended)**
```bash
# Development environment
docker-compose -f docker-compose.dev.yml up -d

# Production environment
docker-compose -f docker-compose.prod.yml up -d
```

### **4. Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

---

## 🏗️ **Project Structure**

```
personal-budget-v2/
├── 📁 frontend/                 # React TypeScript frontend
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   ├── 📁 pages/           # Application pages
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 contexts/        # React contexts
│   │   ├── 📁 utils/           # Utility functions
│   │   └── 📁 types/           # TypeScript definitions
│   ├── 📁 public/              # Static assets
│   └── 📄 Dockerfile           # Frontend container config
├── 📁 backend/                 # Spring Boot backend
│   ├── 📁 src/main/java/       # Java source code
│   ├── 📁 src/main/resources/  # Configuration files
│   └── 📄 Dockerfile           # Backend container config
├── 📁 docs/                    # Documentation
├── 📄 docker-compose.yml       # Main orchestration
├── 📄 docker-compose.dev.yml   # Development environment
├── 📄 docker-compose.prod.yml  # Production environment
└── 📄 README.md               # This file
```

---

## 🔧 **Configuration**

### **Environment Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_NAME` | Database name | `personalbudget` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | JWT signing key | `generated` |
| `JWT_EXPIRATION` | Token expiration (ms) | `86400000` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:8080` |

### **Database Setup**
The application automatically creates the database schema on first run. For manual setup:

```sql
-- Create database
CREATE DATABASE personalbudget;

-- Run migrations (automatic in Spring Boot)
-- Check backend/src/main/resources/application.properties
```

---

## 📚 **API Documentation**

### **Authentication Endpoints**
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

### **Transaction Endpoints**
```http
GET    /api/transactions          # List transactions
POST   /api/transactions          # Create transaction
PUT    /api/transactions/{id}     # Update transaction
DELETE /api/transactions/{id}     # Delete transaction
GET    /api/transactions/search   # Search transactions
```

### **Analytics Endpoints**
```http
GET /api/analytics/summary        # Financial summary
GET /api/analytics/categories     # Category breakdown
GET /api/analytics/trends         # Spending trends
```

### **Installment Endpoints**
```http
GET    /api/installments          # List installments
POST   /api/installments          # Create installment
PUT    /api/installments/{id}     # Update installment
DELETE /api/installments/{id}     # Delete installment
```

---

## 🧪 **Testing**

### **Frontend Testing**
```bash
cd frontend
npm test                    # Run tests
npm run test:coverage       # Coverage report
npm run test:e2e           # End-to-end tests
```

### **Backend Testing**
```bash
cd backend
mvn test                    # Run unit tests
mvn test -Dtest=IntegrationTest  # Integration tests
mvn jacoco:report          # Coverage report
```

### **Docker Testing**
```bash
# Test container health
docker-compose ps

# View logs
docker-compose logs frontend
docker-compose logs backend
```

---

## 🚀 **Deployment**

### **VPS Deployment**
```bash
# 1. Clone repository on VPS
git clone https://github.com/yourusername/personal-budget-v2.git
cd personal-budget-v2

# 2. Configure environment
cp env.example .env
nano .env

# 3. Deploy production
docker-compose -f docker-compose.prod.yml up -d

# 4. Setup Nginx (optional)
sudo ./setup-nginx-vps.sh
```

### **Cloud Deployment**
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3
- **Backend**: Deploy to AWS ECS, Google Cloud Run, or DigitalOcean
- **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL)

---

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation as needed
- Follow conventional commit messages
- Ensure responsive design compatibility

---

## 📋 **Roadmap**

### **Version 2.1** (Planned)
- [ ] Budget goals and alerts
- [ ] Export to PDF/Excel
- [ ] Multi-currency support
- [ ] Advanced reporting

### **Version 2.2** (Future)
- [ ] Mobile app (React Native)
- [ ] Bank account integration
- [ ] Investment tracking
- [ ] Collaborative budgeting

---

## 🐛 **Troubleshooting**

### **Common Issues**

**Port already in use**
```bash
# Stop existing containers
docker-compose down

# Check port usage
netstat -tulpn | grep :3000
```

**Database connection failed**
```bash
# Check database container
docker-compose logs db

# Restart database
docker-compose restart db
```

**CORS errors**
```bash
# Verify API URL in frontend
echo $VITE_API_URL

# Check backend CORS configuration
```

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Author**

**Leandro** - *Full Stack Developer*

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Portfolio: [Your Portfolio](https://yourportfolio.com)

---

## 🙏 **Acknowledgments**

- [Chakra UI](https://chakra-ui.com/) for the amazing component library
- [Recharts](https://recharts.org/) for beautiful data visualizations
- [Spring Boot](https://spring.io/projects/spring-boot) for the robust backend framework
- [Docker](https://www.docker.com/) for seamless containerization

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/personal-budget-v2?style=social)](https://github.com/yourusername/personal-budget-v2)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/personal-budget-v2?style=social)](https://github.com/yourusername/personal-budget-v2)
[![GitHub watchers](https://img.shields.io/github/watchers/yourusername/personal-budget-v2?style=social)](https://github.com/yourusername/personal-budget-v2)

</div>
