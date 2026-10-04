'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

export type PortalDropdownAlign = 'start' | 'center' | 'end';
export type PortalDropdownPlacement = 'auto' | 'bottom' | 'top';

export interface PortalDropdownProps {
  /** Tampilkan / sembunyikan panel */
  open: boolean;
  /** Dipanggil saat klik di luar panel & anchor, atau saat menekan Escape */
  onClose: () => void;
  /** Elemen trigger (trigger/field pembuka dropdown) */
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  /** Perataan horizontal panel terhadap anchor */
  align?: PortalDropdownAlign;
  /** Penempatan vertikal: 'auto' akan membalik ke atas bila ruang bawah tidak cukup */
  placement?: PortalDropdownPlacement;
  /** Jarak (px) antara anchor dan panel */
  offset?: number;
  /** Samakan lebar panel dengan lebar anchor */
  matchAnchorWidth?: boolean;
  /** Batas tinggi maksimal panel (px). Isi yang lebih panjang akan di-scroll. */
  maxHeight?: number;
  /** Class pada elemen panel */
  className?: string;
  /** Style tambahan pada elemen panel */
  style?: CSSProperties;
  /** Nonaktifkan penutupan saat klik di luar */
  disableOutsideClose?: boolean;
}

const VIEWPORT_GUTTER = 8;
const MIN_PANEL_HEIGHT = 96;

/** Di atas semua layer aplikasi (navbar sticky & modal hanya z-50) */
export const PORTAL_DROPDOWN_Z_INDEX = 9999;

interface PanelGeometry {
  top: number;
  left: number;
  width?: number;
  maxHeight: number;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Dropdown yang dirender melalui React Portal ke `document.body` dengan
 * `position: fixed` + z-index tertinggi, sehingga tidak pernah tertimpa oleh
 * stacking context, `overflow: hidden`, atau `contain` dari elemen induknya.
 *
 * Panel selalu diposisikan relatif terhadap anchor sejak frame pertama
 * (tidak pernah tergambar di koordinat 0,0 pojok kiri atas).
 */
export function PortalDropdown({
  open,
  onClose,
  anchorRef,
  children,
  align = 'start',
  placement = 'auto',
  offset = 8,
  matchAnchorWidth = false,
  maxHeight = 320,
  className,
  style,
  disableOutsideClose = false,
}: PortalDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  /** Ukuran isi panel terakhir yang diketahui (dipakai sebagai estimasi awal) */
  const naturalSizeRef = useRef<{ height: number; width: number }>({ height: 0, width: 0 });
  const onCloseRef = useRef(onClose);

  const [isMounted, setIsMounted] = useState(false);
  const [geometry, setGeometry] = useState<PanelGeometry | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useIsomorphicLayoutEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const computeGeometry = useCallback(
    (contentHeight: number, contentWidth: number): PanelGeometry | null => {
      const anchor = anchorRef.current;
      if (!anchor) return null;

      const rect = anchor.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const panelWidth = matchAnchorWidth ? rect.width : contentWidth || rect.width;

      const spaceBelow = viewportHeight - rect.bottom - offset - VIEWPORT_GUTTER;
      const spaceAbove = rect.top - offset - VIEWPORT_GUTTER;

      const resolvedPlacement: 'bottom' | 'top' =
        placement !== 'auto'
          ? placement
          : contentHeight <= spaceBelow || spaceBelow >= spaceAbove
            ? 'bottom'
            : 'top';

      const available = Math.max(
        resolvedPlacement === 'bottom' ? spaceBelow : spaceAbove,
        MIN_PANEL_HEIGHT
      );
      const cap = Math.max(Math.min(maxHeight, available), MIN_PANEL_HEIGHT);
      const panelHeight = Math.min(contentHeight || cap, cap);

      const top =
        resolvedPlacement === 'bottom'
          ? rect.bottom + offset
          : Math.max(VIEWPORT_GUTTER, rect.top - offset - panelHeight);

      let left = rect.left;
      if (!matchAnchorWidth) {
        if (align === 'end') left = rect.right - panelWidth;
        else if (align === 'center') left = rect.left + rect.width / 2 - panelWidth / 2;
      }
      left = Math.min(
        Math.max(left, VIEWPORT_GUTTER),
        Math.max(VIEWPORT_GUTTER, viewportWidth - panelWidth - VIEWPORT_GUTTER)
      );

      return {
        top: Math.round(top),
        left: Math.round(left),
        width: matchAnchorWidth ? rect.width : undefined,
        maxHeight: Math.round(cap),
      };
    },
    [align, anchorRef, matchAnchorWidth, maxHeight, offset, placement]
  );

  /**
   * Ukur tinggi isi panel lewat `scrollHeight` (tetap akurat walau panel sudah
   * ter-cap `maxHeight`) lalu perbarui posisinya.
   */
  const measure = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const { width } = panel.getBoundingClientRect();
    const contentHeight = panel.scrollHeight;

    naturalSizeRef.current = { width, height: contentHeight };
    setGeometry(computeGeometry(contentHeight, width));
  }, [computeGeometry]);

  // Saat ditutup: buang posisi agar pembukaan berikutnya dihitung dari anchor terkini.
  useIsomorphicLayoutEffect(() => {
    if (!open) setGeometry(null);
  }, [open]);

  // Ukur & tempatkan di layout effect, sehingga browser tidak pernah paints
  // panel pada posisi yang belum dikoreksi.
  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    measure();
  }, [measure, open]);

  // Ikuti pergeseran viewport / scroll agar panel tidak tertinggal dari anchor.
  useEffect(() => {
    if (!open) return;

    let frame = 0;
    const handleViewportChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [measure, open]);

  // Isi panel yang berubah (mis. hasil pencarian difilter) -> hitung ulang posisi.
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel || typeof ResizeObserver === 'undefined') return;

    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(panel);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure, open]);

  // Klik di luar (anchor + panel dihitung sebagai "di dalam") & tombol Escape.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      if (!disableOutsideClose) onCloseRef.current();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [anchorRef, disableOutsideClose, open]);

  /**
   * Posisi dihitung saat render memakai estimasi ukuran isi terakhir, sehingga
   * frame pertama panel sudah menempel di anchor (bukan muncul dari pojok 0,0).
   * `layout effect` di atas akan mengoreksinya sebelum paint.
   */
  const resolvedGeometry = useMemo<PanelGeometry | null>(() => {
    if (!open || !isMounted) return null;
    return geometry ?? computeGeometry(naturalSizeRef.current.height, naturalSizeRef.current.width);
  }, [computeGeometry, geometry, isMounted, open]);

  if (!open || !isMounted || !resolvedGeometry) return null;

  const panelStyle: CSSProperties = {
    position: 'fixed',
    top: `${resolvedGeometry.top}px`,
    left: `${resolvedGeometry.left}px`,
    width: resolvedGeometry.width ? `${resolvedGeometry.width}px` : undefined,
    maxHeight: `${resolvedGeometry.maxHeight}px`,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    zIndex: PORTAL_DROPDOWN_Z_INDEX,
    ...style,
  };

  return createPortal(
    <div ref={panelRef} style={panelStyle} className={`animate-dropdown-in ${className ?? ''}`}>
      {children}
    </div>,
    document.body
  );
}

export default PortalDropdown;
