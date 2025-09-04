'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Force this page to be dynamic - it's an admin panel
export const dynamic = 'force-dynamic';

interface BackupStatus {
  currentDatabase: {
    users: number;
    calculators: number;
    lessons: number;
  };
  recentBackups: Array<{
    fileName: string;
    filePath: string;
    size: number;
    created: string;
  }>;
  totalBackups: number;
}

interface ImportResult {
  success: boolean;
  message: string;
  importedCounts?: {
    users: number;
    calculators: number;
    lessons: number;
  };
  backupFilePath?: string;
}

export default function BackupPage() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importStrategy, setImportStrategy] = useState<'merge' | 'replace'>('merge');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBackupStatus();
  }, []);

  const loadBackupStatus = async () => {
    try {
      const response = await fetch('/api/admin/backup/status');
      if (response.ok) {
        const data = await response.json();
        setBackupStatus(data);
      }
    } catch (error) {
      console.error('Failed to load backup status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/backup/export', {
        method: 'POST'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Extract filename from response headers or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileName = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : `zerofinanx_backup_${new Date().toISOString().slice(0, 10)}.db`;
        
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setMessage({ type: 'success', text: 'Database backup downloaded successfully!' });
        loadBackupStatus(); // Refresh status
      } else {
        throw new Error('Failed to export database');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export database. Please try again.' });
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!fileInputRef.current?.files?.[0]) {
      setMessage({ type: 'error', text: 'Please select a backup file to import.' });
      return;
    }

    setImportLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('backupFile', fileInputRef.current.files[0]);
      formData.append('strategy', importStrategy);

      const response = await fetch('/api/admin/backup/import', {
        method: 'POST',
        body: formData
      });

      const result: ImportResult = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadBackupStatus(); // Refresh status
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import database. Please try again.' });
    } finally {
      setImportLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 h-64 bg-gray-300"></div>
              <div className="bg-white rounded-lg p-6 h-64 bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin" 
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Database Backup & Restore</h1>
          <p className="text-gray-600 mt-2">
            Export your database for backup or import data from existing backups
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Current Database Status */}
        {backupStatus && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Database</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{backupStatus.currentDatabase.users}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{backupStatus.currentDatabase.calculators}</div>
                <div className="text-sm text-gray-600">Calculators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{backupStatus.currentDatabase.lessons}</div>
                <div className="text-sm text-gray-600">Lessons</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Database */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Database</h2>
            <p className="text-gray-600 mb-6">
              Create a backup of your current database. This will download a .db file that you can use to restore your data later.
            </p>
            
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {exportLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Backup...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Backup
                </>
              )}
            </button>
          </div>

          {/* Import Database */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Database</h2>
            <p className="text-gray-600 mb-4">
              Restore data from a backup file. Choose your import strategy carefully.
            </p>

            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label htmlFor="backupFile" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Backup File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="backupFile"
                  accept=".db"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Import Strategy
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="strategy"
                      value="merge"
                      checked={importStrategy === 'merge'}
                      onChange={(e) => setImportStrategy(e.target.value as 'merge')}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      <strong>Merge:</strong> Add new data, update existing records
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="strategy"
                      value="replace"
                      checked={importStrategy === 'replace'}
                      onChange={(e) => setImportStrategy(e.target.value as 'replace')}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      <strong>Replace:</strong> Clear existing data, import backup data
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={importLoading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Import Backup
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> A backup of your current database will be created automatically before importing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Backups */}
        {backupStatus && backupStatus.recentBackups.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Backups ({backupStatus.totalBackups} total)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backupStatus.recentBackups.map((backup, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {backup.fileName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(backup.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(backup.created)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}