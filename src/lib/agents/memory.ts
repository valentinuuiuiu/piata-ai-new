import redisCache from '../redis-cache';

export interface AgentMemoryItem {
  timestamp: string;
  agentName: string;
  task: string;
  outcome: any;
  context?: any;
}

export class AgentMemory {
  private static PREFIX = 'agent_memory:';
  private static SESSION_TTL = 86400; // 24 hours

  /**
   * Keep a thought or outcome in memory
   */
  static async remember(agentName: string, task: string, outcome: any, context?: any) {
    const memoryKey = `${this.PREFIX}${agentName}:latest`;
    const memoryItem: AgentMemoryItem = {
      timestamp: new Date().toISOString(),
      agentName,
      task,
      outcome,
      context
    };

    await redisCache.connect();
    await redisCache.set(memoryKey, memoryItem, this.SESSION_TTL);
    
    // Also push to a list of historical memories for this agent (last 10)
    const historyKey = `${this.PREFIX}${agentName}:history`;
    // Note: redisCache doesn't have LPUSH, so we'll fetch and update for now
    // or we could add LPUSH to redis-cache.ts later.
    let history = await redisCache.get<AgentMemoryItem[]>(historyKey) || [];
    history.unshift(memoryItem);
    await redisCache.set(historyKey, history.slice(0, 10), this.SESSION_TTL);
  }

  /**
   * Recall the latest memory for an agent
   */
  static async recallLatest(agentName: string): Promise<AgentMemoryItem | null> {
    await redisCache.connect();
    const memoryKey = `${this.PREFIX}${agentName}:latest`;
    return await redisCache.get<AgentMemoryItem>(memoryKey);
  }

  /**
   * Recall full history for an agent
   */
  static async recallHistory(agentName: string): Promise<AgentMemoryItem[]> {
    await redisCache.connect();
    const historyKey = `${this.PREFIX}${agentName}:history`;
    return await redisCache.get<AgentMemoryItem[]>(historyKey) || [];
  }
}
