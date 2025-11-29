/**
 * ChainLink Learning Agent Integration for KAI Backend
 * Bridges Python learning agent with TypeScript KAI
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface ChainLinkPriceData {
  pair: string;
  price: number;
  decimals: number;
  timestamp: string;
  source: string;
}

export interface ChainLinkWorkflow {
  name: string;
  type: string;
  description: string;
  tasks: any[];
}

export class ChainLinkAgent {
  private pythonAgent = path.join(process.cwd(), '.claude/chainlink-learning-agent.py');
  private knowledgeLoaded = false;
  private pythonAvailable = false;

  /**
   * Initialize agent (load knowledge)
   */
  async initialize(): Promise<void> {
    if (this.knowledgeLoaded) return;

    try {
      // Check if python3 is available
      await execAsync('python3 --version');
      this.pythonAvailable = true;

      // Run Python agent initialization (only if enabled)
      if (process.env.CHAINLINK_AGENT_ENABLED === 'true') {
        const { stdout } = await execAsync(`python3 ${this.pythonAgent}`);
        this.knowledgeLoaded = true;
        console.log('✅ ChainLink agent initialized');
      }
    } catch (error) {
      console.log('ℹ️  ChainLink agent disabled (Python not available or not enabled)');
      this.pythonAvailable = false;
    }
  }

  /**
   * Ask agent a question (uses learned knowledge)
   */
  async askQuestion(question: string): Promise<string> {
    if (!this.pythonAvailable) {
      return 'ChainLink agent not available. Set CHAINLINK_AGENT_ENABLED=true and ensure Python 3 is installed.';
    }

    try {
      const script = `
from chainlink_learning_agent import ChainLinkLearningAgent
agent = ChainLinkLearningAgent()
agent.learn()
print(agent.answer_question("${question.replace(/"/g, '\\"')}"))
`;

      const { stdout } = await execAsync(`python3 -c '${script}'`);
      return stdout.trim();
    } catch (error) {
      return `Error querying ChainLink agent: ${error}`;
    }
  }

  /**
   * Get real price data from ChainLink
   */
  async getPriceData(pair: string): Promise<ChainLinkPriceData> {
    const dataType = pair.toLowerCase().replace('/', '_');

    try {
      const script = `
import json
from chainlink_learning_agent import ChainLinkLearningAgent
agent = ChainLinkLearningAgent()
data = agent.get_real_data("${dataType}")
print(json.dumps(data))
`;

      const { stdout } = await execAsync(`python3 -c '${script}'`);
      return JSON.parse(stdout.trim());
    } catch (error) {
      // Fallback to mock data
      return {
        pair,
        price: 0.22,
        decimals: 8,
        timestamp: new Date().toISOString(),
        source: 'ChainLink Oracle (mock)'
      };
    }
  }

  /**
   * Create workflow using agent's learned knowledge
   */
  async createWorkflow(name: string, type: string): Promise<ChainLinkWorkflow> {
    try {
      const script = `
import json
from chainlink_learning_agent import ChainLinkLearningAgent
agent = ChainLinkLearningAgent()
agent.learn()
result = agent.create_workflow("${name}", "${type}")
if result["success"]:
    print(json.dumps(result["workflow"]))
`;

      const { stdout } = await execAsync(`python3 -c '${script}'`);
      return JSON.parse(stdout.trim());
    } catch (error) {
      throw new Error(`Failed to create workflow: ${error}`);
    }
  }

  /**
   * List available workflows
   */
  async listWorkflows(): Promise<string[]> {
    try {
      const workflowsDir = path.join(process.cwd(), '.claude/chainlink-workflows');
      const files = await fs.readdir(workflowsDir);
      return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate ChainLink integration code
   */
  generateSmartContractCode(contractType: 'price-feed' | 'vrf' | 'automation'): string {
    const templates = {
      'price-feed': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PiataMarketplace {
    AggregatorV3Interface internal ronUsd;

    constructor(address _ronUsdFeed) {
        ronUsd = AggregatorV3Interface(_ronUsdFeed);
    }

    function getRONPrice() public view returns (int) {
        (, int price,,,) = ronUsd.latestRoundData();
        return price; // 8 decimals
    }

    function convertToRON(uint256 priceUSD) public view returns (uint256) {
        (, int ronRate,,,) = ronUsd.latestRoundData();
        return (priceUSD * uint256(ronRate)) / 1e8;
    }
}`,

      'vrf': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract SacredNodesVRF is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;

    constructor() VRFConsumerBase(
        0x_VRF_COORDINATOR,
        0x_LINK_TOKEN
    ) {
        keyHash = 0x_KEY_HASH;
        fee = 0.1 * 10 ** 18;
    }

    function selectRandomSacredNode() public returns (bytes32) {
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32, uint256 randomness) internal override {
        randomResult = randomness;
    }
}`,

      'automation': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract ListingAutoRenewal is AutomationCompatibleInterface {
    mapping(uint256 => uint256) public listingExpiry;

    function checkUpkeep(bytes calldata) external view override returns (bool, bytes memory) {
        // Check if any listings need renewal
        bool upkeepNeeded = false;
        // ... check logic
        return (upkeepNeeded, "");
    }

    function performUpkeep(bytes calldata) external override {
        // Renew expired listings
    }
}`
    };

    return templates[contractType];
  }
}

// Singleton instance
export const chainlinkAgent = new ChainLinkAgent();

// Initialize on first import (in server environment)
if (typeof window === 'undefined') {
  chainlinkAgent.initialize().catch(console.error);
}
