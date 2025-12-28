
import { piataAgent } from '../src/lib/piata-agent';
import { emailSystem } from '../src/lib/email-system';
import { socialMediaAutomation } from '../src/lib/social-media-automation';
import { workflowRegistry } from '../src/lib/internal-workflow-registry';
import { antigravityAgent } from '../src/lib/agents/antigravity-agent';
import { gemmaAgent } from '../src/lib/agents/gemma-agent';
import { opalAgent } from '../src/lib/agents/opal-agent';
import { pixelAgent } from '../src/lib/agents/pixel-agent';

async function verifyHealth() {
  console.log('🏥 Starting Health Check for All Agents...');

  try {
    const checks = [
      { name: 'Piata Agent', instance: piataAgent },
      { name: 'Email System', instance: emailSystem },
      { name: 'Social Media Automation', instance: socialMediaAutomation },
      { name: 'Workflow Registry', instance: workflowRegistry },
      { name: 'Antigravity Agent', instance: antigravityAgent },
      { name: 'Gemma Agent', instance: gemmaAgent },
      { name: 'Opal Agent', instance: opalAgent },
      { name: 'Pixel Agent (UI Pro)', instance: pixelAgent }
    ];

    let successCount = 0;

    for (const check of checks) {
      if (check.instance) {
        console.log(`✅ ${check.name} is online.`);
        successCount++;
      } else {
        console.error(`❌ ${check.name} is offline/missing.`);
      }
    }

    if (workflowRegistry) {
      await workflowRegistry.initialize();
      console.log('✅ Workflow Registry initialized.');
    }

    if (successCount === checks.length) {
      console.log(`🎉 The Full Council is assembled! (${successCount}/${checks.length} Agents active)`);
    } else {
      console.warn(`⚠️ Only ${successCount}/${checks.length} Agents are ready.`);
    }

  } catch (error) {
    console.error('❌ Health Check Failed:', error);
    process.exit(1);
  }
}

verifyHealth();
