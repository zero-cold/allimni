// بطاقات «كلّمني»: يأشر عليها الطفل عشان يقول اللي يبيه أو يحس فيه.
export type TalkSection = 'want' | 'feel' | 'family';

export interface TalkCard {
  id: string;
  section: TalkSection;
  word: string;
  art: string;
}

export const TALK_SECTIONS: { id: TalkSection; art: string }[] = [
  { id: 'want', art: 'help' },
  { id: 'feel', art: 'happy' },
  { id: 'family', art: 'mama' },
];

const card = (section: TalkSection) => ([id, word, art]: [string, string, string]): TalkCard => ({ id, section, word, art });

export const TALK: TalkCard[] = [
  ...([
    ['talk-water', 'أبي ماي', 'water'], ['talk-eat', 'أبي آكل', 'eat'], ['talk-toilet', 'أبي الحمام', 'toilet'],
    ['talk-sleep', 'أبي أنام', 'sleep'], ['talk-play', 'أبي ألعب', 'play'], ['talk-mama', 'أبي ماما', 'mama'],
    ['talk-baba', 'أبي بابا', 'baba'], ['talk-hurt', 'يعورني', 'hurt'], ['talk-help', 'ساعدني', 'help'],
    ['talk-done', 'خلاص', 'stop'], ['talk-more', 'بعد', 'more'], ['talk-yes', 'إيه', 'yes'], ['talk-no', 'لا', 'no'],
    ['talk-cold', 'بردان', 'cold'], ['talk-hot', 'حرّان', 'hot'], ['talk-out', 'أبي أطلع', 'door'],
  ] as [string, string, string][]).map(card('want')),
  ...([
    ['feel-happy', 'مستانس', 'happy'], ['feel-sad', 'زعلان', 'sad'], ['feel-scared', 'خايف', 'scared'],
    ['feel-angry', 'معصّب', 'angry'], ['feel-tired', 'تعبان', 'tired'], ['feel-hungry', 'جوعان', 'hungry'],
    ['feel-thirsty', 'عطشان', 'thirsty'], ['feel-shy', 'مستحي', 'shy'],
  ] as [string, string, string][]).map(card('feel')),
  ...([
    ['family-mama', 'ماما', 'mama'], ['family-baba', 'بابا', 'baba'], ['family-grandma', 'يدّه', 'grandma'],
    ['family-grandpa', 'يدّي', 'grandpa'], ['family-brother', 'أخوي', 'boy'], ['family-sister', 'أختي', 'girl'],
    ['family-khal', 'خالي', 'khal'], ['family-amm', 'عمي', 'amm'],
  ] as [string, string, string][]).map(card('family')),
];
