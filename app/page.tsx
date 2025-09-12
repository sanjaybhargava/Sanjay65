'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getStoredEmail } from '@/lib/guest-cookie';

// Streamlined homepage focused purely on educational conversion
// Enhanced with modern visuals and prominent philosophy section

function PricingCard({
  name,
  priceLabel,
  blurb,
  highlight = false,
  onLoginHref = "/login",
  ctaLabel = "Get Started",
  disabled = false,
  badge,
}) {
  return (
    <div
      className={
        "relative flex flex-col justify-between rounded-3xl border shadow-xl p-8 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 " +
        (highlight ? "border-indigo-200 shadow-indigo-100/50 ring-1 ring-indigo-100" : "border-gray-200")
      }
    >
      {badge && (
        <div className="absolute -top-4 right-6 select-none rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">{badge}</div>
      )}
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-gray-900">{name}</h3>
        <p className="mt-3 text-gray-600 leading-relaxed">{blurb}</p>
        <div className="mt-8 flex items-end gap-2">
          <span className="text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{priceLabel}</span>
        </div>
      </div>

      <a
        href={onLoginHref}
        aria-disabled={disabled ? "true" : undefined}
        className={
          "mt-10 inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-bold transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl " +
          (highlight
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
            : "bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50") +
          (disabled ? " opacity-60 pointer-events-none" : "")
        }
      >
        {ctaLabel}
      </a>
    </div>
  );
}

export default function ZeroFinanxPricingPage() {
  const router = useRouter();
  const [showPhilosophy, setShowPhilosophy] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  
  // Check if user already provided email and verify if they're an existing beta user
  useEffect(() => {
    const storedEmail = getStoredEmail();
    if (storedEmail) {
      setHasEmail(true);
      // Check if this user exists in the database (existing beta user)
      checkExistingUser(storedEmail);
    } else {
      // No stored email = new user, redirect to beta-closed
      setIsExistingUser(false);
      router.push('/beta-closed');
    }
  }, [router]);

  const checkExistingUser = async (email: string) => {
    try {
      const response = await fetch('/api/customers/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setIsExistingUser(true);
        } else {
          // Email in cookie but not in database = redirect to beta-closed
          setIsExistingUser(false);
          router.push('/beta-closed');
        }
      } else {
        // API error, assume new user
        setIsExistingUser(false);
        router.push('/beta-closed');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setIsExistingUser(false);
      router.push('/beta-closed');
    }
  };

  // Show loading while checking user status
  if (isExistingUser === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="w-24" aria-hidden="true" />

          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">Zero Financial Anxiety</h1>
          </div>

          <nav className="flex w-24 justify-end">
            <a
              href={hasEmail ? "/dashboard" : "/login"}
              className="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              {hasEmail ? "Dashboard" : "Get Started"}
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-20 md:pt-24">
        
        {/* Hero */}
        <section className="mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-extrabold tracking-tight md:text-6xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Financial education that actually works
          </h2>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            Learn your Save Number, Spend Number and much more.<br />
            US Focused, No ads or upsells.
          </p>
        </section>

        {/* Philosophy strip - Enhanced */}
        <section className="mx-auto mt-12 max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 p-1 shadow-2xl">
            <div className="rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-8 text-center">
              <div className="mx-auto max-w-3xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Philosophy</h3>
                <p className="text-lg text-gray-800 leading-relaxed">
                  We aim to <span className="font-black text-orange-600 text-xl">get fired</span> as your financial educator—by empowering you to be your own.
                </p>
                <button 
                  type="button" 
                  onClick={() => setShowPhilosophy(true)} 
                  className="mt-4 inline-flex items-center font-bold text-orange-600 underline underline-offset-4 decoration-2 hover:text-orange-700 transition-colors"
                >
                  Learn why →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mt-20 grid gap-10 md:grid-cols-2 max-w-5xl mx-auto">
          <PricingCard
            name="Education (Beta)"
            priceLabel="Free"
            blurb="Welcome back! Continue your financial education journey with lessons and calculators."
            highlight
            ctaLabel="Go to Dashboard"
            onLoginHref="/dashboard"
            badge="Beta Access ✓"
          />

          <PricingCard
            name="Full Advisory Service"
            priceLabel="Coming 2026"
            blurb="Human + AI financial advice with SEC registration. Same philosophy: teach you to be your own advisor."
            ctaLabel="Get notified"
            disabled
          />
        </section>

        {/* Legal */}
        <section className="mt-20 text-center text-sm text-gray-500 max-w-3xl mx-auto bg-white/60 rounded-2xl p-6 backdrop-blur-sm">
          <p className="leading-relaxed">
            zerofinanx provides educational content and tools. It is <span className="font-semibold">not</span> investment, legal, tax, or accounting advice. Consult a qualified professional before acting.
          </p>
        </section>
      </main>

      {/* Philosophy modal - Enhanced */}
      {showPhilosophy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPhilosophy(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-labelledby="philosophy-title" className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-200">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 id="philosophy-title" className="text-2xl font-bold tracking-tight text-gray-900 mb-4">Why we want to be fired</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">ZeroFinanx is built to transfer skill, not create dependence. Our goal is to teach a simple, U.S.-focused playbook so you can make confident decisions yourself.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Use our lessons and calculators to build your plan—and when you're ready, fire us. The same philosophy will hold when we offer paid advisory services.</p>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">Educational service. Not investment, legal, tax, or accounting advice.</p>
            <div className="text-center">
              <button 
                onClick={() => setShowPhilosophy(false)} 
                className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Got it!
              </button>
            </div>
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