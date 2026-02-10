/**
 * Extract the best value from an Alexa slot.
 * Tries: entity resolution name → entity resolution id → raw value
 */
export function getSlotValue(slot: any): string | undefined {
  if (!slot) return undefined;

  // Try entity resolution first (custom slot types)
  const resolution = slot.resolutions?.resolutionsPerAuthority?.[0];
  if (resolution?.status?.code === 'ER_SUCCESS_MATCH') {
    const resolved = resolution.values?.[0]?.value;
    // Prefer .name (human-readable), fall back to .id
    return resolved?.name || resolved?.id || slot.value;
  }

  // Fall back to raw spoken value
  return slot.value || undefined;
}
