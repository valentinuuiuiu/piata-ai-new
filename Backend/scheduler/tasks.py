import os
import requests
from celery_config import app
from dotenv import load_dotenv

load_dotenv()

# Determine the local API URL - forcing internal docker network or localhost
# If running inside docker container (celery), host.docker.internal works on Mac/Windows, 
# but on Linux standard docker, we might need to point to the host IP or the service name if nextjs was in docker.
# Assuming Next.js runs on host machine (localhost:3000) and we are in docker:
# We'll try to target the host.
# Default to live production if LOCAL_APP_URL is not set
APP_URL = os.getenv('APP_URL', os.getenv('LOCAL_APP_URL', 'https://piata-ai.ro'))
CRON_SECRET = os.getenv('CRON_SECRET', '5f8d9e2a1b4c7d0e3f6a9b2c5e8d1a4f')

def trigger_endpoint(endpoint):
    """
    Helper to trigger the API endpoint (local or live).
    """
    url = f"{APP_URL}{endpoint}"
    print(f"🚀 Triggering task: {url}")
    
    headers = {
        "Authorization": f"Bearer {CRON_SECRET}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=300)
        print(f"✅ Status: {response.status_code} - {response.text[:100]}")
        return response.json()
    except Exception as e:
        print(f"❌ Error triggering {endpoint}: {str(e)}")
        return {"error": str(e)}

@app.task
def jules_orchestrator():
    print("🤖 Executing Jules Orchestrator")
    return trigger_endpoint('/api/cron/jules-orchestrator')

@app.task
def blog_daily():
    print("✍️ Executing Blog Daily")
    return trigger_endpoint('/api/cron/blog-daily')

@app.task
def trending_topics():
    print("📈 Executing Trending Topics")
    return trigger_endpoint('/api/cron/trending-topics')

@app.task
def shopping_agents_runner():
    print("🛍️ Executing Shopping Agents")
    return trigger_endpoint('/api/cron/shopping-agents-runner')

@app.task
def autonomous_marketing():
    print("📢 Executing Autonomous Marketing")
    return trigger_endpoint('/api/cron/autonomous-marketing')

@app.task
def social_media_generator():
    print("📱 Executing Social Media Generator")
    return trigger_endpoint('/api/cron/social-media-generator')
