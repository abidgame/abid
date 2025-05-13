import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGameDetails, rateGame, updateGameStats } from '../../store/actions/gameActions';
import Layout from '../../components/Layout';
import Leaderboard from '../../components/Leaderboard';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Head from 'next/head';
import axios from 'axios';

const GameDetails = () => {
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useDispatch();
  const { gameDetails, loading, error } = useSelector((state) => state.games);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [userRating, setUserRating] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playStartTime, setPlayStartTime] = useState(null);
  const [score, setScore] = useState(0);
  const [showScoreInput, setShowScoreInput] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchGameDetails(slug));
    }
  }, [dispatch, slug]);

  useEffect(() => {
    // Set user rating if already rated
    if (gameDetails && isAuthenticated && gameDetails.ratings) {
      const userRatingObj = gameDetails.ratings.find(
        rating => rating.user === user.id
      );
      if (userRatingObj) {
        setUserRating(userRatingObj.value);
      }
    }
  }, [gameDetails, isAuthenticated, user]);

  const handlePlay = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setIsPlaying(true);
    setPlayStartTime(Date.now());
    
    // Record game play start
    dispatch(updateGameStats(gameDetails.id, {
      isNewPlayer: !gameDetails.playedBy?.includes(user.id),
    }));
  };

  const handleStopPlaying = () => {
    if (playStartTime) {
      const playTime = Math.floor((Date.now() - playStartTime) / 1000); // in seconds
      
      // Update game stats with play time
      dispatch(updateGameStats(gameDetails.id, {
        playTime,
      }));
    }
    
    setIsPlaying(false);
    setPlayStartTime(null);
    setShowScoreInput(true);
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !gameDetails) return;
    
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/leaderboard/games/${gameDetails.id}/submit`,
        { score: Number(score) },
        { withCredentials: true }
      );
      setShowScoreInput(false);
      // Refresh the leaderboard component by changing a key
      // This is handled by the Leaderboard component's useEffect
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  const handleRating = (rating) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    setUserRating(rating);
    dispatch(rateGame(gameDetails.id, rating));
  };

  if (loading || !gameDetails) {
    return (
      <Layout title="Loading...">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/games')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back to Games
          </button>
        </div>
      </Layout>
    );
  }

  const {
    title,
    description,
    thumbnail,
    developer,
    publisher,
    releaseDate,
    genre,
    platform,
    rating,
    totalRatings,
    gameUrl,
    id
  } = gameDetails;

  return (
    <>
      <Head>
        <title>{title} | GameZone</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | GameZone`} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={thumbnail} />
      </Head>

      <Layout title={title}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Game Image */}
            <div className="md:col-span-1">
              <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={thumbnail}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Rating Section */}
              <div className="mt-6 bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Rate this game</h3>
                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className="focus:outline-none"
                    >
                      {star <= userRating ? (
                        <StarIcon className="h-8 w-8 text-yellow-400" />
                      ) : (
                        <StarOutline className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Average rating: {rating.toFixed(1)} ({totalRatings} ratings)
                </p>
              </div>

              {/* Leaderboard */}
              <div className="mt-6">
                <Leaderboard gameId={id} limit={5} />
              </div>
            </div>

            {/* Game Details */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {genre}
                </span>
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {platform}
                </span>
              </div>

              <p className="mt-4 text-lg text-gray-700">{description}</p>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Developer</dt>
                    <dd className="mt-1 text-sm text-gray-900">{developer}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Publisher</dt>
                    <dd className="mt-1 text-sm text-gray-900">{publisher}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Release Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(releaseDate).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Score Input */}
              {showScoreInput && isAuthenticated && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900">Submit Your Score</h3>
                  <form onSubmit={handleScoreSubmit} className="mt-2 flex items-end">
                    <div className="flex-1 mr-3">
                      <label htmlFor="score" className="block text-sm font-medium text-blue-700">
                        Score
                      </label>
                      <input
                        type="number"
                        id="score"
                        name="score"
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Submit
                    </button>
                  </form>
                </div>
              )}

              {/* Play Button */}
              <div className="mt-8">
                {!isPlaying ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlay}
                    className="w-full sm:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Play Now
                  </motion.button>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={gameUrl}
                        title={title}
                        className="w-full h-full"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <button
                      onClick={handleStopPlaying}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Stop Playing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default GameDetails;