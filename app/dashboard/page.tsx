'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  title: string;
  description: string;
  created_at?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Check of gebruiker is ingelogd
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else setUser(session.user);
    };
    checkSession();
  }, [router]);

  // ✅ Ophalen projecten
  const fetchProjecten = async () => {
    const { data, error } = await supabase
      .from('projecten')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching projecten:', error);
    else setProjecten(data || []);
  };

  useEffect(() => {
    fetchProjecten();
  }, []);

  // ✅ Nieuw project toevoegen
  const handleAddProject = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('projecten')
      .insert([{ title: newTitle, description: newDescription }])
      .select();

    setLoading(false);

    if (error) {
      console.error(error);
    } else {
      setProjecten([...data, ...projecten]);
      setNewTitle('');
      setNewDescription('');
    }
  };

  // ✅ Project bijwerken
  const handleUpdateProject = async (id: string) => {
    const { data, error } = await supabase
      .from('projecten')
      .update({ title: editTitle, description: editDescription })
      .eq('id', id)
      .select();

    if (error) console.error(error);
    else {
      setProjecten(projecten.map(p => (p.id === id ? data[0] : p)));
      setEditingId(null);
    }
  };

  // ✅ Project verwijderen
  const handleDeleteProject = async (id: string) => {
    const { error } = await supabase.from('projecten').delete().eq('id', id);
    if (error) console.error(error);
    else setProjecten(projecten.filter(p => p.id !== id));
  };

  // ✅ Uitloggen
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!user) return <p className="text-black">Loading...</p>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <p className="mb-6 text-gray-700">Welkom, {user.email}</p>

      {/* Nieuw project toevoegen */}
      <div className="bg-white p-5 rounded-lg shadow mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Nieuw project toevoegen</h2>
        <input
          type="text"
          placeholder="Titel"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="border border-gray-400 p-2 rounded w-full mb-3 bg-white text-black placeholder-gray-500"
        />
        <textarea
          placeholder="Beschrijving"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="border border-gray-400 p-2 rounded w-full mb-3 bg-white text-black placeholder-gray-500"
        />
        <button
          onClick={handleAddProject}
          disabled={loading}
          className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Toevoegen...' : 'Toevoegen'}
        </button>
      </div>

      {/* Lijst van projecten */}
      <h2 className="text-2xl font-semibold mb-3 text-gray-800">Mijn projecten</h2>

      {projecten.length === 0 ? (
        <p className="text-gray-600">Nog geen projecten toegevoegd.</p>
      ) : (
        <ul className="space-y-4">
          {projecten.map((item) => (
            <li key={item.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              {editingId === item.id ? (
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border border-gray-400 p-2 rounded w-full mb-2 text-black"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="border border-gray-400 p-2 rounded w-full mb-2 text-black"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateProject(item.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Opslaan
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-700 mb-3">{item.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditTitle(item.title);
                        setEditDescription(item.description);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={() => handleDeleteProject(item.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Verwijderen
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
