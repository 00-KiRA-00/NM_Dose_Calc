export const RADIOPHARMACEUTICALS = [
  // ========== 18F Tracers ==========
  {
    id: "18f_fdg_body",
    name: "FDG (Body/Torso)",
    nuclide: "18F",
    indication: "Oncology",
    refMci: 5.6,               // 3 MBq/kg x 70kg = 210 MBq ≈ 5.67 mCi
    refWeightKg: 70,
    minMci: 3.5,
    maxMci: 15.0,
    source: "EANM/SNMMI 2025 + Al Sawafi 2025",
    notes: "18F-FDG PET. Modern hybrid PET/CT allows 3 MBq/kg. Pediatric: 39% reduction per EANM 2024.",
    halfLifeHours: 1.8295
  },
  {
    id: "18f_fdg_brain",
    name: "FDG (Brain)",
    nuclide: "18F",
    indication: "Neurology",
    refMci: 5.0,
    refWeightKg: 70,
    minMci: 3.0,
    maxMci: 10.0,
    source: "EANM/SNMMI 2025",
    notes: "Lower activity for dedicated brain imaging.",
    halfLifeHours: 1.8295
  },
  {
    id: "18f_fdg_cardiac",
    name: "FDG (Cardiac)",
    nuclide: "18F",
    indication: "Cardiology",
    refMci: 8.5,               // Approximate average for 70kg (2.5–5.0 MBq/kg = 5–10 mCi)
    refWeightKg: 70,
    minMci: 3.0,
    maxMci: 15.0,
    source: "SNMMI 2022 / FDA Label 2025",
    notes: "For myocardial viability, inflammation/sarcoidosis, device infection, and vasculitis. Patient preparation with glucose/insulin loading required. Injection-to-imaging interval: 45–90 minutes.",
    halfLifeHours: 1.8295
  },
  {
    id: "18f_fet",
    name: "FET (Brain Tumor)",
    nuclide: "18F",
    indication: "Neurology",
    refMci: 5.4,
    refWeightKg: 70,
    minMci: 2.7,
    maxMci: 8.1,
    source: "EANM",
    notes: "18F-FET PET for brain tumors.",
    halfLifeHours: 1.8295
  },
  {
    id: "18f_naf",
    name: "NaF (Bone)",
    nuclide: "18F",
    indication: "Oncology",
    refMci: 10.0,
    refWeightKg: 70,
    minMci: 5.0,
    maxMci: 15.0,
    source: "FDA Label 2025",
    notes: "FDA recommended adult dose 8-12 mCi.",
    halfLifeHours: 1.8295
  },

  // ========== 68Ga Tracers ==========
  {
    id: "68ga_dotatate",
    name: "DOTATATE (NETs)",
    nuclide: "68Ga",
    indication: "Oncology",
    refMci: 3.8,               // 2 MBq/kg = 140 MBq ≈ 3.8 mCi
    refWeightKg: 70,
    minMci: 3.0,
    maxMci: 5.4,
    source: "FDA Label 2025",
    notes: "Weight-based 0.054 mCi/kg (2 MBq/kg). Max 5.4 mCi.",
    halfLifeHours: 1.1333
  },
  {
    id: "68ga_psma",
    name: "PSMA (Prostate)",
    nuclide: "68Ga",
    indication: "Oncology",
    refMci: 6.5,
    refWeightKg: 70,
    minMci: 6.0,
    maxMci: 7.0,
    source: "FDA Label & Real‑World 2025",
    notes: "Typical adult dose 6‑7 mCi (222‑259 MBq).",
    halfLifeHours: 1.1333
  },
  {
    id: "68ga_fapi",
    name: "FAPI (Fibroblast Activation Protein)",
    nuclide: "68Ga",
    indication: "Oncology",
    refMci: 4.1,
    refWeightKg: 70,
    minMci: 2.0,
    maxMci: 5.4,
    source: "EANM/SNMMI 2024–2025",
    notes: "68Ga-FAPI PET/CT for tumor imaging. Weight-based dose: 1.8–2.2 MBq/kg (approx. 0.05–0.06 mCi/kg).",
    halfLifeHours: 1.13 // ~68 minutes (decay-corrected)
  },
  {
    id: "68ga_exendin",
    name: "Exendin (Insulinoma)",
    nuclide: "68Ga",
    indication: "Oncology",
    refMci: 2.7,
    refWeightKg: 70,
    minMci: 1.35,
    maxMci: 4.05,
    source: "EANM",
    notes: "Insulinoma imaging.",
    halfLifeHours: 1.1333
  },
  {
    id: "68ga_rgd",
    name: "RGD (Angiogenesis)",
    nuclide: "68Ga",
    indication: "Oncology",
    refMci: 3.5,
    refWeightKg: 70,
    minMci: 2.0,
    maxMci: 5.0,
    source: "Literature",
    notes: "0.05 mCi/kg typical.",
    halfLifeHours: 1.1333
  },
  {
    id: "68ga_pentixafor",
    name: "Pentixafor (Lymphoma)",
    nuclide: "68Ga",
    indication: "Oncology",
    refMci: 4.0,
    refWeightKg: 70,
    minMci: 2.0,
    maxMci: 6.0,
    source: "Literature",
    notes: "Range 2‑5 mCi.",
    halfLifeHours: 1.1333
  },

  // ========== 99mTc Tracers ==========
  {
    id: "99mtc_dmsa",
    name: "DMSA (Renal)",
    nuclide: "99mTc",
    indication: "Nephrology",
    refMci: 2.0,
    refWeightKg: 70,
    minMci: 1.0,
    maxMci: 3.0,
    source: "SNMMI 2024",
    notes: "Weight‑based 0.05 mCi/kg.",
    halfLifeHours: 6.01
  },

  // 99mTc DTPA (Renal Function)
{
  id: "99mtc_dtpa_gfr",
  name: "DTPA (GFR Only)",
  nuclide: "99mTc",
  indication: "Nephrology",
  refMci: 3.0, // Reference dose for 70kg adult
  refWeightKg: 70,
  minMci: 2.4,
  maxMci: 3.6,
  source: "University of Wisconsin Protocol 2019",
  notes: "Two-point GFR protocol. Ideal for glomerular filtration rate assessment.",
  halfLifeHours: 6.01
},
{
  id: "99mtc_dtpa_renogram",
  name: "DTPA (Full Renogram)",
  nuclide: "99mTc",
  indication: "Nephrology",
  refMci: 4.0, // Reference dose for 70kg adult
  refWeightKg: 70,
  minMci: 3.0,
  maxMci: 5.0,
  source: "Clinical Protocols",
  notes: "Full dynamic study to assess perfusion, function and drainage.",
  halfLifeHours: 6.01
},

// 99mTc EC (Renal Function)
{
  id: "99mtc_ec_erpf",
  name: "EC (ERPF Only)",
  nuclide: "99mTc",
  indication: "Nephrology",
  refMci: 3.5, // Reference dose for 70kg adult
  refWeightKg: 70,
  minMci: 2.0,
  maxMci: 5.0,
  source: "Literature Consensus",
  notes: "Standard ERPF measurement. Ideal for effective renal plasma flow assessment.",
  halfLifeHours: 6.01
},
{
  id: "99mtc_ec_renogram",
  name: "EC (Full Renogram)",
  nuclide: "99mTc",
  indication: "Nephrology",
  refMci: 4.0, // Reference dose for 70kg adult
  refWeightKg: 70,
  minMci: 3.0,
  maxMci: 5.0,
  source: "Clinical Protocols",
  notes: "Full dynamic study with perfusion, function and drainage phases.",
  halfLifeHours: 6.01
},

// 99mTc MIBI (Cardiac)
{
  id: "99mtc_mibi_rest",
  name: "MIBI Rest",
  nuclide: "99mTc",
  indication: "Cardiology",
  refMci: 10.0,
  refWeightKg: 70,
  minMci: 8.0, 
  maxMci: 12.0, 
  source: "SNMMI/ASNC",
  notes: "Day 1: Rest (8-12 mCi) + Stress (24-36 mCi). 1:3 ratio.",
  halfLifeHours: 6.01
},
{
  id: "99mtc_mibi_stress",
  name: "MIBI Stress",
  nuclide: "99mTc",
  indication: "Cardiology",
  refMci: 13.0, // Reference dose for 70kg adult (average of  11-15 mCi)
  refWeightKg: 70,
  minMci: 11.0,
  maxMci: 15.0,
  source: "SNMMI/ASNC",
  notes: "2-Day: 25-30 mCi each day. No 1:3 ratio required.",
  halfLifeHours: 6.01
},
  {
    id: "99mtc_mebrofenine",
    name: "Mebrofenine (Hepatic)",
    nuclide: "99mTc",
    indication: "Hepatology",
    refMci: 5.0,
    refWeightKg: 70,
    minMci: 2.0,
    maxMci: 10.0,
    source: "FDA Label",
    notes: "Dose based on bilirubin.",
    halfLifeHours: 6.01
  },
  {
    id: "99mtc_hsa",
    name: "HSA (Blood Pool)",
    nuclide: "99mTc",
    indication: "Cardiology",
    refMci: 12.0,
    refWeightKg: 70,
    minMci: 8.0,
    maxMci: 16.0,
    source: "Literature",
    notes: "Blood pool imaging.",
    halfLifeHours: 6.01
  },
  {
    id: "99mtc_maa",
    name: "MAA (Lung)",
    nuclide: "99mTc",
    indication: "Pulmonology",
    refMci: 4.0,
    refWeightKg: 70,
    minMci: 2.0,
    maxMci: 6.0,
    source: "FDA / SNMMI",
    notes: "Perfusion scan.",
    halfLifeHours: 6.01
  },
  {
    id: "99mtc_trodat",
    name: "TRODAT (Striatal)",
    nuclide: "99mTc",
    indication: "Neurology",
    refMci: 20.0,
    refWeightKg: 70,
    minMci: 18.0,
    maxMci: 25.0,
    source: "Literature (PMC)",
    notes: "Dopamine transporter.",
    halfLifeHours: 6.01
  },
  {
    id: "99mtc_rbc",
    name: "RBC (Blood Pool)",
    nuclide: "99mTc",
    indication: "Cardiology",
    refMci: 22.0,
    refWeightKg: 70,
    minMci: 15.0,
    maxMci: 25.0,
    source: "Literature",
    notes: "GI bleeding / cardiac pool.",
    halfLifeHours: 6.01
  },

  // ========== 131I Tracers ==========
  {
    id: "131i_nai_diagnostic",
    name: "Sodium Iodide (Diagnostic)",
    nuclide: "131I",
    indication: "Endocrinology (Diagnostic)",
    refMci: 0.3,
    refWeightKg: 70,
    minMci: 0.1,
    maxMci: 0.5,
    source: "SNMMI / IAEA",
    notes: "For thyroid uptake and diagnostic scan (low dose).",
    halfLifeHours: 192.48
  },
  {
    id: "131i_mibg_diagnostic",
    name: "mIBG (Diagnostic)",
    nuclide: "131I",
    indication: "Oncology (Diagnostic)",
    refMci: 0.5,
    refWeightKg: 70,
    minMci: 0.3,
    maxMci: 1.0,
    source: "SNMMI 2024",
    notes: "Diagnostic scan for neuroblastoma/pheochromocytoma.",
    halfLifeHours: 192.48
  },
    // ========== Generator Parents (for decay correction only) ==========
  {
    id: "mo99",
    name: "Molybdenum-99",
    nuclide: "99Mo",
    indication: "Generator Parent",
    refMci: 0,
    refWeightKg: 70,
    minMci: 0,
    maxMci: 0,
    source: "IAEA / NRC",
    notes: "Parent of ⁹⁹ᵐTc generator. Half‑life: 66 hours.",
    halfLifeHours: 66.0
  },
  {
    id: "ge68",
    name: "Germanium-68",
    nuclide: "68Ge",
    indication: "Generator Parent",
    refMci: 0,
    refWeightKg: 70,
    minMci: 0,
    maxMci: 0,
    source: "IAEA / NIST",
    notes: "Parent of ⁶⁸Ga generator. Half‑life: 271 days (6504 hours).",
    halfLifeHours: 6504.0
  }
];

// Helper functions unchanged
export function getAllNuclides() {
  const nuclides = new Set(RADIOPHARMACEUTICALS.map(t => t.nuclide));
  return Array.from(nuclides).sort();
}

export function getTracersByNuclide(nuclide) {
  return RADIOPHARMACEUTICALS.filter(t => t.nuclide === nuclide);
}

export function getTracerById(id) {
  return RADIOPHARMACEUTICALS.find(t => t.id === id);
}