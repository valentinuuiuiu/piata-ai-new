import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()

# Use Redis from docker-compose service name 'redis' or localhost if running outside docker
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')

app = Celery('scheduler', broker=REDIS_URL, backend=REDIS_URL, include=['tasks'])

app.conf.update(
    timezone='UTC',
    enable_utc=True,
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
)

# Define the schedule
app.conf.beat_schedule = {
    'jules-orchestrator': {
        'task': 'tasks.jules_orchestrator',
        'schedule': crontab(hour=8, minute=0),
    },
    'blog-daily': {
        'task': 'tasks.blog_daily',
        'schedule': crontab(hour=9, minute=0),
    },
    'trending-topics': {
        'task': 'tasks.trending_topics',
        'schedule': crontab(hour=9, minute=0, day_of_week=1), # Monday
    },
    'shopping-agents-runner': {
        'task': 'tasks.shopping_agents_runner',
        'schedule': crontab(hour=10, minute=0),
    },
    'autonomous-marketing': {
        'task': 'tasks.autonomous_marketing',
        'schedule': crontab(hour=11, minute=0),
    },
    'social-media-generator': {
        'task': 'tasks.social_media_generator',
        'schedule': crontab(hour=12, minute=0),
    },
}
