'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CalculatorsList from '@/components/CalculatorsList';
import { getStoredEmail } from '@/lib/guest-cookie';

export default function CalculatorsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const storedEmail = getStoredEmail();
    if (!storedEmail) {
      router.push('/beta-closed');
      return;
    }

    try {
      const response = await fetch('/api/customers/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: storedEmail })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setIsAuthorized(true);
        } else {
          router.push('/beta-closed');
        }
      } else {
        router.push('/beta-closed');
      }
    } catch (error) {
      console.error('Error checking access:', error);
      router.push('/beta-closed');
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <CalculatorsList showHeader={true} />
      </div>
    </div>
  );
}