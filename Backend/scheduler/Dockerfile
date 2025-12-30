FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Default command can be overridden in docker-compose
CMD ["celery", "-A", "celery_config", "worker", "--loglevel=info"]
