#!/usr/bin/env npx tsx

/**
 * Script to import database backup
 * Usage: npx tsx scripts/import-backup.ts <path-to-backup-file> [strategy]
 * Strategy: 'merge' (default) or 'replace'
 */

import { backupService } from '../lib/services/backup';
import path from 'path';
import fs from 'fs';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: npx tsx scripts/import-backup.ts <path-to-backup-file> [strategy]');
    console.log('Strategy: "merge" (default) or "replace"');
    process.exit(1);
  }

  const backupFilePath = args[0];
  const strategy = (args[1] as 'merge' | 'replace') || 'merge';

  // Validate file exists
  if (!fs.existsSync(backupFilePath)) {
    console.error(`Error: Backup file not found: ${backupFilePath}`);
    process.exit(1);
  }

  // Validate strategy
  if (strategy !== 'merge' && strategy !== 'replace') {
    console.error('Error: Strategy must be "merge" or "replace"');
    process.exit(1);
  }

  console.log(`Importing backup from: ${backupFilePath}`);
  console.log(`Strategy: ${strategy}`);
  console.log('');

  try {
    // Get current database stats before import
    console.log('Current database status:');
    const beforeStats = backupService.getDatabaseStats();
    console.log(`- Users: ${beforeStats.users}`);
    console.log(`- Calculators: ${beforeStats.calculators}`);
    console.log(`- Lessons: ${beforeStats.lessons}`);
    console.log('');

    // Perform import
    console.log('Starting import...');
    const result = await backupService.importDatabase(backupFilePath, strategy);

    if (result.success) {
      console.log('✅ Import completed successfully!');
      console.log(`Message: ${result.message}`);
      
      if (result.importedCounts) {
        console.log('');
        console.log('Imported data:');
        console.log(`- Users: ${result.importedCounts.users}`);
        console.log(`- Calculators: ${result.importedCounts.calculators}`);
        console.log(`- Lessons: ${result.importedCounts.lessons}`);
      }

      if (result.backupFilePath) {
        console.log('');
        console.log(`Backup of original data saved to: ${result.backupFilePath}`);
      }

      // Get final database stats
      console.log('');
      console.log('Final database status:');
      const afterStats = backupService.getDatabaseStats();
      console.log(`- Users: ${afterStats.users}`);
      console.log(`- Calculators: ${afterStats.calculators}`);
      console.log(`- Lessons: ${afterStats.lessons}`);

    } else {
      console.error('❌ Import failed!');
      console.error(`Error: ${result.message}`);
      
      if (result.backupFilePath) {
        console.log(`Your original data has been backed up to: ${result.backupFilePath}`);
      }
      
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Import failed with unexpected error:');
    console.error(error);
    process.exit(1);
  }
}

main();