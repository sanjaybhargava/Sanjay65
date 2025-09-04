'use client';

import React from 'react';
import Link from 'next/link';

// Force this page to be dynamic - it's an admin panel
export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your ZeroFinanx application settings
          </p>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          

          {/* Lessons Management */}
          <Link href="/admin/lessons" className="block">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Lessons</h2>
                  <p className="text-sm text-gray-600">Educational content</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Add, edit, and manage educational lessons for users
              </p>
              <div className="mt-4 text-purple-600 text-sm font-medium">
                Manage Lessons →
              </div>
            </div>
          </Link>

          {/* Calculators Management */}
          <Link href="/admin/calculators" className="block">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Calculators</h2>
                  <p className="text-sm text-gray-600">Financial tools</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Add, edit, and manage financial calculators and tools
              </p>
              <div className="mt-4 text-blue-600 text-sm font-medium">
                Manage Calculators →
              </div>
            </div>
          </Link>


          {/* Database Backup */}
          <Link href="/admin/backup" className="block">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Database Backup</h2>
                  <p className="text-sm text-gray-600">Backup & restore</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Export database backups and import data from previous backups
              </p>
              <div className="mt-4 text-orange-600 text-sm font-medium">
                Manage Backups →
              </div>
            </div>
          </Link>

        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Site
            </Link>
            <Link 
              href="/admin/guide" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Documentation
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Refresh Page
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Authentication Status</h3>
          <p className="text-sm text-blue-700">
            Your application is currently configured to use <strong>passwordless authentication</strong> by default.
            Users will receive magic links via email to sign in. You can change this in the Authentication settings.
          </p>
        </div>
      </div>
    </div>
  );
}