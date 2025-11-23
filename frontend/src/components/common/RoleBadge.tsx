'use client';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const roleConfig = {
    PLAYER: {
      icon: '🏀',
      label: 'Joueur',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
    },
    RECRUITER: {
      icon: '🔍',
      label: 'Recruteur',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300',
    },
    ADMIN: {
      icon: '👑',
      label: 'Admin',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-300',
    },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.PLAYER;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

