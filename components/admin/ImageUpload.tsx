'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2, Link2, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Product Image',
  helperText = 'Upload JPG, PNG, WebP, SVG up to 10MB',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setErrorMsg('');
    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds 10MB.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to upload image');
      }

      if (json.data?.url) {
        onChange(json.data.url);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-white/90 text-xs">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-lime/90 hover:text-lime flex items-center gap-1 transition-colors"
        >
          <Link2 className="w-3 h-3" />
          <span>{showUrlInput ? 'Switch to file upload' : 'Enter URL instead'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-rose-950/70 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {showUrlInput ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g. /images/products/pumpkin-seeds.svg or https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="glass-input-3d flex-1 px-3 py-2 rounded-xl text-xs"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="glass-btn-3d p-2 rounded-xl text-rose-300 hover:text-white"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div>
          {value ? (
            /* Uploaded Preview State */
            <div className="relative group rounded-2xl overflow-hidden border border-white/20 bg-black/40 p-2 flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                <Image
                  src={value}
                  alt="Product preview"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-lime" />
                  <span>Image uploaded</span>
                </div>
                <p className="text-[10px] text-botanical-sage font-mono truncate" title={value}>
                  {value}
                </p>
              </div>

              <div className="flex items-center gap-1.5 pr-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="glass-btn-3d px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white/90 hover:text-white"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Replace'}
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="glass-btn-3d p-1.5 rounded-lg text-rose-300 hover:text-white"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Dropzone / Upload Trigger State */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                isDragging
                  ? 'border-lime bg-lime/10 shadow-[0_0_15px_rgba(183,228,89,0.3)]'
                  : 'border-white/20 hover:border-lime/60 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-6 h-6 text-lime animate-spin" />
                  <span className="text-xs text-botanical-sage">Uploading image to CDN...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-lime shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white">
                      Click to upload <span className="text-botanical-sage font-normal">or drag &amp; drop</span>
                    </p>
                    <p className="text-[10px] text-botanical-sage mt-0.5">{helperText}</p>
                  </div>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
