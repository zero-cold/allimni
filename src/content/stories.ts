// قصص قصيرة مصورة: كل صفحة جملة وحدة ورسوم.
export interface Story {
  id: string;
  title: string;
  cover: string;
  pages: { text: string; art: string[] }[];
}

export const STORIES: Story[] = [
  {
    id: 'owl-sea',
    title: 'البومة تروح البحر',
    cover: 'boat',
    pages: [
      { text: 'صباح الخير! البومة صحت من النوم.', art: ['owl', 'sun'] },
      { text: 'ركبت القارب وطلعت البحر.', art: ['owl', 'boat'] },
      { text: 'شافت سمك ملوّن.', art: ['fish', 'tropicalfish'] },
      { text: 'لقت صدفة فيها لولوة!', art: ['shell'] },
      { text: 'ورجعت البيت مستانسة.', art: ['owl', 'house'] },
    ],
  },
  {
    id: 'sara-hungry',
    title: 'سارة جوعانة',
    cover: 'majboos',
    pages: [
      { text: 'سارة جوعانة.', art: ['girl', 'hungry'] },
      { text: 'ماما سوّت مجبوس.', art: ['mama', 'majboos'] },
      { text: 'سارة أكلت وشبعت.', art: ['girl', 'majboos'] },
      { text: 'بعدين شربت ماي.', art: ['water'] },
      { text: 'سارة مستانسة.', art: ['girl', 'happy'] },
    ],
  },
  {
    id: 'day-out',
    title: 'يوم في الديرة',
    cover: 'kuwaittowers',
    pages: [
      { text: 'طلعنا من البيت.', art: ['house'] },
      { text: 'رحنا أبراج الكويت.', art: ['kuwaittowers'] },
      { text: 'لعبنا عند البحر.', art: ['beach', 'ball'] },
      { text: 'أكلنا آيس كريم.', art: ['icecream'] },
      { text: 'رجعنا البيت ونمنا.', art: ['moon', 'sleep'] },
    ],
  },
];
