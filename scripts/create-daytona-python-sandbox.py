#!/usr/bin/env python3
"""
Create Daytona Sandbox with 2 CPUs and 8GB RAM using Python SDK
"""

import json
import time

def create_daytona_sandbox():
    try:
        from daytona import Daytona, DaytonaConfig
        
        print("🚀 [Daytona Python SDK] Creating Sandbox")
        print("=" * 50)
        print("Configuration: 2 CPUs, 8GB RAM, 20GB Disk")
        print("Repository: https://github.com/valentinuuiuiu/piata-ai-new.git")
        print()
        
        # Define the configuration with your API key
        api_key = "dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f"
        config = DaytonaConfig(api_key=api_key)
        
        # Initialize the Daytona client
        print("🔗 Initializing Daytona client...")
        daytona = Daytona(config)
        
        # Create the Sandbox instance with resource specifications
        print("🏗️  Creating sandbox with 2 CPUs and 8GB RAM...")
        sandbox = daytona.create(
            name="piata-ai-sandbox-2cpu-8gb",
            cpus=2,
            memory="8Gi",
            disk="20Gi"
        )
        
        print("✅ Sandbox created successfully!")
        print(f"   Sandbox ID: {sandbox.id}")
        print(f"   Name: {sandbox.name}")
        print(f"   Status: {sandbox.status}")
        print(f"   Resources: {sandbox.resources}")
        
        # Test the sandbox by running some commands
        print("\n🧪 Testing sandbox with sample commands...")
        
        # Test 1: System information
        print("   Testing: System information...")
        response = sandbox.process.code_run('cat /proc/cpuinfo | grep processor | wc -l')
        if response.exit_code != 0:
            print(f"   ❌ CPU check failed: {response.exit_code} {response.result}")
        else:
            cpu_count = response.result.strip()
            print(f"   ✅ CPU count: {cpu_count}")
        
        # Test 2: Memory check
        print("   Testing: Memory check...")
        response = sandbox.process.code_run('free -h')
        if response.exit_code != 0:
            print(f"   ❌ Memory check failed: {response.exit_code} {response.result}")
        else:
            print(f"   ✅ Memory info retrieved")
            print(f"   {response.result}")
        
        # Test 3: Disk space
        print("   Testing: Disk space...")
        response = sandbox.process.code_run('df -h /')
        if response.exit_code != 0:
            print(f"   ❌ Disk check failed: {response.exit_code} {response.result}")
        else:
            print(f"   ✅ Disk info retrieved")
            print(f"   {response.result}")
        
        # Test 4: Hello World
        print("   Testing: Hello World...")
        response = sandbox.process.code_run('print("Hello World from Daytona sandbox!")')
        if response.exit_code != 0:
            print(f"   ❌ Hello test failed: {response.exit_code} {response.result}")
        else:
            print(f"   ✅ Hello World output: {response.result}")
        
        print("\n🎉 Daytona Sandbox Ready!")
        print("\n📋 Sandbox Details:")
        print(f"   ID: {sandbox.id}")
        print(f"   Name: {sandbox.name}")
        print(f"   Status: {sandbox.status}")
        print(f"   Resources: 2 CPUs, 8GB RAM, 20GB Disk")
        
        # Show available commands
        print("\n🔧 Available Commands:")
        print("   # Run Python code:")
        print("   response = sandbox.process.code_run('print(\"Hello\")')")
        print("   print(response.result)")
        print()
        print("   # Run shell commands:")
        print("   response = sandbox.process.shell('ls -la')")
        print("   print(response.result)")
        print()
        print("   # Clone repository:")
        print("   response = sandbox.process.shell('git clone https://github.com/valentinuuiuiu/piata-ai-new.git')")
        print()
        print("   # Install dependencies:")
        print("   response = sandbox.process.shell('cd piata-ai-new && npm install')")
        
        print("\n🧹 Cleanup when done:")
        print(f"   sandbox.delete()  # or use sandbox.terminate()")
        
        # Save sandbox info to file
        sandbox_info = {
            "id": sandbox.id,
            "name": sandbox.name,
            "status": sandbox.status,
            "resources": {
                "cpus": 2,
                "memory": "8Gi",
                "disk": "20Gi"
            },
            "commands": {
                "python_code": "sandbox.process.code_run('print(\"Hello\")')",
                "shell_command": "sandbox.process.shell('ls -la')",
                "clone_repo": "sandbox.process.shell('git clone https://github.com/valentinuuiuiu/piata-ai-new.git')",
                "delete": "sandbox.delete()"
            },
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        with open("daytona-sandbox-info.json", "w") as f:
            json.dump(sandbox_info, f, indent=2)
        
        print(f"\n💾 Sandbox info saved to: daytona-sandbox-info.json")
        
        return sandbox
        
    except ImportError:
        print("❌ Daytona SDK not found!")
        print("Please install the Daytona SDK:")
        print("pip install daytona-sdk")
        return None
        
    except Exception as e:
        print(f"❌ Error creating sandbox: {e}")
        return None

def main():
    print("Creating Daytona sandbox with Python SDK...")
    sandbox = create_daytona_sandbox()
    
    if sandbox:
        print("\n🎯 MISSION ACCOMPLISHED!")
        print("Your Daytona sandbox with 2 CPUs and 8GB RAM is ready!")
    else:
        print("\n❌ Failed to create sandbox")
        print("Please check your API key and Daytona account status")

if __name__ == "__main__":
    main()