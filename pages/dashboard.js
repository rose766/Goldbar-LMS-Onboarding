import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [parts, setParts] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Fetch parts (mock data for now - replace with real data later)
      const mockParts = [
        { id: 1, part_number: 1, title: 'Company Foundation & Culture', description: 'Understand Goldbar mission and values' },
        { id: 2, part_number: 2, title: 'Product & Service Understanding', description: 'Learn about VA types and pricing' },
        { id: 3, part_number: 3, title: 'Client Success Framework', description: 'Master the CSM role' },
        { id: 4, part_number: 4, title: 'VA Management & Performance', description: 'Coach and manage VAs' },
        { id: 5, part_number: 5, title: 'Client Communication', description: 'Master communication skills' },
        { id: 6, part_number: 6, title: 'Account Health & Intervention', description: 'Learn health scoring' },
        { id: 7, part_number: 7, title: 'Expansion & Retention', description: 'Drive growth strategies' },
        { id: 8, part_number: 8, title: 'Staffing & Team Coordination', description: 'Manage staffing changes' },
        { id: 9, part_number: 9, title: 'Operations, Tools & Systems', description: 'Master your tools' },
        { id: 10, part_number: 10, title: 'Financial Acumen & Contracts', description: 'Understand pricing and contracts' },
        { id: 11, part_number: 11, title: 'Industry Specialization', description: 'Deep dive into verticals' },
        { id: 12, part_number: 12, title: 'Advanced Strategy & Mastery', description: 'Master your role' },
      ];

      setParts(mockParts);

      // Mock progress data
      const mockProgress = {
        1: { completed: true, assessment_score: 92, assessment_passed: true },
        2: { completed: true, assessment_score: 88, assessment_passed: true },
        3: { completed: false, assessment_score: null, assessment_passed: false },
      };

      setProgress(mockProgress);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner" style={{ margin: '50px auto' }}></div>;
  }

  if (!user) return null;

  // Calculate overall progress
  const completedParts = Object.values(progress).filter(p => p.completed).length;
  const overallProgress = Math.round((completedParts / parts.length) * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white', padding: '20px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ marginBottom: '5px', color: 'white' }}>Welcome, {profile?.full_name || 'Account Manager'}!</h1>
              <p style={{ opacity: 0.9 }}>Goldbar Talent - Account Manager Onboarding Program</p>
            </div>
            <button
              className="btn btn-secondary"
              style={{ padding: '10px 20px' }}
              onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="container" style={{ marginTop: '30px', maxWidth: '1000px' }}>
        <div className="card">
          <h2>Your Progress</h2>
          <p style={{ marginBottom: '15px' }}>
            You've completed <strong>{completedParts} of {parts.length}</strong> parts ({overallProgress}%)
          </p>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>

        {/* Parts List */}
        <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>Onboarding Parts</h2>
        <div className="grid grid-2">
          {parts.map((part, index) => {
            const isCompleted = progress[part.id]?.completed;
            const isPassed = progress[part.id]?.assessment_passed;
            const canAccess = index === 0 || progress[parts[index - 1].id]?.assessment_passed;

            return (
              <div
                key={part.id}
                className="card"
                style={{
                  borderLeft: isCompleted ? '4px solid #4caf50' : '4px solid #2a5298',
                  opacity: canAccess ? 1 : 0.6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <h3 style={{ marginBottom: '5px' }}>Part {part.part_number}</h3>
                  {isCompleted && <span style={{ background: '#4caf50', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '12px' }}>✓ Complete</span>}
                </div>

                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>{part.title}</h4>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>{part.description}</p>

                {isCompleted ? (
                  <div style={{ padding: '10px', background: '#e8f5e9', borderRadius: '4px', marginBottom: '15px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#2e7d32' }}>
                      Assessment Score: <strong>{progress[part.id].assessment_score}%</strong>
                    </p>
                  </div>
                ) : null}

                {canAccess ? (
                  <Link href={`/part/${part.id}`}>
                    <button className="btn btn-primary" style={{ width: '100%' }}>
                      {isCompleted ? 'View Again' : 'Start Part'}
                    </button>
                  </Link>
                ) : (
                  <button className="btn btn-secondary" disabled style={{ width: '100%', opacity: 0.6 }}>
                    Locked - Complete Part {part.part_number - 1} First
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {completedParts === parts.length && (
          <div className="card" style={{ marginTop: '40px', background: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
            <h3 style={{ color: '#2e7d32' }}>🎉 Congratulations!</h3>
            <p style={{ color: '#2e7d32' }}>
              You've completed the entire Account Manager onboarding program! Welcome to the Goldbar Talent team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
