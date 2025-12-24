/**
 * Google Sheets Integration for Stripe Payments
 * "Every transaction deserves a spreadsheet"
 */

export interface TransactionRecord {
  id: string;
  date: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  product: string;
  description?: string;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  topProducts: string[];
  dailySales: Array<{date: string; amount: number}>;
}

export class GoogleSheetsIntegration {
  private apiKey: string;
  private spreadsheetId: string;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor(apiKey: string, spreadsheetId: string) {
    this.apiKey = apiKey;
    this.spreadsheetId = spreadsheetId;
  }

  /**
   * Record a Stripe payment in Google Sheets
   */
  async recordTransaction(transaction: TransactionRecord): Promise<void> {
    const sheetName = 'Transactions';
    const values = [
      [
        transaction.id,
        transaction.date,
        transaction.customerEmail,
        transaction.amount,
        transaction.currency,
        transaction.status,
        transaction.paymentMethod,
        transaction.product,
        transaction.description || ''
      ]
    ];

    await this.appendToSheet(sheetName, values);
  }

  /**
   * Update inventory based on Stripe sales
   */
  async updateInventory(itemName: string, quantitySold: number, totalAmount: number): Promise<void> {
    const sheetName = 'Inventory';
    
    // Read current inventory
    const inventoryData = await this.readSheet(sheetName);
    
    // Find the item
    const itemRow = inventoryData.find((row: string[]) => 
      row[0]?.toLowerCase().includes(itemName.toLowerCase())
    );

    if (itemRow) {
      // Update quantity and sales
      const currentQuantity = parseInt(itemRow[1] || '0');
      const currentSales = parseFloat(itemRow[3] || '0');
      
      itemRow[1] = (currentQuantity - quantitySold).toString();
      itemRow[3] = (currentSales + totalAmount).toString();
    } else {
      // Add new item
      const values = [[itemName, -quantitySold, new Date().toISOString(), totalAmount]];
      await this.appendToSheet(sheetName, values);
    }
  }

  /**
   * Generate sales analytics
   */
  async getSalesAnalytics(): Promise<SalesAnalytics> {
    const transactionsData = await this.readSheet('Transactions');
    
    if (transactionsData.length < 2) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        averageOrderValue: 0,
        topProducts: [],
        dailySales: []
      };
    }

    const transactions = transactionsData.slice(1).map((row: string[]) => ({
      amount: parseFloat(row[3] || '0'),
      product: row[7] || 'Unknown'
    }));

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalTransactions = transactions.length;
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Calculate top products
    const productCounts = transactions.reduce((acc, t) => {
      acc[t.product] = (acc[t.product] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([product]) => product);

    // Calculate daily sales
    const dailySalesMap = new Map<string, number>();
    for (const t of transactions) {
      const date = new Date().toISOString().split('T')[0]; // Today's date
      dailySalesMap.set(date, (dailySalesMap.get(date) || 0) + t.amount);
    }

    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRevenue,
      totalTransactions,
      averageOrderValue,
      topProducts,
      dailySales
    };
  }

  /**
   * Create a new sales dashboard
   */
  async createDashboard(): Promise<void> {
    const analytics = await this.getSalesAnalytics();
    
    const dashboardData = [
      ['Sales Dashboard - ' + new Date().toLocaleDateString()],
      [''],
      ['Metric', 'Value'],
      ['Total Revenue', `$${analytics.totalRevenue.toFixed(2)}`],
      ['Total Transactions', analytics.totalTransactions.toString()],
      ['Average Order Value', `$${analytics.averageOrderValue.toFixed(2)}`],
      [''],
      ['Top Products'],
      ...analytics.topProducts.map(product => [product])
    ];

    await this.updateSheet('Dashboard', dashboardData);
  }

  /**
   * Private helper methods
   */
  private async appendToSheet(sheetName: string, values: any[][]): Promise<void> {
    const url = `${this.baseUrl}/${this.spreadsheetId}/values/${sheetName}!A:Z:append?valueInputOption=RAW&key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values })
    });

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }
  }

  private async readSheet(sheetName: string): Promise<string[][]> {
    const url = `${this.baseUrl}/${this.spreadsheetId}/values/${sheetName}!A:Z?key=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  }

  private async updateSheet(sheetName: string, values: any[][]): Promise<void> {
    const url = `${this.baseUrl}/${this.spreadsheetId}/values/${sheetName}!A1?valueInputOption=RAW&key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values })
    });

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }
  }
}

/**
 * Helper function to initialize Google Sheets with Stripe integration
 */
export function createStripeSheetsIntegration(): GoogleSheetsIntegration | null {
  const apiKey = process.env.GOOGLE_API_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (!apiKey || !spreadsheetId) {
    console.warn('Google Sheets integration requires GOOGLE_API_KEY and GOOGLE_SHEETS_ID');
    return null;
  }

  return new GoogleSheetsIntegration(apiKey, spreadsheetId);
}