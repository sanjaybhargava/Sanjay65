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

    // Wait for file to be fully written and readable
    let retries = 10;
    let fileBuffer: Buffer;
    
    while (retries > 0) {
      try {
        if (fs.existsSync(result.filePath)) {
          fileBuffer = fs.readFileSync(result.filePath);
          if (fileBuffer.length > 0) {
            break;
          }
        }
      } catch (error) {
        // File might still be being written
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      retries--;
      
      if (retries === 0) {
        throw new Error(`Backup file not accessible: ${result.filePath}`);
      }
    }
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