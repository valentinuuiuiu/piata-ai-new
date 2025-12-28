#!/usr/bin/env npx tsx
/**
 * N8N Workflow Import via API
 * Automatically imports all workflows using N8N REST API
 */

import * as fs from 'fs';
import * as path from 'path';

const N8N_URL = 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
if (!N8N_API_KEY) throw new Error('N8N_API_KEY is required');
const WORKFLOWS_DIR = '/tmp/piata_n8n_workflows';

interface WorkflowImportResult {
  name: string;
  success: boolean;
  id?: string;
  error?: string;
  active?: boolean;
}

async function testN8NConnection() {
  console.log('🔗 Testing N8N API Connection...\n');

  try {
    const response = await fetch(`${N8N_URL}/api/v1/workflows`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ N8N API Connected!`);
      console.log(`   Found ${data.data?.length || 0} existing workflows\n`);
      
      if (data.data && data.data.length > 0) {
        console.log('   Existing Workflows:');
        data.data.forEach((wf: any) => {
          console.log(`     - ${wf.name} (ID: ${wf.id}) - ${wf.active ? '✓ Active' : '✗ Inactive'}`);
        });
      }
      console.log('');
      
      return { success: true, workflows: data.data || [] };
    } else {
      const error = await response.text();
      console.log(`❌ N8N API Error: ${response.status}`);
      console.log(`   ${error}\n`);
      return { success: false, error };
    }
  } catch (error: any) {
    console.log(`❌ Connection Failed: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function cleanWorkflowForImport(workflowData: any) {
  // Create a clean workflow with required fields
  const cleaned: any = {
    name: workflowData.name || 'Unnamed Workflow',
    nodes: workflowData.nodes || [],
    connections: workflowData.connections || {},
    settings: {}  // Required but must be empty object
  };
  
  // IMPORTANT: Do NOT include tags, active, id, createdAt, updatedAt (read-only)
  
  return cleaned;
}

async function importWorkflow(workflowPath: string): Promise<WorkflowImportResult> {
  const workflowName = path.basename(workflowPath, '.json');
  console.log(`📦 Importing: ${workflowName}...`);

  try {
    // Read and parse workflow
    const rawData = fs.readFileSync(workflowPath, 'utf-8');
    const workflowData = JSON.parse(rawData);
    
    // Clean workflow for import
    const cleanedWorkflow = await cleanWorkflowForImport(workflowData);
    
    console.log(`   Cleaned workflow: ${cleanedWorkflow.name}`);
    console.log(`   Nodes: ${cleanedWorkflow.nodes?.length || 0}`);
    
    // Import via API
    const response = await fetch(`${N8N_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(cleanedWorkflow)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Imported successfully! (ID: ${data.id})`);
      
      // Try to activate
      await activateWorkflow(data.id, data.name);
      
      return { 
        name: workflowName, 
        success: true, 
        id: data.id,
        active: data.active 
      };
    } else {
      const errorText = await response.text();
      let errorMsg = `${response.status}: ${errorText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.message || errorMsg;
      } catch (e) {
        // Ignored
      }
      
      console.log(`   ❌ Import failed: ${errorMsg}`);
      return { name: workflowName, success: false, error: errorMsg };
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return { name: workflowName, success: false, error: error.message };
  }
}

async function activateWorkflow(workflowId: string, workflowName: string): Promise<boolean> {
  console.log(`   ⚡ Activating workflow...`);

  try {
    // First get the workflow to update it
    const getResponse = await fetch(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!getResponse.ok) {
      console.log(`   ⚠️  Could not fetch workflow for activation`);
      return false;
    }

    const workflow = await getResponse.json();
    workflow.active = true;

    // Update with active=true
    const updateResponse = await fetch(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(workflow)
    });

    if (updateResponse.ok) {
      console.log(`   ✅ Activated!\n`);
      return true;
    } else {
      console.log(`   ⚠️  Activation status: ${updateResponse.status}\n`);
      return false;
    }
  } catch (error: any) {
    console.log(`   ⚠️  Activation error: ${error.message}\n`);
    return false;
  }
}

async function importAllWorkflows() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     N8N WORKFLOWS - AUTOMATED IMPORT VIA API         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Test connection
  const connectionTest = await testN8NConnection();
  if (!connectionTest.success) {
    console.log('❌ Cannot proceed without N8N connection.');
    console.log('   Make sure N8N is running: docker ps | grep n8n');
    console.log('   Check API key is correct in .env\n');
    return;
  }

  // Find workflow files
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.log(`❌ Workflows directory not found: ${WORKFLOWS_DIR}\n`);
    return;
  }

  const workflowFiles = fs.readdirSync(WORKFLOWS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(WORKFLOWS_DIR, f));

  console.log(`📂 Found ${workflowFiles.length} workflow files\n`);
  console.log('═══════════════════════════════════════════════════════\n');

  const results: WorkflowImportResult[] = [];

  // Import each workflow
  for (const workflowFile of workflowFiles) {
    const result = await importWorkflow(workflowFile);
    results.push(result);
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 IMPORT SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Files: ${workflowFiles.length}`);
  console.log(`✅ Successfully Imported: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (successful > 0) {
    console.log('\n✅ Imported Workflows:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   - ${r.name} (ID: ${r.id})`);
    });
  }
  
  if (failed > 0) {
    console.log('\n❌ Failed Workflows:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  
  // Final verification
  console.log('\n🔍 Verifying N8N workflows...\n');
  await testN8NConnection();
  
  if (successful === workflowFiles.length) {
    console.log('🎉 ALL WORKFLOWS IMPORTED AND ACTIVATED!\n');
  } else if (successful > 0) {
    console.log('⚠️  Partial success - Some workflows imported.\n');
  } else {
    console.log('❌ Import failed - Check errors above.\n');
  }
}

// Run import
importAllWorkflows().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
