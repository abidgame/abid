import { useEffect, useState } from 'react';
import Head from 'next/head';
import GameCard from '@/components/GameCard';
import Layout from '@/components/Layout';
import { io } from 'socket.io-client';
import { useRouter } from 'next/router';

export default function Home() {
  const [games, setGames] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  const [stats, setStats] = useState({ totalPlays: 0, totalGames: 0 });
  const router = useRouter();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, trendingRes] = await Promise.all([
          fetch('/api/games'),
          fetch('/api/games/trending')
        ]);
        
        setGames(await gamesRes.json());
        setTrendingGames(await trendingRes.json());
      } catch (error) {
        console.error('Failed to load games:', error);
      }
    };

    fetchData();
  }, []);

  // Socket.io for real-time updates
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    socket.on('view-update', (data) => {
      setGames(prev => prev.map(game => 
        game._id === data.gameId ? { ...game, views: game.views + 1 } : game
      ));
    });

    socket.on('live-stats', (data) => {
      setStats(data);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <Layout>
      <Head>
        <title>GameZone - Play Free Online Games</title>
        <meta name="description" content="Discover and play the best HTML5 games" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Play Free Online Games</h1>
          <p className="text-xl mb-8">No downloads required - Instant fun!</p>
          <div className="flex justify-center space-x-4">
            <span className="bg-white text-blue-600 px-4 py-2 rounded-lg">
              {stats.totalGames}+ Games
            </span>
            <span className="bg-white text-blue-600 px-4 py-2 rounded-lg">
              {stats.totalPlays.toLocaleString()}+ Plays
            </span>
          </div>
        </div>
      </section>

      {/* Trending Games */}
      <section className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6">🔥 Trending Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingGames.map(game => (
            <GameCard 
              key={game._id} 
              game={game}
              onClick={() => router.push(`/games/${game.slug}`)}
            />
          ))}
        </div>
      </section>

      {/* All Games */}
      <section className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6">🎮 All Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {games.map(game => (
            <GameCard 
              key={game._id} 
              game={game}
              onClick={() => router.push(`/games/${game.slug}`)}
            />
          ))}
        </div>
      </section>

      {/* Ad Unit (AdSense) */}
      <div className="container mx-auto p-4">
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
      </div>
    </Layout>
  );
}