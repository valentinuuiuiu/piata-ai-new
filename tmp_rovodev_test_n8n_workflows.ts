#!/usr/bin/env npx tsx
/**
 * Test N8N Workflows Integration
 * Import and activate workflows programmatically
 */

import * as fs from 'fs';
import * as path from 'path';

const N8N_URL = 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
if (!N8N_API_KEY) throw new Error('N8N_API_KEY is required');

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
      
      return data.data || [];
    } else {
      console.log(`❌ N8N API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`   Response: ${text}\n`);
      return null;
    }
  } catch (error: any) {
    console.log(`❌ Connection Failed: ${error.message}\n`);
    return null;
  }
}

async function importWorkflow(workflowPath: string) {
  const workflowName = path.basename(workflowPath, '.json');
  console.log(`📦 Importing: ${workflowName}`);

  try {
    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
    
    const response = await fetch(`${N8N_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(workflowData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Imported successfully! (ID: ${data.id})`);
      return data;
    } else {
      const error = await response.text();
      console.log(`   ❌ Import failed: ${response.status} - ${error}`);
      return null;
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function activateWorkflow(workflowId: string, workflowName: string) {
  console.log(`⚡ Activating: ${workflowName}`);

  try {
    const response = await fetch(`${N8N_URL}/api/v1/workflows/${workflowId}/activate`, {
      method: 'PATCH',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      console.log(`   ✅ Activated!\n`);
      return true;
    } else {
      console.log(`   ⚠️  Activation status: ${response.status}\n`);
      return false;
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function importAllWorkflows() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     N8N WORKFLOWS - IMPORT & ACTIVATION TEST         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Test connection first
  const existingWorkflows = await testN8NConnection();
  if (existingWorkflows === null) {
    console.log('❌ Cannot proceed without N8N connection. Exiting.\n');
    return;
  }

  // Find workflow files
  const workflowsDir = '/tmp/piata_n8n_workflows';
  if (!fs.existsSync(workflowsDir)) {
    console.log(`❌ Workflows directory not found: ${workflowsDir}\n`);
    return;
  }

  const workflowFiles = fs.readdirSync(workflowsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(workflowsDir, f));

  console.log(`\n📂 Found ${workflowFiles.length} workflow files to import\n`);
  console.log('═══════════════════════════════════════════════════════\n');

  let imported = 0;
  let activated = 0;

  for (const workflowFile of workflowFiles) {
    const result = await importWorkflow(workflowFile);
    
    if (result && result.id) {
      imported++;
      
      // Try to activate
      const isActivated = await activateWorkflow(result.id, result.name);
      if (isActivated) activated++;
    }
  }

  // Final summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 IMPORT SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`Total Workflow Files: ${workflowFiles.length}`);
  console.log(`✅ Successfully Imported: ${imported}`);
  console.log(`⚡ Successfully Activated: ${activated}`);
  console.log(`❌ Failed: ${workflowFiles.length - imported}`);
  
  if (imported === workflowFiles.length && activated === workflowFiles.length) {
    console.log('\n🎉 ALL WORKFLOWS IMPORTED AND ACTIVATED!\n');
  } else if (imported > 0) {
    console.log('\n✅ Partial success - Some workflows imported.\n');
  } else {
    console.log('\n❌ Import failed - Check N8N logs and API key.\n');
  }

  // List final state
  console.log('═══════════════════════════════════════════════════════');
  await testN8NConnection();
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run the import
importAllWorkflows().catch(console.error);
