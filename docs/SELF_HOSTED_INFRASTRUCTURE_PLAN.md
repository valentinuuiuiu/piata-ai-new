# Self-Hosted Infrastructure Setup Plan

**Status**: In Progress  
**Updated**: 2025-12-23 07:45 UTC+2

## 🎯 Objective

Set up self-hosted Supabase and n8n for the Piata AI marketplace to achieve full control over:

- Database and authentication (Supabase)
- Workflow automation (n8n)
- Reduced dependency on external services
- Cost optimization for long-term operations

---

## ✅ Completed Steps

### 1. Docker Infrastructure Fixed

- ✅ Moved Docker data root to `/mnt/nexusos/docker-data` (641GB free)
- ✅ Resolved disk space issues on `/` partition
- ✅ Cleaned up corrupted images from previous VFS configuration
- ✅ Restarted Docker daemon successfully
- ✅ Successfully pulled `redis:alpine` image
- ⏳ Currently pulling `n8nio/n8n:latest` image (in progress)

### 2. Docker Configuration

**Current daemon.json:**

```json
{
  "storage-driver": "vfs",
  "data-root": "/mnt/nexusos/docker-data"
}
```

**Note**: Using VFS storage driver due to `/mnt/nexusos` filesystem constraints. This works but is slower than overlay2.

---

## 🔄 In Progress

### 3. n8n Setup

**Status**: Pulling image (~85% complete)

Once complete, will start with:

```bash
docker-compose up -d n8n redis
```

**Services to run:**

- `redis:alpine` - Message queue and caching
- `n8nio/n8n` - Workflow automation platform

**Updated docker-compose.yml** fixes:

- Running n8n as root to avoid user permission issues
- Volume mounted to `/root/.n8n` instead of `/home/node/.n8n`
- Proper environment variables configured

---

## 📋 Next Steps

### 4. Test n8n Access

Once containers are running:

```bash
# Check container status
docker ps

# Access n8n web interface
http://localhost:5678
```

**Expected outcome**: n8n welcome screen with setup wizard

### 5. Self-Hosted Supabase Setup

**Option A: Official Supabase Docker Compose** (Recommended)

```bash
# Clone official Supabase setup
cd /home/shiva
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Configure environment
cp .env.example .env
nano .env  # Update JWT_SECRET, POSTGRES_PASSWORD, etc.

# Start all Supabase services
docker-compose up -d
```

**Supabase Services Included:**

- PostgreSQL 15
- PostgREST API
- GoTrue Auth
- Realtime
- Storage
- pg_meta
- Studio (Web UI)
- Kong API Gateway

**Ports:**

- 8000: Kong API Gateway
- 5432: PostgreSQL
- 54321: Studio (Web UI)

### 6. Migrate Data from Cloud Supabase

Once self-hosted instance is running:

```bash
# Dump from cloud Supabase
pg_dump "$CLOUD_SUPABASE_URL" > piata_backup.sql

# Restore to local instance
psql -h localhost -U postgres piata < piata_backup.sql
```

### 7. Update Application Configuration

Update `.env.local` and `.env.production.local`:

```bash
# Old (cloud)
#NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
#NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# New (self-hosted)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=<generate-new-jwt>
SUPABASE_SERVICE_ROLE_KEY=<generate-new-jwt>
DATABASE_URL=postgresql://postgres:password@localhost:5432/piata
```

### 8. n8n Workflow Integration

**Initial Workflows to Create:**

1. **Marketing Automation**

   - Trigger: Cron (daily at 9 AM)
   - Action: Call `/api/cron/blog-daily`
   - Monitor: Log results to database

2. **Shopping Agent Runner**

   - Trigger: Cron (every hour)
   - Action: Check new listings, match with agents
   - Notify: Send emails for matches

3. **Health Checks**
   - Trigger: Cron (every 15 minutes)
   - Check: Database, API, external services
   - Alert: Send notification if down

---

## 🎯 Goals by Timeline

### Today (Dec 23)

- [⏳] Complete n8n image pull and container startup
- [ ] Access n8n web UI successfully
- [ ] Create first test workflow in n8n
- [ ] Document n8n workflow templates

### Tomorrow (Dec 24)

- [ ] Pull official Supabase Docker setup
- [ ] Start Supabase stack locally
- [ ] Access Supabase Studio UI
- [ ] Test database connection

### Day After (Dec 25)

- [ ] Export data from cloud Supabase
- [ ] Import to self-hosted instance
- [ ] Verify all tables and data integrity
- [ ] Test application connection to local DB

### Week 1 (by Dec 30)

- [ ] Migrate all n8n workflows from Vercel crons
- [ ] Update application to use self-hosted Supabase
- [ ] Setup automated backups
- [ ] Configure SSL/HTTPS for production access
- [ ] Create monitoring dashboard

---

## 🔧 Technical Challenges & Solutions

### Challenge 1: VFS Storage Driver Performance

**Problem**: VFS is slower and uses more disk space than overlay2  
**Current Status**: Acceptable for now, works correctly  
**Future Fix**:

```bash
# Switch to overlay2 once we verify kernel support
sudo nano /etc/docker/daemon.json
# Change "vfs" to "overlay2"
sudo systemctl restart docker
```

### Challenge 2: Container User Permissions

**Problem**: n8n container failed with "user node not found"  
**Solution**: ✅ Run as root with updated docker-compose.yml

### Challenge 3: Volume Mounts

**Problem**: Redis missing volume on restart  
**Solution**: Ensure volumes defined in docker-compose.yml

---

## 📊 Resource Usage Monitoring

**Current Disk Usage:**

- `/` (SSD): 125GB/234GB (57% used)
- `/mnt/nexusos` (HDD): 229GB/916GB (27% used)
- Docker data: `/mnt/nexusos/docker-data`

**Projected Usage:**

- Supabase full stack: ~5-10GB
- n8n + workflows: ~1-2GB
- PostgreSQL data (current): ~2GB
- **Total estimate**: ~15GB (plenty of space)

---

## 🚀 Benefits of Self-Hosted Setup

1. **Cost Savings**

   - No Supabase Pro fees ($25/month)
   - No Vercel cron limitations
   - Unlimited database size

2. **Performance**

   - Local network latency (sub-millisecond)
   - No rate limiting
   - Full control over resources

3. **Privacy & Control**

   - Data stays on your hardware
   - Custom security policies
   - Easier compliance

4. **Flexibility**
   - Install any PostgreSQL extension
   - Custom workflows in n8n
   - Direct database access

---

## 📝 Notes & Observations

- **Docker restart successful** after cleaning corrupted images
- **Image pulls working** despite VFS driver slowness
- **Plenty of disk space** on HDD for all services
- **Network connectivity** confirmed with successful pulls
- **Previous error was storage-driver related**, not network

---

## 🔗 Useful Resources

- [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting)
- [n8n Documentation](https://docs.n8n.io/)
- [Docker Storage Drivers](https://docs.docker.com/storage/storagedriver/select-storage-driver/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

---

**Next Update**: After n8n container successfully starts
