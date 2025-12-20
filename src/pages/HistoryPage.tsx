import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, GenerationHistory, getStorageUrl } from '@/lib/supabase';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Image, Download, Loader2, Calendar, Sparkles, History, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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

  // Apply search filter
  const searchedHistory = filteredHistory.filter(item =>
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Combine with processing jobs first (they should appear at top)
  const allItems: HistoryItem[] = [
    ...filteredProcessingJobs.map(job => ({ ...job, isJob: true })),
    ...searchedHistory,
  ];

  // Pagination
  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  const paginatedItems = allItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Mobile: shorter format like "20 Des"
      return dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });
    }
    
    // Desktop: full format
    return dateObj.toLocaleDateString('id-ID', {
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
      <div className="w-full px-2 sm:px-4 md:px-6 py-4 md:py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-8 border-b-2 md:border-b-4 border-black pb-3 md:pb-6">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <div className="bg-white p-1 md:p-2 border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md md:rounded-lg animate-wiggle shrink-0">
              <History className="w-4 h-4 md:w-6 md:h-6 stroke-[2.5px] md:stroke-[3px]" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-4xl font-display uppercase tracking-tight leading-tight">
              Riwayat Gambar
            </h1>
          </div>
          <p className="text-xs sm:text-sm md:text-lg text-gray-600 font-bold font-mono">
            Koleksi karya masterpiece kamu ada disini.
          </p>
        </div>

        {/* Filter Tabs - Mobile Horizontal Scroll */}
        <div className="mb-4 md:mb-8">
          <label className="block font-display uppercase text-sm md:text-xl mb-2 md:mb-4 flex items-center gap-2">
            <span className="bg-black text-white w-5 h-5 md:w-8 md:h-8 flex items-center justify-center rounded-full text-[10px] md:text-sm shrink-0">✓</span>
            <span>Kategori</span>
          </label>
          <div className="flex gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {(Object.keys(pageTypeLabels) as PageType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-2.5 sm:px-3 md:px-6 py-1.5 md:py-2 border-2 md:border-4 border-black font-bold uppercase text-[10px] sm:text-xs md:text-sm transition-all rounded-md md:rounded-lg whitespace-nowrap shrink-0 ${
                  activeTab === type 
                    ? 'bg-black text-white' 
                    : 'bg-white active:bg-gray-100'
                }`}
              >
                {pageTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Search Box */}
        <div className="mb-4 md:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 md:border-4 border-black pl-9 md:pl-12 py-2 md:py-3 text-sm md:text-base font-bold rounded-md md:rounded-lg w-full h-10 md:h-auto"
            />
          </div>
        </div>

        {/* Refresh Button */}
        {processingJobs.length > 0 && (
          <div className="mb-3 md:mb-6 flex items-center gap-2 bg-yellow-50 border-2 border-black p-2 md:p-4 rounded-md md:rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="border-2 border-black font-bold text-[10px] md:text-sm px-2 md:px-4 h-7 md:h-9"
            >
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Refresh
            </Button>
            <span className="text-[10px] md:text-sm font-mono text-gray-600 font-bold flex items-center">
              <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full animate-pulse mr-1.5"></span>
              {processingJobs.length} diproses
            </span>
          </div>
        )}

        {/* Content */}
        {allItems.length === 0 ? (
          <div className="border-2 md:border-4 border-black bg-white p-4 md:p-12 flex flex-col items-center justify-center text-center rounded-lg md:rounded-xl">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-gray-100 border-2 md:border-4 border-black flex items-center justify-center mb-3 md:mb-6 rounded-full">
              <Image className="w-6 h-6 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-2xl font-display uppercase mb-1 md:mb-2">Belum ada karya!</h3>
            <p className="text-xs md:text-base text-gray-500 font-bold font-mono mb-4 md:mb-8 max-w-sm">
              Mulai bikin gambar pertamamu sekarang!
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard/generate'}
              className="bg-genz-lime text-black font-bold border-2 md:border-4 border-black text-sm md:text-lg py-2 md:py-6 px-4 md:px-8 rounded-lg w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gas Bikin Gambar!
            </Button>
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="border-2 md:border-4 border-black bg-white p-4 md:p-12 flex flex-col items-center justify-center text-center rounded-lg md:rounded-xl">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-gray-100 border-2 md:border-4 border-black flex items-center justify-center mb-3 md:mb-6 rounded-full">
              <Search className="w-6 h-6 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-2xl font-display uppercase mb-1 md:mb-2">Tidak ada hasil</h3>
            <p className="text-xs md:text-base text-gray-500 font-bold font-mono max-w-sm">
              Coba ubah pencarian atau filter kamu.
            </p>
          </div>
        ) : (
          <>
            {/* Gallery Grid - 2 columns on mobile, expanding on larger screens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6 mb-6 md:mb-8">
              {paginatedItems.map((item) => (
              <div key={item.id} className="border-2 md:border-4 border-black bg-white overflow-hidden group rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] md:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:hover:-translate-y-1 transition-all">
                <div className="aspect-square relative bg-gray-100 border-b-2 md:border-b-4 border-black">
                  {item.isJob ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2">
                      <Skeleton className="w-full h-full rounded-none" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                        <Loader2 className="w-6 h-6 md:w-10 md:h-10 animate-spin text-black mb-1 md:mb-3" />
                        <span className="text-[10px] md:text-sm font-bold font-mono text-center px-1">
                          Memproses...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={getStorageUrl((item as GenerationHistory).image_path)}
                        alt={item.prompt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Desktop hover overlay */}
                      <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center backdrop-blur-[2px]">
                        <button
                          onClick={() => handleDownload(item as GenerationHistory)}
                          className="px-4 py-2 bg-white text-black border-3 border-black font-bold uppercase text-xs hover:bg-genz-cyan transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg"
                        >
                          <Download className="w-4 h-4 inline mr-2" />
                          Download
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-1.5 sm:p-2 md:p-4">
                  <div className="flex items-center justify-between gap-1 mb-1 md:mb-3">
                    <span className={`text-[8px] md:text-[10px] px-1 md:px-2 py-0.5 font-bold uppercase rounded ${
                      item.isJob 
                        ? 'bg-yellow-400 text-black animate-pulse' 
                        : 'bg-black text-white'
                    }`}>
                      {item.isJob ? '...' : (pageTypeLabels[item.page_type as PageType] || item.page_type)}
                    </span>
                    {/* Mobile download button */}
                    {!item.isJob && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item as GenerationHistory);
                        }}
                        className="md:hidden p-1 border border-black bg-genz-lime rounded active:bg-genz-lime/70"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] sm:text-[10px] md:text-xs font-mono font-bold line-clamp-1 md:line-clamp-2 text-gray-600 mb-1 md:mb-2">
                    {item.prompt.slice(0, 30)}{item.prompt.length > 30 ? '...' : ''}
                  </p>
                  <div className="flex items-center gap-0.5 text-[8px] md:text-[10px] font-bold text-gray-400">
                    <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
                    <span className="truncate">{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
            </div>

            {/* Pagination - Simplified for mobile */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 md:gap-4">
                {/* Page info */}
                <div className="text-center text-[10px] md:text-sm font-bold text-gray-500">
                  {currentPage}/{totalPages} • {allItems.length} gambar
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border-2 md:border-3 border-black font-bold rounded-md disabled:opacity-30 disabled:cursor-not-allowed bg-white active:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  
                  {/* Page numbers - show max 5 on mobile */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 md:w-10 md:h-10 font-bold border-2 md:border-3 border-black rounded-md text-xs md:text-sm transition-all ${
                          currentPage === page
                            ? 'bg-black text-white'
                            : 'bg-white active:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border-2 md:border-3 border-black font-bold rounded-md disabled:opacity-30 disabled:cursor-not-allowed bg-white active:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
