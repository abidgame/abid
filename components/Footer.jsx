import Link from 'next/link';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaDiscord,
} from 'react-icons/fa';

const Footer = () => {
  const navigation = {
    main: [
      { name: 'About', href: '/about' },
      { name: 'Games', href: '/games' },
      { name: 'Blog', href: '/blog' },
      { name: 'Support', href: '/support' },
      { name: 'Terms', href: '/terms' },
      { name: 'Privacy', href: '/privacy' },
    ],
    social: [
      {
        name: 'Facebook',
        href: '#',
        icon: FaFacebook,
      },
      {
        name: 'Twitter',
        href: '#',
        icon: FaTwitter,
      },
      {
        name: 'Instagram',
        href: '#',
        icon: FaInstagram,
      },
      {
        name: 'GitHub',
        href: '#',
        icon: FaGithub,
      },
      {
        name: 'Discord',
        href: '#',
        icon: FaDiscord,
      },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav
          className="flex flex-wrap justify-center"
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="px-5 py-2">
              <Link
                href={item.href}
                className="text-base text-gray-500 hover:text-gray-900"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-gray-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} GameSection. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 