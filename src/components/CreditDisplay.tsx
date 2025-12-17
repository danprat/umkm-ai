import { useAuth } from '@/contexts/AuthContext';
import { Coins, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CreditDisplayProps {
  variant?: 'default' | 'compact';
  showBuyButton?: boolean;
  isVertical?: boolean;
}

export default function CreditDisplay({ 
  variant = 'default',
  showBuyButton = true,
  isVertical = false
}: CreditDisplayProps) {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded" />
        <div className="w-8 h-4 bg-gray-300 rounded" />
      </div>
    );
  }

  const credits = profile?.credits ?? 0;
  const isLow = credits <= 3;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div 
          className={`flex items-center gap-1.5 px-2 py-1 border-2 border-foreground text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            isLow 
              ? 'bg-red-100 text-red-700' 
              : 'bg-white text-foreground'
          }`}
        >
          <Coins className="w-3 h-3" />
          <span>{credits}</span>
        </div>
        {showBuyButton && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/pricing')}
            className={`
              px-2 py-1 h-auto border-2 border-foreground 
              font-bold uppercase text-xs
              shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
              transition-all
              ${isLow ? 'bg-accent hover:bg-accent/90' : 'bg-secondary hover:bg-secondary/90'}
            `}
          >
            <ShoppingCart className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex ${isVertical ? 'flex-col items-stretch' : 'items-center'} gap-2`}>
      <div 
        className={`flex items-center justify-center gap-2 px-3 py-1.5 border-[2px] border-foreground font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
          isLow 
            ? 'bg-red-100 text-red-700' 
            : 'bg-white text-foreground'
        }`}
      >
        <Coins className="w-4 h-4" />
        <span className="text-base">{credits}</span>
        <span className="text-xs uppercase tracking-wider">credits</span>
      </div>
      
      {showBuyButton && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/pricing')}
          className={`
            px-3 py-1.5 border-[2px] border-foreground 
            font-bold uppercase text-sm tracking-wider
            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
            hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
            transition-all
            ${isVertical ? 'w-full' : 'h-full'}
            ${isLow ? 'bg-accent hover:bg-accent/90' : 'bg-secondary hover:bg-secondary/90'}
          `}
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          Beli
        </Button>
      )}
    </div>
  );
}
