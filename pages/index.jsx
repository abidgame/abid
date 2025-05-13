import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import { fetchFeaturedGames, fetchTopGames } from '../store/actions/gameActions';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Home = () => {
  const dispatch = useDispatch();
  const { featuredGames, topGames, loading } = useSelector((state) => state.games);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    dispatch(fetchFeaturedGames());
    dispatch(fetchTopGames());
  }, [dispatch]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Layout title="Home">
      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              Welcome to Game Platform
            </h1>
            <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto">
              Discover and play the best online games. Join our community of gamers
              and start your gaming journey today.
            </p>
            <div className="mt-10">
              <a
                href="/games"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:text-lg"
              >
                Browse Games
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-white"></div>
      </section>

      {/* Featured Games */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Featured Games
          </h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <motion.div
              ref={ref}
              variants={container}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredGames.map((game) => (
                <motion.div key={game.id} variants={item}>
                  <GameCard game={game} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Top Rated Games */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Top Rated Games
          </h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {topGames.map((game) => (
                <motion.div key={game.id} variants={item}>
                  <GameCard game={game} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Game Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <a
                key={category.name}
                href={`/games/category/${category.slug}`}
                className="group relative rounded-lg overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="object-cover group-hover:opacity-75 transition-opacity"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {category.gameCount} games
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

const categories = [
  {
    name: 'Action',
    slug: 'action',
    image: '/images/categories/action.jpg',
    gameCount: 156,
  },
  {
    name: 'Adventure',
    slug: 'adventure',
    image: '/images/categories/adventure.jpg',
    gameCount: 94,
  },
  {
    name: 'Strategy',
    slug: 'strategy',
    image: '/images/categories/strategy.jpg',
    gameCount: 82,
  },
  {
    name: 'RPG',
    slug: 'rpg',
    image: '/images/categories/rpg.jpg',
    gameCount: 67,
  },
  {
    name: 'Sports',
    slug: 'sports',
    image: '/images/categories/sports.jpg',
    gameCount: 45,
  },
  {
    name: 'Puzzle',
    slug: 'puzzle',
    image: '/images/categories/puzzle.jpg',
    gameCount: 73,
  },
  {
    name: 'Racing',
    slug: 'racing',
    image: '/images/categories/racing.jpg',
    gameCount: 38,
  },
  {
    name: 'Simulation',
    slug: 'simulation',
    image: '/images/categories/simulation.jpg',
    gameCount: 51,
  },
];

export default Home;
