import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Facebook } from 'lucide-react';
import logo from '../assets/logo.png';

const Footer = () => {
  const socialLinks = [
    {
      icon: <Linkedin className="h-5 w-5" />,
      href: 'https://www.linkedin.com/company/111453283/admin/dashboard/',
    },
    {
      icon: <Facebook className="h-5 w-5" />,
      href: 'https://www.facebook.com/people/Resumewala/61578981080067/',
    },
    {
      icon: <Instagram className="h-5 w-5" />,
      href: 'https://www.instagram.com/resumewala.co.in',
    },
  ];

  const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Employers', href: '/employee' },
    { name: 'Browse Jobs', href: '/jobs' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
  ];

  return (
    <footer className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* BRAND */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Link to="/">
              <img src={logo} alt="Resumewala Logo" className="h-20 w-auto" />
            </Link>

            {/* Social Icons */}
            <div className="flex gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white shadow-sm hover:bg-blue-500 hover:text-white transition"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed text-center md:text-left max-w-sm">
              Resumewala connects job seekers with verified employers through a
              smart, transparent, and efficient hiring platform.
            </p>
          </div>

          {/* LINKS */}
          <div className="flex justify-center md:justify-start">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* EMPTY COLUMN (for future contact/info) */}
          <div className="hidden md:block" />
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-300 mt-10 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} RESUMEWALA. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
