export const WAITING_TIMES = {
  // 18F
  "18f_fdg_body": { minutes: 60, range: "55-75", note: "EANM/SNMMI 2024" },
  "18f_fdg_brain": { minutes: 60, range: "55-75", note: "Brain protocol" },
  "18f_fdg_cardiac": { minutes: 60, range: "45-90", note: "SNMMI 2022 – viability/inflammation" },
  "18f_fet": { minutes: 60, range: "45-60", note: "Brain tumor" },
  "18f_naf": { minutes: 60, range: "45-60", note: "Bone PET" },

  // 68Ga
  "68ga_dotatate": { minutes: 60, range: "45-90", note: "NETs" },
  "68ga_psma": { minutes: 60, range: "45-90", note: "Prostate" },
  "68ga_exendin": { minutes: 60, range: "45-75", note: "Insulinoma" },
  "68ga_rgd": { minutes: 60, range: "45-75", note: "Angiogenesis" },
  "68ga_pentixafor": { minutes: 60, range: "45-75", note: "Lymphoma" },

  // 99mTc
  "99mtc_mibi": { minutes: 60, range: "15-180", note: "Dual-phase" },
  "99mtc_dmsa": { minutes: 180, range: "120-240", note: "Renal cortex" },
  "99mtc_dtpa": { minutes: 0, range: "0", note: "Dynamic flow" },
  "99mtc_ec": { minutes: 0, range: "0", note: "Dynamic flow" },
  "99mtc_mebrofenine": { minutes: 60, range: "45-90", note: "Hepatobiliary" },
  "99mtc_hsa": { minutes: 0, range: "0", note: "Blood pool" },
  "99mtc_maa": { minutes: 0, range: "0", note: "Lung perfusion" },
  "99mtc_trodat": { minutes: 240, range: "210-270", note: "Striatal" },
  "99mtc_rbc": { minutes: 30, range: "0-60", note: "RBC" },

  // 131I
  "131i_nai_diagnostic": { minutes: 1440, range: "1440-2880 (24-48h)", note: "Diagnostic thyroid scan" },
  "131i_nai_therapy": { minutes: 0, range: "N/A", note: "Therapy – no scan timing" },
  "131i_mibg_diagnostic": { minutes: 1440, range: "1200-1440 (20-24h)", note: "Diagnostic mIBG scan" },
  "131i_mibg_therapy": { minutes: 0, range: "N/A", note: "Therapy – imaging usually at 24-72h" }
};

export function getWaitingTime(tracerId) {
  return WAITING_TIMES[tracerId] || null;
}

export function getTargetDateTimeFromNow(minutes) {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60 * 1000);
}