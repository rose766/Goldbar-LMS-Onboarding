import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { onboardingCurriculum } from '../../lib/curriculum';

export default function PartViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      checkUser();
      loadPart();
    }
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/login');
    else setUser(user);
  };

  const loadPart = () => {
    const partData = onboardingCurriculum.find(p => p.part_number === parseInt(id));
    setPart(partData);
    setLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            user_id: user.id,
            part_id: parseInt(id),
            comment_text: comment,
            is_admin_response: false,
          },
        ]);

      if (!error) {
        setComment('');
        alert('Comment posted! Rose will review and respond soon.');
      }
    } catch (error) {
      alert('Error posting comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading || !part) {
    return <div className="spinner" style={{ margin: '50px auto' }}></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: '#2a5298', color: 'white', padding: '20px' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <Link href="/dashboard" style={{ color: 'white', fontSize: '14px' }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ marginTop: '10px', color: 'white' }}>Part {part.part_number}: {part.title}</h1>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1000px', marginTop: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
          <button onClick={() => setActiveTab('content')} style={{ padding: '10px 20px', background: activeTab === 'content' ? '#2a5298' : 'transparent', color: activeTab === 'content' ? 'white' : '#666', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0', fontWeight: 600 }}>Content</button>
          <button onClick={() => setActiveTab('assessment')} style={{ padding: '10px 20px', background: activeTab === 'assessment' ? '#2a5298' : 'transparent', color: activeTab === 'assessment' ? 'white' : '#666', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0', fontWeight: 600 }}>Assessment</button>
          <button onClick={() => setActiveTab('comments')} style={{ padding: '10px 20px', background: activeTab === 'comments' ? '#2a5298' : 'transparent', color: activeTab === 'comments' ? 'white' : '#666', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0', fontWeight: 600 }}>Q&A</button>
        </div>

        {activeTab === 'content' && (
          <div className="card">
            <div style={{ lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>
              {part.content}
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="card">
            <h2>Part {part.part_number} Assessment</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Complete this assessment to unlock the next part. You need 85% to pass.</p>
            <div style={{ padding: '20px', background: '#fff3e0', borderRadius: '4px', marginBottom: '20px' }}>
              <p><strong>Assessment coming soon!</strong></p>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="card">
            <h2>Questions & Comments</h2>
            <form onSubmit={handleAddComment} style={{ marginBottom: '30px' }}>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What questions do you have?" style={{ width: '100%', minHeight: '100px', padding: '12px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
              <button type="submit" disabled={submittingComment} className="btn btn-primary">Post Comment</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
