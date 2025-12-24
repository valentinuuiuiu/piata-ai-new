#!/usr/bin/env python3
"""
Daytona Sandbox Setup for piata-ai-new (New Volume)
2 CPUs, 8GB RAM configuration
"""

def main():
    print("🚀 Daytona Sandbox Setup - piata-ai-new (New Volume)")
    print("=" * 65)
    print()
    
    print("📋 New Volume Configuration:")
    print("   • Volume: piata-ai-new (newer version)")
    print("   • CPUs: 2")
    print("   • Memory: 8GB (8Gi)")
    print("   • Disk: 20GB (20Gi)")
    print("   • Repository: https://github.com/valentinuuiuiu/piata-ai-new.git")
    print("   • API Key: dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f")
    print()
    
    print("✅ Current Status:")
    print("   • Working directory: /home/shiva/piata-ai-new")
    print("   • Using NEW piata-ai-new volume")
    print("   • All scripts configured for new volume")
    print()
    
    print("🔧 Create Sandbox with Python SDK:")
    print()
    
    # Updated Python code for new volume
    daytona_code = '''
from daytona import Daytona, DaytonaConfig

# Configuration for NEW piata-ai-new volume
config = DaytonaConfig(api_key="dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f")
daytona = Daytona(config)

# Create sandbox with 2 CPUs, 8GB RAM for NEW piata-ai-new
sandbox = daytona.create(
    name="piata-ai-new-sandbox-2cpu-8gb",
    cpus=2,
    memory="8Gi", 
    disk="20Gi",
    # Additional configuration for new volume
    git_url="https://github.com/valentinuuiuiu/piata-ai-new.git",
    branch="main"
)

print("🎉 New piata-ai-new sandbox created!")
print(f"Volume: piata-ai-new")
print(f"ID: {sandbox.id}")
print(f"Status: {sandbox.status}")

# Test with new volume
response = sandbox.process.code_run('echo "Testing piata-ai-new volume"')
print(f"Test result: {response.result}")

# Verify we're using the new volume
response = sandbox.process.code_run('pwd && ls -la')
print(f"Working directory:\\n{response.result}")

# Clean up
sandbox.delete()
'''
    
    print(daytona_code)
    
    print("🚀 Quick Commands for piata-ai-new:")
    print()
    print("# Clone new volume")
    print("git clone https://github.com/valentinuuiuiu/piata-ai-new.git")
    print("cd piata-ai-new")
    print()
    print("# Setup and run")
    print("npm install")
    print("npm run dev")
    print()
    print("# Check project structure")
    print("ls -la")
    print("cat package.json")
    print("cat README.md")
    print()
    
    print("📁 Files for piata-ai-new:")
    print("   ✅ DAYTONA_SANDBOX_SETUP.md")
    print("   ✅ scripts/create-daytona-python-sandbox.py")
    print("   ✅ scripts/daytona-complete-setup.py")
    print("   ✅ All configured for NEW piata-ai-new volume")
    print()
    
    print("🎯 Ready to create Daytona sandbox with NEW piata-ai-new volume!")
    print("   • 2 CPUs allocated")
    print("   • 8GB RAM configured") 
    print("   • 20GB disk space")
    print("   • Repository: https://github.com/valentinuuiuiu/piata-ai-new.git")

if __name__ == "__main__":
    main()