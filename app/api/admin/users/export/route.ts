import { NextRequest, NextResponse } from 'next/server';
import { userExportService } from '@/lib/services/userExport';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    // Get user data
    const users = userExportService.getUsersForExport();
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No users found to export' },
        { status: 404 }
      );
    }

    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    if (format === 'excel' || format === 'xlsx') {
      // Generate Excel-compatible CSV with BOM
      const fileBuffer = userExportService.generateExcelCSV(users);
      const fileName = `users_export_${timestamp}.csv`;

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    } else {
      // Generate regular CSV
      const csvContent = userExportService.generateCSV(users);
      const fileName = `users_export_${timestamp}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': Buffer.byteLength(csvContent, 'utf8').toString(),
        },
      });
    }
  } catch (error) {
    console.error('User export error:', error);
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    );
  }
}