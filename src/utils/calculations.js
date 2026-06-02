// Webster factor
export function calculateWebsterFactor(weightKg) {
  return Math.pow(weightKg / 70, 0.7);
}

// Base adult dose (Webster + caps)
export function calculateBaseDoseMci(tracer, weightKg) {
  const factor = calculateWebsterFactor(weightKg);
  let nominalMci = tracer.refMci * factor;
  let finalMci = nominalMci;
  let capped = false;
  let capReason = "";
  if (finalMci < tracer.minMci) {
    finalMci = tracer.minMci;
    capped = true;
    capReason = `Capped to minimum (${tracer.minMci.toFixed(1)} mCi)`;
  } else if (finalMci > tracer.maxMci) {
    finalMci = tracer.maxMci;
    capped = true;
    capReason = `Capped to maximum (${tracer.maxMci.toFixed(1)} mCi)`;
  }
  return { nominalMci, finalMci, factor, capped, capReason };
}

// EANM weight factor table
function getEANMWeightFactor(weightKg) {
  if (weightKg < 3) return 0.1;
  if (weightKg < 5) return 0.2;
  if (weightKg < 8) return 0.3;
  if (weightKg < 12) return 0.4;
  if (weightKg < 16) return 0.5;
  if (weightKg < 20) return 0.6;
  if (weightKg < 25) return 0.7;
  if (weightKg < 32) return 0.8;
  if (weightKg < 42) return 0.9;
  return 1.0;
}

// BSA (Mosteller)
function calculateBSA(weightKg, heightCm) {
  if (!heightCm || heightCm <= 0) return null;
  return Math.sqrt((heightCm * weightKg) / 3600);
}

// Clark's rule (lb)
function clarksRule(adultDoseMci, weightKg) {
  const weightLb = weightKg * 2.20462;
  return adultDoseMci * (weightLb / 150);
}

// Young's rule
function youngsRule(adultDoseMci, ageYears) {
  if (ageYears <= 0) return adultDoseMci;
  return adultDoseMci * (ageYears / (ageYears + 12));
}

// Solomon Fried (months)
function solomonFriedRule(adultDoseMci, ageMonths) {
  if (ageMonths <= 0) return adultDoseMci;
  return adultDoseMci * (ageMonths / 150);
}

// Age groups for warnings
export const AGE_GROUPS = [
  { name: "Newborn (0-1 month)", minAge: 0, maxAge: 0.083, factor: 0.5, criticality: "critical", notes: "Extreme caution" },
  { name: "Infant (1-6 months)", minAge: 0.083, maxAge: 0.5, factor: 0.6, criticality: "critical", notes: "Rapid development" },
  { name: "Infant (6-12 months)", minAge: 0.5, maxAge: 1, factor: 0.7, criticality: "caution", notes: "Developing organs" },
  { name: "Toddler (1-2 years)", minAge: 1, maxAge: 2, factor: 0.8, criticality: "caution", notes: "Rapid growth" },
  { name: "Preschool (2-5 years)", minAge: 2, maxAge: 5, factor: 0.9, criticality: "caution", notes: "Minor adjustments" },
  { name: "School Age (5-12 years)", minAge: 5, maxAge: 12, factor: 0.95, criticality: "normal", notes: "" },
  { name: "Adolescent (12-18 years)", minAge: 12, maxAge: 18, factor: 0.98, criticality: "normal", notes: "" }
];

export function getAgeGroup(ageYears) {
  if (!ageYears && ageYears !== 0) return null;
  return AGE_GROUPS.find(g => ageYears >= g.minAge && ageYears <= g.maxAge) || null;
}

export function getAgeWarning(ageYears) {
  const group = getAgeGroup(ageYears);
  if (!group) return null;
  if (group.criticality === "critical") return `⚠️ CRITICAL: ${group.name} - ${group.notes}`;
  if (group.criticality === "caution") return `⚠️ CAUTION: ${group.name} - ${group.notes}`;
  return null;
}

// Pediatric rules constants
export const PEDIATRIC_RULES = {
  WEBSTER: "Webster's Rule (age factor)",
  EANM: "EANM Dosage Card",
  BSA: "Body Surface Area",
  CLARK: "Clark's Rule",
  YOUNG: "Young's Rule",
  SOLOMON_FRIED: "Solomon Fried's Rule"
};

// Main pediatric dose calculator (with optional tracerId for FDG reduction)
export function calculatePediatricDose(adultDoseMci, weightKg, ageYears, rule, heightCm = null, ageMonths = null, tracerId = null) {
  if (!rule || rule === PEDIATRIC_RULES.WEBSTER) {
    const ageGroup = getAgeGroup(ageYears);
    const factor = ageGroup ? ageGroup.factor : 1.0;
    return { finalDose: adultDoseMci * factor, factor, ruleUsed: PEDIATRIC_RULES.WEBSTER };
  }

  if (rule === PEDIATRIC_RULES.EANM) {
    let baseAdultDose = adultDoseMci;
    // 2024 EANM proposal: 39% reduction for 18F-FDG in children
    if (tracerId && (tracerId === "18f_fdg_body" || tracerId === "18f_fdg_brain")) {
      baseAdultDose = adultDoseMci * 0.61;
    }
    const factor = getEANMWeightFactor(weightKg);
    return { finalDose: baseAdultDose * factor, factor, ruleUsed: PEDIATRIC_RULES.EANM };
  }

  if (rule === PEDIATRIC_RULES.BSA) {
    if (!heightCm || heightCm <= 0) throw new Error("Height required for BSA rule");
    const bsaChild = calculateBSA(weightKg, heightCm);
    const bsaAdult = 1.73;
    const factor = bsaChild / bsaAdult;
    return { finalDose: adultDoseMci * factor, factor, ruleUsed: PEDIATRIC_RULES.BSA };
  }

  if (rule === PEDIATRIC_RULES.CLARK) {
    const dose = clarksRule(adultDoseMci, weightKg);
    const factor = dose / adultDoseMci;
    return { finalDose: dose, factor, ruleUsed: PEDIATRIC_RULES.CLARK };
  }

  if (rule === PEDIATRIC_RULES.YOUNG) {
    const dose = youngsRule(adultDoseMci, ageYears);
    const factor = dose / adultDoseMci;
    return { finalDose: dose, factor, ruleUsed: PEDIATRIC_RULES.YOUNG };
  }

  if (rule === PEDIATRIC_RULES.SOLOMON_FRIED) {
    if (ageMonths === null || ageMonths <= 0) throw new Error("Age in months required for Solomon Fried rule");
    const dose = solomonFriedRule(adultDoseMci, ageMonths);
    const factor = dose / adultDoseMci;
    return { finalDose: dose, factor, ruleUsed: PEDIATRIC_RULES.SOLOMON_FRIED };
  }

  return { finalDose: adultDoseMci, factor: 1.0, ruleUsed: rule };
}

// Decay functions
export function decayFactor(tHours, halfLifeHours) {
  return Math.exp(-Math.LN2 * tHours / halfLifeHours);
}

export function activityAtTime(initialActivityMci, halfLifeHours, elapsedHours) {
  return initialActivityMci * decayFactor(elapsedHours, halfLifeHours);
}

export function requiredInitialActivity(desiredActivityMci, halfLifeHours, timeToTargetHours) {
  if (timeToTargetHours <= 0) return desiredActivityMci;
  return desiredActivityMci / decayFactor(timeToTargetHours, halfLifeHours);
}