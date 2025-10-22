'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Project {
  id: string;
  title: string;
  description: string;
  created_at?: string;
}

export default function HomePage() {
  const [projecten, setProjecten] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjecten = async () => {
      const { data, error } = await supabase
        .from('projecten')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching projecten:', error);
      else setProjecten(data || []);
    };

    fetchProjecten();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-white to-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Mijn Portfolio</h1>

      {projecten.length === 0 ? (
        <p className="text-gray-600">Er zijn nog geen projecten toegevoegd.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projecten.map((project) => (
            <div key={project.id} className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h2>
              <p className="text-gray-700">{project.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(project.created_at || '').toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
