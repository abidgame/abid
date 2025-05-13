import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const GameCard = ({ game }) => {
  const {
    slug,
    title,
    thumbnail,
    description,
    rating,
    totalRatings,
    genre,
    platform,
  } = game;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <Link href={`/games/${slug}`}>
        <div className="relative h-48 w-full">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h3>
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="ml-1 text-sm text-gray-600">
                {rating.toFixed(1)}
              </span>
              <span className="ml-1 text-xs text-gray-500">
                ({totalRatings})
              </span>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {description}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {genre}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {platform}
              </span>
            </div>
            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Play Now →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default GameCard;