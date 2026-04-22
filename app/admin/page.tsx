'use client';

import { useState, useEffect } from 'react';
import { ui } from '../../lib/ui';

type GameUpdate = {
  id: string;
  title: string;
  slug: string;
  source: string;
  article_url: string;
  image_url?: string | null;
  summary?: string | null;
  published_at?: string | null;
};

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ updates: 0, details: 0 });
  const [recentUpdates, setRecentUpdates] = useState<GameUpdate[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const response = await fetch('/api/seed');
      const data = await response.json();
      if (data.ok) {
        setStats({ updates: data.data?.length || 0, details: 0 });
        setRecentUpdates(data.data || []);
      }
    } catch (error) {
      console.error('Erreur de chargement:', error);
    }
  }

  async function addSampleData() {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/seed');
      const data = await response.json();
      
      if (data.ok) {
        setMessage(`Succès: ${data.data?.length || 0} jeux ajoutés`);
        loadStats();
      } else {
        setMessage(`Erreur: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function scrapeData() {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/sync', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'demo-secret'}`
        }
      });
      const data = await response.json();
      
      if (data.ok) {
        setMessage(`Scraping: ${data.found || 0} jeux trouvés, ${data.inserted || 0} insérés`);
        loadStats();
      } else {
        setMessage(`Erreur scraping: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Erreur scraping: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1118] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-[#66c0f4]">Administration GameScraper</h1>
        
        <div className="grid gap-6 mb-8">
          <div className={`${ui.card} p-6`}>
            <h2 className="text-xl font-bold mb-4">Statistiques</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#8b98a5]">Total Updates</p>
                <p className="text-2xl font-bold">{stats.updates}</p>
              </div>
              <div>
                <p className="text-sm text-[#8b98a5]">Details Scrapés</p>
                <p className="text-2xl font-bold">{stats.details}</p>
              </div>
            </div>
          </div>

          <div className={`${ui.card} p-6`}>
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={addSampleData}
                disabled={isLoading}
                className="bg-[#66c0f4] px-4 py-2 text-[#0b141b] font-semibold hover:bg-[#8fd3ff] disabled:opacity-50"
              >
                {isLoading ? 'Chargement...' : 'Ajouter données d\'exemple'}
              </button>
              
              <button
                onClick={scrapeData}
                disabled={isLoading}
                className="bg-[#223041] px-4 py-2 text-white font-semibold hover:bg-[#2d4055] disabled:opacity-50"
              >
                {isLoading ? 'Scraping...' : 'Lancer scraping (game3rb.com)'}
              </button>
            </div>
            
            {message && (
              <div className={`mt-4 p-3 rounded ${message.includes('Erreur') ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                {message}
              </div>
            )}
          </div>

          {recentUpdates.length > 0 && (
            <div className={`${ui.card} p-6`}>
              <h2 className="text-xl font-bold mb-4">Données récentes</h2>
              <div className="space-y-2">
                {recentUpdates.slice(0, 5).map((update) => (
                  <div key={update.id} className="border-b border-[#263241] pb-2">
                    <p className="font-semibold">{update.title}</p>
                    <p className="text-sm text-[#8b98a5]">{update.source} - {update.slug}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`${ui.cardSoft} p-4`}>
          <h3 className="text-lg font-bold mb-2">Navigation rapide</h3>
          <div className="flex flex-wrap gap-2">
            <a href="/" className="text-[#66c0f4] hover:underline">Accueil</a>
            <a href="/updates" className="text-[#66c0f4] hover:underline">Updates</a>
            <a href="/games" className="text-[#66c0f4] hover:underline">Jeux</a>
            <a href="/watchlist" className="text-[#66c0f4] hover:underline">Watchlist</a>
          </div>
        </div>
      </div>
    </div>
  );
}
