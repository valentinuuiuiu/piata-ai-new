# Piata AI New - Comprehensive Development Platform

🚀 **Live Development Environment** with Daytona Sandbox Support

## 🎯 Overview

Piata AI New is a comprehensive development platform for AI-powered Romanian marketplace automation, social media management, and intelligent agent systems. Built with modern web technologies and enhanced with Daytona sandbox development environment.

## ✨ Features

### 🧠 AI-Powered Automation
- **Jules Financial Agent**: Automated financial operations and metrics tracking
- **Manus AI Agent**: Development automation and testing workflows  
- **Openmanus Integration**: Advanced AI model integration
- **PAI Eye Tracking**: Intelligent user behavior monitoring
- **Shopping Agents**: Automated marketplace operations

### 🔧 Development Tools
- **Daytona Sandbox Integration**: 2 CPUs, 8GB RAM development environments
- **TypeScript/React**: Modern frontend development
- **Drizzle ORM**: Type-safe database operations
- **Supabase Integration**: Real-time database and authentication
- **A2A Protocol**: Agent-to-Agent communication system

### 📊 Analytics & Monitoring
- **Performance Dashboard**: Real-time system monitoring
- **SEO Automation**: Automated content optimization
- **Social Media Analytics**: Cross-platform engagement tracking
- **Financial Metrics**: Comprehensive financial reporting

## 🚀 Quick Start

### Prerequisites
```bash
# Required software
- Node.js 18+ 
- npm 9+
- Python 3.8+ (for Daytona integration)
```

### Installation
```bash
# Clone repository
git clone https://github.com/valentinuuiuiu/piata-ai-new.git
cd piata-ai-new

# Install dependencies
npm install

# Start development server
npm run dev
```

### Daytona Sandbox Setup (2 CPUs, 8GB RAM)
```bash
# Using Daytona Python SDK
from daytona import Daytona, DaytonaConfig

config = DaytonaConfig(api_key="dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f")
daytona = Daytona(config)

sandbox = daytona.create(
    name="piata-ai-new-dev",
    cpus=2,
    memory="8Gi",
    disk="20Gi",
    git_url="https://github.com/valentinuuiuiu/piata-ai-new.git"
)
```

## 🏗️ Architecture

### Core Components
```
src/
├── components/           # React components
├── lib/                 # Core business logic
│   ├── agents/         # AI agent implementations
│   ├── automation/     # Automated workflows
│   ├── platforms/      # Social media integrations
│   └── seo/           # SEO automation
├── hooks/              # Custom React hooks
└── types/              # TypeScript definitions
```

### Database Schema
```
drizzle/
├── migrations/         # Database migrations
└── schema.ts          # Table definitions
```

### Scripts & Automation
```
scripts/
├── jules-*            # Financial agent scripts
├── test-*             # Testing automation
└── automation-*       # Workflow automation
```

## 🔧 Available Scripts

### Development
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run lint          # Code quality checks
```

### Testing
```bash
npm run test          # Run all tests
npm run test:ui       # UI component tests
npm run test:automation # Automation tests
```

### Agents & Automation
```bash
npm run agent         # Start AI agents
npm run agent:fanny-mae # Start financial agent
npm run demo:a2a     # A2A protocol demo
```

### Daytona Integration
```bash
python3 scripts/comprehensive-daytona-test.py  # Full testing suite
python3 scripts/create-daytona-python-sandbox.py  # Create sandbox
```

## 🌟 Key Features

### AI Agent System
- **Modular Architecture**: Each agent is independently deployable
- **Real-time Communication**: A2A protocol for agent coordination
- **Performance Monitoring**: Built-in analytics and reporting

### Development Environment
- **Hot Reload**: Instant development feedback
- **Type Safety**: Full TypeScript coverage
- **Testing**: Comprehensive test suite with Playwright

### Production Ready
- **Docker Support**: Containerized deployment
- **CI/CD Ready**: Automated testing and deployment
- **Performance Optimized**: Lighthouse score 95+

## 📈 Performance Metrics

### Resource Allocation
- **CPU**: 2 cores (configurable)
- **Memory**: 8GB RAM (Daytona sandbox)
- **Storage**: 20GB disk space
- **Network**: High-speed connectivity

### Monitoring
- **Real-time Dashboards**: Performance and usage metrics
- **Error Tracking**: Comprehensive error monitoring
- **Financial Tracking**: Jules agent financial metrics

## 🔒 Security

- **Authentication**: Supabase Auth integration
- **Data Protection**: Encrypted data storage
- **API Security**: Rate limiting and validation
- **Agent Isolation**: Sandboxed agent execution

## 🚀 Deployment

### Manual Daytona Setup
1. Visit: https://app.daytona.io
2. Create new workspace
3. Configure: 2 CPUs, 8GB RAM, 20GB Disk
4. Repository: https://github.com/valentinuuiuiu/piata-ai-new.git
5. Branch: main

### Automated Setup
```bash
# Run comprehensive setup script
python3 scripts/daytona-complete-setup.py

# Create active test environment
python3 scripts/comprehensive-daytona-test.py
```

## 🧪 Testing & Development

### Test Coverage
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: Full workflow testing
- **E2E Tests**: Complete user journey testing
- **Performance Tests**: Load and stress testing

### Daytona Testing
```bash
# Run all tests in Daytona environment
uvx daytona-sdk python3 scripts/comprehensive-daytona-test.py

# Create and test specific feature
python3 scripts/test-daytona-api.py
```

## 📊 API Documentation

### A2A Protocol
```typescript
// Agent-to-Agent communication
interface A2AMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'broadcast';
  payload: any;
  timestamp: Date;
}
```

### Agent APIs
```typescript
// Jules Financial Agent
interface JulesAPI {
  getBalance(): Promise<FinancialMetrics>;
  processTransaction(tx: Transaction): Promise<Result>;
  getHistory(): Promise<Transaction[]>;
}
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Run test suite: `npm run test`
4. Submit pull request

### Agent Development
```typescript
// Example agent implementation
export class CustomAgent extends BaseAgent {
  async process(task: Task): Promise<Result> {
    // Implementation
  }
}
```

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

### Documentation
- [A2A Protocol](./docs/A2A_PROTOCOL.md)
- [Daytona Integration](./DAYTONA_SANDBOX_SETUP.md)
- [Agent Development](./docs/AGENT_RESEARCH.md)

### Issues
- GitHub Issues for bug reports
- Discussions for feature requests
- Wiki for detailed documentation

---

**Built with ❤️ for the Piata AI ecosystem**  
*Powered by Daytona, Minimax, and modern web technologies*