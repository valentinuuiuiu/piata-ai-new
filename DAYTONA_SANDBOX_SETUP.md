# Daytona Sandbox Setup: 2 CPUs, 8GB RAM

## Overview
This guide provides instructions for creating a Daytona sandbox with 2 CPUs and 8GB RAM using your Daytona API credentials.

## API Configuration

### Credentials
```bash
DAYTONA_API_KEY=dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f
DAYTONA_BASE_URL=https://app.daytona.io/api
```

### Target Configuration
- **CPUs**: 2
- **Memory**: 8GB (8Gi)
- **Disk**: 20GB (20Gi)
- **Repository**: https://github.com/valentinuuiuiu/piata-ai-new.git
- **Branch**: main

## Method 1: Manual Setup (Recommended)

Since the API is currently returning 404 errors, here's the manual setup process:

### Step 1: Access Daytona Dashboard
1. Visit: https://app.daytona.io
2. Log in with your Daytona account
3. Navigate to "Workspaces" or "Create New"

### Step 2: Configure Workspace
1. **Workspace Name**: `piata-ai-sandbox-2cpu-8gb`
2. **Repository**: `https://github.com/valentinuuiuiu/piata-ai-new.git`
3. **Branch**: `main`
4. **Resources**:
   - **CPUs**: 2
   - **Memory**: 8GB (8Gi)
   - **Disk**: 20GB (20Gi)
5. **Timeout**: 24 hours (or your preferred duration)

### Step 3: Create and Connect
1. Click "Create Workspace"
2. Wait for workspace to initialize (usually 30-60 seconds)
3. Once ready, you'll see a workspace URL
4. Click the URL to connect to your sandbox

## Method 2: API Setup (When Available)

### API Request Format
```bash
curl -X POST "https://app.daytona.io/api/workspaces" \
  -H "Authorization: Bearer dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "piata-ai-sandbox-2cpu-8gb",
    "gitUrl": "https://github.com/valentinuuiuiu/piata-ai-new.git",
    "branch": "main",
    "resources": {
      "cpus": 2,
      "memory": "8Gi",
      "disk": "20Gi"
    }
  }'
```

### Expected Response
```json
{
  "id": "ws_xxxxxxxxxxxxx",
  "name": "piata-ai-sandbox-2cpu-8gb",
  "status": "running",
  "url": "https://app.daytona.io/ws/ws_xxxxxxxxxxxxx",
  "resources": {
    "cpus": 2,
    "memory": "8Gi",
    "disk": "20Gi"
  }
}
```

## Workspace Usage

### Verification Commands
```bash
# Check CPU count
cat /proc/cpuinfo | grep processor | wc -l
# Expected output: 2

# Check memory
free -h
# Expected output: ~8Gi total memory

# Check disk space
df -h
# Expected output: ~20Gi disk space

# List system info
lscpu | grep -E "(CPU\(s\)|Model name)"
```

### Development Setup
```bash
# Clone or navigate to repository
cd /workspace  # or your preferred directory

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build project
npm run build
```

### Resource Management
```bash
# Monitor CPU usage
top -b -n 1 | grep "Cpu(s)"

# Monitor memory usage
free -h

# Monitor disk usage
df -h

# Check running processes
ps aux --sort=-%mem | head -10
```

## Troubleshooting

### Common Issues
1. **404 API Errors**: Endpoint structure may have changed
2. **Authentication Failed**: Check API key validity
3. **Resource Limits**: Verify your Daytona plan supports requested resources
4. **Repository Access**: Ensure GitHub repository is accessible

### API Troubleshooting
```bash
# Test API connectivity
curl -X GET "https://app.daytona.io/api/health" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Test workspace listing
curl -X GET "https://app.daytona.io/api/workspaces" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Cleanup

### Delete Workspace via API
```bash
curl -X DELETE "https://app.daytona.io/api/workspaces/WORKSPACE_ID" \
  -H "Authorization: Bearer dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f"
```

### Delete via Dashboard
1. Go to Daytona dashboard
2. Find your workspace
3. Click "Delete" or "Terminate"

## Integration with Scripts

### Automated Script (daytona-sandbox-2cpu-8gb.js)
Run the provided JavaScript script for automated sandbox creation:
```bash
node scripts/daytona-sandbox-2cpu-8gb.js
```

### Expected Output
```bash
🚀 [Daytona Sandbox Creator]
===========================
Configuration: 2 CPUs, 8GB RAM, 20GB Disk

✅ SUCCESS: Workspace created!
   ID: ws_xxxxxxxxxxxxx
   Name: piata-ai-sandbox-2cpu-8gb
   Status: running
   URL: https://app.daytona.io/ws/ws_xxxxxxxxxxxxx
```

## Next Steps

1. **Set up development environment** in your sandbox
2. **Configure environment variables** as needed
3. **Install project dependencies**
4. **Run your development workflow**
5. **Monitor resource usage** during development
6. **Clean up** when done

## Support

- **Daytona Dashboard**: https://app.daytona.io
- **Daytona Documentation**: Check Daytona official docs
- **API Issues**: Contact Daytona support if API problems persist
- **Resource Issues**: Check your account plan limits