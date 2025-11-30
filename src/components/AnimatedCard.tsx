'use client';

import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function AnimatedCard({ children, delay = 0, className = '' }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 ${className}`}
    >
      {children}
    </motion.div>
  );
}