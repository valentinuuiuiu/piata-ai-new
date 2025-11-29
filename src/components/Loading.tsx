import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Se încarcă...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-slate-700 border-t-indigo-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {message && (
        <p className="mt-4 text-slate-400 text-sm">{message}</p>
      )}
    </div>
  );
};

interface LoadingCardProps {
  message?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  message = 'Se încarcă datele...'
}) => {
  return (
    <div className="glass p-8 rounded-2xl">
      <div className="flex items-center space-x-4">
        <motion.div
          className="w-6 h-6 border-2 border-slate-600 border-t-indigo-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-slate-300">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;