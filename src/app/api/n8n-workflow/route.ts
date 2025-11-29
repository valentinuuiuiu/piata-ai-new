/**
 * N8N Workflow API - Serve workflow JSON files from collection
 */

import { NextRequest } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

const WORKFLOWS_BASE = '/home/shiva/Documents/workflows/workflows';

export async function POST(req: NextRequest) {
  try {
    const { path, category } = await req.json();

    if (path) {
      // Get specific workflow
      const workflowPath = join(WORKFLOWS_BASE, path);
      const workflowJson = await readFile(workflowPath, 'utf-8');

      return Response.json({
        success: true,
        workflow: workflowJson,
        path
      });
    }

    return Response.json(
      { error: 'Path required' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('[N8N Workflow API] Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// List available workflows
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let workflowsPath = WORKFLOWS_BASE;

    if (category) {
      workflowsPath = join(WORKFLOWS_BASE, category);
    }

    const files = await readdir(workflowsPath);
    const workflows = files.filter(f => f.endsWith('.json'));

    return Response.json({
      success: true,
      workflows,
      category,
      count: workflows.length
    });

  } catch (error: any) {
    console.error('[N8N Workflow API] Error listing:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
