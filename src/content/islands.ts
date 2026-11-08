import type { IslandId } from './types';

// شكل كل جزيرة على الخريطة: الشارة والحيوان اللي يزين بنرها.
export const ISLAND_LOOK: Record<IslandId, { badge: string; art: string }> = {
  ar: { badge: 'أ', art: 'camel' },
  en: { badge: 'A', art: 'lion' },
  num: { badge: '١', art: 'crab' },
  color: { badge: '🎨', art: 'tropicalfish' },
  shape: { badge: '▲', art: 'gift' },
  animal: { badge: '🐾', art: 'chicken' },
  food: { badge: '🍽', art: 'majboos' },
  place: { badge: '🏠', art: 'kuwaittowers' },
};
