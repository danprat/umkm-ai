import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'zoom-in' | 'bounce-in' | 'rotate-in';
  delay?: number;
  duration?: number;
}

export const ScrollReveal = ({ 
  children, 
  className, 
  animation = 'fade-up', 
  delay = 0,
  duration = 600
}: ScrollRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-up':
        return 'translate-y-16 opacity-0';
      case 'fade-in':
        return 'opacity-0';
      case 'slide-left':
        return '-translate-x-16 opacity-0';
      case 'slide-right':
        return 'translate-x-16 opacity-0';
      case 'zoom-in':
        return 'scale-90 opacity-0';
      case 'bounce-in':
        return 'scale-50 opacity-0';
      case 'rotate-in':
        return 'rotate-[-10deg] scale-90 opacity-0';
      default:
        return 'opacity-0';
    }
  };

  const getVisibleClass = () => {
    switch (animation) {
      case 'bounce-in':
        return 'animate-bounce-in opacity-100'; // Uses custom animation if available or fallback
      default:
        return 'translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100';
    }
  };

  // For bounce-in we might want to use the CSS animation class instead of transition
  // But for consistency let's stick to transitions for most, and animation classes for complex ones if needed.
  // Actually, let's keep it simple with transitions.
  
  return (
    <div
      ref={ref}
      className={cn(
        'transition-all cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy transition
        isVisible ? getVisibleClass() : getAnimationClass(),
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`, 
        transitionDelay: `${delay}ms` 
      }}
    >
      {children}
    </div>
  );
};
