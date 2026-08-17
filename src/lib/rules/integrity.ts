// Absorbs rounding differences between line-item totals and printed totals.
const TOLERANCE = 0.02;

export function checkIntegrity(
  amountHt: number | null,
  vatAmount: number | null,
  amountTtc: number | null
): { integrityOk: boolean; integrityDelta: number | null } {
  if (amountHt == null || vatAmount == null || amountTtc == null) {
    return { integrityOk: true, integrityDelta: null };
  }

  const delta = Math.round((amountHt + vatAmount - amountTtc) * 100) / 100;
  return { integrityOk: Math.abs(delta) <= TOLERANCE, integrityDelta: delta };
}
