'use client';

import React, { useState } from "react";
import Link from "next/link";

export default function BetaClosedPage() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email) {
      setMessage("Please enter your email to join the waitlist.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // First check if user has been promoted to beta
      const checkResponse = await fetch('/api/customers/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.exists) {
          // User has been promoted to beta! Set cookie and redirect
          const { setGuestCookie } = await import('@/lib/guest-cookie');
          setGuestCookie({ email: email.trim().toLowerCase(), allowed: true });
          setMessage("Great! You've been approved for beta access. Redirecting to app...");
          
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
          return;
        }
      }

      // User not in beta yet, proceed with waitlist signup
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Thanks! You're on the waitlist. Check your email for confirmation.");
        setEmail("");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error('Waitlist error:', err);
      setMessage("Something went wrong. Please try again.");
    }
    
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-800 hover:opacity-80">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm">Back to Home</span>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Zero Financial Anxiety</h1>
          </div>

          <div className="w-24" aria-hidden="true" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-20 md:pt-24">
        
        {/* Hero Section */}
        <section className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-orange-400 to-red-400 text-white text-2xl font-bold mb-8">
            🚧
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
            Free Beta Closed
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-4">
            Thanks to our beta users, we're working on a paid launch
          </p>
          
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600">$10</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
              <div className="text-gray-400">or</div>
              <div>
                <div className="text-3xl font-bold text-purple-600">$100</div>
                <div className="text-sm text-gray-600">annually</div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto mb-16">
          <button
            onClick={() => setShowWaitlist(true)}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 text-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            Join Waitlist
          </button>
          
          <Link
            href="/beta-closed/preview"
            className="inline-flex items-center justify-center rounded-2xl bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-8 py-4 text-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            Learn More
          </Link>
        </section>

        {/* Philosophy Section */}
        <section className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 p-1 shadow-2xl">
            <div className="rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Philosophy Remains the Same</h3>
              <p className="text-lg text-gray-800 leading-relaxed">
                We aim to <span className="font-black text-orange-600 text-xl">get fired</span> as your financial educator—by empowering you to be your own.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Waitlist Modal */}
      {showWaitlist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWaitlist(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-900 text-white font-bold mb-4">Z</div>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">Join the Waitlist</h3>
              <p className="text-sm text-gray-600 mt-2">Be the first to know when we launch</p>
            </div>

            <form onSubmit={handleWaitlistSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="waitlist-email" className="text-sm font-medium text-slate-700">Email Address</label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 transition-all duration-200"
                >
                  {isSubmitting ? 'Checking...' : 'Join Waitlist / Check Access'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowWaitlist(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>

            {message && (
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
                {message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-gray-600">
          Copyright {new Date().getFullYear()} zerofinanx. All rights reserved.
        </div>
      </footer>
    </div>
  );
}