
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, icon, variant = 'primary', ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'secondary':
          return 'bg-white text-gray-700 border border-gray-300';
        case 'outline':
          return 'bg-transparent border border-[#07595A] text-[#07595A]';
        default:
          return 'bg-gradient-to-b from-[#07595A] to-[#065659]';
      }
    };

    return (
      <button
        className={cn(
          // Base styles adapted from reference
          'animated-button cursor-pointer relative inline-flex items-center justify-center overflow-hidden transition-all duration-250 ease-in-out rounded-xl border-none outline-none px-4 py-3',
          getVariantClasses(),
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Fold effect */}
        <span className="fold absolute top-0 right-0 h-4 w-4 transition-all duration-500 ease-in-out bg-gradient-to-br from-[#07595A]/80 to-transparent shadow-sm rounded-tr-xl rounded-bl-2xl z-10"></span>
        
        {/* Floating points */}
        <div className="points-wrapper absolute inset-0 overflow-hidden pointer-events-none z-10">
          {[...Array(10)].map((_, i) => (
            <i
              key={i}
              className={`point absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-${[1, 0.7, 0.8, 0.6, 1, 0.5, 0.9, 0.8, 0.6, 1][i]} animate-float-${i + 1}`}
              style={{
                left: `${[10, 30, 25, 44, 50, 75, 88, 58, 98, 65][i]}%`,
                animationDuration: `${[2.35, 2.5, 2.2, 2.05, 1.9, 1.5, 2.2, 2.25, 2.6, 2.5][i]}s`,
                animationDelay: `${[0.2, 0.5, 0.1, 0, 0, 1.5, 0.2, 0.2, 0.1, 0.2][i]}s`
              }}
            />
          ))}
        </div>

        {/* Inner content */}
        <span className="inner relative z-20 w-full text-white inline-flex items-center justify-center gap-2 text-sm font-medium leading-6 transition-colors duration-200">
          {icon}
          {children}
        </span>

        <style>{`
          .animated-button::before {
            content: "";
            position: absolute;
            inset: 1px;
            transition: all 0.5s ease-in-out;
            border-radius: calc(0.75rem - 1px);
            z-index: 0;
            background: linear-gradient(
              177.95deg,
              rgba(255, 255, 255, 0.19) 0%,
              rgba(255, 255, 255, 0) 100%
            );
          }
          
          .animated-button::after {
            content: "";
            position: absolute;
            inset: 2px;
            transition: all 0.5s ease-in-out;
            border-radius: calc(0.75rem - 2px);
            z-index: 0;
            background: linear-gradient(0deg, #07595A, #07595A);
          }
          
          .animated-button:active {
            transform: scale(0.95);
          }
          
          .animated-button:hover .fold {
            margin-top: -1rem;
            margin-right: -1rem;
          }
          
          .fold::after {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            width: 150%;
            height: 150%;
            transform: rotate(45deg) translateX(0%) translateY(-18px);
            background-color: #e8e8e8;
            pointer-events: none;
          }
          
          @keyframes floating-points {
            0% { transform: translateY(0); }
            85% { opacity: 0; }
            100% { transform: translateY(-55px); opacity: 0; }
          }
          
          .point {
            animation: floating-points infinite ease-in-out;
          }
        `}</style>
      </button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };
