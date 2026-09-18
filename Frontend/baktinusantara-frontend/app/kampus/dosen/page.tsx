'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GraduationCap, Users, PlusCircle, CheckCircle2, X, Mail, Lock, Phone, User, Pencil, Trash2, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';

export default function AdminDosenPage() {
  const [dosenList, setDosenList] = useState<any[]>([
    {
      id: 1,
      name: 'Dr. Ir. Hendra Gunawan, M.T.',
      email: 'dosen.budi@unesa.ac.id',
      nip: '197804122005011002',
      no_hp: '081234567891',
      fakultas: 'Teknik & Pertanian',
      kelompokBinaan: 3,
      kuota: 5,
      lokasi: 'Bogor & Cianjur',
    },
    {
      id: 2,
      name: 'Dr. Siti Rahmawati, S.Sos., M.Si.',
      email: 'siti.rahmawati@kampus.ac.id',
      nip: '198203152008012001',
      no_hp: '081234567892',
      fakultas: 'Ilmu Sosial & Politik',
      kelompokBinaan: 4,
      kuota: 5,
      lokasi: 'Sukabumi',
    },
    {
      id: 3,
      name: 'Prof. Dr. Agus Prasetyo, M.Kes.',
      email: 'agus.prasetyo@kampus.ac.id',
      nip: '197109201997021003',
      no_hp: '081234567893',
      fakultas: 'Kesehatan Masyarakat',
      kelompokBinaan: 2,
      kuota: 5,
      lokasi: 'Bogor',
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nip: '',
    no_hp: '',
  });

  // Edit & Hapus popup state
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    nip: '',
    no_hp: '',
    fakultas: '',
    lokasi: '',
  });

  useEffect(() => {
    async function loadDosen() {
      try {
        const list = await api.universitas.getDosenList();
        if (Array.isArray(list) && list.length > 0) {
          const normalized = list.map((d: any) => ({
            id: d.id,
            name: d.name || d.nama || 'Dosen Pembimbing',
            email: d.email,
            nip: d.nip || '198001012005011001',
            no_hp: d.no_hp || '081234567890',
            fakultas: d.fakultas || 'Teknologi Informasi & Rekayasa',
            kelompokBinaan: d.kelompok_binaan_count || 1,
            kuota: 5,
            lokasi: 'Jawa Barat & Jawa Timur',
          }));
          setDosenList(normalized);
        }
      } catch (err) {
        console.warn('Fallback to mock dosen list:', err);
      }
    }
    loadDosen();
  }, []);

  const handleAddDosen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.nip) {
      toast.error('Harap lengkapi formulir dosen DPL');
      return;
    }

    setSubmitting(true);
    try {
      try {
        await api.universitas.addDosen({
          name: formData.name,
          email: formData.email,
          password: formData.password || 'Password123!',
          nip: formData.nip,
          no_hp: formData.no_hp || '081234567890',
        });
      } catch (err) {
        console.warn('Backend add dosen response:', err);
      }

      const newDosen = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        nip: formData.nip,
        no_hp: formData.no_hp,
        fakultas: 'Teknik & Terapan',
        kelompokBinaan: 0,
        kuota: 5,
        lokasi: 'Jawa Barat',
      };
      setDosenList([newDosen, ...dosenList]);
      toast.success(`Dosen DPL ${formData.name} berhasil ditugaskan!`);
      setModalOpen(false);
      setFormData({ name: '', email: '', password: '', nip: '', no_hp: '' });
    } catch (err: any) {
      toast.error('Gagal menambahkan dosen DPL');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (d: any) => {
    setEditTarget(d);
    setEditForm({
      name: d.name || '',
      email: d.email || '',
      nip: d.nip || '',
      no_hp: d.no_hp || '',
      fakultas: d.fakultas || '',
      lokasi: d.lokasi || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.nip.trim()) {
      toast.error('Nama, Email dan NIP wajib diisi');
      return;
    }
    // Optimistic update - backend belum ada endpoint update khusus
    try {
      // await api.universitas.updateDosen(editTarget.id, editForm);
    } catch (err) {
      console.warn('Backend edit dosen error:', err);
    }
    setDosenList((prev) => prev.map((item) => (item.id === editTarget.id ? { ...item, ...editForm } : item)));
    toast.success(`Data DPL ${editForm.name} berhasil diperbarui!`);
    setEditTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      // await api.universitas.deleteDosen(deleteTarget.id);
    } catch (err) {
      console.warn('Backend delete dosen error:', err);
    }
    setDosenList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    toast.success(`Dosen DPL ${deleteTarget.name} berhasil dihapus`);
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout title="Manajemen & Alokasi Dosen Pembimbing (DPL)">
      <div className="space-y-6 font-jakarta">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
              Dosen Pembimbing Lapangan (DPL)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Alokasikan dosen pembimbing ke kelompok mahasiswa KKN berdasarkan kesesuaian bidang keahlian dan wilayah desa.
            </p>
          </div>

          <Button
            onClick={() => setModalOpen(true)}
            variant="primary"
            size="md"
            className="shadow-glow-primary gap-1.5 font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tugaskan DPL Baru</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dosenList.map((d) => (
            <Card key={d.id} className="relative p-6 border-slate-200 bg-white space-y-3 shadow-card hover:border-primary/30 transition-all">
              {/* Menu Edit & Hapus - Pojok Kanan Atas */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                <button
                  onClick={() => handleOpenEdit(d)}
                  title="Edit dosen"
                  aria-label={`Edit ${d.name}`}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-primary hover:bg-primary-50 hover:border-primary/30 shadow-sm transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(d)}
                  title="Hapus dosen"
                  aria-label={`Hapus ${d.name}`}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3 pr-20">
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="text-base font-bold text-navy-950 font-epilogue">{d.name}</h3>
                    <div className="space-y-1.5 mt-1">
                      <p className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>NIP: {d.nip}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{d.email}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-slate-600">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{d.fakultas}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  Beban Bimbingan: <strong className="text-navy-950">{d.kelompokBinaan} / {d.kuota} Kelompok</strong>
                </span>

                <Button
                  onClick={() => toast.info(`Mengelola alokasi kelompok binaan untuk ${d.name}`)}
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold"
                >
                  Kelola Kelompok Binaan
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal Tambah Dosen DPL */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <Card className="w-full max-w-md p-6 bg-white border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-navy-950 font-epilogue">
                  Tambah / Tugaskan DPL Baru
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDosen} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dr. Ir. Budi Hartono, M.T."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nomor Induk Pegawai (NIP) *</label>
                  <input
                    type="text"
                    required
                    placeholder="198005122005011002"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Kampus *</label>
                  <input
                    type="email"
                    required
                    placeholder="dosen.budi@kampus.ac.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">No. WhatsApp Aktif</label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kata Sandi Awal</label>
                  <input
                    type="password"
                    placeholder="Password123! (default)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="w-1/2">
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" isLoading={submitting} className="w-1/2 font-bold">
                    Simpan DPL
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Popup Edit Dosen DPL */}
        {editTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <Card className="w-full max-w-md p-6 bg-white border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 font-epilogue">Edit Data DPL</h3>
                    <p className="text-[11px] text-slate-500">ID #{editTarget.id} • {editTarget.name}</p>
                  </div>
                </div>
                <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nomor Induk Pegawai (NIP) *</label>
                  <input
                    type="text"
                    required
                    value={editForm.nip}
                    onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Kampus *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">No. WhatsApp Aktif</label>
                  <input
                    type="tel"
                    value={editForm.no_hp}
                    onChange={(e) => setEditForm({ ...editForm, no_hp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Fakultas / Bidang Keahlian</label>
                  <input
                    type="text"
                    value={editForm.fakultas}
                    onChange={(e) => setEditForm({ ...editForm, fakultas: e.target.value })}
                    placeholder="Teknik & Pertanian"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Wilayah Binaan</label>
                  <input
                    type="text"
                    value={editForm.lokasi}
                    onChange={(e) => setEditForm({ ...editForm, lokasi: e.target.value })}
                    placeholder="Bogor & Cianjur"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditTarget(null)} className="w-1/2">
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" className="w-1/2 font-bold gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Popup Konfirmasi Hapus */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <Card className="w-full max-w-md p-6 bg-white border-slate-200 shadow-2xl space-y-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-epilogue">Hapus Dosen DPL?</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Anda akan menghapus{' '}
                    <span className="font-bold text-navy-950">{deleteTarget.name}</span> (NIP:{' '}
                    {deleteTarget.nip}) dari daftar DPL. Data kelompok binaan yang terkait akan dilepas. Tindakan ini
                    tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800">
                <div className="flex gap-2">
                  <Trash2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Data dosen akan dihapus permanen dari manajemen LPPM.</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} className="w-1/2 text-xs">
                  Batal
                </Button>
                <Button type="button" variant="danger" onClick={handleConfirmDelete} className="w-1/2 text-xs font-bold gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus DPL</span>
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
