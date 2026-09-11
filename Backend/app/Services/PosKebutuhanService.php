<?php

namespace App\Services;

use App\Models\PosKebutuhan;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class PosKebutuhanService
{
    protected function assertDesaVerified(User $user): void
    {
        if (!$user->profilDesa || !$user->profilDesa->verified_at) {
            throw ValidationException::withMessages([
                'akun' => 'Akun desa Anda belum diverifikasi admin.',
            ]);
        }
    }

    public function createDirect(User $user, array $data): PosKebutuhan
    {
        $this->assertDesaVerified($user);

        $data['desa_id'] = $user->profilDesa->id;
        $data['status'] = 'open';
        return PosKebutuhan::create($data);
    }

    public function getByDesa(int $desaId)
    {
        return PosKebutuhan::where('desa_id', $desaId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getPublicCatalog(?string $kategori = null, ?float $lat = null, ?float $lon = null, ?float $radiusKm = null)
    {
        $query = PosKebutuhan::with('desa')->where('status', 'open');

        if ($kategori) {
            $query->where('kategori', $kategori);
        }

        if ($lat !== null && $lon !== null) {
            $query->join('profil_desa', 'pos_kebutuhan.desa_id', '=', 'profil_desa.id')
                ->selectRaw("pos_kebutuhan.*,
                    ROUND(6371 * ACOS(LEAST(1.0, GREATEST(-1.0,
                        COS(RADIANS(?)) * COS(RADIANS(profil_desa.latitude)) *
                        COS(RADIANS(profil_desa.longitude) - RADIANS(?)) +
                        SIN(RADIANS(?)) * SIN(RADIANS(profil_desa.latitude))
                    ))), 2) AS jarak_km",
                    [$lat, $lon, $lat]
                );
            if ($radiusKm !== null) {
                $query->having('jarak_km', '<=', $radiusKm);
            }
            $query->orderBy('jarak_km', 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->get();
    }
}