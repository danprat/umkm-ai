import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, GenerationHistory, getStorageUrl } from '@/lib/supabase';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Image, Download, Loader2, Calendar, Sparkles, History } from 'lucide-react';

type PageType = 'all' | 'generate' | 'promo' | 'mascot' | 'food' | 'style';

const pageTypeLabels: Record<PageType, string> = {
  all: 'Semua',
  generate: 'Generate',
  promo: 'Promo',
  mascot: 'Maskot',
  food: 'Food',
  style: 'Style',
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PageType>('all');

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('generation_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setHistory(data || []);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  const filteredHistory = activeTab === 'all' 
    ? history 
    : history.filter(item => item.page_type === activeTab);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async (item: GenerationHistory) => {
    try {
      const url = getStorageUrl(item.image_path);
      const response = await fetch(url);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `umkm-ai-${item.page_type}-${Date.now()}.png`;
      link.click();
      
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-accent p-2 border-[3px] border-foreground">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-display uppercase">
              Riwayat Gambar
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Lihat dan download gambar yang sudah dibuat
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <label className="block font-bold uppercase text-sm tracking-wider mb-2">
            Filter
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(pageTypeLabels) as PageType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-4 py-2 border-[3px] border-foreground font-bold uppercase text-sm transition-all ${
                  activeTab === type 
                    ? 'bg-accent' 
                    : 'bg-background hover:bg-muted'
                }`}
              >
                {pageTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {filteredHistory.length === 0 ? (
          <div className="border-[3px] border-foreground bg-background p-8 md:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-accent border-[3px] border-foreground flex items-center justify-center mb-4">
              <Image className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-display uppercase mb-2">Belum ada gambar</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Mulai generate gambar untuk melihatnya di sini
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard/generate'}
              className="brutal-btn-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Sekarang
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredHistory.map((item) => (
              <div key={item.id} className="border-[3px] border-foreground bg-background overflow-hidden group">
                <div className="aspect-square relative bg-muted">
                  <img
                    src={getStorageUrl(item.image_path)}
                    alt={item.prompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDownload(item)}
                      className="px-4 py-2 bg-background border-[3px] border-foreground font-bold uppercase text-sm hover:bg-accent transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      Download
                    </button>
                  </div>
                </div>
                <div className="p-3 border-t-[3px] border-foreground">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-accent border-2 border-foreground font-bold uppercase">
                      {pageTypeLabels[item.page_type as PageType] || item.page_type}
                    </span>
                    {/* Mobile download button */}
                    <button
                      onClick={() => handleDownload(item)}
                      className="md:hidden p-2 border-2 border-foreground bg-background hover:bg-accent transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm line-clamp-2 text-muted-foreground mb-2">
                    {item.prompt}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
