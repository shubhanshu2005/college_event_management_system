import React from 'react';

interface HimanshuAvatarProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
}

export const HimanshuAvatar: React.FC<HimanshuAvatarProps> = ({
  className = '',
  size = 'md',
  showBorder = true
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24'
  }[size];

  return (
    <div
      className={`relative inline-block shrink-0 rounded-2xl overflow-hidden bg-slate-100 ${sizeClasses} ${
        showBorder ? 'border-2 border-red-600 shadow-sm' : ''
      } ${className}`}
      title="Dr. Himanshu Arora (Principal & Main Head, Arya College Main Campus, Jaipur)"
    >
      <img
        src="/himanshu_arora.svg"
        alt="Dr. Himanshu Arora"
        className="w-full h-full object-cover object-top select-none"
        loading="eager"
      />
    </div>
  );
};
