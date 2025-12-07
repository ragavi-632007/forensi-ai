import React, { useState, useEffect, useRef } from 'react';
import { MediaRecord, CaseComment } from '../types';
import { MOCK_OFFICERS } from '../data';

interface MediaGalleryProps {
  media: MediaRecord[];
  currentUser: { name: string, id: string };
  onAddComment?: (evidenceId: string, content: string) => void;
}

// Lazy Loading Component for Image Thumbnails
const LazyThumbnail = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });
    }, { rootMargin: '200px' }); 

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-900">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse z-0">
          <svg className="w-8 h-8 text-slate-700 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      {isVisible && (
        <img 
          src={src} 
          alt={alt} 
          className={`${className} transition-opacity duration-500 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            console.error("Failed to load image:", src.substring(0, 50));
            // Show placeholder on error
            setIsLoaded(false);
          }}
        />
      )}
    </div>
  );
};

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, currentUser, onAddComment }) => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaRecord | null>(null);
  const [newComment, setNewComment] = useState('');
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setNewComment('');
  }, [selectedMedia]);

  const filteredMedia = media.filter(m => filter === 'all' || m.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      );
      case 'video': return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      );
      case 'audio': return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
      );
      default: return null;
    }
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim() || !selectedMedia || !onAddComment) return;
    onAddComment(selectedMedia.id, newComment);
    setNewComment('');
  };

  const MetadataItem = ({ label, value }: { label: string, value: string | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
        <span className="text-xs text-slate-500 font-medium uppercase">{label}</span>
        <span className="text-sm text-slate-300 font-mono truncate max-w-[150px]">{value}</span>
      </div>
    );
  };

  return (
    <div className="bg-slate-850 rounded-lg border border-slate-700 shadow-xl h-full flex flex-col">
      {/* ... Filter Header ... */}
      <div className="p-3 sm:p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-cyan-400 font-semibold tracking-wide flex items-center gap-2 text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          EVIDENCE GALLERY
        </h3>
        <div className="flex gap-1 sm:gap-2 bg-slate-800 p-1 rounded-lg w-full sm:w-auto">
          {['all', 'image', 'video', 'audio'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs uppercase font-medium transition-all ${
                filter === t 
                ? 'bg-cyan-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        {filteredMedia.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-500">
             <p>No media found for this filter.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map((item) => (
              <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden group hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-900/20 cursor-pointer relative" onClick={() => setSelectedMedia(item)}>
                 {/* Comment Indicator */}
                 {(item.comments?.length || 0) > 0 && (
                   <div className="absolute top-2 right-2 z-20 bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 rounded flex items-center gap-0.5">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                     {item.comments?.length}
                   </div>
                 )}

                <div className="aspect-square bg-slate-900 relative flex items-center justify-center overflow-hidden">
                  {item.type === 'image' && item.url ? (
                    <LazyThumbnail src={item.url} alt={item.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : item.type === 'image' ? (
                    // Fallback for images without URL
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  ) : (
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      item.type === 'video' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {getIcon(item.type)}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-slate-200 truncate" title={item.fileName}>{item.fileName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Media Player Modal with Sidebar */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
           <div className="w-full h-full sm:rounded-lg flex flex-col md:flex-row max-w-[1600px] max-h-[100vh] sm:max-h-[90vh] mx-auto bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
              
              {/* Left: Media Viewer (70%) */}
              <div className="flex-1 bg-black flex flex-col relative border-r-0 md:border-r border-slate-800">
                <button 
                   onClick={() => setSelectedMedia(null)} 
                   className="absolute top-2 sm:top-4 left-2 sm:left-4 z-[60] text-white/50 hover:text-white bg-black/40 p-1.5 sm:p-2 rounded-full hover:bg-black/60 transition-colors"
                   aria-label="Close media viewer"
                 >
                   <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>

                 <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
                    {selectedMedia.type === 'image' && (
                       <img src={selectedMedia.url} alt={selectedMedia.fileName} className="max-w-full max-h-full object-contain shadow-2xl" />
                    )}
                    {selectedMedia.type === 'video' && (
                       <video ref={videoRef} src={selectedMedia.url} controls className="max-w-full max-h-full rounded bg-black" autoPlay />
                    )}
                    {selectedMedia.type === 'audio' && (
                       <div className="text-center w-full px-4">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                          </div>
                          <audio ref={audioRef} src={selectedMedia.url} controls className="w-full max-w-md" />
                       </div>
                    )}
                 </div>
                 
                 <div className="h-auto sm:h-16 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center px-4 sm:px-6 py-3 sm:py-0 justify-between gap-2 sm:gap-0">
                    <div className="flex flex-col min-w-0 flex-1">
                       <span className="text-white font-medium text-sm sm:text-base truncate">{selectedMedia.fileName}</span>
                       <span className="text-xs text-slate-500">{new Date(selectedMedia.timestamp).toLocaleString()}</span>
                    </div>
                    <a href={selectedMedia.url} download className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm text-white rounded transition-colors whitespace-nowrap">Download</a>
                 </div>
              </div>

              {/* Right: Sidebar (30%) - Metadata & Comments */}
              <div className="w-full md:w-96 bg-slate-850 flex flex-col border-t md:border-t-0 border-slate-800">
                 {/* Metadata Section */}
                 <div className="p-6 border-b border-slate-700">
                    <h4 className="text-sm font-bold text-cyan-500 uppercase mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Exif & Metadata
                    </h4>
                    <div className="space-y-1">
                      <MetadataItem label="Size" value={selectedMedia.size} />
                      <MetadataItem label="MIME" value={selectedMedia.mimeType} />
                      <MetadataItem label="Device" value={selectedMedia.metadata?.device} />
                      <MetadataItem label="Location" value={selectedMedia.metadata?.location} />
                      {selectedMedia.type === 'image' && <MetadataItem label="Dimensions" value={selectedMedia.metadata?.dimensions} />}
                      {(selectedMedia.type === 'video' || selectedMedia.type === 'audio') && <MetadataItem label="Duration" value={selectedMedia.metadata?.duration} />}
                    </div>
                 </div>

                 {/* Comments Section */}
                 <div className="flex-1 flex flex-col min-h-0 bg-slate-900/30">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                       <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                         <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                         Comments
                       </h4>
                       <span className="text-xs text-slate-500">{selectedMedia.comments?.length || 0} notes</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                       {(!selectedMedia.comments || selectedMedia.comments.length === 0) ? (
                          <div className="text-center text-slate-600 text-sm mt-10 italic">
                             No comments added yet.
                          </div>
                       ) : (
                         selectedMedia.comments.map(comment => (
                           <div key={comment.id} className="bg-slate-800 p-3 rounded border border-slate-700">
                              <div className="flex justify-between items-start mb-1">
                                 <span className="text-xs font-bold text-cyan-400">{comment.userName}</span>
                                 <span className="text-[10px] text-slate-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed">{comment.content}</p>
                           </div>
                         ))
                       )}
                    </div>

                    {/* Add Comment */}
                    <div className="p-4 bg-slate-800 border-t border-slate-700">
                       <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                            placeholder="Add forensic note..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                          />
                          <button 
                            onClick={handleCommentSubmit}
                            className="p-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-colors"
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;