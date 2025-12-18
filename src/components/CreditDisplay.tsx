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
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full animate-pulse border-2 border-transparent">
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
          className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md ${
            isLow 
              ? 'bg-red-100 text-red-700' 
              : 'bg-white text-black'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span className="font-mono">{credits}</span>
        </div>
        {showBuyButton && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/pricing')}
            className={`
              px-2 py-1 h-auto border-2 border-black rounded-md
              font-bold uppercase text-xs
              shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
              transition-all bg-genz-lime text-black hover:bg-genz-lime/80
            `}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex ${isVertical ? 'flex-col items-stretch' : 'items-center'} gap-3`}>
      <div 
        className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg ${
          isLow 
            ? 'bg-red-100 text-red-700' 
            : 'bg-white text-black'
        }`}
      >
        <Coins className="w-5 h-5" />
        <span className="text-lg font-mono">{credits}</span>
        <span className="text-xs uppercase tracking-wider font-display">Kredit</span>
      </div>
      
      {showBuyButton && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/pricing')}
          className={`
            px-4 py-2 border-2 border-black rounded-lg
            font-bold uppercase text-sm tracking-wider
            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
            hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
            transition-all bg-genz-pink text-black hover:bg-genz-pink/90
            ${isVertical ? 'w-full' : 'h-full'}
          `}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Isi Ulang
        </Button>
      )}
    </div>
  );
}
