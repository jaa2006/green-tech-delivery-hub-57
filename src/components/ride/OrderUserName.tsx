import React from 'react';
import { User } from 'lucide-react';
import { useUserName } from '@/hooks/useUserName';

interface OrderUserNameProps {
  userId: string;
  className?: string;
}

const OrderUserName: React.FC<OrderUserNameProps> = ({ userId, className = "" }) => {
  const { userName, loading } = useUserName(userId);

  if (loading) {
    return (
      <span className={`flex items-center ${className}`}>
        <User className="w-3 h-3 mr-1" />
        Loading...
      </span>
    );
  }

  return (
    <span className={`flex items-center ${className}`}>
      <User className="w-3 h-3 mr-1" />
      {userName}
    </span>
  );
};

export default OrderUserName;