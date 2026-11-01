# «علمني» Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** بناء النسخة الأولى من تطبيق ويب يتثبت على الجوال، يعلّم الأطفال ضعاف السمع الحروف والأرقام والألوان باللعب.

**Architecture:** تطبيق يعمل كله على الجهاز بدون خادم. البيانات والمنطق (`content`, `progress`, `settings`) دوال نقية بدون واجهة، و`storage` و`feedback` يعزلان واجهات المتصفح، والألعاب والشاشات مكوّنات React فوقها.

**Tech Stack:** React، TypeScript، Vite، vite-plugin-pwa، idb-keyval، Vitest، Testing Library، fake-indexeddb، Playwright.

**Spec:** `docs/superpowers/specs/2026-11-01-hearing-kids-learning-app-design.md`

## Global Constraints

- لا إعلانات، ولا شراء داخل التطبيق، ولا حسابات، ولا طلبات شبكة لبيانات الطفل.
- كل معلومة تُقدَّم بالصوت لها مقابل بصري، وكل لعبة تكتمل والصوت مغلق.
- لا مؤقت ولا خسارة نجوم في أي لعبة.
- الواجهة من اليمين لليسار، وأهداف اللمس لا تقل عن 64 بكسل، والنص الإنجليزي داخل البطاقات `dir="ltr"`.
- شاشات الطفل تعمل بدون قراءة، وأي نص إرشادي له رمز أو حركة.
- لا تُعرض إشارة أو رسم فم إلا إذا كان له ملف معتمد في `src/content/media.ts`، وهذا الملف يبدأ فارغاً.
- كل الأصول محلية ومخزنة للعمل بدون إنترنت.

## Review Focus

1. **إغلاق التطبيق وسط مرحلة:** تعود المرحلة من أولها والنجوم السابقة محفوظة (Task 2، Task 10).
2. **الضغط السريع أو المتعدد:** ضغطتان على بالون أو على نهاية المرحلة لا تحتسبان مرتين (Task 2، Task 6).
3. **ملف بوضع «يعتمد على النظر»:** لا يخرج أي صوت في أي مسار، حتى عند تبديل الملف أثناء النطق (Task 4).
4. **الأصوات تتأخر أو غير موجودة:** `getVoices()` يرجع فارغاً أول مرة؛ يُحدَّث التوفر عند `voiceschanged` ولا يظهر زر استماع بلا صوت (Task 4).
5. **التخزين معطل أو بيانات تالفة، وحذف الملف المفتوح:** يستمر اللعب من الذاكرة، ويرجع حذف الملف إلى شاشة الملفات (Task 3، Task 9).

---

### Task 1: تجهيز المشروع والمحتوى

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `.gitignore`
- Create: `src/content/types.ts`, `src/content/items.ts`, `src/content/stages.ts`, `src/content/media.ts`
- Test: `src/content/content.test.ts`

**Interfaces:**
- Produces:
  - `type IslandId = 'ar' | 'en' | 'num' | 'color'`
  - `type GameId = 'trace' | 'match' | 'balloon' | 'mix'`
  - `interface Item { id: string; island: IslandId; display: string; altDisplay?: string; word: string; lang: 'ar' | 'en'; art: string; count?: number; colorHex?: string; symbol?: string }`
  - `getItems(island: IslandId): Item[]`
  - `getItem(id: string): Item`
  - `getStages(island: IslandId): { index: number; itemIds: string[] }[]`
  - `gamesForStage(island: IslandId, stageIndex: number): [GameId, GameId]`
  - `fillRound(island: IslandId, stageIndex: number, needed: number): Item[]`
  - `MIX_RECIPES: { a: string; b: string; result: string }[]`
  - `MEDIA: Record<string, { sign?: string; mouth?: string; audio?: string }>`

- [ ] **Step 1: تهيئة المستودع والمشروع**

Run: `git init && npm create vite@latest . -- --template react-ts && npm i idb-keyval && npm i -D vitest jsdom @testing-library/react @testing-library/user-event fake-indexeddb vite-plugin-pwa @playwright/test`
Expected: `npm run build` ينجح. أضف `"test": "vitest run"` إلى `package.json`.

- [ ] **Step 2: كتابة الاختبار الفاشل**

```ts
test('item counts', () => {
  expect(getItems('ar')).toHaveLength(28);
  expect(getItems('en')).toHaveLength(26);
  expect(getItems('num')).toHaveLength(20);
  expect(getItems('color')).toHaveLength(10);
});
test('stage counts', () => {
  expect(getStages('ar')).toHaveLength(10);
  expect(getStages('en')).toHaveLength(9);
  expect(getStages('num')).toHaveLength(7);
  expect(getStages('color')).toHaveLength(4);
});
test('stages cover each item once', () => { /* لكل جزيرة: اتحاد itemIds يساوي كل العناصر بلا تكرار */ });
test('two different games from the island', () => {
  // لكل مرحلة: اللعبتان مختلفتان، والألوان بلا trace، والبقية بلا mix
});
test('fillRound completes short last stage', () => {
  const round = fillRound('ar', 9, 3);
  expect(round).toHaveLength(3);
  expect(new Set(round.map(i => i.id)).size).toBe(3);
  expect(round.map(i => i.id)).toContain(getStages('ar')[9].itemIds[0]);
});
test('every color has unique symbol', () => { /* symbol و colorHex موجودان وفريدان */ });
test('mix recipes match spec', () => {
  expect(MIX_RECIPES).toEqual([
    { a: 'red', b: 'yellow', result: 'orange' },
    { a: 'blue', b: 'yellow', result: 'green' },
    { a: 'red', b: 'blue', result: 'purple' },
    { a: 'red', b: 'white', result: 'pink' },
  ]);
});
test('media starts empty', () => expect(MEDIA).toEqual({}));
```

- [ ] **Step 3: تشغيل الاختبار**

Run: `npm test -- content`
Expected: FAIL لأن الوحدات غير موجودة.

- [ ] **Step 4: كتابة البيانات والدوال**

الكلمات والألوان من القسم 5 في الوثيقة حرفياً وبترتيبها. الأرقام: `display` بالشكل الإنجليزي، و`altDisplay` بالشكل العربي، و`count` بقيمة الرقم. `gamesForStage` تدور على أزواج ألعاب الجزيرة حسب رقم المرحلة. `fillRound` تكمل من المراحل السابقة في الجزيرة نفسها.

- [ ] **Step 5: تشغيل الاختبار**

Run: `npm test -- content`
Expected: PASS

- [ ] **Step 6: Commit**

Run: `git add -A && git commit -m "feat: scaffold app and learning content"`

### Task 2: منطق التقدم

**Files:**
- Create: `src/progress/progress.ts`
- Test: `src/progress/progress.test.ts`

**Interfaces:**
- Consumes: `getStages`, `IslandId`
- Produces:
  - `interface Progress { stars: number; completed: Record<IslandId, number[]>; practice: Record<string, number>; lastRunId?: string }` حيث قيمة `practice` عدد الإجابات الصحيحة المتتالية بدون تلميح.
  - `emptyProgress(): Progress`
  - `isStageUnlocked(p: Progress, island: IslandId, index: number): boolean`
  - `completeStage(p: Progress, island: IslandId, index: number, runId: string): Progress`
  - `recordMistakes(p: Progress, itemId: string, mistakesInStage: number): Progress`
  - `recordCorrect(p: Progress, itemId: string, hinted: boolean): Progress`
  - `practiceItems(p: Progress, island: IslandId, max: number): string[]`
  - `OUTFITS: { id: string; stars: number }[]` بعتبات 9 و30 و60 و90
  - `unlockedOutfits(stars: number): string[]`

- [ ] **Step 1: كتابة الاختبار الفاشل**

```ts
test('first stage open, next opens after completion', () => {
  let p = emptyProgress();
  expect(isStageUnlocked(p, 'ar', 0)).toBe(true);
  expect(isStageUnlocked(p, 'ar', 1)).toBe(false);
  p = completeStage(p, 'ar', 0, 'r1');
  expect(isStageUnlocked(p, 'ar', 1)).toBe(true);
  expect(isStageUnlocked(p, 'en', 0)).toBe(true);
});
test('3 stars first, 1 on replay', () => {
  let p = completeStage(emptyProgress(), 'ar', 0, 'r1');
  expect(p.stars).toBe(3);
  p = completeStage(p, 'ar', 0, 'r2');
  expect(p.stars).toBe(4);
});
test('same run counts once', () => {
  let p = completeStage(emptyProgress(), 'ar', 0, 'r1');
  p = completeStage(p, 'ar', 0, 'r1');
  expect(p.stars).toBe(3);
});
test('needs practice after 2 mistakes only', () => {
  expect(recordMistakes(emptyProgress(), 'ar-1', 1).practice).toEqual({});
  expect(recordMistakes(emptyProgress(), 'ar-1', 2).practice).toEqual({ 'ar-1': 0 });
});
test('practice clears after 2 correct in a row without hint', () => {
  let p = recordMistakes(emptyProgress(), 'ar-1', 2);
  p = recordCorrect(p, 'ar-1', false);
  p = recordCorrect(p, 'ar-1', true);   // التلميح يصفّر العد
  expect(p.practice['ar-1']).toBe(0);
  p = recordCorrect(p, 'ar-1', false);
  p = recordCorrect(p, 'ar-1', false);
  expect(p.practice['ar-1']).toBeUndefined();
});
test('stars never decrease from mistakes', () => {
  const p = completeStage(emptyProgress(), 'ar', 0, 'r1');
  expect(recordMistakes(p, 'ar-1', 5).stars).toBe(3);
});
test('interrupted stage leaves no partial state', () => {
  // recordMistakes وrecordCorrect لا تضيفان المرحلة إلى completed ولا تغيران stars
});
test('outfit thresholds', () => {
  expect(unlockedOutfits(8)).toEqual([]);
  expect(unlockedOutfits(90)).toHaveLength(4);
});
```

- [ ] **Step 2: تشغيل الاختبار**

Run: `npm test -- progress`
Expected: FAIL

- [ ] **Step 3: تنفيذ الدوال في `src/progress/progress.ts`**

كلها دوال نقية ترجع نسخة جديدة.

- [ ] **Step 4: تشغيل الاختبار**

Run: `npm test -- progress`
Expected: PASS

- [ ] **Step 5: Commit**

Run: `git add -A && git commit -m "feat: add stars, unlocks and practice logic"`

### Task 3: الملفات والإعدادات والتخزين

**Files:**
- Create: `src/settings/settings.ts`, `src/storage/storage.ts`
- Test: `src/settings/settings.test.ts`, `src/storage/storage.test.ts`

**Interfaces:**
- Consumes: `Progress`, `emptyProgress`
- Produces:
  - `type HearingMode = 'visual' | 'partial'`
  - `interface Settings { sound: boolean; speechRate: 'slow' | 'normal'; vibration: boolean; reduceMotion: boolean }`
  - `defaultSettings(mode: HearingMode, prefersReducedMotion: boolean): Settings`
  - `interface Profile { id: string; name: string; avatar: string; mode: HearingMode; settings: Settings; progress: Progress }`
  - `interface AppState { version: 1; profiles: Profile[] }`
  - `MAX_PROFILES = 6`
  - `addProfile(s: AppState, p: Profile): AppState` ترمي خطأ عند تجاوز الحد
  - `loadState(): Promise<AppState>`
  - `saveState(s: AppState): Promise<boolean>` ترجع `false` عند الفشل
  - `requestPersistence(): Promise<boolean>`

- [ ] **Step 1: كتابة الاختبار الفاشل**

```ts
test('mode defaults', () => {
  expect(defaultSettings('visual', false)).toMatchObject({ sound: false, vibration: true });
  expect(defaultSettings('partial', false)).toMatchObject({ sound: true, vibration: true });
  expect(defaultSettings('visual', true).reduceMotion).toBe(true);
});
test('seventh profile rejected', () => { /* addProfile على 6 ملفات ترمي خطأ */ });
test('state round trips', async () => { /* saveState ثم loadState بنفس القيم عبر fake-indexeddb */ });
test('no data gives empty state', async () => {
  expect(await loadState()).toEqual({ version: 1, profiles: [] });
});
test('corrupt data gives empty state', async () => { /* قيمة غير صالحة في المفتاح: لا يرمي خطأ */ });
test('storage failure keeps app running', async () => {
  // عند فشل idb-keyval: saveState ترجع false، وloadState اللاحقة ترجع آخر حالة من الذاكرة
});
```

- [ ] **Step 2: تشغيل الاختبار**

Run: `npm test -- settings storage`
Expected: FAIL

- [ ] **Step 3: التنفيذ**

مفتاح واحد في idb-keyval اسمه `allimni-state`، مع نسخة في الذاكرة. `requestPersistence` تستدعي `navigator.storage?.persist?.()`.

- [ ] **Step 4: تشغيل الاختبار**

Run: `npm test -- settings storage`
Expected: PASS

- [ ] **Step 5: Commit**

Run: `git add -A && git commit -m "feat: add profiles, settings and local storage"`

### Task 4: التغذية الراجعة والصوت

**Files:**
- Create: `src/feedback/feedback.ts`
- Test: `src/feedback/feedback.test.ts`

**Interfaces:**
- Consumes: `Settings`
- Produces:
  - `createFeedback(settings: Settings, env?: FeedbackEnv): Feedback`
  - `interface Feedback { correct(): void; wrong(): void; celebrate(): void; speak(text: string, lang: 'ar' | 'en'): void; stop(): void; canSpeak(lang: 'ar' | 'en'): boolean; onVoicesChanged(fn: () => void): () => void }`
  - `FeedbackEnv` يغلف `speechSynthesis` و`navigator.vibrate` ونغمات WebAudio للاختبار.

- [ ] **Step 1: كتابة الاختبار الفاشل**

```ts
test('sound off is fully silent', () => {
  const env = fakeEnv();
  const f = createFeedback({ ...base, sound: false }, env);
  f.correct(); f.wrong(); f.celebrate(); f.speak('باء', 'ar');
  expect(env.spoken).toEqual([]);
  expect(env.tones).toEqual([]);
});
test('sound on speaks at chosen rate', () => {
  const env = fakeEnv({ voices: ['ar-SA'] });
  createFeedback({ ...base, sound: true, speechRate: 'slow' }, env).speak('باء', 'ar');
  expect(env.spoken[0]).toMatchObject({ text: 'باء', lang: 'ar', rate: 0.6 });
});
test('missing vibration does not throw', () => {
  expect(() => createFeedback(base, fakeEnv({ vibrate: undefined })).correct()).not.toThrow();
});
test('vibration setting respected', () => { /* vibration:false لا يستدعي vibrate */ });
test('canSpeak reflects voices, updates late', () => {
  const env = fakeEnv({ voices: [] });
  const f = createFeedback({ ...base, sound: true }, env);
  expect(f.canSpeak('ar')).toBe(false);
  env.setVoices(['ar-EG']);
  expect(f.canSpeak('ar')).toBe(true);
});
test('canSpeak false when sound off', () => { /* حتى لو الصوت العربي موجود */ });
test('stop cancels speech', () => { /* تستدعي speechSynthesis.cancel */ });
```

- [ ] **Step 2: تشغيل الاختبار**

Run: `npm test -- feedback`
Expected: FAIL

- [ ] **Step 3: التنفيذ**

السرعة: `slow = 0.6` و`normal = 1`. الاهتزاز: صحيح 40ms، خطأ `[30,40,30]`، احتفال `[60,40,60,40,120]`. النغمات تولدها WebAudio بدون ملفات.

- [ ] **Step 4: تشغيل الاختبار**

Run: `npm test -- feedback`
Expected: PASS

- [ ] **Step 5: Commit**

Run: `git add -A && git commit -m "feat: add visual-first feedback and speech"`

### Task 5: الرسوم ومسارات التتبّع ولعبة التتبّع

**Files:**
- Create: `scripts/copy-art.mjs`, `public/art/*.svg`, `public/art/LICENSES.md`, `src/content/strokes.ts`, `src/games/traceLogic.ts`, `src/games/TraceGame.tsx`
- Test: `src/content/art.test.ts`, `src/content/strokes.test.ts`, `src/games/traceLogic.test.ts`

**Interfaces:**
- Consumes: `Item`, `Feedback`
- Produces:
  - `type Stroke = { x: number; y: number }[]` على شبكة 100×100، والنقطة المفردة تعني نقرة مثل نقاط الحروف العربية.
  - `getStrokes(item: Item): Stroke[][]` مجموعة لكل خانة، فالرقم 12 خانتان.
  - `checkStroke(stroke: Stroke, drawn: {x:number;y:number}[], tolerance?: number): boolean` والهامش الافتراضي 14.
  - `interface GameProps { items: Item[]; feedback: Feedback; reduceMotion: boolean; onAnswer(itemId: string, a: { correct: boolean; hinted: boolean }): void; onDone(): void }` وكل الألعاب تلتزم بها.

- [ ] **Step 1: كتابة الاختبار الفاشل**

```ts
test('every item art exists', () => { /* لكل عنصر: public/art/<art>.svg موجود */ });
test('all ar, en, num items have strokes', () => { /* getStrokes غير فارغة، وكل النقاط بين 0 و100 */ });
test('number 12 has two digit groups', () => {
  expect(getStrokes(getItem('num-12'))).toHaveLength(2);
});
test('accepts points in order within margin', () => {
  expect(checkStroke(line, line.map(p => ({ x: p.x + 8, y: p.y })))).toBe(true);
});
test('rejects reversed order', () => {
  expect(checkStroke(line, [...line].reverse())).toBe(false);
});
test('rejects a path far away', () => { /* إزاحة 40 ترجع false */ });
test('single point stroke accepts a tap', () => {
  expect(checkStroke([{ x: 50, y: 50 }], [{ x: 55, y: 45 }])).toBe(true);
});
```

- [ ] **Step 2: تشغيل الاختبار**

Run: `npm test -- art strokes traceLogic`
Expected: FAIL

- [ ] **Step 3: نسخ الرسوم**

انسخ بالسكربت من `googlefonts/noto-emoji` بنسخة محددة (مسار `svg/`)، مع نص الرخصة في `LICENSES.md`. لا يوجد رمز جاهز لكلمتي «رمان» و«صقر»، فارسمهما يدوياً في `public/art/` بأسلوب مقارب.

- [ ] **Step 4: كتابة المسارات ولعبة التتبّع**

المسارات: الحروف العربية بالشكل المنفصل، والإنجليزية بالحرف الكبير، والأرقام بالشكل العربي (٠–٩). يعرض `TraceGame` الخطوة الحالية بمسار منقط واتجاه متحرك، ويظهر تلميح تتبع متحرك بعد محاولتين خاطئتين، والإصبع يرسم على `<canvas>` مع `touch-action: none`.

- [ ] **Step 5: تشغيل الاختبار**

Run: `npm test -- art strokes traceLogic`
Expected: PASS

- [ ] **Step 6: Commit**

Run: `git add -A && git commit -m "feat: add art, stroke data and tracing game"`

### Task 6: ألعاب المطابقة والبالونات والخلط

**Files:**
- Create: `src/games/MatchGame.tsx`, `src/games/BalloonGame.tsx`, `src/games/MixGame.tsx`
- Test: `src/games/games.test.tsx`

**Interfaces:**
- Consumes: `GameProps`, `MIX_RECIPES`, `getItems`
- Produces: `MatchGame`, `BalloonGame`, `MixGame` بنفس `GameProps`.

- [ ] **Step 1: كتابة الاختبار الفاشل**

```tsx
test('match finishes after 3 correct pairs', async () => { /* onDone مرة واحدة */ });
test('match number shows quantity, color shows object', () => { /* العنصر يعرض كميته أو لونه */ });
test('balloon finishes after exactly 5 correct', async () => { /* 5 نقرات صحيحة ثم onDone */ });
test('double tap on a correct balloon counts once', async () => {
  // dblClick على بالون صحيح: onAnswer تُستدعى مرة واحدة
});
test('wrong balloon returns and no score lost', async () => { /* العداد لا ينقص والبالون يبقى متاحاً */ });
test('hint appears after 2 wrong attempts', async () => {
  // بعد خطأين تظهر علامة التلميح، والإجابة التالية hinted: true
});
test('mix red+yellow shows orange', async () => { /* اختيار اللونين يعرض النتيجة ثم onDone بعد كل الوصفات المطلوبة */ });
test('all games complete with sound off', async () => { /* feedback.speak لا يكون شرطاً لأي تقدم */ });
```

- [ ] **Step 2: تشغيل الاختبار**

Run: `npm test -- games`
Expected: FAIL

- [ ] **Step 3: تنفيذ الألعاب**

البالونات تعرض المطلوب مع صورته في الأعلى، وتعيد البالون الفائت من الأسفل، ولا تستخدم مؤقتاً للفشل. الموزعات من الجزيرة نفسها. مع `reduceMotion` تصير البالونات ثابتة وتختفي الاهتزازات الكبيرة. الخلط يعرض وصفتين في كل جولة.

- [ ] **Step 4: تشغيل الاختبار**

Run: `npm test -- games`
Expected: PASS

- [ ] **Step 5: Commit**

Run: `git add -A && git commit -m "feat: add match, balloon and color mix games"`

### Task 7: حالة التطبيق والملفات وبوابة ولي الأمر

**Files:**
- Create: `src/app/store.tsx`, `src/screens/ProfilesScreen.tsx`, `src/screens/ProfileForm.tsx`, `src/screens/ParentGate.tsx`, `src/styles.css`
- Modify: `src/App.tsx`, `index.html`
- Test: `src/screens/profiles.test.tsx`

**Interfaces:**
- Consumes: `AppState`, `loadState`, `saveState`, `addProfile`, `defaultSettings`
- Produces:
  - `useApp(): { state: AppState; active: Profile | null; saveFailed: boolean; selectProfile(id: string | null): void; updateProfile(id: string, fn: (p: Profile) => Profile): void; addProfile(p: Profile): void; removeProfile(id: string): void; navigate(s: Screen): void; screen: Screen }`
  - `type Screen = { name: 'profiles' } | { name: 'map' } | { name: 'stage'; island: IslandId; index: number } | { name: 'companion' } | { name: 'parent' }`
  - `ParentGate` بخاصية `onPass(): void`، و`makeGateQuestion(rand?: () => number): { a: number; b: number; answer: number }`

- [ ] **Step 1: كتابة الاختبار الفاشل**

```tsx
test('first run goes through gate to create profile', async () => { /* لا ملفات: تظهر البوابة، ثم النموذج */ });
test('gate rejects wrong answer', async () => { /* الإجابة الخاطئة لا تفتح وتظهر مسألة جديدة */ });
test('gate question is simple multiplication', () => {
  // a و b بين 2 و9
});
test('creating profile applies mode defaults', async () => { /* visual => sound:false */ });
test('add profile hidden at 6', () => { /* زر الإضافة غير موجود عند 6 ملفات */ });
test('child picks profile without password', async () => { /* نقرة على الصورة تفتح الخريطة */ });
```

- [ ] **Step 2: تشغيل الاختبار**

Run: `npm test -- profiles`
Expected: FAIL

- [ ] **Step 3: التنفيذ**

`index.html` بـ `lang="ar" dir="rtl"`. الانتقال بين الشاشات بحالة داخلية بدون مكتبة توجيه. يستدعي `store` الدالة `saveState` بعد كل تغيير و`requestPersistence` عند إنشاء أول ملف. يوقف تبديل الملف أي نطق جارٍ.

- [ ] **Step 4: تشغيل الاختبار**

Run: `npm test -- profiles`
Expected: PASS

- [ ] **Step 5: Commit**

Run: `git add -A && git commit -m "feat: add profiles flow and parent gate"`

### Task 8: الخريطة والمرحلة والرفيق

**Files:**
- Create: `src/screens/MapScreen.tsx`, `src/screens/StageScreen.tsx`, `src/screens/LearnCard.tsx`, `src/screens/Celebration.tsx`, `src/screens/CompanionScreen.tsx`
- Test: `src/screens/stage.test.tsx`

**Interfaces:**
- Consumes: `useApp`, `getStages`, `gamesForStage`, `fillRound`, `practiceItems`, `completeStage`, `recordMistakes`, `recordCorrect`, `unlockedOutfits`, `MEDIA`, `createFeedback`, كل الألعاب
- Produces: هذه الشاشات، وتُربط في `App.tsx`.

- [ ] **Step 1: كتابة الاختبار الفاشل**

```tsx
test('map shows 4 open islands and locks later stages', () => {});
test('stage flow: learn cards, 2 games, celebration, stars saved', async () => {
  // 3 نجوم في الملف بعد الاحتفال
});
test('finish tapped twice awards once', async () => {});
test('learn card hides sign and mouth without media', () => {
  // لا عنصر sign ولا mouth عندما MEDIA فارغ
});
test('visual mode puts sign before speech, partial reverses', () => {
  // نختبر الترتيب بعد حقن MEDIA تجريبي للعنصر
});
test('listen button hidden when canSpeak is false', () => {});
test('English card uses dir ltr', () => {});
test('practice item joins later stage round', () => {
  // عنصر في practice يظهر في لعبة مرحلة لاحقة من الجزيرة نفسها
});
test('feeding is free and outfits open by stars', async () => {
  // الإطعام لا ينقص stars، والملابس تتبع unlockedOutfits
});
```

- [ ] **Step 2: تشغيل الاختبار**

Run: `npm test -- stage`
Expected: FAIL

- [ ] **Step 3: التنفيذ**

`StageScreen` يولد `runId` واحد عند بدء المرحلة ولا يحفظ `completeStage` إلا في نهايتها، فالخروج وسطها يعيدها من أولها. جولات الألعاب تضم حتى عنصرين من `practiceItems`، وتُستدعى `recordMistakes` عند نهاية المرحلة. `LearnCard` يعرض حركة الكتابة أو العدّ أو الأشياء الملونة حسب نوع العنصر. يستجيب الاحتفال لـ`reduceMotion`.

- [ ] **Step 4: تشغيل الاختبار**

Run: `npm test -- stage`
Expected: PASS

- [ ] **Step 5: Commit**

Run: `git add -A && git commit -m "feat: add map, stage flow and companion"`

### Task 9: لوحة ولي الأمر

**Files:**
- Create: `src/screens/ParentScreen.tsx`
- Test: `src/screens/parent.test.tsx`

**Interfaces:**
- Consumes: `useApp`, `ParentGate`, `getStages`, `getItem`, `createFeedback`
- Produces: `ParentScreen`.

- [ ] **Step 1: كتابة الاختبار الفاشل**

```tsx
test('shows per island progress and practice items', () => {});
test('settings change saves per child', async () => {});
test('mode change resets defaults, later edits stay individual', async () => {});
test('delete needs confirmation', async () => { /* إلغاء لا يحذف */ });
test('deleting active profile returns to profiles', async () => {});
test('deleting last profile returns to first run', async () => {});
test('warns when arabic voice missing', () => {});
test('warns when saving failed', () => {});
test('explains data stays on this device', () => {});
```

- [ ] **Step 2: تشغيل الاختبار**

Run: `npm test -- parent`
Expected: FAIL

- [ ] **Step 3: التنفيذ**

مربع تأكيد الحذف داخل الصفحة. ادخل إلى اللوحة من شاشة الملفات والخريطة عبر `ParentGate`.

- [ ] **Step 4: تشغيل الاختبار**

Run: `npm test -- parent`
Expected: PASS

- [ ] **Step 5: Commit**

Run: `git add -A && git commit -m "feat: add parent dashboard"`

### Task 10: التثبيت والعمل بدون إنترنت والاختبار الشامل

**Files:**
- Modify: `vite.config.ts`, `index.html`
- Create: `public/icons/*`, `playwright.config.ts`, `e2e/app.spec.ts`

**Interfaces:**
- Consumes: التطبيق كاملاً.

- [ ] **Step 1: كتابة الاختبار الفاشل**

```ts
test('full flow and persistence', async ({ page }) => {
  // إنشاء ملف بوضع visual، إكمال مرحلة، إعادة التحميل، النجوم 3
});
test('leaving mid stage restarts it, stars kept', async ({ page }) => {});
test('works offline after first load', async ({ page, context }) => {
  // انتظار تفعيل service worker، ثم setOffline(true) وإعادة التحميل وإكمال مرحلة، ثم التأكد من ظهور الرسوم
});
test('no external requests', async ({ page }) => {
  // كل الطلبات من نفس الأصل
});
test('no horizontal scroll, targets at least 64px', async ({ page }) => {
  // على 375×812 و768×1024
});
```

- [ ] **Step 2: تشغيل الاختبار**

Run: `npx playwright install chromium webkit && npm run build && npx playwright test`
Expected: FAIL في اختبار العمل بدون إنترنت.

- [ ] **Step 3: إعداد التثبيت**

`VitePWA` بوضع `autoUpdate`، و`globPatterns` تشمل `svg`، وmanifest باسم «علمني» و`dir: 'rtl'` و`lang: 'ar'` و`display: 'standalone'` وأيقونات 192 و512 وmaskable. أضف وسوم Apple للتثبيت على الآيفون.

- [ ] **Step 4: تشغيل كل الاختبارات**

Run: `npm test && npm run build && npx playwright test`
Expected: PASS على Chromium وWebKit.

- [ ] **Step 5: Commit**

Run: `git add -A && git commit -m "feat: make app installable and offline"`

- [ ] **Step 6: تقرير التجربة اليدوية**

اكتب في `docs/manual-test.md` ما يجب تجربته على آيفون وأندرويد حقيقيين: التثبيت، والصوت العربي، والتتبّع بالإصبع، والعمل بدون إنترنت، وتجربة الأطفال، ومراجعة الأخصائي. هذه خطوات لا تغطيها الاختبارات الآلية.
