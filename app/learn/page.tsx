'use client';

import { Book, ArrowLeft, Clock, CheckCircle, PlayCircle, FileText, TrendingUp, PiggyBank, CreditCard, Home } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import LessonViewer from '@/components/LessonViewer';
import { getStoredEmail } from '@/lib/guest-cookie';

interface Lesson {
  id: number;
  title: string;
  category: string;
  duration: string;
  difficulty: string;
  description: string;
  content: string;
  videoUrl?: string;
  videoSummary?: string;
  startMessage?: string;
  orderIndex: number;
  icon: string;
  color: string;
  completed: boolean;
  active: boolean;
}

function EducationalContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Check user access first
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

  // Fetch lessons from API
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchLessons = async () => {
      try {
        const response = await fetch('/api/lessons');
        if (response.ok) {
          const data = await response.json();
          // Only show active lessons to users
          const activeLessons = data.filter((lesson: Lesson) => lesson.active);
          setLessons(activeLessons);
          
          // Check if we need to open a specific lesson from URL
          const lessonId = searchParams.get('lesson');
          if (lessonId) {
            const lesson = activeLessons.find(l => l.id.toString() === lessonId);
            if (lesson) {
              setSelectedLesson(lesson);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [searchParams, isAuthorized]);

  // Icon mapping for lesson icons
  const getIconComponent = (iconName: string) => {
    const iconMap = {
      PiggyBank,
      CreditCard, 
      Home,
      TrendingUp,
      BookOpen: Book,
      FileText
    };
    return iconMap[iconName as keyof typeof iconMap] || Book;
  };


  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Show loading state
  if (isAuthorized === null || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (selectedLesson) {
    return (
      <LessonViewer
        lessonId={selectedLesson.id.toString()}
        onClose={() => setSelectedLesson(null)}
        onBack={() => setSelectedLesson(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-xl font-semibold">Educational Content</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <Book className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Learn Personal Finance</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Master the fundamentals with bite-sized lessons designed for busy people. Start with the basics and build your knowledge.
          </p>
        </div>


        {/* Lessons Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const Icon = getIconComponent(lesson.icon);
            return (
              <div
                key={lesson.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedLesson(lesson)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${lesson.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{lesson.title}</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <span>Educational Content</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {lesson.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-purple-600 text-sm font-medium">
                    <PlayCircle className="h-4 w-4" />
                    Start Lesson
                  </span>
                  {lesson.completed && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}

export default function EducationalContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading lessons...</p>
        </div>
      </div>
    }>
      <EducationalContentInner />
    </Suspense>
  );
}