<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressMingguan extends Model
{
    protected $table = 'progress_mingguan';
    protected $fillable = ['proposal_id', 'minggu_ke', 'persentase', 'deskripsi', 'foto_url', 'is_locked'];

    protected $appends = [
        'judul_kegiatan',
        'target_program_terkait',
        'durasi_jam',
        'status',
        'foto_dokumentasi_urls',
        'tanggal',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class, 'proposal_id');
    }

    public function getJudulKegiatanAttribute()
    {
        $rawDeskripsi = $this->attributes['deskripsi'] ?? '';
        if (!empty($rawDeskripsi) && preg_match('/^\[(.*?)\]\s*(.*)$/s', $rawDeskripsi, $matches)) {
            return trim($matches[1]);
        }

        return match ((int) $this->minggu_ke) {
            1 => 'Survei & Identifikasi Kebutuhan Lapangan',
            2 => 'Perancangan Konsep & Persiapan Program Kerja',
            3 => 'Implementasi Program & Sosialisasi Masyarakat',
            4 => 'Pelatihan, Evaluasi & Serah Terima Program',
            default => 'Aktivitas Lapangan Minggu ke-' . $this->minggu_ke,
        };
    }

    public function getDeskripsiAttribute($value)
    {
        if (!empty($value) && preg_match('/^\[(.*?)\]\s*(.*)$/s', $value, $matches)) {
            return trim($matches[2]);
        }
        return $value;
    }

    public function getTargetProgramTerkaitAttribute()
    {
        if ($this->relationLoaded('proposal') && $this->proposal) {
            if ($this->proposal->relationLoaded('posKebutuhan') && $this->proposal->posKebutuhan) {
                return $this->proposal->posKebutuhan->judul;
            }
            if (!empty($this->proposal->draf_proker)) {
                return $this->proposal->draf_proker;
            }
        }
        return 'Pelatihan Branding & Kemasan UMKM Desa';
    }

    public function getDurasiJamAttribute()
    {
        return 6;
    }

    public function getStatusAttribute()
    {
        if ($this->persentase >= 100 || (int) $this->minggu_ke <= 2) {
            return 'approved';
        }
        return 'submitted';
    }

    public function getFotoDokumentasiUrlsAttribute()
    {
        if (!empty($this->foto_url)) {
            return [$this->foto_url];
        }
        return [];
    }

    public function getTanggalAttribute()
    {
        if ($this->created_at) {
            return $this->created_at->format('Y-m-d');
        }
        return now()->format('Y-m-d');
    }
}