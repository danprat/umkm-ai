import { useState, useEffect } from 'react';
import { supabase, getStorageUrl } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image as ImageIcon, Search, Filter, Trash2, X, Calendar, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface GalleryItem {
  id: string;
  user_id: string;
  prompt: string;
  image_path: string;
  aspect_ratio: string | null;
  page_type: 'generate' | 'promo' | 'mascot' | 'food' | 'style';
  created_at: string;
  user_email?: string;
}

const pageTypeLabels = {
  generate: 'Generate Image',
  promo: 'Promo Produk',
  mascot: 'Buat Maskot',
  food: 'Food Lens AI',
  style: 'Copy Style',
};

export default function AdminGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [filteredGallery, setFilteredGallery] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPageType, setFilterPageType] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [gallery, searchQuery, filterPageType]);

  const fetchGallery = async () => {
    try {
      setIsLoading(true);
      
      // Fetch generation history with user profiles
      const { data, error } = await supabase
        .from('generation_history')
        .select(`
          id,
          user_id,
          prompt,
          image_path,
          aspect_ratio,
          page_type,
          created_at,
          profiles!inner(email)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      // Transform data to include user email
      const transformedData = data?.map(item => ({
        ...item,
        user_email: (item.profiles as any)?.email || 'Unknown',
      })) || [];

      setGallery(transformedData);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Gagal memuat galeri');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...gallery];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.prompt.toLowerCase().includes(query) ||
          item.user_email?.toLowerCase().includes(query)
      );
    }

    // Page type filter
    if (filterPageType !== 'all') {
      filtered = filtered.filter(item => item.page_type === filterPageType);
    }

    setFilteredGallery(filtered);
    setPage(1);
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm(`Hapus gambar dari ${item.user_email}?`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('generated-images')
        .remove([item.image_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('generation_history')
        .delete()
        .eq('id', item.id);

      if (dbError) throw dbError;

      toast.success('Gambar berhasil dihapus');
      setGallery(gallery.filter(g => g.id !== item.id));
      setSelectedImage(null);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Gagal menghapus gambar');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const paginatedGallery = filteredGallery.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredGallery.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 animate-pulse text-genz-lime" />
            <p className="font-bold text-gray-600">Loading gallery...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-genz-purple border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-display uppercase">Galeri User</h1>
        </div>
        <p className="text-gray-600 font-bold">
          Total {filteredGallery.length} gambar dari semua user
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari prompt atau email user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-black font-bold"
            />
          </div>

          {/* Page Type Filter */}
          <Select value={filterPageType} onValueChange={setFilterPageType}>
            <SelectTrigger className="border-2 border-black font-bold">
              <SelectValue placeholder="Semua Fitur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Fitur</SelectItem>
              <SelectItem value="generate">Generate Image</SelectItem>
              <SelectItem value="promo">Promo Produk</SelectItem>
              <SelectItem value="mascot">Buat Maskot</SelectItem>
              <SelectItem value="food">Food Lens AI</SelectItem>
              <SelectItem value="style">Copy Style</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFilterPageType('all');
            }}
            className="border-2 border-black font-bold"
          >
            <X className="w-4 h-4 mr-2" />
            Reset Filter
          </Button>
        </div>
      </div>

      {/* Gallery Grid */}
      {paginatedGallery.length === 0 ? (
        <div className="text-center py-16 bg-white border-4 border-black rounded-lg">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="font-bold text-gray-500">Tidak ada gambar ditemukan</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedGallery.map((item) => (
              <div
                key={item.id}
                className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
                onClick={() => setSelectedImage(item)}
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={getStorageUrl(item.image_path)}
                    alt={item.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-genz-lime text-black text-xs font-bold px-2 py-1 border-2 border-black rounded">
                      {pageTypeLabels[item.page_type]}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <p className="text-xs font-mono font-bold line-clamp-2 text-gray-600">
                    {item.prompt}
                  </p>
                  
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <User className="w-3 h-3" />
                    <span className="truncate">{item.user_email}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-2 border-black font-bold"
              >
                Previous
              </Button>
              <span className="font-bold text-sm px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-2 border-black font-bold"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl border-4 border-black max-h-[90vh] flex flex-col overflow-hidden">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display uppercase text-2xl">
                  Detail Gambar
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 overflow-y-auto flex-1">
                {/* Full Image - Responsive with max-width and max-height */}
                <div className="bg-gray-100 border-2 border-black rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
                  <img
                    src={getStorageUrl(selectedImage.image_path)}
                    alt={selectedImage.prompt}
                    className="w-full h-auto max-w-full max-h-[60vh] object-contain"
                  />
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 border-2 border-black p-4 rounded-lg">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">User</p>
                    <p className="font-mono font-bold">{selectedImage.user_email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Fitur</p>
                    <p className="font-bold">{pageTypeLabels[selectedImage.page_type]}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Aspect Ratio</p>
                    <p className="font-bold">{selectedImage.aspect_ratio || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Tanggal</p>
                    <p className="font-bold">{formatDate(selectedImage.created_at)}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Prompt</p>
                    <p className="font-mono font-bold text-gray-700">{selectedImage.prompt}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedImage)}
                    className="flex-1 border-2 border-black font-bold"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Gambar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
