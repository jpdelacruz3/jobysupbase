import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Todo {
  id: string;
  text: string;
  created_at: string;
}

export default function TodoManager() {
  const { session } = useAuth();
  const userId = session!.user.id;

  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodos() {
      const { data, error } = await supabase
        .from('todos')
        .select('id, text, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        setFetchError(error.message);
      } else {
        setTodos(data ?? []);
      }
      setLoading(false);
    }

    fetchTodos();

    // Real-time subscription — reflects inserts/deletes from any tab or device
    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTodos((prev) => [payload.new as Todo, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setTodos((prev) => prev.filter((t) => t.id !== (payload.old as Todo).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const trimmed = text.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from('todos')
      .insert({ text: trimmed, user_id: userId });

    if (error) {
      setSubmitError(error.message);
    } else {
      setText('');
    }
  }

  async function handleDelete(id: string) {
    setSubmitError(null);
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) setSubmitError(error.message);
  }

  if (loading) return <p>Loading todos…</p>;
  if (fetchError) return <p role="alert">Failed to load todos: {fetchError}</p>;

  return (
    <section>
      <h2>Todos</h2>

      <form onSubmit={handleAdd}>
        <label htmlFor="todo-input">New todo</label>
        <input
          id="todo-input"
          type="text"
          value={text}
          placeholder="What needs doing?"
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={!text.trim()}>
          Add
        </button>
      </form>

      {submitError && <p role="alert">{submitError}</p>}

      {todos.length === 0 ? (
        <p>No todos yet — add one above.</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              <span>{todo.text}</span>
              <button type="button" onClick={() => handleDelete(todo.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
