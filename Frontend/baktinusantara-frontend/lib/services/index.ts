export * from './auth.service';
export * from './wilayah.service';
export * from './aspirasi.service';
export * from './pos-kebutuhan.service';
export * from './kelompok.service';
export * from './proposal.service';
export * from './progress.service';
export * from './luaran.service';
export * from './dashboard.service';
export * from './notification.service';
export * from './universitas.service';
export * from './dosen.service';
export * from './admin.service';

import authService from './auth.service';
import wilayahService from './wilayah.service';
import aspirasiService from './aspirasi.service';
import posKebutuhanService from './pos-kebutuhan.service';
import kelompokService from './kelompok.service';
import proposalService from './proposal.service';
import progressService from './progress.service';
import luaranService from './luaran.service';
import dashboardService from './dashboard.service';
import notificationService from './notification.service';
import universitasService from './universitas.service';
import dosenService from './dosen.service';
import adminService from './admin.service';

export const api = {
  auth: authService,
  wilayah: wilayahService,
  aspirasi: aspirasiService,
  posKebutuhan: posKebutuhanService,
  kelompok: kelompokService,
  proposal: proposalService,
  progress: progressService,
  luaran: luaranService,
  dashboard: dashboardService,
  notification: notificationService,
  universitas: universitasService,
  dosen: dosenService,
  admin: adminService,
};

export default api;
