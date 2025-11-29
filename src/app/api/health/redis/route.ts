import { NextResponse } from 'next/server';
import { createConnection } from 'net';

function checkRedis(): Promise<boolean> {
  return new Promise((resolve) => {
    const host = process.env.REDIS_HOST || 'redis';
    const port = parseInt(process.env.REDIS_PORT || '6379');
    
    const socket = createConnection({ host, port });
    
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      socket.end();
      resolve(true);
    });

    socket.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

export async function GET() {
  try {
    const isHealthy = await checkRedis();
    
    const redisHealth = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'redis',
      timestamp: new Date().toISOString(),
      details: {
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || '6379'
      }
    };

    if (!isHealthy) {
      return NextResponse.json(redisHealth, { status: 503 });
    }

    return NextResponse.json(redisHealth, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error: any) {
    console.error('Redis health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'redis',
        error: error.message || 'Redis connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
