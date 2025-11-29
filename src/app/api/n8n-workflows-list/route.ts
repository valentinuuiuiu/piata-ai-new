/**
 * N8N Workflows List API - Browse the 2,058 workflows by category
 */

import { NextRequest } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

const WORKFLOWS_BASE = '/home/shiva/Documents/workflows/workflows';

const CATEGORIES = {
  'ai_agent': '01_ai_agent_development',
  'communication': '02_communication_messaging',
  'data_processing': '03_data_processing_analysis',
  'marketing': '04_marketing_automation',
  'ecommerce': '05_ecommerce_retail',
  'crm': '06_crm_sales',
  'project': '07_project_management',
  'social': '08_social_media',
  'storage': '09_cloud_storage',
  'scraping': '10_web_scraping',
  'business': '11_business_automation',
  'content': '12_creative_content',
  'design': '13_creative_design',
  'devops': '14_technical_devops',
  'finance': '15_financial_accounting'
};

export async function POST(req: NextRequest) {
  try {
    const { category } = await req.json();

    let workflowsPath = WORKFLOWS_BASE;

    if (category && CATEGORIES[category as keyof typeof CATEGORIES]) {
      workflowsPath = join(WORKFLOWS_BASE, CATEGORIES[category as keyof typeof CATEGORIES]);
    }

    const files = await readdir(workflowsPath, { withFileTypes: true });

    if (!category) {
      // Return all categories with counts
      const categories = files
        .filter(f => f.isDirectory())
        .map(f => ({
          id: Object.keys(CATEGORIES).find(k => CATEGORIES[k as keyof typeof CATEGORIES] === f.name),
          name: f.name,
          folder: f.name
        }));

      const categoriesWithCounts = await Promise.all(
        categories.map(async (cat) => {
          const catPath = join(WORKFLOWS_BASE, cat.folder);
          const catFiles = await readdir(catPath);
          const workflowCount = catFiles.filter(f => f.endsWith('.json')).length;

          return {
            ...cat,
            count: workflowCount
          };
        })
      );

      return Response.json({
        success: true,
        categories: categoriesWithCounts,
        total: categoriesWithCounts.reduce((sum, cat) => sum + cat.count, 0)
      });
    }

    // Return workflows in category
    const workflows = files
      .filter(f => f.name.endsWith('.json'))
      .map(f => ({
        name: f.name,
        path: category ? `${CATEGORIES[category as keyof typeof CATEGORIES]}/${f.name}` : f.name
      }));

    return Response.json({
      success: true,
      category,
      workflows,
      count: workflows.length
    });

  } catch (error: any) {
    console.error('[N8N Workflows List] Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Return category list
    const categoriesData = Object.entries(CATEGORIES).map(([id, folder]) => ({
      id,
      folder,
      name: folder.replace(/^\d+_/, '').replace(/_/g, ' ').toUpperCase()
    }));

    return Response.json({
      success: true,
      categories: categoriesData
    });

  } catch (error: any) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
