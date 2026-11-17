import { AqeeqaInvitationData, ThemeSettings } from '../types/wedding';

export const THEME_PRESETS: Record<
  ThemeSettings['preset'],
  Omit<ThemeSettings, 'preset' | 'typographyPreset'> & { label: string }
> = {
  'emerald-ivory': {
    label: 'Royal Emerald & Champagne Gold',
    canvasBg: '#062118',
    cardBg: '#faf7f0',
    primaryAccent: '#0b4f3a',
    goldAccent: '#b8923a',
    textColor: '#1e2923',
  },
  'midnight-emerald': {
    label: 'Midnight Forest & Warm Gold',
    canvasBg: '#03120d',
    cardBg: '#f6f3ea',
    primaryAccent: '#064e3b',
    goldAccent: '#c9a24d',
    textColor: '#1a2421',
  },
  'champagne-cream': {
    label: 'Champagne Cream & Antique Bronze',
    canvasBg: '#1c1610',
    cardBg: '#fdfaf3',
    primaryAccent: '#14532d',
    goldAccent: '#b8893a',
    textColor: '#292119',
  },
  'royal-ivory-gold': {
    label: 'Ivory Parchment & Imperial Gold',
    canvasBg: '#0b221a',
    cardBg: '#fcfaf4',
    primaryAccent: '#0f5132',
    goldAccent: '#a8802b',
    textColor: '#1c2420',
  },
};

export const SEEDED_MEDIA_REFS = [
  {
    id: 'seed-aqeeqa-envelope',
    kind: 'image' as const,
    originalName: 'aqeeqa_envelope_gold_cover.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 0,
    storagePath: 'src/assets/images/aqeeqa_envelope_gold_cover_1794928610797.jpg',
    url: '/src/assets/images/aqeeqa_envelope_gold_cover_1794928610797.jpg',
  },
  {
    id: 'seed-aqeeqa-baby-portrait',
    kind: 'image' as const,
    originalName: 'aqeeqa_baby_portrait.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 0,
    storagePath: 'src/assets/images/aqeeqa_baby_portrait_1794928612481.jpg',
    url: '/src/assets/images/aqeeqa_baby_portrait_1794928612481.jpg',
  },
  {
    id: 'seed-aqeeqa-hall',
    kind: 'image' as const,
    originalName: 'aqeeqa_hall_celebration.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 0,
    storagePath: 'src/assets/images/aqeeqa_hall_celebration_1794928612785.jpg',
    url: '/src/assets/images/aqeeqa_hall_celebration_1794928612785.jpg',
  },
  {
    id: 'seed-aqeeqa-courtyard',
    kind: 'image' as const,
    originalName: 'aqeeqa_lantern_courtyard.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 0,
    storagePath: 'src/assets/images/aqeeqa_lantern_courtyard_1794928613921.jpg',
    url: '/src/assets/images/aqeeqa_lantern_courtyard_1794928613921.jpg',
  },
  {
    id: 'seed-ambient-backdrop',
    kind: 'image' as const,
    originalName: 'ambient_palace_backdrop.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 0,
    storagePath: 'src/assets/images/ambient_palace_backdrop_1794848027737.jpg',
    url: '/src/assets/images/ambient_palace_backdrop_1794848027737.jpg',
  },
  {
    id: 'seed-bollywood-music',
    kind: 'audio' as const,
    originalName: 'bollywood_instrumental.mp3',
    mimeType: 'audio/mpeg',
    sizeBytes: 0,
    storagePath: 'src/assets/audio/bollywood_instrumental.mp3',
    url: '/src/assets/audio/bollywood_instrumental.mp3',
  },
];

export const DEFAULT_INVITATION: AqeeqaInvitationData = {
  id: 'default-invitation',
  slug: 'syed-aakif-aqeeqa-mubarak',
  isDefault: true,
  isPublished: true,
  updatedAt: new Date().toISOString(),

  brandTitle: 'ROYAL AQEEQA',
  occasionTitle: 'AQEEQA MUBARAK',
  bismillahArabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  openingSubtitle: 'A Special Invitation',
  openingInvitationLine: 'You are Cordially Invited',

  quranVerseArabic:
    'بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ، وَشَكَرْتَ الْوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ',
  quranVerseTranslation:
    'May Allah bless you in the child gifted to you, may you give thanks to the Giver, may he reach maturity, and may you be blessed with his righteousness.',

  childName: 'Syed Aakif Ali Jagirdar',
  grandfatherName: 'Syed Yusuf Ali Jagirdar',
  fatherName: 'Syed Kashif Ali Jagirdar',
  familySubtitle: 'Jagirdar Family · Partur, District Jalna',

  invitationLead: 'With the blessings of Almighty Allah,',
  invitationMessage:
    'cordially invite you and your family to grace the blessed occasion of the Aqeeqa ceremony of',
  invitationClosingLine:
    'Your gracious presence and duas will make this occasion even more special. Please join us and bless the little one with your prayers.',

  aqeeqaDate: '24 November 2026',
  aqeeqaDay: 'Tuesday',
  aqeeqaTime: 'Baad Namaz-e-Maghrib (After Maghrib Prayer)',
  hijriDate: '13 Jumada al-Thani 1448 Hijri',
  targetDateTime: '2026-11-24T17:50:00+05:30',
  postEventMessage: 'Alhamdulillah! The blessed Aqeeqa celebration has arrived.',

  venueName: 'Master Function Hall',
  venueAddress: 'Near Bus Station (Gaon), Taluka Partur, District Jalna, Maharashtra.',
  googleMapsUrl:
    'https://maps.google.com/?q=Master+Function+Hall+Near+Bus+Station+Partur+Jalna+Maharashtra',

  babyPhoto: {
    attachmentId: 'seed-aqeeqa-baby-portrait',
    url: '/src/assets/images/aqeeqa_baby_portrait_1794928612481.jpg',
    storagePath: 'src/assets/images/aqeeqa_baby_portrait_1794928612481.jpg',
    originalName: 'aqeeqa_baby_portrait.jpg',
    mimeType: 'image/jpeg',
  },
  babyPhotoCaption: 'Syed Aakif Ali Jagirdar — Blessed with Faith & Joy',
  familyPhoto: {
    attachmentId: 'seed-aqeeqa-hall',
    url: '/src/assets/images/aqeeqa_hall_celebration_1794928612785.jpg',
    storagePath: 'src/assets/images/aqeeqa_hall_celebration_1794928612785.jpg',
    originalName: 'aqeeqa_hall_celebration.jpg',
    mimeType: 'image/jpeg',
  },
  familyPhotoCaption: 'Warm Hospitality & Family Gathering',

  envelopeCoverImage: {
    attachmentId: 'seed-aqeeqa-envelope',
    url: '/src/assets/images/aqeeqa_envelope_gold_cover_1794928610797.jpg',
    storagePath: 'src/assets/images/aqeeqa_envelope_gold_cover_1794928610797.jpg',
    originalName: 'aqeeqa_envelope_gold_cover.jpg',
    mimeType: 'image/jpeg',
  },

  events: [
    {
      id: 'event-aqeeqa-ceremony',
      title: 'Aqeeqa Ceremony & Dua',
      date: 'Tuesday, 24 November 2026',
      hijriDate: '13 Jumada al-Thani 1448 Hijri',
      time: 'Baad Namaz-e-Maghrib (After Maghrib Prayer)',
      venue: 'Master Function Hall',
      address: 'Near Bus Station (Gaon), Taluka Partur, District Jalna, Maharashtra.',
      description:
        'Sacred Aqeeqa sunnah gathering and collective Dua for the health, righteousness, and Barakah of Syed Aakif Ali Jagirdar.',
      googleMapsUrl:
        'https://maps.google.com/?q=Master+Function+Hall+Near+Bus+Station+Partur+Jalna+Maharashtra',
      photo: {
        attachmentId: 'seed-aqeeqa-courtyard',
        url: '/src/assets/images/aqeeqa_lantern_courtyard_1794928613921.jpg',
        storagePath: 'src/assets/images/aqeeqa_lantern_courtyard_1794928613921.jpg',
        originalName: 'aqeeqa_lantern_courtyard.jpg',
        mimeType: 'image/jpeg',
      },
    },
    {
      id: 'event-aqeeqa-dinner',
      title: 'Aqeeqa Mubarak Dinner',
      date: 'Tuesday, 24 November 2026',
      hijriDate: '13 Jumada al-Thani 1448 Hijri',
      time: 'Following Maghrib Dua',
      venue: 'Master Function Hall',
      address: 'Near Bus Station (Gaon), Taluka Partur, District Jalna, Maharashtra.',
      description:
        'Join the Jagirdar family for a joyful Sunnah dinner celebrating the blessed milestone.',
      googleMapsUrl:
        'https://maps.google.com/?q=Master+Function+Hall+Near+Bus+Station+Partur+Jalna+Maharashtra',
      photo: {
        attachmentId: 'seed-aqeeqa-hall',
        url: '/src/assets/images/aqeeqa_hall_celebration_1794928612785.jpg',
        storagePath: 'src/assets/images/aqeeqa_hall_celebration_1794928612785.jpg',
        originalName: 'aqeeqa_hall_celebration.jpg',
        mimeType: 'image/jpeg',
      },
    },
  ],

  gallery: [
    {
      id: 'gal-baby-1',
      attachmentId: 'seed-aqeeqa-baby-portrait',
      url: '/src/assets/images/aqeeqa_baby_portrait_1794928612481.jpg',
      caption: 'Blessed Arrival — Syed Aakif Ali Jagirdar',
      category: 'baby',
      order: 0,
    },
    {
      id: 'gal-family-2',
      attachmentId: 'seed-aqeeqa-hall',
      url: '/src/assets/images/aqeeqa_hall_celebration_1794928612785.jpg',
      caption: 'Family & Hospitality at Master Function Hall',
      category: 'family',
      order: 1,
    },
    {
      id: 'gal-courtyard-3',
      attachmentId: 'seed-aqeeqa-courtyard',
      url: '/src/assets/images/aqeeqa_lantern_courtyard_1794928613921.jpg',
      caption: 'Baad Namaz-e-Maghrib Gathering Glow',
      category: 'celebration',
      order: 2,
    },
  ],

  contacts: [
    {
      id: 'contact-1',
      name: 'Syed Yusuf Ali Jagirdar',
      relation: '',
      phone: '8149492341',
    },
    {
      id: 'contact-2',
      name: 'Syed Aakif Ali Jagirdar',
      relation: '',
      phone: '9766622216',
    },
  ],

  closingDuaArabic:
    'أُعِيذُهُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
  closingDuaTranslation:
    'I seek protection for him in the perfect words of Allah from every harm and from every envious eye.',
  closingWishes:
    'Your warm presence and sincere Duas for Syed Aakif Ali Jagirdar are the greatest gift for our family.',
  giftPolicyPrimary: 'किसी किस्म का आहेर कबूल नहीं किया जाएगा।',
  giftPolicySecondary: 'Kisi kism ka aaher qabool nahi kiya jayega.',
  footerCompliments: 'With Warm Regards — Syed Yusuf Ali Jagirdar & Syed Kashif Ali Jagirdar',

  music: {
    enabled: true,
    trackTitle: 'Bollywood Celebration Instrumental',
    audio: {
      attachmentId: 'seed-bollywood-music',
      url: '/src/assets/audio/bollywood_instrumental.mp3',
      storagePath: 'src/assets/audio/bollywood_instrumental.mp3',
      originalName: 'bollywood_instrumental.mp3',
      mimeType: 'audio/mpeg',
    },
  },

  background: {
    mode: 'image',
    image: {
      attachmentId: 'seed-ambient-backdrop',
      url: '/src/assets/images/ambient_palace_backdrop_1794848027737.jpg',
      storagePath: 'src/assets/images/ambient_palace_backdrop_1794848027737.jpg',
      originalName: 'ambient_palace_backdrop.jpg',
      mimeType: 'image/jpeg',
    },
    video: null,
    fallbackImage: {
      attachmentId: 'seed-ambient-backdrop',
      url: '/src/assets/images/ambient_palace_backdrop_1794848027737.jpg',
      storagePath: 'src/assets/images/ambient_palace_backdrop_1794848027737.jpg',
      originalName: 'ambient_palace_backdrop.jpg',
      mimeType: 'image/jpeg',
    },
    position: 'center',
    overlayOpacity: 0.72,
    particlesEnabled: true,
    shimmerEnabled: true,
  },

  theme: {
    preset: 'emerald-ivory',
    canvasBg: '#062118',
    cardBg: '#faf7f0',
    primaryAccent: '#0b4f3a',
    goldAccent: '#b8923a',
    textColor: '#1e2923',
    typographyPreset: 'royal-script',
  },
};
