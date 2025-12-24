#!/usr/bin/env python3
"""
Complete Daytona Sandbox Setup with 2 CPUs and 8GB RAM
Using Daytona Python SDK with uvx
"""

def main():
    print("🚀 Daytona Sandbox Setup: 2 CPUs, 8GB RAM")
    print("=" * 60)
    print()
    
    print("📋 Configuration:")
    print("   • CPUs: 2")
    print("   • Memory: 8GB (8Gi)")
    print("   • Disk: 20GB (20Gi)")
    print("   • Repository: https://github.com/valentinuuiuiu/piata-ai-new.git")
    print("   • API Key: dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f")
    print()
    
    print("🔧 Setup Instructions:")
    print("1. Install Daytona SDK with uv:")
    print("   uv add daytona-sdk")
    print()
    
    print("2. Run the following Python code:")
    print()
    
    # The actual Daytona Python code
    daytona_code = '''
from daytona import Daytona, DaytonaConfig

# Define the configuration
config = DaytonaConfig(api_key="dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f")

# Initialize the Daytona client
daytona = Daytona(config)

# Create the Sandbox instance with 2 CPUs and 8GB RAM
sandbox = daytona.create(
    name="piata-ai-sandbox-2cpu-8gb",
    cpus=2,
    memory="8Gi",
    disk="20Gi"
)

# Run the code securely inside the Sandbox
response = sandbox.process.code_run('print("Hello World from code!")')
if response.exit_code != 0:
    print(f"Error: {response.exit_code} {response.result}")
else:
    print(response.result)

# Verify resources
print("\\n🔍 Verifying Resources:")
response = sandbox.process.code_run('cat /proc/cpuinfo | grep processor | wc -l')
print(f"CPUs: {response.result.strip()}")

response = sandbox.process.code_run('free -h')
print(f"Memory:\\n{response.result}")

print("\\n🎉 Sandbox created successfully!")
print(f"Sandbox ID: {sandbox.id}")
print(f"Name: {sandbox.name}")
print(f"Status: {sandbox.status}")

# Clean up when done
sandbox.delete()
'''
    
    print(daytona_code)
    
    print("3. Alternative one-liner:")
    print("   uv run --with daytona-sdk - << EOF")
    print('   python -c "from daytona import Daytona, DaytonaConfig; daytona = Daytona(DaytonaConfig(api_key=\\"dtn_xxx\\")); sandbox = daytona.create(name=\\"test\\", cpus=2, memory=\\"8Gi\\"); print(sandbox.id)"')
    print("   EOF")
    print()
    
    print("🔧 Manual Setup (if SDK not working):")
    print("1. Go to: https://app.daytona.io")
    print("2. Click 'Create New Workspace'")
    print("3. Configure:")
    print("   • Name: piata-ai-sandbox-2cpu-8gb")
    print("   • Repository: https://github.com/valentinuuiuiu/piata-ai-new.git")
    print("   • CPUs: 2")
    print("   • Memory: 8GB")
    print("   • Disk: 20GB")
    print("4. Click 'Create'")
    print()
    
    print("🚀 Quick Start Commands in Sandbox:")
    print("# Check system resources")
    print("cat /proc/cpuinfo | grep processor | wc -l")
    print("free -h")
    print("df -h")
    print()
    print("# Clone and setup project")
    print("git clone https://github.com/valentinuuiuiu/piata-ai-new.git")
    print("cd piata-ai-new")
    print("npm install")
    print("npm run dev")
    print()
    print("# Run development")
    print("npm run build")
    print("npm test")
    print()
    
    print("📁 Files Created:")
    print("   • scripts/create-daytona-python-sandbox.py")
    print("   • DAYTONA_SANDBOX_SETUP.md")
    print("   • daytona-sandbox-info.json (after creation)")
    print()
    
    print("✅ Ready to create your 2 CPU, 8GB RAM Daytona sandbox!")

if __name__ == "__main__":
    main()