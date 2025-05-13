import { useState } from 'react';
import { Tab } from '@headlessui/react';
import Layout from '../components/Layout';
import Leaderboard from '../components/Leaderboard';
import { TrophyIcon, UsersIcon, FireIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Head from 'next/head';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const LeaderboardPage = () => {
  const [categories] = useState([
    {
      id: 'global',
      name: 'Global',
      icon: <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />,
      description: 'Top players across all games'
    },
    {
      id: 'weekly',
      name: 'Weekly Hot',
      icon: <FireIcon className="h-5 w-5 mr-2 text-red-500" />,
      description: 'Trending players this week'
    },
    {
      id: 'friends',
      name: 'Friends',
      icon: <UsersIcon className="h-5 w-5 mr-2 text-blue-500" />,
      description: 'See how your friends rank'
    }
  ]);

  return (
    <>
      <Head>
        <title>Leaderboard | GameZone</title>
        <meta name="description" content="View the top players across all games" />
      </Head>

      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Leaderboard
            </motion.h1>
            <motion.p 
              className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Compete with players from around the world and see where you rank.
            </motion.p>
          </div>

          <div className="w-full px-2 py-4 sm:px-0">
            <Tab.Group>
              <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                {categories.map((category) => (
                  <Tab
                    key={category.id}
                    className={({ selected }) =>
                      classNames(
                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                        selected
                          ? 'bg-white shadow'
                          : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                      )
                    }
                  >
                    <div className="flex items-center justify-center">
                      {category.icon}
                      {category.name}
                    </div>
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="mt-2">
                <Tab.Panel className={classNames('rounded-xl bg-white p-3')}>
                  <p className="text-sm text-gray-500 mb-4">{categories[0].description}</p>
                  <Leaderboard limit={20} />
                </Tab.Panel>
                <Tab.Panel className={classNames('rounded-xl bg-white p-3')}>
                  <p className="text-sm text-gray-500 mb-4">{categories[1].description}</p>
                  <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <p className="text-gray-600">Weekly leaderboards are coming soon!</p>
                  </div>
                </Tab.Panel>
                <Tab.Panel className={classNames('rounded-xl bg-white p-3')}>
                  <p className="text-sm text-gray-500 mb-4">{categories[2].description}</p>
                  <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <p className="text-gray-600">Friend leaderboards are coming soon!</p>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LeaderboardPage; 