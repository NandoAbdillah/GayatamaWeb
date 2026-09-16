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

  const getPlatformMeta = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return {
          name: 'Instagram',
          icon: Instagram,
          color: 'text-pink-600 dark:text-pink-400',
          bgBadge: 'bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300',
          btnBg: 'hover:bg-pink-600 hover:text-white',
        };
      case 'facebook':
        return {
          name: 'Facebook',
          icon: Facebook,
          color: 'text-blue-600 dark:text-blue-400',
          bgBadge: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
          btnBg: 'hover:bg-blue-600 hover:text-white',
        };
      case 'tiktok':
        return {
          name: 'TikTok',
          icon: Video,
          color: 'text-slate-900 dark:text-teal-400',
          bgBadge: 'bg-slate-100 dark:bg-teal-950/60 border-slate-300 dark:border-teal-800 text-slate-800 dark:text-teal-300',
          btnBg: 'hover:bg-slate-900 hover:text-white dark:hover:bg-teal-500',
        };
      case 'youtube':
        return {
          name: 'YouTube',
          icon: Youtube,
          color: 'text-red-600 dark:text-red-400',
          bgBadge: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
          btnBg: 'hover:bg-red-600 hover:text-white',
        };
      default:
        return {
          name: 'Social Media',
          icon: Twitter,
          color: 'text-sky-600 dark:text-sky-400',
          bgBadge: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300',
          btnBg: 'hover:bg-sky-600 hover:text-white',
        };
    }
  };

  const meta = getPlatformMeta(post.platform);
  const PlatformIcon = meta.icon;

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${className}`}
      >
        {/* Media Thumbnail Container */}
        {post.media_url && (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-navy-950">
            <img
              src={post.media_url}
              alt={post.author_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Top platform badge */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md bg-white/90 dark:bg-navy-900/90 shadow-xs">
              <PlatformIcon className={`w-3 h-3 ${meta.color}`} />
              <span className="text-navy-950 dark:text-white">{meta.name}</span>
            </div>

            {post.media_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/90 text-navy-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2.5">
            {/* Author Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {post.author_avatar ? (
                  <img
                    src={post.author_avatar}
                    alt={post.author_name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-navy-700 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {post.author_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-navy-950 dark:text-white truncate flex items-center gap-1">
                    {post.author_name}
                    {post.is_verified && (
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                    )}
                  </h4>
                  {post.author_username && (
                    <p className="text-[10px] text-slate-400 truncate">
                      {post.author_username}
                    </p>
                  )}
                </div>
              </div>

              {!post.media_url && (
                <div className={`p-1.5 rounded-lg border ${meta.bgBadge}`}>
                  <PlatformIcon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Caption Snippet */}
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-jakarta">
              {post.caption}
            </p>
          </div>

          {/* Bottom Metas & External Redirect Button */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3 font-semibold">
              <span className="flex items-center gap-1 text-rose-500">
                <Heart className="w-3.5 h-3.5 fill-current" />
                {post.likes_count.toLocaleString('id-ID')}
              </span>
              <span className="flex items-center gap-1 text-sky-500">
                <MessageCircle className="w-3.5 h-3.5" />
                {post.comments_count.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {post.embed_url && (
                <button
                  type="button"
                  onClick={() => setShowEmbedModal(true)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors"
                >
                  Embed
                </button>
              )}
              <a
                href={post.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 border border-slate-200/80 dark:border-navy-700 ${meta.btnBg} transition-all shadow-xs`}
                title={`Buka di ${meta.name}`}
              >
                <span>Buka {meta.name}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
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
                <p className="text-xs text-slate-400">Embed tidak tersedia secara langsung.</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-jakarta">
                {post.caption}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-400">
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
