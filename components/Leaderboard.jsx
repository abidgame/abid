import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { TrophyIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Leaderboard = ({ gameId, limit = 10 }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const endpoint = gameId 
          ? `${process.env.NEXT_PUBLIC_API_URL}/leaderboard/games/${gameId}?limit=${limit}`
          : `${process.env.NEXT_PUBLIC_API_URL}/leaderboard/global?limit=${limit}`;
        
        const { data } = await axios.get(endpoint);
        setLeaderboard(data.data.leaderboard);
        
        // Fetch user rank if authenticated and gameId is provided
        if (isAuthenticated && gameId) {
          const rankResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/leaderboard/games/${gameId}/rank`,
            { withCredentials: true }
          );
          setUserRank(rankResponse.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameId, limit, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
        {gameId ? 'Game Leaderboard' : 'Global Leaderboard'}
      </h3>

      {leaderboard.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No scores recorded yet. Be the first!</p>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {gameId ? 'Score' : 'Total Score'}
                </th>
                {!gameId && (
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Games
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <motion.tr
                  key={gameId ? entry._id : entry._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`${
                    isAuthenticated && user && entry.user?._id === user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {index === 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-500 text-white rounded-full">
                        1
                      </span>
                    )}
                    {index === 1 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-400 text-white rounded-full">
                        2
                      </span>
                    )}
                    {index === 2 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-700 text-white rounded-full">
                        3
                      </span>
                    )}
                    {index > 2 && <span className="text-gray-500">{index + 1}</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        {entry.user?.avatar || entry.avatar ? (
                          <img
                            src={entry.user?.avatar || entry.avatar}
                            alt={entry.user?.name || entry.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                            {(entry.user?.name || entry.name || 'User').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.user?.name || entry.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    {gameId ? entry.score.toLocaleString() : entry.totalScore.toLocaleString()}
                  </td>
                  {!gameId && (
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {entry.gamesPlayed}
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User's rank (if authenticated and playing a specific game) */}
      {isAuthenticated && userRank && (
        <div className="mt-6 p-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Your Ranking</p>
                <div className="flex items-center">
                  {userRank.rank ? (
                    <>
                      <span className="text-sm text-gray-500">
                        #{userRank.rank} of {userRank.totalPlayers}
                      </span>
                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        Top {Math.round((userRank.rank / userRank.totalPlayers) * 100)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Not ranked yet</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Your Best Score</p>
              <p className="text-lg font-bold text-blue-600">
                {userRank.score ? userRank.score.toLocaleString() : '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 