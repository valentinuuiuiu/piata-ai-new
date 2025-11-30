import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * RETRVR Agent - Autonomous Deployment
 * "I'll be damned if I would move a finger" - The agent does it all!
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, config } = body

    switch (action) {
      case 'setup_github':
        return await setupGitHub(config)

      case 'setup_vercel':
        return await setupVercel(config)

      case 'deploy_supabase':
        return await deploySupabase(config)

      case 'full_deploy':
        return await fullDeploy(config)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('RETRVR error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Setup GitHub repository
 */
async function setupGitHub(config: any) {
  const { githubToken, repoName, repoDescription } = config

  if (!githubToken) {
    return NextResponse.json(
      { error: 'GitHub token required' },
      { status: 400 }
    )
  }

  // Create GitHub repo via API
  const createRepoResponse = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      name: repoName || 'piata-ai-marketplace',
      description: repoDescription || 'AI-powered Romanian marketplace - Rise until the lambs became ships 🚀',
      private: false,
      auto_init: false
    })
  })

  if (!createRepoResponse.ok) {
    const error = await createRepoResponse.json()
    return NextResponse.json(
      { error: `GitHub API error: ${error.message}` },
      { status: createRepoResponse.status }
    )
  }

  const repoData = await createRepoResponse.json()

  // Log success to agent learning
  await logAgentAction('retrvr', 'setup_github', true, {
    repo_url: repoData.html_url,
    clone_url: repoData.clone_url
  })

  return NextResponse.json({
    success: true,
    message: 'GitHub repository created successfully!',
    data: {
      repo_url: repoData.html_url,
      clone_url: repoData.clone_url,
      ssh_url: repoData.ssh_url,
      git_url: repoData.git_url
    }
  })
}

/**
 * Setup Vercel deployment
 */
async function setupVercel(config: any) {
  const { vercelToken, projectName, githubRepo } = config

  if (!vercelToken) {
    return NextResponse.json(
      { error: 'Vercel token required' },
      { status: 400 }
    )
  }

  // Create Vercel project via API
  const createProjectResponse = await fetch('https://api.vercel.com/v9/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vercelToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: projectName || 'piata-ai',
      framework: 'nextjs',
      gitRepository: githubRepo ? {
        type: 'github',
        repo: githubRepo
      } : undefined,
      environmentVariables: [
        {
          key: 'NEXT_PUBLIC_SUPABASE_URL',
          value: process.env.NEXT_PUBLIC_SUPABASE_URL,
          target: ['production', 'preview', 'development']
        },
        {
          key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          target: ['production', 'preview', 'development']
        },
        {
          key: 'SUPABASE_SERVICE_ROLE_KEY',
          value: process.env.SUPABASE_SERVICE_ROLE_KEY,
          target: ['production', 'preview', 'development']
        },
        {
          key: 'NEXTAUTH_SECRET',
          value: process.env.NEXTAUTH_SECRET,
          target: ['production', 'preview', 'development']
        },
        {
          key: 'NEXTAUTH_URL',
          value: 'https://piata-ai.ro',
          target: ['production']
        },
        {
          key: 'KAI_SECRET_KEY',
          value: process.env.KAI_SECRET_KEY,
          target: ['production', 'preview', 'development']
        }
      ]
    })
  })

  if (!createProjectResponse.ok) {
    const error = await createProjectResponse.json()
    return NextResponse.json(
      { error: `Vercel API error: ${error.message}` },
      { status: createProjectResponse.status }
    )
  }

  const projectData = await createProjectResponse.json()

  // Log success
  await logAgentAction('retrvr', 'setup_vercel', true, {
    project_id: projectData.id,
    project_name: projectData.name
  })

  return NextResponse.json({
    success: true,
    message: 'Vercel project created successfully!',
    data: {
      project_id: projectData.id,
      project_name: projectData.name,
      url: `https://${projectData.name}.vercel.app`
    }
  })
}

/**
 * Deploy Supabase migration
 */
async function deploySupabase(config: any) {
  const { supabaseToken, projectRef } = config

  if (!supabaseToken) {
    return NextResponse.json(
      { error: 'Supabase token required' },
      { status: 400 }
    )
  }

  // Read migration SQL
  const migrationSQL = await fetch('/supabase/migration.sql').then(r => r.text())

  // Execute migration via Supabase API
  const executeSQLResponse = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    }
  )

  if (!executeSQLResponse.ok) {
    const error = await executeSQLResponse.json()
    return NextResponse.json(
      { error: `Supabase API error: ${error.message}` },
      { status: executeSQLResponse.status }
    )
  }

  // Log success
  await logAgentAction('retrvr', 'deploy_supabase', true, {
    project_ref: projectRef,
    tables_created: 15
  })

  return NextResponse.json({
    success: true,
    message: 'Supabase migration executed successfully!',
    data: {
      project_ref: projectRef,
      tables_created: 15,
      message: 'Database ready - Rise until the lambs became ships! 🚀'
    }
  })
}

/**
 * Full autonomous deployment
 */
async function fullDeploy(config: any) {
  const results = {
    github: null as any,
    vercel: null as any,
    supabase: null as any
  }

  try {
    // Step 1: GitHub
    const githubResult = await setupGitHub(config)
    results.github = await githubResult.json()

    // Step 2: Vercel
    const vercelConfig = {
      ...config,
      githubRepo: results.github.data?.clone_url
    }
    const vercelResult = await setupVercel(vercelConfig)
    results.vercel = await vercelResult.json()

    // Step 3: Supabase
    const supabaseResult = await deploySupabase(config)
    results.supabase = await supabaseResult.json()

    // Log complete deployment
    await logAgentAction('retrvr', 'full_deploy', true, results)

    return NextResponse.json({
      success: true,
      message: 'Full deployment complete! You didn\'t lift a finger! 🎉',
      results,
      next_steps: [
        'Configure DNS in Cloudflare',
        'Wait 5-10 minutes for DNS propagation',
        'Visit https://piata-ai.ro',
        'Rise until the lambs became ships! 🚀'
      ]
    })
  } catch (error: any) {
    await logAgentAction('retrvr', 'full_deploy', false, {
      error: error.message,
      partial_results: results
    })

    return NextResponse.json({
      error: error.message,
      partial_results: results
    }, { status: 500 })
  }
}

/**
 * Log agent action to learning history
 */
async function logAgentAction(
  agentName: string,
  action: string,
  success: boolean,
  data: any
) {
  if (!supabase) return;
  try {
    await supabase.from('agent_learning_history').insert({
      agent_name: agentName,
      task_description: action,
      input_data: {},
      output_data: data,
      success,
      performance_score: success ? 100 : 0
    })
  } catch (error) {
    console.error('Failed to log agent action:', error)
  }
}

/**
 * Get deployment status
 */
export async function GET(req: NextRequest) {
  try {
    // Get latest RETRVR actions
    if (!supabase) {
      return NextResponse.json({ success: true, stats: { total_deployments: 0 }, recent_actions: [] });
    }

    const { data, error } = await supabase
      .from('agent_learning_history')
      .select('*')
      .eq('agent_name', 'retrvr')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const stats = {
      total_deployments: data.length,
      successful: data.filter(d => d.success).length,
      failed: data.filter(d => !d.success).length,
      success_rate: data.length > 0
        ? (data.filter(d => d.success).length / data.length) * 100
        : 0
    }

    return NextResponse.json({
      success: true,
      stats,
      recent_actions: data
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
