import JSZip from 'jszip';
import { MediaRecord } from '../types';

export const parseZipFile = async (file: File): Promise<MediaRecord[]> => {
  try {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    const mediaItems: MediaRecord[] = [];
    
    // We process files to create object URLs for preview
    const filePromises: Promise<void>[] = [];
    let idCounter = 1;

    loadedZip.forEach((relativePath, zipEntry) => {
      if (zipEntry.dir) return;
      
      const name = zipEntry.name;
      // Skip hidden files or system files
      if (name.startsWith('__MACOSX') || name.startsWith('.')) return;

      const lowerName = name.toLowerCase();
      let type: 'image' | 'video' | 'audio' | null = null;
      let mime = '';

      if (/\.(jpg|jpeg|png|gif|webp|bmp)$/.test(lowerName)) {
          type = 'image';
          mime = 'image/jpeg'; 
      } else if (/\.(mp4|mov|avi|webm|mkv)$/.test(lowerName)) {
          type = 'video';
          mime = 'video/mp4';
      } else if (/\.(mp3|wav|ogg|m4a|aac)$/.test(lowerName)) {
          type = 'audio';
          mime = 'audio/mpeg';
      }

      if (type) {
          const p = zipEntry.async('blob').then(async (blob) => {
              // Create blob URL for immediate display
              // We'll store the blob in Supabase Storage and save the public URL
              const blobUrl = URL.createObjectURL(blob);
              
              // Calculate a simulated size string
              const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
              
              mediaItems.push({
                  id: `extracted_${idCounter++}_${Date.now()}`,
                  timestamp: new Date().toISOString(), // In a real forensic app, we'd parse EXIF/metadata here
                  type: type!,
                  fileName: name.split('/').pop() || name, // Handle nested folders
                  url: blobUrl, // Use blob URL for immediate display, will be uploaded to Storage
                  size: `${sizeMB} MB`,
                  mimeType: mime,
                  metadata: {
                    device: "Unknown (Extracted)",
                    location: undefined
                  },
                  // Store the blob for later upload to Supabase Storage
                  _blob: blob
              } as any);
          });
          filePromises.push(p);
      }
    });

    await Promise.all(filePromises);
    return mediaItems;
  } catch (error) {
    console.error("Error parsing ZIP:", error);
    throw new Error("Failed to parse ZIP file. Please ensure it is a valid archive.");
  }
};