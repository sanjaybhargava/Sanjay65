import { NextRequest, NextResponse } from 'next/server';
import { backupService } from '@/lib/services/backup';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('backupFile') as File;
    const strategy = formData.get('strategy') as string || 'merge';

    if (!file) {
      return NextResponse.json(
        { error: 'No backup file provided' },
        { status: 400 }
      );
    }

    // Validate strategy
    if (strategy !== 'merge' && strategy !== 'replace') {
      return NextResponse.json(
        { error: 'Invalid strategy. Must be "merge" or "replace"' },
        { status: 400 }
      );
    }

    // Create temporary file to save the uploaded backup
    const tempDir = path.join(process.cwd(), 'data', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `temp_backup_${Date.now()}.db`);
    
    try {
      // Save uploaded file to temp location
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(tempFilePath, buffer);

      // Import the database
      const result = await backupService.importDatabase(tempFilePath, strategy as 'merge' | 'replace');

      return NextResponse.json(result);

    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }

  } catch (error) {
    console.error('Backup import error:', error);
    return NextResponse.json(
      { error: 'Failed to import backup' },
      { status: 500 }
    );
  }
}