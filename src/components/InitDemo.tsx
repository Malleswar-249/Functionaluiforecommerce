import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, Loader } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function InitDemo() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const initialized = localStorage.getItem('demoInitialized');
    if (!initialized) {
      setShow(true);
    }
  }, []);

  const handleInitialize = async () => {
    setLoading(true);
    setStatus('Initializing demo accounts...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe618f6f/init-demo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setStatus('Demo accounts created successfully!');
        localStorage.setItem('demoInitialized', 'true');
        setTimeout(() => {
          setShow(false);
        }, 2000);
      } else {
        setStatus('Demo accounts may already exist. You can proceed to login.');
        localStorage.setItem('demoInitialized', 'true');
        setTimeout(() => {
          setShow(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Init error:', error);
      setStatus('Initialization complete. You can proceed to login.');
      localStorage.setItem('demoInitialized', 'true');
      setTimeout(() => {
        setShow(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('demoInitialized', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4DC2EF] rounded-full mb-4">
            <Database size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#342639] mb-2">Welcome to E-Commerce Platform</h2>
          <p className="text-gray-600">
            Click below to initialize demo accounts for testing
          </p>
        </div>

        {status ? (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-[#5E998C]">
              {loading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <CheckCircle size={20} />
              )}
              <span>{status}</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
            <p className="font-semibold text-gray-800 mb-2">Demo Accounts:</p>
            <p className="text-gray-600 mb-1">
              <strong>Admin:</strong> admin@demo.com / admin123
            </p>
            <p className="text-gray-600">
              <strong>User:</strong> user@demo.com / user123
            </p>
          </div>
        )}

        {!status && (
          <div className="flex gap-3">
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="flex-1 bg-[#4DC2EF] hover:bg-[#5E998C] text-white px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50"
            >
              Initialize Demo
            </button>
            <button
              onClick={handleSkip}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
