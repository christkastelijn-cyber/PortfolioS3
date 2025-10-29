'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import '../styling/homepage.css';
import SectionFooter from "../sections/sectionfooter";

interface Project {
  id: string;
  title: string;
  description: string;
  project_url?: string;
  image_url?: string;
  created_at?: string;
}

export default function HomePage() {
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [loadedPreviews, setLoadedPreviews] = useState<{ [key: string]: boolean }>({});
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;
  const router = useRouter();

  useEffect(() => {
  const letters = document.querySelectorAll('.letter');
  if (!letters.length) return;

  const radius = 120;

  const handleMove = (e: MouseEvent) => {
    letters.forEach((el: Element) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const factor = (radius - dist) / radius; 
        const translateY = -70 * factor;
        const glow = factor * 1.2; 
        (el as HTMLElement).style.transform = `translateY(${translateY}px)`;
        (el as HTMLElement).style.textShadow = `
          0 0 ${25 * glow}px rgba(255, 215, 0, ${glow}),
          0 0 ${35 * glow}px rgba(255, 215, 0, ${glow * 0.7}),
          0 0 ${45 * glow}px rgba(255, 215, 0, ${glow * 0.5})
        `;
      } else {
        (el as HTMLElement).style.transform = 'translateY(0px)';
        (el as HTMLElement).style.textShadow = 'none';
      }
    });
  };

  window.addEventListener('mousemove', handleMove);
  return () => window.removeEventListener('mousemove', handleMove);
}, []);


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

  const totalPages = Math.ceil(projecten.length / itemsPerPage);
  const visibleProjecten = projecten.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="homepage-container">
      <div className="wolkenhomepage"></div>
      <div className="homepage-header">
        <button
          onClick={() => router.push('/login')}
          className="login-button"
        >
          Login
        </button>
      </div>

      <div className="homepage-header-text">
        <h1 className="homepage-title chewy">
          {'Portfolio'.split('').map((letter, i) => (
            <span key={i} className="letter">{letter}</span>
          ))}
        </h1>
        <h1 className="Naam chewy">
          {'Christ Kastelijn'.split('').map((letter, i) => (
            <span key={i} className="letter">{letter}</span>
          ))}
        </h1>
      </div>

      <div id='Over-mij' className='Over-mij-tekst'>
        <h1 className="Over-mij chewy">
          Over <span style={{ color: '#FFD700' }}>mij</span>  
        </h1>

      <p className='verhaaltje-christ inter'> 
        Ik ben <span style={{color: '#FFD700'}}>Christ Kastleijn</span>, 
        een nieuwsgierige en gedreven <span style={{color: '#FFD700'}}>HBO ICT</span> 
        student die houdt van alles wat met <span style={{color: '#FFD700'}}>technologie </span>
        te maken heeft. Van het bouwen van slimme webapps tot het analyseren van grote data, 
        ik vind het geweldig om creatieve oplossingen te bedenken en ze tot leven te 
        brengen.<br /><br /> 
        Buiten school ben ik niet alleen bezig met 
        <span style={{color: '#FFD700'}}>technologische trends</span> en tools, 
        maar ben ik ook actief met <span style={{color: '#FFD700'}}>voetbal</span>. 
        Of het nu op het veld trainen is, wedstrijden spelen of tactieken bespreken, 
        sport geeft me energie en discipline.<br /><br /> 
        Ik combineer mijn passie voor 
        <span style={{color: '#FFD700'}}>programmeren</span> en technologie met mijn 
        liefde voor <span style={{color: '#FFD700'}}>voetbal</span>. Zo blijf ik 
        nieuwsgierig, creatief en gemotiveerd, zowel in projecten als in het dagelijks leven. 
      </p>
      </div>

      <div id='Projecten' className='projecten-tekst chewy'>Projecten</div>

      {projecten.length === 0 ? (
        <p className="homepage-empty">Er zijn nog geen projecten toegevoegd.</p>
      ) : (
        <div className="projects-wrapper">
          <div className="project-grid">
            {visibleProjecten.map((project) => (
              <div key={project.id} className="project-card">
                <h2 className="project-title inter">{project.title}</h2>
                <p className="project-description inter">{project.description}</p>

                {project.project_url ? (
                  <div className="project-preview">
                    {!loadedPreviews[project.id] && (
                      <div className="preview-spinner">
                        <svg
                          className="spinner-icon"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="spinner-bg"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="spinner-fg"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                      </div>
                    )}
                    <img
                      src={`https://api.microlink.io/?url=${encodeURIComponent(
                        project.project_url
                      )}&screenshot=true&meta=false&embed=screenshot.url`}
                      alt="Project preview"
                      className="project-image"
                      onLoad={() =>
                        setLoadedPreviews((prev) => ({ ...prev, [project.id]: true }))
                      }
                      onError={() =>
                        setLoadedPreviews((prev) => ({ ...prev, [project.id]: true }))
                      }
                    />
                  </div>
                ) : project.image_url ? (
                  <img
                    src={project.image_url}
                    alt="Project afbeelding"
                    className="project-image"
                  />
                ) : null}

                <p className="project-date">
                  {new Date(project.created_at || '').toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pager-controls">
              <button
                className="pager-arrow left"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Vorige pagina"
              >
                ‹
              </button>
              <button
                className="pager-arrow right"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                aria-label="Volgende pagina"
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}

      <img className='kleinepalmboom' src="kleine palmboom.png" alt="" />
      <img className='grotepalmboom' src="grotepalmboom.png" alt="" />
      <SectionFooter />
    </div>
  );
}
