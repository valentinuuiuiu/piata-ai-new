import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const metric = searchParams.get('metric');
  const dimension1 = searchParams.get('dimension1');
  const timeframe = searchParams.get('timeframe') || '24h';

  try {
    let sqlQuery = `
      SELECT metric_name, metric_value, dimension1, dimension2, recorded_at
      FROM marketplace_analytics
      WHERE 1=1
    `;
    const params: any[] = [];

    if (metric) {
      sqlQuery += ` AND metric_name = ?`;
      params.push(metric);
    }

    if (dimension1) {
      sqlQuery += ` AND dimension1 = ?`;
      params.push(dimension1);
    }

    // Filter by timeframe
    const timeFilter = getTimeFilter(timeframe);
    if (timeFilter) {
      sqlQuery += ` AND recorded_at >= ${timeFilter}`;
    }

    sqlQuery += ` ORDER BY recorded_at DESC LIMIT 100`;

    const results = await query(sqlQuery, params);

    // Calculate real-time metrics
    const realtimeMetrics = await getRealtimeMetrics();

    return NextResponse.json({
      success: true,
      analytics: results,
      realtime: realtimeMetrics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Analytics API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

function getTimeFilter(timeframe: string): string {
  switch (timeframe) {
    case '1h':
      return `DATE_SUB(NOW(), INTERVAL 1 HOUR)`;
    case '24h':
      return `DATE_SUB(NOW(), INTERVAL 24 HOUR)`;
    case '7d':
      return `DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    case '30d':
      return `DATE_SUB(NOW(), INTERVAL 30 DAY)`;
    default:
      return `DATE_SUB(NOW(), INTERVAL 24 HOUR)`;
  }
}

async function getRealtimeMetrics() {
  try {
    const queries = [
      // Total active listings
      `SELECT COUNT(*) as count FROM anunturi WHERE status = 'active'`,
      // Total users
      `SELECT COUNT(*) as count FROM users`,
      // New listings today
      `SELECT COUNT(*) as count FROM anunturi WHERE DATE(created_at) = CURDATE()`,
      // Average price
      `SELECT COALESCE(AVG(price), 0) as avg_price FROM anunturi WHERE status = 'active' AND price > 0`,
      // Top categories
      `SELECT c.name, COUNT(a.id) as count 
       FROM categories c 
       LEFT JOIN anunturi a ON c.id = a.category_id AND a.status = 'active'
       GROUP BY c.id, c.name 
       ORDER BY count DESC 
       LIMIT 5`
    ];

    const results = await Promise.all(queries.map(q => query(q))) as any[][];

    return {
      totalActiveListings: results[0][0]?.count || 0,
      totalUsers: results[1][0]?.count || 0,
      newListingsToday: results[2][0]?.count || 0,
      averagePrice: parseFloat(results[3][0]?.avg_price || 0).toFixed(2),
      topCategories: results[4] || []
    };
  } catch (error) {
    console.error('❌ Realtime metrics error:', error);
    return {
      totalActiveListings: 0,
      totalUsers: 0,
      newListingsToday: 0,
      averagePrice: '0.00',
      topCategories: []
    };
  }
}

export async function POST(request: Request) {
  try {
    const { metric_name, metric_value, dimension1, dimension2 } = await request.json();

    if (!metric_name || metric_value === undefined) {
      return NextResponse.json({
        success: false,
        error: 'metric_name and metric_value are required'
      }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO marketplace_analytics (metric_name, metric_value, dimension1, dimension2)
       VALUES (?, ?, ?, ?)`,
      [metric_name, metric_value, dimension1 || null, dimension2 || null]
    );

    return NextResponse.json({
      success: true,
      id: (result as any).insertId,
      message: 'Analytics data recorded successfully'
    });

  } catch (error: any) {
    console.error('❌ Analytics POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}