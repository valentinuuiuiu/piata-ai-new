import { Pool, PoolClient } from 'pg';
import { a2aSignalManager } from './a2a';

/**
 * Universal DB MCP Manager
 * 
 * A flexible database tool manager that allows for dynamic definition of database tools
 * (parameterized SQL) similar to the Google GenAI Toolbox, but integrated directly 
 * into our TypeScript environment.
 */
export interface DBSource {
  id: string;
  connectionString: string;
  maxConnections?: number;
}

export interface DBTool {
  id: string;
  sourceId: string;
  sql: string; // SQL template with named parameters like: SELECT * FROM users WHERE id = {{id}}
  description: string;
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
    description: string;
  }>;
}

export interface UniversalDBConfig {
  sources: DBSource[];
  tools: DBTool[];
}

export class UniversalDBManager {
  private poolMap: Map<string, Pool> = new Map();
  private tools: Map<string, DBTool> = new Map();
  private config: UniversalDBConfig | null = null;

  constructor() {
    // Load configuration from universal-db-config.json
    this.loadConfig();
  }

  /**
   * Load configuration from the JSON file
   */
  private loadConfig(): void {
    try {
      // Using dynamic import to avoid issues with require in TypeScript
      const fs = require('fs');
      const path = require('path');

      const configPath = path.join(process.cwd(), 'universal-db-config.json');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        let config = JSON.parse(configContent);

        // Replace environment variables in connection strings
        if (config.sources) {
          config.sources = config.sources.map((source: any) => {
            if (source.connectionString && typeof source.connectionString === 'string') {
              // Replace environment variable placeholders like ${ENV_VAR}
              source.connectionString = source.connectionString.replace(/\$\{([^}]+)\}/g, (match: string, envVar: string) => {
                return process.env[envVar] || match;
              });
            }
            return source;
          });
        }

        this.config = config;
        this.initializeSources();
        this.initializeTools();
      } else {
        console.log('[UniversalDBManager] No configuration file found, using defaults');
        this.config = { sources: [], tools: [] };
      }
    } catch (error) {
      console.error('[UniversalDBManager] Failed to load configuration:', error);
      this.config = { sources: [], tools: [] };
    }
  }

  /**
   * Initialize database connection pools from sources
   */
  private initializeSources(): void {
    if (!this.config) return;

    for (const source of this.config.sources) {
      try {
        const pool = new Pool({
          connectionString: source.connectionString,
          max: source.maxConnections || 10,
        });

        // Test the connection
        pool.query('SELECT 1', (err) => {
          if (err) {
            console.error(`[UniversalDBManager] Failed to connect to source ${source.id}:`, err);
          } else {
            console.log(`[UniversalDBManager] Connected to source: ${source.id}`);
          }
        });

        this.poolMap.set(source.id, pool);
      } catch (error) {
        console.error(`[UniversalDBManager] Failed to create pool for source ${source.id}:`, error);
      }
    }
  }

  /**
   * Initialize tools from configuration
   */
  private initializeTools(): void {
    if (!this.config) return;

    for (const tool of this.config.tools) {
      this.tools.set(tool.id, tool);
    }
  }

  /**
   * Execute a database tool with provided arguments
   */
  async executeTool(toolName: string, args: Record<string, any>): Promise<any> {
    const startTime = Date.now();
    
    // Log the tool execution attempt
    await a2aSignalManager.broadcastEnhanced('DB_TOOL_EXECUTION_ATTEMPT', {
      toolName,
      args,
      timestamp: new Date()
    }, 'universal-db-manager', 'normal');

    try {
      const tool = this.tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool "${toolName}" not found`);
      }

      // Validate arguments against the tool's parameter schema
      this.validateArguments(tool, args);

      // Get the database pool for this tool's source
      const pool = this.poolMap.get(tool.sourceId);
      if (!pool) {
        throw new Error(`Database source "${tool.sourceId}" not found or not connected`);
      }

      // Replace parameters in the SQL template
      let sql = tool.sql;
      for (const [paramName, paramValue] of Object.entries(args)) {
        // Replace {{paramName}} with the actual value (be careful about SQL injection)
        // For now, we'll use a simple replacement, but in production we should use proper parameterization
        const placeholder = new RegExp(`{{${paramName}}}`, 'g');
        sql = sql.replace(placeholder, this.escapeValue(paramValue));
      }

      // Execute the query
      const client: PoolClient = await pool.connect();
      try {
        const result = await client.query(sql);
        
        const duration = Date.now() - startTime;
        
        // Log successful execution
        await a2aSignalManager.broadcastEnhanced('DB_TOOL_EXECUTION_SUCCESS', {
          toolName,
          duration,
          rowsAffected: result.rowCount,
          timestamp: new Date()
        }, 'universal-db-manager', 'normal');

        return {
          success: true,
          data: result.rows,
          rowCount: result.rowCount,
          executionTime: duration
        };
      } finally {
        client.release();
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`[UniversalDBManager] Tool execution failed:`, error);
      
      // Log failure
      await a2aSignalManager.broadcastEnhanced('DB_TOOL_EXECUTION_FAILED', {
        toolName,
        error: error instanceof Error ? error.message : String(error),
        duration,
        timestamp: new Date()
      }, 'universal-db-manager', 'high');

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: duration
      };
    }
  }

  /**
   * Validate arguments against the tool's parameter schema
   */
  private validateArguments(tool: DBTool, args: Record<string, any>): void {
    for (const param of tool.parameters) {
      if (param.required && args[param.name] === undefined) {
        throw new Error(`Required parameter "${param.name}" is missing for tool "${tool.id}"`);
      }

      if (args[param.name] !== undefined) {
        // Type validation could be added here
        // For now, we just check if required params are present
      }
    }
  }

  /**
   * Basic SQL injection prevention by escaping values
   * Note: This is a basic implementation - in production, use proper parameterized queries
   */
  private escapeValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    
    if (typeof value === 'string') {
      // Simple SQL escaping - in production, use proper parameterized queries
      return "'" + value.replace(/'/g, "''") + "'";
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    
    if (value instanceof Date) {
      return "'" + value.toISOString() + "'";
    }
    
    return String(value);
  }

  /**
   * Add a new tool dynamically
   */
  addTool(tool: DBTool): void {
    this.tools.set(tool.id, tool);
  }

  /**
   * Get available tools
   */
  getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Health check for all database connections
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};

    for (const [sourceId, pool] of this.poolMap.entries()) {
      try {
        await pool.query('SELECT 1');
        status[sourceId] = true;
      } catch (error) {
        status[sourceId] = false;
      }
    }

    return status;
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    for (const [sourceId, pool] of this.poolMap.entries()) {
      try {
        await pool.end();
        console.log(`[UniversalDBManager] Closed connection pool for ${sourceId}`);
      } catch (error) {
        console.error(`[UniversalDBManager] Error closing pool for ${sourceId}:`, error);
      }
    }
    this.poolMap.clear();
  }
}