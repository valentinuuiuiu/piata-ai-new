# Native Installation Guide - Redis, n8n & Supabase

**Because Docker VFS is broken on this system**

## 🚨 Problem Summary

The Docker installation on this Kali Linux system is using the VFS storage driver which is **fundamentally broken**:

- Container images corrupted during extraction
- `/etc/passwd` files missing in containers
- Entrypoint scripts not found
- All containers fail to start

**Root cause**: VFS driver doesn't properly extract image layers

---

## ✅ Solution: Install Natively

### 1. Install Redis (5 minutes)

```bash
# Install Redis server
sudo apt update
sudo apt install -y redis-server

# Start Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify it's running
redis-cli ping  # Should return "PONG"

# Check status
sudo systemctl status redis-server
```

**Redis will listen on**: `localhost:6379`

---

### 2. Install n8n (5 minutes)

n8n requires Node.js (which you already have). Install globally with npm:

```bash
# Install n8n globally
sudo npm install -g n8n

# Verify installation
n8n --version

# Start n8n (this will run in foreground)
n8n start

# OR run in background with PM2
sudo npm install -g pm2
pm2 start n8n
pm2 save
pm2 startup
```

**n8n will listen on**: `http://localhost:5678`

**First time setup**:

1. Open `http://localhost:5678` in browser
2. Create admin account
3. Start creating workflows!

---

### 3. Self-Hosted Supabase (30 minutes)

**Option A: Use Official Docker Compose** (if we fix Docker):

First, we need to fix Docker's storage driver:

```bash
# Stop Docker
sudo systemctl stop docker

# Change storage driver to overlay2
sudo bash -c 'cat > /etc/docker/daemon.json << EOF
{
  "storage-driver": "overlay2",
  "data-root": "/mnt/nexusos/docker-data"
}
EOF'

# Remove old VFS data
sudo rm -rf /mnt/nexusos/docker-data/vfs

# Start Docker
sudo systemctl start docker

# Verify overlay2 is active
docker info | grep "Storage Driver"
```

Then clone and start Supabase:

```bash
cd /home/shiva
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Copy env file
cp .env.example .env

# Generate secrets
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
ANON_KEY=$(openssl rand -base64 32)
SERVICE_KEY=$(openssl rand -base64 32)

# Update .env file
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" .env
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
sed -i "s/ANON_KEY=.*/ANON_KEY=$ANON_KEY/" .env
sed -i "s/SERVICE_ROLE_KEY=.*/SERVICE_ROLE_KEY=$SERVICE_KEY/" .env

# Start Supabase
docker-compose up -d

# Access Supabase Studio
# Open: http://localhost:54321
```

**Option B: Native PostgreSQL Installation** (Simpler):

```bash
# Install PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create piata database
sudo -u postgres psql << EOF
CREATE DATABASE piata;
CREATE USER piata_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE piata TO piata_admin;
\q
EOF

# Install PostgREST for REST API
wget https://github.com/PostgREST/postgrest/releases/download/v11.2.2/postgrest-v11.2.2-linux-static-x64.tar.xz
tar xvf postgrest-v11.2.2-linux-static-x64.tar.xz
sudo mv postgrest /usr/local/bin/
```

---

## 🎯 Quick Start Commands

Run these commands in order:

```bash
# 1. Install Redis
sudo apt update && sudo apt install -y redis-server
sudo systemctl enable --now redis-server

# 2. Install n8n
sudo npm install -g n8n pm2
pm2 start n8n
pm2 save

# 3. Verify everything
redis-cli ping
curl http://localhost:5678
```

---

## 📊 Service Ports

- **Redis**: `localhost:6379`
- **n8n**: `http://localhost:5678`
- **PostgreSQL**: `localhost:5432`
- **Supabase Studio** (if using Docker): `http://localhost:54321`

---

## 🔄 Update Piata AI Config

Once services are running, update your `.env.local`:

```bash
# Redis for caching
REDIS_URL=redis://localhost:6379

# n8n webhooks
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# If using native PostgreSQL
DATABASE_URL=postgresql://piata_admin:your_password@localhost:5432/piata
```

---

## 🛠️ Fixing Docker (Advanced)

If you want to fix Docker properly:

### Step 1: Check Kernel Support

```bash
# Check if overlay2 is supported
lsmod | grep overlay

# If not loaded, load it
sudo modprobe overlay

# Make it persistent
echo "overlay" | sudo tee -a /etc/modules
```

### Step 2: Switch Storage Driver

```bash
# Stop Docker
sudo systemctl stop docker

# Clean old VFS data (WARNING: This deletes all images/containers)
sudo rm -rf /mnt/nexusos/docker-data/vfs
sudo rm -rf /mnt/nexusos/docker-data/image
sudo rm -rf /mnt/nexusos/docker-data/containers

# Update daemon.json
sudo tee /etc/docker/daemon.json << 'EOF'
{
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "data-root": "/mnt/nexusos/docker-data"
}
EOF

# Start Docker
sudo systemctl start docker

# Verify
docker info | grep "Storage Driver"
# Should say: Storage Driver: overlay2
```

### Step 3: Re-pull Images

```bash
docker pull redis:alpine
docker pull n8nio/n8n:latest
docker-compose up -d
```

---

## ✅ Recommended Approach

**For immediate productivity**:

1. ✅ Install Redis natively (5 min)
2. ✅ Install n8n natively (5 min)
3. ⏸️ Keep using cloud Supabase for now
4. 🔧 Fix Docker in background
5. 🚀 Migrate to self-hosted Supabase later

**Why?**

- Get n8n workflows running TODAY
- Redis for scheduler daemon works immediately
- Cloud Supabase is stable (no rush to migrate)
- Fix Docker properly when you have time

---

## 🎯 Next Steps

1. **Run Redis commands above**
2. **Install n8n with PM2**
3. **Test scheduler daemon** with local Redis
4. **Create n8n workflows** for marketing automation
5. **Fix Docker storage driver** (when you have time)
6. **Migrate to self-hosted Supabase** (optional)

---

## 📝 Current Status

- ✅ Docker data moved to HDD (641GB free)
- ✅ Images pulled (redis, n8n, supabase)
- ❌ Docker VFS driver is broken
- ⏳ Native installation is the solution
- 📍 **Action**: Install Redis and n8n natively

**Your system is ready** - just need native installs instead of broken Docker!
