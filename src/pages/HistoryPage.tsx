import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, GenerationHistory, getStorageUrl } from '@/lib/supabase';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Image, Download, Loader2, Calendar, Sparkles, History, RefreshCw } from 'lucide-react';

type PageType = 'all' | 'generate' | 'promo' | 'mascot' | 'food' | 'style';

interface GenerationJob {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  page_type: string;
  aspect_ratio?: string;
  image_path?: string;
  created_at: string;
}

type HistoryItem = (GenerationHistory | GenerationJob) & { isJob?: boolean };

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
  const [processingJobs, setProcessingJobs] = useState<GenerationJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PageType>('all');

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch completed history
      const { data: historyData, error: historyError } = await supabase
        .from('generation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (historyError) throw historyError;
      setHistory(historyData || []);

      // Fetch processing jobs (not completed yet)
      const { data: jobsData, error: jobsError } = await supabase
        .from('generation_jobs')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (jobsError) throw jobsError;
      setProcessingJobs(jobsData || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Realtime subscription for job updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('generation_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generation_jobs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime update:', payload);
          // Refresh data when job status changes
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Combine processing jobs and history, filter by tab
  const filteredProcessingJobs = activeTab === 'all' 
    ? processingJobs 
    : processingJobs.filter(item => item.page_type === activeTab);

  const filteredHistory = activeTab === 'all' 
    ? history 
    : history.filter(item => item.page_type === activeTab);

  // Combine with processing jobs first (they should appear at top)
  const allItems: HistoryItem[] = [
    ...filteredProcessingJobs.map(job => ({ ...job, isJob: true })),
    ...filteredHistory,
  ];

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
          <Loader2 className="w-12 h-12 animate-spin text-black" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 border-b-4 border-black pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg animate-wiggle">
              <History className="w-6 h-6 stroke-[3px]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight">
              Riwayat Gambar
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-bold font-mono">
            Koleksi karya masterpiece kamu ada disini.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <label className="block font-display uppercase text-xl mb-4 flex items-center gap-2">
            <span className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">filter</span>
            Pilih Kategori
          </label>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(pageTypeLabels) as PageType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-6 py-2 border-4 border-black font-bold uppercase text-sm transition-all rounded-lg ${
                  activeTab === type 
                    ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] translate-x-[2px] translate-y-[2px]' 
                    : 'bg-white hover:bg-gray-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                }`}
              >
                {pageTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        {processingJobs.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="border-2 border-black font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <span className="text-sm font-mono text-gray-500">
              {processingJobs.length} gambar sedang diproses
            </span>
          </div>
        )}

        {/* Content */}
        {allItems.length === 0 ? (
          <div className="border-4 border-black bg-white p-12 flex flex-col items-center justify-center text-center shadow-brutal rounded-xl">
            <div className="w-20 h-20 bg-gray-100 border-4 border-black flex items-center justify-center mb-6 rounded-full">
              <Image className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-display uppercase mb-2">Belum ada karya nih!</h3>
            <p className="text-gray-500 font-bold font-mono mb-8 max-w-sm">
              Mulai bikin gambar pertamamu sekarang! Jangan malu-malu.
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard/generate'}
              className="bg-genz-lime text-black font-bold border-4 border-black hover:bg-genz-lime/80 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-6 px-8 rounded-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Gas Bikin Gambar!
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allItems.map((item) => (
              <div key={item.id} className="border-4 border-black bg-white overflow-hidden group rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all duration-300">
                <div className="aspect-square relative bg-gray-100 border-b-4 border-black">
                  {item.isJob ? (
                    // Processing job - show skeleton
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <Skeleton className="w-full h-full rounded-none" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                        <Loader2 className="w-10 h-10 animate-spin text-black mb-3" />
                        <span className="text-sm font-bold font-mono text-center px-2">
                          Sedang membuat gambar...
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Completed history - show image
                    <>
                      <img
                        src={getStorageUrl((item as GenerationHistory).image_path)}
                        alt={item.prompt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <button
                          onClick={() => handleDownload(item as GenerationHistory)}
                          className="px-6 py-3 bg-white text-black border-4 border-black font-bold uppercase text-sm hover:bg-genz-cyan transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg transform hover:scale-105 active:scale-95"
                        >
                          <Download className="w-5 h-5 inline mr-2" />
                          Ambil Gambar
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] px-2 py-1 font-bold uppercase rounded border-2 ${
                      item.isJob 
                        ? 'bg-yellow-400 text-black border-black animate-pulse' 
                        : 'bg-black text-white border-transparent'
                    }`}>
                      {item.isJob ? 'Processing...' : (pageTypeLabels[item.page_type as PageType] || item.page_type)}
                    </span>
                    {/* Mobile download button - only for completed */}
                    {!item.isJob && (
                      <button
                        onClick={() => handleDownload(item as GenerationHistory)}
                        className="md:hidden p-2 border-2 border-black bg-white hover:bg-gray-100 transition-colors rounded-lg"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs font-mono font-bold line-clamp-2 text-gray-600 mb-3 leading-relaxed">
                    {item.prompt.split(' ').slice(0, 5).join(' ')}{item.prompt.split(' ').length > 5 ? '...' : ''}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
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
