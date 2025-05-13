import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/actions/authActions';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Games', href: '/games' },
    { name: 'Top Rated', href: '/games/top-rated' },
    { name: 'New Releases', href: '/games/new-releases' },
    { name: 'Leaderboard', href: '/leaderboard', icon: TrophyIcon },
  ];

  const authLinks = isAuthenticated
    ? [
        { name: 'Profile', href: '/profile', icon: UserCircleIcon },
        {
          name: 'Logout',
          onClick: handleLogout,
          icon: ArrowRightOnRectangleIcon,
        },
      ]
    : [
        { name: 'Login', href: '/auth/login' },
        { name: 'Register', href: '/auth/register' },
      ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold text-blue-600">
                  GameSection
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.icon && <item.icon className="h-5 w-5 mr-1" />}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {isAuthenticated && user && (
              <span className="mr-2 text-sm text-gray-700">
                Hello, {user.username}
              </span>
            )}
            {authLinks.map((item) => (
              item.href ? (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                  {item.name}
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                  {item.name}
                </button>
              )
            ))}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                router.pathname === item.href
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                {item.name}
              </div>
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="space-y-1">
            {authLinks.map((item) => (
              item.href ? (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                    {item.name}
                  </div>
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                    {item.name}
                  </div>
                </button>
              )
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 