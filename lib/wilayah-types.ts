export interface Province {
  id: string;
  name: string;
  capital: string;
  lat: number;
  lng: number;
  elv?: number;
  tz?: number;
  population?: number;
  total_area?: number;
  has_path: boolean;
}

export interface Regency {
  id: string;
  name: string;
  capital?: string;
  lat: number;
  lng: number;
  elv?: number;
  tz?: number;
  population?: number;
  total_area?: number;
  has_path: boolean;
  province?: {
    id: string;
    name: string;
  };
}

export interface District {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  has_path: boolean;
  province?: {
    id: string;
    name: string;
  };
  regency?: {
    id: string;
    name: string;
  };
}

export interface Village {
  id: string;
  name: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  has_path: boolean;
  province?: {
    id: string;
    name: string;
  };
  regency?: {
    id: string;
    name: string;
  };
  district?: {
    id: string;
    name: string;
  };
}

export interface PostalCodeEntry {
  id: string;
  name: string;
  postal_code: string;
  province: {
    id: string;
    name: string;
  };
  regency: {
    id: string;
    name: string;
  };
  district: {
    id: string;
    name: string;
  };
}

export interface PolygonPath {
  id: string;
  name?: string;
  path: [number, number][][] | [number, number][][][]; // Single ring [[lat,lng], ...] or multi-ring [[[lat,lng], ...], ...]
}

export interface WilayahStats {
  total_provinces: number;
  total_regencies: number;
  total_districts: number;
  total_villages: number;
  total_postal_codes: number;
  total_paths: number;
  total_population: number;
  total_area: number;
  total_endpoints?: number;
  total_filesize_human?: string;
  total_disk_usage_human?: string;
}

export interface WilayahApiResponse<T> {
  data: T;
  meta: {
    generated_at?: string;
    level?: number;
  };
}

export interface SelectedWilayahHierarchy {
  provinceId: string;
  provinceName: string;
  regencyId: string;
  regencyName: string;
  districtId: string;
  districtName: string;
  villageId: string;
  villageName: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}
