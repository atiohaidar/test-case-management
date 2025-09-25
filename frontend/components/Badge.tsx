
import React from 'react';
import { Priority, TestCaseType } from '../types';

interface BadgeProps {
  text: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ text, className = '' }) => {
  return (
    <span className={`inline-block bg-ui-element text-body-text text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      {text}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: Priority;
  large?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, large = false }) => {
  const styles = {
    high: 'bg-red-800 text-red-200',
    medium: 'bg-yellow-800 text-yellow-200',
    low: 'bg-blue-800 text-blue-200',
  };
  const size = large ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-block font-semibold rounded-md capitalize ${styles[priority]} ${size}`}>
      {priority}
    </span>
  );
};

interface TypeBadgeProps {
  type: TestCaseType;
  large?: boolean;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, large = false }) => {
  const styles = {
    positive: 'bg-green-800 text-green-200',
    negative: 'bg-purple-800 text-purple-200',
  };
  const size = large ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-block font-semibold rounded-md capitalize ${styles[type]} ${size}`}>
      {type}
    </span>
  );
};
