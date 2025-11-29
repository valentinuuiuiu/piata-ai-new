'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex items-center space-x-2 text-sm">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <li className="flex items-center">
                <span className="mx-2 text-gray-600">/</span>
                {item.href ? (
                  <a
                    href={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-white font-medium">{item.label}</span>
                )}
              </li>
            </motion.div>
          ))}
        </AnimatePresence>
      </ol>
    </nav>
  );
}