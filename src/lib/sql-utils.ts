/**
 * Converts MySQL-style (?) parameter placeholders to PostgreSQL-style ($1, $2, etc)
 * @param sql - SQL query with ? placeholders
 * @returns SQL query with $1, $2, etc placeholders
 */
export function convertSQLPlaceholders(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

// Example usage:
// const convertedSQL = convertSQLPlaceholders('SELECT * FROM users WHERE id = ? AND email = ?');
// console.log(convertedSQL); // SELECT * FROM users WHERE id = $1 AND email = $2
