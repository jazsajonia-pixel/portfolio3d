'use client';

import { motion } from 'framer-motion';
import {
  Code,
  Figma,
  Database,
  Cpu,
  Folder,
  Lightbulb,
} from 'phosphor-react';

const tools = [
  { name: 'React', icon: Code, color: '#61dafb' },
  { name: 'Next.js', icon: Code, color: '#000000' },
  { name: 'Tailwind CSS', icon: Cpu, color: '#06b6d4' },
  { name: 'Claude', icon: Lightbulb, color: '#f97316' },
  { name: 'Python', icon: Code, color: '#3776ab' },
  { name: 'JavaScript', icon: Code, color: '#f7df1e' },
  { name: 'TypeScript', icon: Code, color: '#3178c6' },
  { name: 'PostgreSQL', icon: Database, color: '#336791' },
  { name: 'MongoDB', icon: Database, color: '#13aa52' },
  { name: 'Framer Motion', icon: Figma, color: '#a855f7' },
];

export default function Marquee() {
  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 py-8">
      <motion.div
        animate={{ x: ['0%', '-100%'] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex gap-8 whitespace-nowrap"
      >
        {[...tools, ...tools].map((tool, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full border border-dark-700 hover:border-primary-500 transition-smooth"
          >
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${tool.color}20` }}
            >
              <tool.icon
                size={16}
                weight="fill"
                style={{ color: tool.color }}
              />
            </div>
            <span className="text-sm font-medium text-dark-200">
              {tool.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
