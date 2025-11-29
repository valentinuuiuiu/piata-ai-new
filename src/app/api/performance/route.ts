import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'overview';

  try {
    switch (action) {
      case 'overview':
        return await getPerformanceOverview();
      case 'slow_queries':
        return await getSlowQueries();
      case 'table_stats':
        return await getTableStats();
      case 'index_usage':
        return await getIndexUsage();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Performance monitoring error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

async function getPerformanceOverview() {
  const queries = [
    // Table sizes
    `SELECT 
      TABLE_NAME,
      ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size_MB',
      TABLE_ROWS,
      ROUND((INDEX_LENGTH / 1024 / 1024), 2) AS 'Index_MB'
     FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA = 'piata_ro'
     ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC`,
    
    // Query performance stats
    `SELECT 
       query_type,
       AVG(execution_time_ms) as avg_time,
       MAX(execution_time_ms) as max_time,
       COUNT(*) as query_count,
       AVG(rows_examined) as avg_rows_examined
     FROM query_performance
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
     GROUP BY query_type`,
    
    // Active connections
    `SHOW STATUS LIKE 'Threads_connected'`,
    
    // Buffer pool usage
    `SHOW STATUS LIKE 'Innodb_buffer_pool%'`
  ];

  const results = await Promise.all(queries.map(q => query(q))) as any[][];

  return NextResponse.json({
    success: true,
    data: {
      tableStats: results[0],
      queryPerformance: results[1],
      activeConnections: results[2][0]?.Variable_value || 0,
      bufferPoolStats: results[3]
    }
  });
}

async function getSlowQueries() {
  const slowQueries = await query(`
    SELECT 
      query_type,
      execution_time_ms,
      rows_examined,
      rows_returned,
      created_at
    FROM query_performance
    WHERE execution_time_ms > 100
      AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ORDER BY execution_time_ms DESC
    LIMIT 50
  `) as any[];

  return NextResponse.json({
    success: true,
    data: slowQueries
  });
}

async function getTableStats() {
  const tableStats = await query(`
    SELECT 
      TABLE_NAME,
      ENGINE,
      TABLE_ROWS,
      DATA_LENGTH,
      INDEX_LENGTH,
      (DATA_LENGTH + INDEX_LENGTH) as TOTAL_SIZE,
      ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS SIZE_MB
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'piata_ro'
    ORDER BY TOTAL_SIZE DESC
  `) as any[];

  return NextResponse.json({
    success: true,
    data: tableStats
  });
}

async function getIndexUsage() {
  const indexStats = await query(`
    SELECT 
      TABLE_NAME,
      INDEX_NAME,
      CARDINALITY,
      SUB_PART,
      NULLABLE,
      INDEX_TYPE
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'piata_ro'
    ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
  `) as any[];

  return NextResponse.json({
    success: true,
    data: indexStats
  });
}

export async function POST(request: Request) {
  try {
    const { query_type, execution_time_ms, rows_examined, rows_returned } = await request.json();

    if (!query_type || execution_time_ms === undefined) {
      return NextResponse.json({
        success: false,
        error: 'query_type and execution_time_ms are required'
      }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO query_performance (query_type, execution_time_ms, rows_examined, rows_returned)
       VALUES (?, ?, ?, ?)`,
      [query_type, execution_time_ms, rows_examined || 0, rows_returned || 0]
    );

    return NextResponse.json({
      success: true,
      id: (result as any).insertId,
      message: 'Performance data recorded successfully'
    });

  } catch (error: any) {
    console.error('❌ Performance POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}