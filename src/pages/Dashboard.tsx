import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import TodoManager from '../components/TodoManager';

export default function Dashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <main>
      <header>
        <h1>Dashboard</h1>
        <p>Welcome, {session?.user.email}</p>
        <button type="button" onClick={handleSignOut}>
          Sign Out
        </button>
      </header>

      <TodoManager />
    </main>
  );
}
