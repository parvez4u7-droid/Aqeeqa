export type MediaKind = 'image' | 'audio' | 'video';

export interface MediaAttachmentRef {
  attachmentId: string;
  url: string;
  storagePath?: string;
  originalName?: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface CeremonyEventItem {
  id: string;
  title: string;
  date: string;
  hijriDate?: string;
  time: string;
  venue: string;
  address: string;
  description: string;
  googleMapsUrl: string;
  photo?: MediaAttachmentRef | null;
}

export interface GalleryPhotoItem {
  id: string;
  attachmentId: string;
  url: string;
  caption?: string;
  category?: 'baby' | 'family' | 'celebration';
  order: number;
}

export interface ContactPerson {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface ThemeSettings {
  preset: 'emerald-ivory' | 'midnight-emerald' | 'champagne-cream' | 'royal-ivory-gold';
  canvasBg: string;
  cardBg: string;
  primaryAccent: string;
  goldAccent: string;
  textColor: string;
  typographyPreset: 'royal-script' | 'mughal-classic' | 'modern-editorial';
}

export interface BackgroundSettings {
  mode: 'gradient' | 'image' | 'video';
  image: MediaAttachmentRef | null;
  video: MediaAttachmentRef | null;
  fallbackImage: MediaAttachmentRef | null;
  position: 'center' | 'top' | 'bottom';
  overlayOpacity: number;
  particlesEnabled: boolean;
  shimmerEnabled: boolean;
}

export interface MusicSettings {
  enabled: boolean;
  trackTitle: string;
  audio: MediaAttachmentRef | null;
}

export interface AqeeqaInvitationData {
  id: string;
  slug: string;
  isDefault: boolean;
  isPublished: boolean;
  updatedAt: string;

  brandTitle: string;
  occasionTitle: string;
  bismillahArabic: string;
  openingSubtitle: string;
  openingInvitationLine: string;

  quranVerseArabic: string;
  quranVerseTranslation: string;

  childName: string;
  grandfatherName: string;
  fatherName: string;
  familySubtitle: string;

  invitationLead: string;
  invitationMessage: string;
  invitationClosingLine: string;

  aqeeqaDate: string;
  aqeeqaDay: string;
  aqeeqaTime: string;
  hijriDate: string;
  targetDateTime: string;
  postEventMessage: string;

  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;

  babyPhoto: MediaAttachmentRef | null;
  babyPhotoCaption: string;
  familyPhoto: MediaAttachmentRef | null;
  familyPhotoCaption: string;
  envelopeCoverImage: MediaAttachmentRef | null;

  events: CeremonyEventItem[];
  gallery: GalleryPhotoItem[];
  contacts: ContactPerson[];

  closingDuaArabic: string;
  closingDuaTranslation: string;
  closingWishes: string;
  giftPolicyPrimary: string;
  giftPolicySecondary: string;
  footerCompliments: string;

  music: MusicSettings;
  background: BackgroundSettings;
  theme: ThemeSettings;
}

export interface RsvpSubmission {
  id: string;
  invitationId: string;
  guestName: string;
  guestPhone: string;
  guestsCount: number;
  status: 'attending' | 'declined';
  blessingMessage: string;
  createdAt: string;
}

// Legacy alias kept for seamless module compatibility
export type WeddingInvitationData = AqeeqaInvitationData;
export type WeddingEventItem = CeremonyEventItem;
