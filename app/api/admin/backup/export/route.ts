import { NextResponse } from 'next/server';
import { backupService } from '@/lib/services/backup';
import fs from 'fs';

export async function POST() {
  try {
    const result = await backupService.exportDatabase();
    
    if (!result.success || !result.filePath) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    // Read the backup file
    const fileBuffer = fs.readFileSync(result.filePath);
    const fileName = `zerofinanx_backup_${result.timestamp}.db`;

    // Return the file as a download
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Backup export error:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}