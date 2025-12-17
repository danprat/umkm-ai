import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
  label?: string;
  currentImage?: string;
}

export function ImageUploader({ onImageSelect, label = "Upload Gambar", currentImage }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onImageSelect(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearImage = useCallback(() => {
    setPreview(null);
    onImageSelect("");
  }, [onImageSelect]);

  return (
    <div className="space-y-2">
      <label className="block font-bold uppercase text-sm tracking-wider">{label}</label>
      
      {preview ? (
        <div className="relative brutal-card p-2">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover border-[3px] border-foreground"
          />
          <button
            onClick={clearImage}
            className="absolute top-4 right-4 bg-destructive text-destructive-foreground p-2 border-[3px] border-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`brutal-card cursor-pointer transition-all ${
            isDragging ? "bg-accent animate-pulse-border" : ""
          }`}
        >
          <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="bg-muted p-4 border-[3px] border-foreground mb-4">
              {isDragging ? (
                <ImageIcon className="w-8 h-8" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>
            <span className="font-bold uppercase text-sm">
              {isDragging ? "Lepaskan disini!" : "Klik atau drag gambar"}
            </span>
            <span className="text-muted-foreground text-xs mt-1">
              PNG, JPG, WEBP (Max 10MB)
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
