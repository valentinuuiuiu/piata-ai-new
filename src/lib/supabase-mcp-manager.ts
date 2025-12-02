#!/usr/bin/env npx tsx
/**
 * Jules Supabase MCP Manager
 * Provides Jules with direct database access for financial operations
 */

import { createClient } from './supabase/server';
import Stripe from 'stripe';

// Initialize Stripe conditionally for webhook processing
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20' as any,
  });
}

interface MCPRequest {
  id: string;
  method: string;
  params: any;
}

interface MCPResponse {
  id: string;
  result?: any;
  error?: {
    code: string;
    message: string;
  };
}

// Database operation functions
class SupabaseManager {
  private supabase: any;

  constructor() {
    this.supabase = createClient();
  }

  // Get credit packages
  async getCreditPackages() {
    const { data, error } = await this.supabase
      .from('credit_packages')
      .select('id, name, credits, price, stripe_price_id')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get user credits balance
  async getUserCredits(userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('credits_balance, full_name')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Update user credits
  async updateUserCredits(userId: string, creditsToAdd: number, transactionType: string = 'purchase') {
    // First get current balance
    const { data: current, error: fetchError } = await this.supabase
      .from('user_profiles')
      .select('credits_balance')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newBalance = current.credits_balance + creditsToAdd;

    // Update balance
    const { data: updated, error: updateError } = await this.supabase
      .from('user_profiles')
      .update({ 
        credits_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select('credits_balance')
      .single();

    if (updateError) throw updateError;

    return updated;
  }

  // Record credit transaction
  async recordTransaction(data: {
    userId: string;
    packageId?: number;
    creditsAmount: number;
    amountEur?: number;
    stripePaymentId?: string;
    status?: string;
  }) {
    const { data: transaction, error } = await this.supabase
      .from('credits_transactions')
      .insert({
        user_id: data.userId,
        package_id: data.packageId || null,
        credits_amount: data.creditsAmount,
        amount_eur: data.amountEur || null,
        stripe_payment_id: data.stripePaymentId || null,
        status: data.status || 'completed',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return transaction;
  }

  // Process Stripe webhook
  async processStripeWebhook(event: any) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, credits, packageId } = session.metadata;

      if (userId && credits) {
        try {
          // Update user credits
          await this.updateUserCredits(userId, parseInt(credits));
          
          // Record transaction
          await this.recordTransaction({
            userId,
            packageId: packageId ? parseInt(packageId) : undefined,
            creditsAmount: parseInt(credits),
            amountEur: session.amount_total ? session.amount_total / 100 : undefined,
            stripePaymentId: session.id,
            status: 'completed'
          });

          console.log(`✅ Successfully processed payment for user ${userId}: +${credits} credits`);
          return { success: true, creditsAdded: parseInt(credits) };
        } catch (error) {
          console.error('❌ Error processing webhook:', error);
          return { success: false, error: (error instanceof Error) ? error.message : String(error) };
        }
      }
    }

    return { success: true, message: 'Event type not processed' };
  }

  // Get transaction history
  async getTransactionHistory(userId: string, limit: number = 10) {
    const { data, error } = await this.supabase
      .from('credits_transactions')
      .select('id, credits_amount, status, stripe_payment_id, created_at, package_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

// Jules MCP message handler
class JulesMCPManager {
  private supabaseManager: SupabaseManager;
  private isRunning: boolean = false;

  constructor() {
    this.supabaseManager = new SupabaseManager();
    this.isRunning = true;
  }

  // Handle incoming MCP requests from Jules
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      const { id, method, params } = request;

      switch (method) {
        case 'get_credit_packages':
          const packages = await this.supabaseManager.getCreditPackages();
          return { id, result: { packages } };

        case 'get_user_credits':
          const credits = await this.supabaseManager.getUserCredits(params.userId);
          return { id, result: credits };

        case 'update_user_credits':
          const updated = await this.supabaseManager.updateUserCredits(
            params.userId, 
            params.creditsToAdd,
            params.transactionType
          );
          return { id, result: updated };

        case 'record_transaction':
          const transaction = await this.supabaseManager.recordTransaction(params);
          return { id, result: transaction };

        case 'get_transaction_history':
          const history = await this.supabaseManager.getTransactionHistory(
            params.userId,
            params.limit || 10
          );
          return { id, result: { transactions: history } };

        case 'process_stripe_webhook':
          const webhookResult = await this.supabaseManager.processStripeWebhook(params.event);
          return { id, result: webhookResult };

        case 'health_check':
          return { id, result: { status: 'healthy', timestamp: new Date().toISOString() } };

        default:
          return {
            id,
            error: { code: 'METHOD_NOT_FOUND', message: `Method ${method} not implemented` }
          };
      }
    } catch (error) {
      return {
        id: request.id,
        error: { code: 'INTERNAL_ERROR', message: (error instanceof Error) ? error.message : String(error) }
      };
    }
  }

  // Simple MCP server loop
  async startServer() {
    console.log('🚀 Jules Supabase MCP Manager started');
    console.log('📊 Ready to handle database operations for Jules');
    
    // For now, we'll just keep the process alive
    // In a full implementation, this would listen for MCP requests
    while (this.isRunning) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  stop() {
    this.isRunning = false;
  }
}

// Start the MCP manager
const manager = new JulesMCPManager();

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Jules Supabase MCP Manager...');
  manager.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Jules Supabase MCP Manager...');
  manager.stop();
  process.exit(0);
});

// Handle command line arguments for testing
if (process.argv.includes('--test')) {
  // Run basic tests
  async function runTests() {
    console.log('🧪 Running Jules Supabase MCP tests...');
    
    try {
      // Test credit packages
      const packages = await manager.handleRequest({
        id: 'test1',
        method: 'get_credit_packages',
        params: {}
      });
      console.log('✅ Credit packages test:', packages.result);

      // Test health check
      const health = await manager.handleRequest({
        id: 'test2',
        method: 'health_check',
        params: {}
      });
      console.log('✅ Health check test:', health.result);

      console.log('🎉 All tests passed!');
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
    
    process.exit(0);
  }

  runTests();
} else {
  // Start server
  manager.startServer().catch(error => {
    console.error('❌ Failed to start Jules Supabase MCP Manager:', error);
    process.exit(1);
  });
}