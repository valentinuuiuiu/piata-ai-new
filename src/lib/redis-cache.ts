import { createClient, RedisClientType } from 'redis';

class RedisCache {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
      },
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
        // Fallback to in-memory cache if Redis fails
        this.isConnected = false;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      const data = await this.client.get(key);
      return data && typeof data === 'string' ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('❌ Redis SET error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('❌ Redis DEL error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('❌ Redis EXISTS error:', error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.isConnected) {
      return [];
    }

    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('❌ Redis KEYS error:', error);
      return [];
    }
  }

  async clear(pattern: string = '*'): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('❌ Redis CLEAR error:', error);
    }
  }

  async getStats(): Promise<any> {
    if (!this.isConnected) {
      return { status: 'disconnected' };
    }

    try {
      const info = await this.client.info();
      return {
        status: 'connected',
        info: info,
        connected: this.isConnected
      };
    } catch (error) {
      console.error('❌ Redis STATS error:', error);
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Cache with automatic key generation
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttlSeconds);
    return data;
  }

  // Invalidate cache patterns
  async invalidatePattern(pattern: string): Promise<void> {
    await this.clear(pattern);
  }

  // Cache warming for popular data
  async warmCache(key: string, fetcher: () => Promise<any>, ttlSeconds: number = 300): Promise<void> {
    try {
      const data = await fetcher();
      await this.set(key, data, ttlSeconds);
    } catch (error) {
      console.error('❌ Cache warming failed:', error);
    }
  }
}

// Singleton instance
const redisCache = new RedisCache();

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisCache.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await redisCache.disconnect();
  process.exit(0);
});

export default redisCache;