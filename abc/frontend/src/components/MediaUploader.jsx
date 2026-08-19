import { useState, useRef, useCallback } from 'react';
import { uploadImageApi, uploadImagesApi, uploadVideoApi, deleteMediaApi } from '../services/api';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

/**
 * MediaUploader – Reusable drag-and-drop media upload component.
 *
 * Props:
 *  - mode: 'image' | 'video' | 'both'  (default: 'both')
 *  - multiple: boolean – allow multiple images (video always single)
 *  - folder: Cloudinary folder path
 *  - onUploadSuccess: (result) => void  — called with Cloudinary/local result
 *  - onDelete: (publicId) => void       — called when user removes an uploaded file
 *  - initialMedia: { url, publicId, type } — pre-fill with existing media
 *  - label: string
 *  - compact: boolean — smaller footprint version
 */
const MediaUploader = ({
  mode = 'both',
  multiple = false,
  folder,
  onUploadSuccess,
  onDelete,
  initialMedia = null,
  label = 'Upload Media',
  compact = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState(initialMedia ? [initialMedia] : []);
  const fileInputRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const acceptedTypes = (() => {
    if (mode === 'image') return ACCEPTED_IMAGE_TYPES.join(',');
    if (mode === 'video') return ACCEPTED_VIDEO_TYPES.join(',');
    return [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',');
  })();

  const simulateProgress = () => {
    setUploadProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) { clearInterval(progressIntervalRef.current); return 90; }
        return prev + Math.random() * 12;
      });
    }, 200);
  };

  const finishProgress = () => {
    clearInterval(progressIntervalRef.current);
    setUploadProgress(100);
    setTimeout(() => setUploadProgress(0), 1200);
  };

  const processFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    setError('');
    setUploading(true);
    simulateProgress();

    try {
      const file = files[0];
      const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

      let result;
      if (isVideo) {
        const res = await uploadVideoApi(file, folder || 'wanderluxe/videos');
        result = res.data;
      } else if (multiple && files.length > 1) {
        const res = await uploadImagesApi(files, folder || 'wanderluxe/images');
        // res.data may be array or single
        const items = Array.isArray(res.data) ? res.data : [res.data];
        const mapped = items.map(r => ({
          url: r.secure_url || r.url,
          publicId: r.public_id,
          type: 'image',
          source: r.source
        }));
        setUploadedMedia(prev => multiple ? [...prev, ...mapped] : mapped);
        items.forEach(r => onUploadSuccess?.({ url: r.secure_url || r.url, publicId: r.public_id, type: 'image', source: r.source }));
        finishProgress();
        setUploading(false);
        return;
      } else {
        const res = await uploadImageApi(file, folder || 'wanderluxe/images');
        result = res.data;
      }

      const mediaItem = {
        url: result.secure_url || result.url,
        publicId: result.public_id,
        type: isVideo ? 'video' : 'image',
        source: result.source,
        duration: result.duration,
        format: result.format
      };

      setUploadedMedia(prev => multiple ? [...prev, mediaItem] : [mediaItem]);
      onUploadSuccess?.(mediaItem);
      finishProgress();
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      clearInterval(progressIntervalRef.current);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  }, [folder, multiple, onUploadSuccess]);

  const handleFileChange = (e) => processFiles(Array.from(e.target.files));

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleRemove = async (mediaItem, index) => {
    try {
      if (mediaItem.publicId) await deleteMediaApi(mediaItem.publicId, mediaItem.type === 'video' ? 'video' : 'image');
      setUploadedMedia(prev => prev.filter((_, i) => i !== index));
      onDelete?.(mediaItem.publicId);
    } catch {
      // Silently remove from UI even if delete fails
      setUploadedMedia(prev => prev.filter((_, i) => i !== index));
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="media-uploader" style={{ width: '100%', fontFamily: 'inherit' }}>
      {label && <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</label>}

      {/* Drop Zone */}
      <div
        id={`media-uploader-drop-${label.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${isDragging ? '#6366f1' : error ? '#ef4444' : '#334155'}`,
          borderRadius: '14px',
          padding: compact ? '20px 16px' : '36px 24px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: isDragging ? 'rgba(99,102,241,0.07)' : 'rgba(15,23,42,0.6)',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Upload progress bar */}
        {uploading && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: `${uploadProgress}%`, height: '3px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width 0.2s ease' }} />
        )}

        <div style={{ fontSize: compact ? '1.8rem' : '2.5rem', marginBottom: '8px' }}>
          {uploading ? '⏫' : isDragging ? '🎯' : mode === 'video' ? '🎬' : mode === 'image' ? '🖼️' : '📁'}
        </div>

        {uploading ? (
          <>
            <p style={{ color: '#6366f1', fontWeight: 600, margin: '0 0 4px' }}>Uploading... {Math.round(uploadProgress)}%</p>
            <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Please wait</p>
          </>
        ) : (
          <>
            <p style={{ color: '#e2e8f0', fontWeight: 600, margin: '0 0 4px', fontSize: compact ? '0.9rem' : '1rem' }}>
              {isDragging ? 'Drop to upload' : 'Drag & drop or click to browse'}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.78rem', margin: 0 }}>
              {mode === 'image' && 'JPG, PNG, WebP, GIF (max 10MB)'}
              {mode === 'video' && 'MP4, WebM, MOV, AVI (max 100MB)'}
              {mode === 'both' && 'Images (10MB) · Videos (100MB)'}
              {multiple && ' · Multiple files supported'}
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ marginTop: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span> {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
        </div>
      )}

      {/* Uploaded Media Preview Gallery */}
      {uploadedMedia.length > 0 && (
        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {uploadedMedia.map((media, index) => (
            <div key={index} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#0f172a', border: '1px solid #1e293b', aspectRatio: media.type === 'video' ? '16/9' : '1' }}>
              {media.type === 'video' ? (
                <video
                  src={media.url}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  preload="metadata"
                />
              ) : (
                <img
                  src={media.url}
                  alt={`Uploaded media ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}

              {/* Overlay with metadata */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '20px 8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {media.source === 'cloudinary' ? '☁️ Cloud' : '💾 Local'} · {media.format || media.type}
                </span>
                <button
                  id={`remove-media-${index}`}
                  onClick={(e) => { e.stopPropagation(); handleRemove(media, index); }}
                  style={{ background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '0.7rem', lineHeight: 1 }}
                  title="Remove"
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
