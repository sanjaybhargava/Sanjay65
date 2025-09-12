'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { lessonRepository } from '@/lib/repositories/lessons';
import { calculatorRepository } from '@/lib/repositories/calculators';

interface Lesson {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  icon: string;
  color: string;
}

interface Calculator {
  id: number;
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
}

export default function BetaPreviewPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showCalculatorsModal, setShowCalculatorsModal] = useState(false);
  const [showLessonsModal, setShowLessonsModal] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      try {
        // Fetch lessons
        const lessonsResponse = await fetch('/api/lessons');
        const lessonsData = await lessonsResponse.json();
        
        // Fetch calculators  
        const calculatorsResponse = await fetch('/api/calculators');
        const calculatorsData = await calculatorsResponse.json();

        setLessons(lessonsData.lessons || []);
        setCalculators(calculatorsData.calculators || []);
        
        // Set last updated to current date
        setLastUpdated(new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
        
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/beta-closed" className="inline-flex items-center gap-2 text-slate-800 hover:opacity-80">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm">Back to Beta Closed</span>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Content Preview</h1>
          </div>

          <div className="w-24" aria-hidden="true" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-12">
        
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-2xl font-bold mb-6">
            📚
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            What You'll Get
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            Comprehensive financial education designed to eliminate anxiety
          </p>
          
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-4 max-w-md mx-auto mb-4">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Last updated:</span> {lastUpdated}
            </p>
          </div>
          
          <p className="text-lg text-indigo-600 font-semibold">
            New lessons drop every week
          </p>
        </section>

        {/* Calculators Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Interactive Calculators</h3>
            <p className="text-gray-600">Practical tools for financial planning</p>
            <button
              onClick={() => setShowCalculatorsModal(true)}
              className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
            >
              Explore Calculators →
            </button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {calculators.slice(0, 3).map((calculator) => (
              <div
                key={calculator.id}
                className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                    style={{ backgroundColor: calculator.color }}
                  >
                    {calculator.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{calculator.name}</h4>
                    <p className="text-sm text-gray-500">{calculator.category}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {calculator.description}
                </p>
              </div>
            ))}
          </div>
          {calculators.length > 3 && (
            <div className="text-center mt-6">
              <p className="text-gray-500">+ {calculators.length - 3} more calculators</p>
            </div>
          )}
        </section>

        {/* Lessons Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Educational Lessons</h3>
            <p className="text-gray-600">Step-by-step financial guidance</p>
            <button
              onClick={() => setShowLessonsModal(true)}
              className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
            >
              View All Lessons →
            </button>
          </div>
          
          {/* Group lessons by category */}
          {Object.entries(
            lessons.reduce((acc, lesson) => {
              if (!acc[lesson.category]) {
                acc[lesson.category] = [];
              }
              acc[lesson.category].push(lesson);
              return acc;
            }, {} as Record<string, Lesson[]>)
          ).map(([category, categoryLessons]) => (
            <div key={category} className="mb-10">
              <h4 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-indigo-600 pl-4">
                {category}
              </h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="relative overflow-hidden rounded-xl bg-white shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg text-white"
                        style={{ backgroundColor: lesson.color }}
                      >
                        {lesson.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 text-sm leading-tight">
                          {lesson.title}
                        </h5>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="px-2 py-1 rounded-md bg-gray-100">
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Join?</h3>
            <p className="text-indigo-100 mb-6">
              Get access to all this content plus new lessons every week
            </p>
            <Link
              href="/beta-closed"
              className="inline-flex items-center justify-center rounded-2xl bg-white text-indigo-600 px-8 py-3 text-lg font-bold hover:bg-gray-50 transition-all duration-200 shadow-lg"
            >
              Join Waitlist
            </Link>
          </div>
        </section>

      </main>

      {/* Calculators Modal */}
      {showCalculatorsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCalculatorsModal(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white text-2xl font-bold mb-4">
                📊
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Calculators Include</h3>
              <p className="text-sm text-gray-600">Essential financial planning tools</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white text-sm font-bold">💰</div>
                <span className="font-semibold text-gray-900">Know Your Save Number</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">🛍️</div>
                <span className="font-semibold text-gray-900">Know Your Spend Number</span>
              </div>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => setShowCalculatorsModal(false)} 
                className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lessons Modal */}
      {showLessonsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLessonsModal(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-200 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-2xl font-bold mb-4">
                📚
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">16 Lessons Include</h3>
              <p className="text-sm text-gray-600">Two-word headlines for easy understanding</p>
            </div>

            <div className="grid gap-2 mb-6 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 1 – Build Floor</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Foundation</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 2 – Risk Allocation</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Strategy</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 3 – Wealth Index</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Tracking</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 4 – Know your Save Number</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Security</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 5 – Lifestyle Choices</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Balance</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 6 – Income Growth</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Earning</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 7 – Money Simplicity</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Clarity</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 8 – Know Your Spend Number</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Freedom</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 9 – Sunset Preparation</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Planning</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 10 – 401(k) Mastery</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Retirement</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 11 – IRA Mastery</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Accounts</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 12 – Kid Wealth Mastery</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Family</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 13 – Social Security Strategy</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Benefits</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 14 – Medicare Mastery</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Healthcare</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 15 – Killing OOM Anxiety</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Mindset</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-900">Lesson 16 – I Bond Mastery</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Investment</span>
              </div>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => setShowLessonsModal(false)} 
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