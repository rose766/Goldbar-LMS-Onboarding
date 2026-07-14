import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ams, setAms] = useState([]);
  const [comments, setComments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        router.push('/dashboard');
        return;
      }

      setUser(user);
      setIsAdmin(true);

      // Load AMs (all non-admin users)
      const { data: amData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_admin', false)
        .order('started_at', { ascending: false });

      setAms(amData || []);

      // Load comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('is_admin_response', false)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);

      // Load recommendations
      const { data: recsData } = await supabase
        .from('recommendations')
        .select('*')
        .eq('is_addressed', false)
        .order('created_at', { ascending: false });

      setRecommendations(recsData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner" style={{ margin: '50px auto' }}></div>;
  }

  if (!isAdmin) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: '#1e3c72', color: 'white', padding: '20px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ color: 'white', margin: 0 }}>🎛️ Admin Dashboard (Rose)</h1>
            <button className="btn btn-secondary" onClick={() => supabase.auth.signOut().then(() => router.push('/'))}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ marginTop: '30px' }}>
        {/* Overview Stats */}
        <div className="grid grid-3" style={{ marginBottom: '40px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: '#2a5298', margin: 0 }}>{ams.length}</h3>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>Account Managers</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: '#ff9800', margin: 0 }}>{comments.length}</h3>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>Pending Comments</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: '#f44336', margin: 0 }}>{recommendations.length}</h3>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>Recommendations</p>
          </div>
        </div>

        {/* AMs Table */}
        <div className="card">
          <h2>Account Managers</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: 600 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: 600 }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: 600 }}>Started</th>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ams.map((am) => (
                <tr key={am.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '10px' }}>{am.full_name}</td>
                  <td style={{ padding: '10px' }}>{am.email}</td>
                  <td style={{ padding: '10px', fontSize: '14px', color: '#666' }}>
                    {new Date(am.started_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                      In Progress
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Comments Section */}
        <div className="card" style={{ marginTop: '30px' }}>
          <h2>Pending Comments from AMs</h2>
          {comments.length === 0 ? (
            <p style={{ color: '#999' }}>No pending comments yet.</p>
          ) : (
            <div>
              {comments.map((comment) => (
                <div key={comment.id} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px', marginBottom: '10px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Part {comment.part_id} - Comment ID: {comment.id}</p>
                  <p style={{ margin: '0', color: '#333' }}>{comment.comment_text}</p>
                  <small style={{ color: '#999' }}>Posted: {new Date(comment.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        <div className="card" style={{ marginTop: '30px' }}>
          <h2>Pending Recommendations</h2>
          {recommendations.length === 0 ? (
            <p style={{ color: '#999' }}>No pending recommendations yet.</p>
          ) : (
            <div>
              {recommendations.map((rec) => (
                <div key={rec.id} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px', marginBottom: '10px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Part {rec.part_id} - {rec.category?.toUpperCase()}</p>
                  <p style={{ margin: '0', color: '#333' }}>{rec.recommendation_text}</p>
                  <small style={{ color: '#999' }}>Submitted: {new Date(rec.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
