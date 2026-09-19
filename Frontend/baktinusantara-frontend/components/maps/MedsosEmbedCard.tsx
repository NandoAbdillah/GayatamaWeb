'use client';

import React, { useState } from 'react';
import {
  Instagram,
  Facebook,
  Video,
  Youtube,
  Twitter,
  ExternalLink,
  Heart,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Play,
  X,
  Share2,
} from 'lucide-react';

export interface MedsosPostItem {
  id: number;
  pos_kebutuhan_id?: number | null;
  profil_desa_id?: number | null;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter';
  post_url: string;
  embed_url?: string | null;
  author_name: string;
  author_username?: string | null;
  author_avatar?: string | null;
  caption: string;
  media_type: 'image' | 'video' | 'carousel';
  media_url?: string | null;
  likes_count: number;
  comments_count: number;
  is_verified: boolean;
  posted_at?: string | null;
}

interface MedsosEmbedCardProps {
  post: MedsosPostItem;
  className?: string;
}

export const MedsosEmbedCard: React.FC<MedsosEmbedCardProps> = ({ post, className = '' }) => {
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setLikeCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const getPlatformMeta = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return {
          name: 'Instagram',
          icon: Instagram,
          color: 'text-[#E1306C]',
          badgeColor: 'text-[#E1306C]',
        };
      case 'facebook':
        return {
          name: 'Facebook',
          icon: Facebook,
          color: 'text-[#1877F2]',
          badgeColor: 'text-[#1877F2]',
        };
      case 'tiktok':
        return {
          name: 'TikTok',
          icon: Video,
          color: 'text-slate-900 dark:text-teal-400',
          badgeColor: 'text-slate-900 dark:text-teal-400',
        };
      case 'youtube':
        return {
          name: 'YouTube',
          icon: Youtube,
          color: 'text-[#FF0000]',
          badgeColor: 'text-[#FF0000]',
        };
      default:
        return {
          name: 'X',
          icon: Twitter,
          color: 'text-slate-900 dark:text-white',
          badgeColor: 'text-slate-900 dark:text-white',
        };
    }
  };

  const formatRelativeTime = (timeStr?: string | null) => {
    if (!timeStr) return 'Baru saja';
    if (timeStr.includes('lalu') || timeStr.includes('ago') || timeStr.includes('Just now') || timeStr.includes('Kemarin')) {
      return timeStr;
    }
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      const now = new Date();
      const diffMs = Math.abs(now.getTime() - date.getTime());
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Baru saja';
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari yang lalu`;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return timeStr;
    }
  };

  const meta = getPlatformMeta(post.platform);
  const PlatformIcon = meta.icon;

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-4 space-y-3 ${className}`}
      >
        {/* 1. Header: Avatar + Name + Relative Time + Platform Icon (Exact Reference Style) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt={post.author_name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-navy-700 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                {post.author_name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-navy-950 dark:text-white truncate flex items-center gap-1">
                <span className="truncate">{post.author_name}</span>
                {post.is_verified && (
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] shrink-0 font-black">
                    ✓
                  </span>
                )}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {formatRelativeTime(post.posted_at)}
              </p>
            </div>
          </div>

          <a
            href={post.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-slate-700 dark:text-slate-200 hover:scale-110 transition-transform shrink-0"
            title={`Buka di ${meta.name}`}
          >
            <PlatformIcon className={`w-5 h-5 ${meta.color}`} />
          </a>
        </div>

        {/* 2. Caption Text with Read More */}
        <div className="space-y-1">
          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed font-jakarta">
            {post.caption}
          </p>
          <a
            href={post.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
          >
            Read more
          </a>
        </div>

        {/* 3. Media Thumbnail (Photo / Video with rounded-2xl) */}
        {post.media_url && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-navy-950 group-hover:shadow-md transition-all">
            <img
              src={post.media_url}
              alt={post.author_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80';
              }}
            />

            {post.media_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/90 text-navy-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            )}

            {post.embed_url && (
              <button
                type="button"
                onClick={() => setShowEmbedModal(true)}
                className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md hover:bg-black/80"
              >
                <span>Embed</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}

        {/* 4. Bottom Action Footer: Heart Likes + Comments + Share Link */}
        <div className="pt-2 border-t border-slate-100 dark:border-navy-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            {/* Like Counter */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors font-medium hover:text-rose-500 ${
                isLiked ? 'text-rose-500 font-bold' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
              <span>{likeCount.toLocaleString('id-ID')}</span>
            </button>

            {/* Comment Counter */}
            <div className="flex items-center gap-1.5 font-medium">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Share / Open Button */}
          <a
            href={post.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white transition-colors font-medium text-xs"
            title="Bagikan Postingan"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </a>
        </div>
      </div>

      {/* Embed Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-navy-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <PlatformIcon className={`w-4 h-4 ${meta.color}`} />
                <h3 className="text-sm font-bold text-navy-950 dark:text-white">
                  Pratinjau Live Embed {meta.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmbedModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-navy-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-navy-800">
              {post.embed_url ? (
                <iframe
                  src={post.embed_url}
                  title="Social Embed"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : post.media_url ? (
                <img
                  src={post.media_url}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">Embed tidak tersedia secara langsung.</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-jakarta">
                {post.caption}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Oleh {post.author_name} ({post.author_username || meta.name})
                </span>
                <a
                  href={post.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span>Buka Tautan Asli</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
