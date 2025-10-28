'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import '@/styling/dashboard.css';

interface Project {
  id: string;
  title: string;
  description: string;
  project_url?: string;
  image_url?: string;
  preview_url?: string | null;
  created_at?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else setUser(session.user);
    };
    checkSession();
  }, [router]);

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

  const getPreviewUrl = async (url: string) => {
    if (!url) return null;
    try {
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true`);
      const data = await response.json();
      return data.data?.screenshot?.url || null;
    } catch (err) {
      console.error('Error fetching preview:', err);
      return null;
    }
  };

  const handleAddProject = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    setLoading(true);

    let uploadedImageUrl: string | null = null;
    let projectUrlToSave: string | null = null;

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, imageFile);

      if (uploadError) console.error('Upload error:', uploadError.message);
      else if (uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);
        uploadedImageUrl = publicUrlData?.publicUrl || null;
      }
    }

    if (newProjectUrl.trim()) {
      projectUrlToSave = newProjectUrl.trim();
      if (!projectUrlToSave.startsWith('http')) {
        projectUrlToSave = 'https://' + projectUrlToSave;
      }
    }

    try {
      const { data: insertData, error: insertError } = await supabase
        .from('projecten')
        .insert([{
          title: newTitle,
          description: newDescription,
          project_url: projectUrlToSave,
          image_url: uploadedImageUrl,
          preview_url: null,
        }])
        .select();

      if (insertError) throw insertError;
      if (insertData) {
        const newProject = insertData[0];
        setProjecten([newProject, ...projecten]);
        setNewTitle('');
        setNewDescription('');
        setNewProjectUrl('');
        setImageFile(null);

        if (projectUrlToSave) {
          getPreviewUrl(projectUrlToSave).then(previewUrl => {
            if (previewUrl) {
              supabase
                .from('projecten')
                .update({ preview_url: previewUrl })
                .eq('id', newProject.id)
                .then(() => {
                  setProjecten(prev =>
                    prev.map(p => (p.id === newProject.id ? { ...p, preview_url: previewUrl } : p))
                  );
                });
            }
          });
        }
      }
    } catch (err: any) {
      console.error('Error adding project:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteProject = async (id: string) => {
    const { error } = await supabase.from('projecten').delete().eq('id', id);
    if (error) console.error(error);
    else setProjecten(projecten.filter(p => p.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) return <p className="loading-text">Loading...</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <p className="welcome-text">Welkom, {user.email}</p>

      <div className="project-form">
        <h2 className="form-title">Nieuw project toevoegen</h2>
        <input
          type="text"
          placeholder="Titel"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="form-input"
        />
        <textarea
          placeholder="Beschrijving"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="form-input"
        />
        <input
          type="text"
          placeholder="Website URL (optioneel)"
          value={newProjectUrl}
          onChange={(e) => setNewProjectUrl(e.target.value)}
          className="form-input"
        />
        <div className="file-upload">
          <label className="file-label">Of upload een afbeelding:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="form-input"
          />
        </div>
        <button
          onClick={handleAddProject}
          disabled={loading}
          className={`add-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Toevoegen...' : 'Toevoegen'}
        </button>
      </div>

      <h2 className="projects-title">Mijn projecten</h2>

      {projecten.length === 0 ? (
        <p className="no-projects">Nog geen projecten toegevoegd.</p>
      ) : (
        <ul className="project-list">
          {projecten.map((item) => (
            <li key={item.id} className="project-item">
              {editingId === item.id ? (
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="form-input"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="form-input"
                  />
                  <div className="button-group">
                    <button onClick={() => handleUpdateProject(item.id)} className="save-button">Opslaan</button>
                    <button onClick={() => setEditingId(null)} className="cancel-button">Annuleren</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="project-title">{item.title}</h3>
                  <p className="project-description">{item.description}</p>

                  {item.project_url ? (
                    <img
                      src={`https://api.microlink.io/?url=${encodeURIComponent(item.project_url)}&screenshot=true&meta=false&embed=screenshot.url`}
                      alt="Project preview"
                      className="project-image"
                    />
                  ) : item.image_url ? (
                    <img src={item.image_url} alt="Project afbeelding" className="project-image" />
                  ) : null}

                  <div className="button-group">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditTitle(item.title);
                        setEditDescription(item.description);
                      }}
                      className="edit-button"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={() => handleDeleteProject(item.id)}
                      className="delete-button"
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
