import { getScheduler, COMMON_JOBS } from '../../../lib/job-scheduler';
import { NextResponse } from 'next/server';

/**
 * Job Scheduler API
 * 
 * Manage automated tasks (cron jobs) via API
 * No complex infrastructure needed - just Redis!
 */

export async function GET(request: Request) {
  try {
    const scheduler = getScheduler();
    await scheduler.connect();
    
    const jobs = await scheduler.getJobs();
    
    return NextResponse.json({
      success: true,
      jobs,
      count: jobs.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, jobId, jobData } = await request.json();
    const scheduler = getScheduler();
    await scheduler.connect();
    
    switch (action) {
      case 'start':
        scheduler.start();
        return NextResponse.json({ success: true, message: 'Scheduler started' });
      
      case 'stop':
        scheduler.stop();
        return NextResponse.json({ success: true, message: 'Scheduler stopped' });
      
      case 'add':
        if (!jobData) {
          return NextResponse.json({ success: false, error: 'Job data required' }, { status: 400 });
        }
        const id = await scheduler.scheduleJob(jobData);
        return NextResponse.json({ success: true, jobId: id });
      
      case 'delete':
        if (!jobId) {
          return NextResponse.json({ success: false, error: 'Job ID required' }, { status: 400 });
        }
        await scheduler.deleteJob(jobId);
        return NextResponse.json({ success: true, message: 'Job deleted' });
      
      case 'setup-defaults':
        // Set up common jobs
        await scheduler.scheduleJob(COMMON_JOBS.DAILY_NEWSLETTER);
        await scheduler.scheduleJob(COMMON_JOBS.HOURLY_SYNC);
        await scheduler.scheduleJob(COMMON_JOBS.VALIDATE_ADS);
        await scheduler.scheduleJob(COMMON_JOBS.WEEKLY_PRICING);
        
        return NextResponse.json({
          success: true,
          message: 'Default jobs configured',
          jobs: Object.keys(COMMON_JOBS)
        });
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
