'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  FolderOpen,
  Gear,
  User,
  Envelope,
  List,
  X,
} from 'phosphor-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Home', href: '/', icon: House },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Services', href: '/services', icon: Gear },
  { name: 'About', href: '/about', icon: User },
  { name: 'Contact', href: '/contact', icon: Envelope },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const isActive = (href) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary-500 hover:bg-primary-600 p-2 rounded-lg transition-smooth"
      >
        {isOpen ? (
          <X size={24} weight="bold" />
        ) : (
          <List size={24} weight="bold" />
        )}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen w-64 bg-dark-900 border-r border-dark-700 z-40 lg:static lg:translate-x-0 overflow-y-auto"
      >
        <div className="p-8 flex flex-col h-full">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h1 className="text-2xl font-bold gradient-text mb-2">JS</h1>
            <p className="text-sm text-dark-400">Jazz Sajonia</p>
            <p className="text-xs text-dark-500 mt-1">
              Web Developer & AI Automation Specialist
            </p>
          </motion.div>

          {/* Navigation Menu */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth group ${
                        active
                          ? 'bg-primary-500 text-white'
                          : 'text-dark-300 hover:bg-dark-800 hover:text-primary-500'
                      }`}
                    >
                      <Icon
                        size={20}
                        weight={active ? 'fill' : 'regular'}
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="border-t border-dark-700 pt-6"
          >
            <p className="text-xs text-dark-500 text-center">
              © 2024 Jazz Sajonia. All rights reserved.
            </p>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main content margin (Desktop only) */}
      <div className="hidden lg:block" />
    </>
  );
}
