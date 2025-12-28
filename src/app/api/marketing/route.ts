import { NextResponse } from 'next/server';

// Ensure this route is always executed dynamically (avoid build-time evaluation pitfalls)
export const dynamic = 'force-dynamic';

async function getNotebook() {
  const mod = await import('../../../lib/notebooklm-integration');
  return {
    notebook: mod.getNotebookLLM(),
    workflows: mod.MARKETING_WORKFLOWS,
  };
}

/**
 * Marketing Automation API
 * 
 * Use NotebookLLM-style intelligence for:
 * - Email campaigns
 * - Social media posts
 * - Trend analysis
 * - User feedback insights
 */

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();
    const { notebook, workflows } = await getNotebook();

    switch (action) {
      case 'analyze': {
        // Analyze sources for marketing insights
        const insights = await notebook.analyzeForMarketing(data.sources || []);
        return NextResponse.json({ success: true, insights });
      }

      case 'email-campaign': {
        // Generate email campaign
        const campaign = await notebook.generateEmailCampaign(
          data.products || [],
          data.audience || 'General audience'
        );
        return NextResponse.json({ success: true, campaign });
      }

      case 'social-posts': {
        // Generate social media posts
        const posts = await notebook.generateSocialPosts(
          data.listing,
          data.platforms || ['facebook', 'linkedin']
        );
        return NextResponse.json({ success: true, posts });
      }

      case 'trend-report': {
        // Generate trend report
        const report = await notebook.generateTrendReport(data.category || 'Electronics');
        return NextResponse.json({ success: true, report });
      }

      case 'feedback-analysis': {
        // Analyze user feedback
        const feedback = await notebook.analyzeUserFeedback(data.reviews || []);
        return NextResponse.json({ success: true, analysis: feedback });
      }

      case 'sheet-analysis': {
        // Analyze Google Sheets data
        const sheetInsights = await notebook.analyzeSheetData(data.sheetData || []);
        return NextResponse.json({ success: true, insights: sheetInsights });
      }

      case 'workflow': {
        // Run preset workflow
        const workflow = workflows[data.workflowName as keyof typeof workflows];
        if (!workflow) {
          return NextResponse.json({
            success: false,
            error: 'Workflow not found'
          }, { status: 404 });
        }
        const result = await workflow(data.params);
        return NextResponse.json({ success: true, result });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Marketing API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // List available workflows
  const { workflows } = await getNotebook();
  return NextResponse.json({
    success: true,
    workflows: Object.keys(workflows),
    actions: [
      'analyze',
      'email-campaign',
      'social-posts',
      'trend-report',
      'feedback-analysis',
      'sheet-analysis',
      'workflow'
    ]
  });
}
