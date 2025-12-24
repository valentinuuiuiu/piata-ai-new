/**
 * Fanny Mae AI Agent System
 * Guardian of Value
 */

import { query } from '@/lib/db';

export interface AgentTool {
  name: string;
  description: string;
  parameters: {
    [key: string]: {
      type: string;
      description: string;
      required?: boolean;
    };
  };
  execute: (params: any) => Promise<any>;
}

export interface AgentPattern {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  actions: AgentAction[];
  enabled: boolean;
}

export interface AgentAction {
  tool: string;
  parameters: any;
}

class FannyMaeAgent {
  private tools: Map<string, AgentTool> = new Map();
  private patterns: Map<string, AgentPattern> = new Map();

  constructor() {
    console.log('💰 Fanny Mae awakens... The Treasury is open.');
    this.initializeTools();
    this.initializePatterns();
  }

  private initializeTools() {
    this.addTool({
      name: 'assess_value',
      description: 'Assess the value of a feature or task.',
      parameters: {
        description: { type: 'string', description: 'Description of the feature or task', required: true },
        complexity: { type: 'number', description: 'Estimated complexity (1-10)', required: true },
        impact: { type: 'number', description: 'Estimated impact (1-10)', required: true }
      },
      execute: async ({ description, complexity, impact }) => {
        const value = (impact * 10) / complexity;
        return { description, complexity, impact, value };
      }
    });

    this.addTool({
        name: 'generate_financial_report',
        description: 'Generate a financial report.',
        parameters: {
            reportType: { type: 'string', description: 'Type of report (e.g., "revenue", "spending")', required: true }
        },
        execute: async ({ reportType }) => {
            if (reportType === 'revenue') {
                const revenueData = await query('SELECT SUM(amount_eur) as total_revenue FROM credits_transactions WHERE amount_eur > 0');
                return { reportType, data: revenueData };
            } else if (reportType === 'spending') {
                const spendingData = await query('SELECT SUM(amount_eur) as total_spending FROM credits_transactions WHERE amount_eur < 0');
                return { reportType, data: spendingData };
            } else {
                return { error: 'Invalid report type' };
            }
        }
    });
  }

  private initializePatterns() {
    this.addPattern({
      id: 'auto_assess_task_value',
      name: 'Auto-Assess Task Value',
      description: 'Automatically assesses the value of new tasks.',
      triggers: ['new_task_created'],
      actions: [
        {
          tool: 'assess_value',
          parameters: {
            description: '{{task.description}}',
            complexity: '{{task.complexity}}',
            impact: '{{task.impact}}'
          }
        }
      ],
      enabled: true
    });
  }

  addTool(tool: AgentTool) {
    this.tools.set(tool.name, tool);
  }

  getTools(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  addPattern(pattern: AgentPattern) {
    this.patterns.set(pattern.id, pattern);
  }

  getPatterns(): AgentPattern[] {
    return Array.from(this.patterns.values());
  }

  async executeTask(description: string): Promise<any> {
    console.log(`🏦 Fanny Mae executing task: "${description}"`);
    
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('revenue report')) {
        return await this.tools.get('generate_financial_report')?.execute({ reportType: 'revenue' });
    } else if (lowerDesc.includes('spending report')) {
        return await this.tools.get('generate_financial_report')?.execute({ reportType: 'spending' });
    } else {
        return { error: 'Unknown task' };
    }
  }
}

export const fannyMaeAgent = new FannyMaeAgent();
