
// Main entry point for the Email System
export * from './types';
export * from './client';
export * from './templates';
export * from './marketing';
export * from './automation';
export * from './transactional';
export * from './events';

import { EmailMarketingSystem } from './marketing';
export const emailSystem = new EmailMarketingSystem();
