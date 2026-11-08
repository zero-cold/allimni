import { existsSync } from 'node:fs';
import { getItems, getStages, gamesForStage, getItem, WORDS } from './stages';
import { ISLAND_IDS } from './types';
import { RECORDINGS, recordingFor, AVAILABLE_RECORDINGS } from './recordings';
import { TALK, TALK_SECTIONS } from './talk';
import { STORIES } from './stories';

test('four new islands with their items', () => {
  expect(ISLAND_IDS).toEqual(['ar', 'en', 'num', 'color', 'shape', 'animal', 'food', 'place']);
  expect(getItems('shape')).toHaveLength(8);
  expect(getItems('animal')).toHaveLength(12);
  expect(getItems('food')).toHaveLength(10);
  expect(getItems('place')).toHaveLength(11);
  expect(getStages('animal')).toHaveLength(4);
});
test('new islands play match and balloon only', () => {
  for (const island of ['shape', 'animal', 'food', 'place'] as const) {
    for (const s of getStages(island)) {
      const games = gamesForStage(island, s.index);
      expect(games.every((g) => g === 'match' || g === 'balloon')).toBe(true);
    }
  }
});
test('word game starts in arabic stage six', () => {
  expect(gamesForStage('ar', 4)).not.toContain('word');
  for (let i = 5; i < 10; i++) expect(gamesForStage('ar', i)).toContain('word');
});
test('word list uses known art and its letters spell the word', () => {
  for (const w of WORDS) {
    expect(w.letters.join('')).toBe(w.word);
    expect(existsSync(`public/art/${w.art}.svg`)).toBe(true);
  }
});
test('kuwaiti words from the recording list', () => {
  expect(getItem('animal-6').word).toBe('دياية');
  expect(getItem('food-1').word).toBe('مجبوس');
  expect(getItem('place-9').word).toBe('أبراج الكويت');
});
test('recording numbers match the recording list', () => {
  expect(RECORDINGS['talk-water']).toBe(1);
  expect(RECORDINGS['feel-happy']).toBe(17);
  expect(RECORDINGS['family-mama']).toBe(25);
  expect(RECORDINGS['praise-kafu']).toBe(33);
  expect(RECORDINGS['ar-1:name']).toBe(42);
  expect(RECORDINGS['ar-1']).toBe(43);
  expect(RECORDINGS['ar-28']).toBe(97);
  expect(RECORDINGS['num-1']).toBe(98);
  expect(RECORDINGS['white']).toBe(127);
  expect(RECORDINGS['mix-pink']).toBe(131);
  expect(RECORDINGS['shape-1']).toBe(132);
  expect(RECORDINGS['animal-1']).toBe(140);
  expect(RECORDINGS['food-1']).toBe(152);
  expect(RECORDINGS['place-11']).toBe(172);
  expect(RECORDINGS['en-1:name']).toBe(173);
  expect(RECORDINGS['en-26']).toBe(224);
  expect(new Set(Object.values(RECORDINGS)).size).toBe(224);
});
test('a recording plays only once its file is available', () => {
  expect(recordingFor('ar-1')).toBeUndefined();
  AVAILABLE_RECORDINGS.add(43);
  expect(recordingFor('ar-1')).toMatch(/audio\/043\.m4a$/);
  AVAILABLE_RECORDINGS.delete(43);
});
test('talk cards cover the three sections with art', () => {
  expect(TALK_SECTIONS.map((s) => s.id)).toEqual(['want', 'feel', 'family']);
  expect(TALK.filter((c) => c.section === 'want')).toHaveLength(16);
  expect(TALK.filter((c) => c.section === 'feel')).toHaveLength(8);
  expect(TALK.filter((c) => c.section === 'family')).toHaveLength(8);
  for (const c of TALK) expect(existsSync(`public/art/${c.art}.svg`), c.id).toBe(true);
});
test('stories have pages with art', () => {
  expect(STORIES).toHaveLength(3);
  for (const s of STORIES) {
    expect(s.pages.length).toBeGreaterThanOrEqual(4);
    for (const p of s.pages) for (const a of p.art) expect(existsSync(`public/art/${a}.svg`), a).toBe(true);
  }
});
