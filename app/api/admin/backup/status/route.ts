import { NextResponse } from 'next/server';
import { backupService } from '@/lib/services/backup';

export async function GET() {
  try {
    const backups = backupService.listBackups();
    const stats = backupService.getDatabaseStats();

    return NextResponse.json({
      currentDatabase: stats,
      recentBackups: backups.slice(0, 10), // Return last 10 backups
      totalBackups: backups.length
    });
  } catch (error) {
    console.error('Backup status error:', error);
    return NextResponse.json(
      { error: 'Failed to get backup status' },
      { status: 500 }
    );
  }
}