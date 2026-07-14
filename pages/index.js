import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="spinner" style={{ margin: '50px auto' }}></div>;
  }

  if (user) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '50px auto' }}>
          <h1>Welcome Back, {user.email}!</h1>
          <p style={{ marginTop: '20px', marginBottom: '30px', fontSize: '16px' }}>
            You're logged in. Head to your onboarding dashboard to continue learning.
          </p>
          <Link href="/dashboard">
            <button className="btn btn-primary" style={{ fontSize: '16px', padding: '12px 30px' }}>
              Go to Dashboard
            </button>
          </Link>
          <button
            className="btn btn-secondary"
            style={{ marginLeft: '10px', fontSize: '16px', padding: '12px 30px' }}
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
      <div className="container" style={{ color: 'white', textAlign: 'center', paddingTop: '60px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', color: 'white' }}>
          🎓 Goldbar Talent LMS
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '40px', opacity: 0.9 }}>
          Complete your Account Manager onboarding program
        </p>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card" style={{ background: 'rgba(255,255,255,0.95)', color: '#1a1a1a' }}>
            <h2 style={{ marginTop: 0 }}>Get Started</h2>
            <p style={{ marginBottom: '20px' }}>
              Create your account to begin the 12-part onboarding curriculum designed specifically for Goldbar Account Managers.
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
              <Link href="/register">
                <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
                  Create Account (Register)
                </button>
              </Link>
              <Link href="/login">
                <button className="btn btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
                  Already have an account? (Login)
                </button>
              </Link>
            </div>
          </div>

          <div style={{ marginTop: '40px', opacity: 0.8 }}>
            <h3 style={{ color: 'white' }}>What You'll Learn:</h3>
            <ul style={{ textAlign: 'left', display: 'inline-block', fontSize: '14px' }}>
              <li>✅ Company culture & mission</li>
              <li>✅ Client success framework</li>
              <li>✅ VA management & coaching</li>
              <li>✅ Account health & growth</li>
              <li>✅ And 8 more comprehensive modules</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
