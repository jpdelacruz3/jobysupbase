import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type Mode = 'login' | 'signup';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email to confirm your account.');
      }
    }

    setLoading(false);
  }

  return (
    <main>
      <h1>{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'signup' : 'login');
          setError(null);
          setMessage(null);
        }}
      >
        {mode === 'login'
          ? "Don't have an account? Sign Up"
          : 'Already have an account? Sign In'}
      </button>
    </main>
  );
}
