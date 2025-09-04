import { NextRequest, NextResponse } from 'next/server';
import { backupService } from '@/lib/services/backup';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    const success = backupService.deleteBackup(fileName);
    
    if (success) {
      return NextResponse.json({ message: 'Backup deleted successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete backup file' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Backup delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}