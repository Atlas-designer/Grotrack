import * as admin from 'firebase-admin';

interface Compartment {
  id: string;
  name: string;
}

const DEFAULT_COMPARTMENTS: Compartment[] = [
  { id: 'fridge', name: 'Fridge' },
  { id: 'freezer', name: 'Freezer' },
  { id: 'pantry', name: 'Pantry' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'dry-ingredients', name: 'Dry Ingredients' },
  { id: 'wet-ingredients', name: 'Wet Ingredients' },
];

/**
 * Look up the house's compartments and find one matching the spoken name.
 * Returns { id, name } or a fallback.
 */
export async function resolveCompartment(
  houseId: string,
  spokenValue: string | undefined
): Promise<{ id: string; name: string }> {
  if (!spokenValue) return { id: 'fridge', name: 'fridge' };

  const spoken = spokenValue.toLowerCase().trim();

  // Synonym map: what the user might say → canonical name
  const synonyms: Record<string, string> = {
    fridge: 'fridge', refrigerator: 'fridge', 'the fridge': 'fridge',
    freezer: 'freezer', 'the freezer': 'freezer', 'ice box': 'freezer',
    pantry: 'pantry', cupboard: 'pantry', 'the pantry': 'pantry', 'the cupboard': 'pantry',
    snacks: 'snacks', 'snack drawer': 'snacks', 'snack cupboard': 'snacks',
    'dry ingredients': 'dry ingredients', 'dry goods': 'dry ingredients', 'baking cupboard': 'dry ingredients',
    'wet ingredients': 'wet ingredients', 'wet goods': 'wet ingredients', liquids: 'wet ingredients',
  };

  const canonical = synonyms[spoken] || spoken;

  // Fetch house compartments from Firestore
  const houseDoc = await admin.firestore().doc(`houses/${houseId}`).get();
  const houseData = houseDoc.data();
  const compartments: Compartment[] = houseData?.compartments ?? DEFAULT_COMPARTMENTS;

  // Match by name (case-insensitive)
  const match = compartments.find(
    (c) => c.name.toLowerCase() === canonical
  );

  if (match) return { id: match.id, name: match.name.toLowerCase() };

  // Fuzzy: check if any compartment name contains the spoken word
  const partial = compartments.find(
    (c) => c.name.toLowerCase().includes(canonical) || canonical.includes(c.name.toLowerCase())
  );

  if (partial) return { id: partial.id, name: partial.name.toLowerCase() };

  // Fallback: use first compartment
  return { id: compartments[0]?.id || 'fridge', name: compartments[0]?.name?.toLowerCase() || 'fridge' };
}
