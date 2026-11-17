import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DEFAULT_INVITATION, SEEDED_MEDIA_REFS } from '../data/defaultInvitation';
import {
  AqeeqaInvitationData,
  MediaAttachmentRef,
  MediaKind,
  RsvpSubmission,
} from '../types/wedding';

const DATA_DIR = path.resolve(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'wedding.db');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS media_attachments (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL DEFAULT 0,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 0,
    data_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rsvps (
    id TEXT PRIMARY KEY,
    invitation_id TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL DEFAULT '',
    guests_count INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL,
    blessing_message TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
  );
`);

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export function seedDatabase() {
  const now = new Date().toISOString();

  // Seed default admin account if none exists
  const adminCountRow = db
    .prepare('SELECT COUNT(*) as count FROM admin_users')
    .get() as { count: number };

  if (adminCountRow.count === 0) {
    const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@royalnikah.com').toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD || 'RoyalNikah2026';
    db.prepare(
      `INSERT INTO admin_users (id, email, name, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(
      'admin-primary',
      defaultEmail,
      'Invitation Administrator',
      hashPassword(defaultPassword),
      now
    );
  }

  // Register seeded Aqeeqa media attachments
  const insertMedia = db.prepare(
    `INSERT OR IGNORE INTO media_attachments
      (id, kind, original_name, mime_type, size_bytes, storage_path, url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const media of SEEDED_MEDIA_REFS) {
    insertMedia.run(
      media.id,
      media.kind,
      media.originalName,
      media.mimeType,
      media.sizeBytes,
      media.storagePath,
      media.url,
      now
    );
  }

  // Seed or migrate default-invitation to Royal Aqeeqa
  const defaultRow = db
    .prepare('SELECT id, slug, data_json FROM invitations WHERE id = ?')
    .get('default-invitation') as
    | { id: string; slug: string; data_json: string }
    | undefined;

  if (!defaultRow) {
    const seededData: AqeeqaInvitationData = {
      ...DEFAULT_INVITATION,
      updatedAt: now,
    };
    db.prepare(
      `INSERT INTO invitations (id, slug, is_default, is_published, data_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      seededData.id,
      seededData.slug,
      1,
      1,
      JSON.stringify(seededData),
      now,
      now
    );
  } else {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(defaultRow.data_json) as Record<string, unknown>;
    } catch {
      parsed = {};
    }

    // Migrate legacy or older Aqeeqa record in place while preserving row & RSVPs
    const parsedMusic = parsed.music as { audio?: { attachmentId?: string } } | undefined;
    const needsInitialAqeeqaMigration =
      defaultRow.slug === 'shaikh-anam-shaikh-nazim' || !parsed.childName;
    const parsedContacts = Array.isArray(parsed.contacts)
      ? (parsed.contacts as Array<{ id?: string; name?: string }>)
      : [];
    const needsBollywoodAudio =
      !parsedMusic?.audio || parsedMusic.audio.attachmentId === 'seed-arabic-oud-music';
    const needsJagirdarMusicUpdate =
      parsed.childName === 'Syed Aakif Yusuf Ali Jagirdar' ||
      parsed.fatherName === 'Syed Kashif Yusuf Ali Jagirdar' ||
      parsed.invitationMessage ===
        'cordially invite you and your family to grace the blessed occasion of the Aqeeqa ceremony of their beloved child,' ||
      parsedContacts.some(
        (c) => c.id === 'contact-2' && c.name !== DEFAULT_INVITATION.contacts[1].name
      ) ||
      needsBollywoodAudio;

    if (needsInitialAqeeqaMigration) {
      const migrated: AqeeqaInvitationData = {
        ...DEFAULT_INVITATION,
        updatedAt: now,
      };
      db.prepare(
        `UPDATE invitations
         SET slug = ?, is_default = 1, is_published = 1, data_json = ?, updated_at = ?
         WHERE id = 'default-invitation'`
      ).run(migrated.slug, JSON.stringify(migrated), now);
    } else if (needsJagirdarMusicUpdate) {
      const merged = {
        ...DEFAULT_INVITATION,
        ...(parsed as Partial<AqeeqaInvitationData>),
        childName:
          parsed.childName === 'Syed Aakif Yusuf Ali Jagirdar'
            ? DEFAULT_INVITATION.childName
            : (parsed.childName as string),
        fatherName:
          parsed.fatherName === 'Syed Kashif Yusuf Ali Jagirdar'
            ? DEFAULT_INVITATION.fatherName
            : (parsed.fatherName as string),
        invitationMessage:
          parsed.invitationMessage ===
          'cordially invite you and your family to grace the blessed occasion of the Aqeeqa ceremony of their beloved child,'
            ? DEFAULT_INVITATION.invitationMessage
            : (parsed.invitationMessage as string) || DEFAULT_INVITATION.invitationMessage,
        contacts: DEFAULT_INVITATION.contacts,
        closingWishes:
          typeof parsed.closingWishes === 'string' &&
          parsed.closingWishes.includes('Syed Aakif Yusuf Ali Jagirdar')
            ? DEFAULT_INVITATION.closingWishes
            : (parsed.closingWishes as string) || DEFAULT_INVITATION.closingWishes,
        footerCompliments:
          typeof parsed.footerCompliments === 'string' &&
          parsed.footerCompliments.includes('Syed Kashif Yusuf Ali Jagirdar')
            ? DEFAULT_INVITATION.footerCompliments
            : (parsed.footerCompliments as string) || DEFAULT_INVITATION.footerCompliments,
        music: needsBollywoodAudio
          ? DEFAULT_INVITATION.music
          : (parsed.music as AqeeqaInvitationData['music']),
        updatedAt: now,
      };
      db.prepare(
        `UPDATE invitations
         SET data_json = ?, updated_at = ?
         WHERE id = 'default-invitation'`
      ).run(JSON.stringify(merged), now);
    }
  }
}

seedDatabase();

export function createSession(userId: string): { token: string; expiresAt: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    `INSERT INTO admin_sessions (token, user_id, expires_at, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(token, userId, expiresAt, now.toISOString());
  return { token, expiresAt };
}

export function getAdminBySessionToken(
  token: string | undefined
): { id: string; email: string; name: string } | null {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.name, s.expires_at
       FROM admin_sessions s
       JOIN admin_users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token) as { id: string; email: string; name: string; expires_at: string } | undefined;

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    return null;
  }
  return { id: row.id, email: row.email, name: row.name };
}

export function registerMediaAttachment(input: {
  kind: MediaKind;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  url: string;
}): MediaAttachmentRef {
  const id = `att_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO media_attachments
      (id, kind, original_name, mime_type, size_bytes, storage_path, url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.kind,
    input.originalName,
    input.mimeType,
    input.sizeBytes,
    input.storagePath,
    input.url,
    now
  );

  return {
    attachmentId: id,
    url: input.url,
    storagePath: input.storagePath,
    originalName: input.originalName,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
  };
}

export function getMediaAttachmentById(attachmentId: string) {
  return db
    .prepare('SELECT * FROM media_attachments WHERE id = ?')
    .get(attachmentId) as
    | {
        id: string;
        kind: string;
        original_name: string;
        mime_type: string;
        size_bytes: number;
        storage_path: string;
        url: string;
      }
    | undefined;
}

function validateMediaRef(
  ref: MediaAttachmentRef | null | undefined,
  fieldLabel: string
): string | null {
  if (!ref) return null;
  if (!ref.attachmentId || typeof ref.attachmentId !== 'string' || !ref.attachmentId.trim()) {
    return `${fieldLabel}: attachmentId is required for every media attachment.`;
  }
  if (!ref.url || typeof ref.url !== 'string' || !ref.url.trim()) {
    return `${fieldLabel}: media upload response is missing its file URL reference.`;
  }
  if (ref.url.startsWith('blob:') || ref.url.startsWith('data:')) {
    return `${fieldLabel}: temporary browser blob/data URLs cannot be saved as permanent media.`;
  }
  const exists = getMediaAttachmentById(ref.attachmentId);
  if (!exists) {
    return `${fieldLabel}: referenced attachmentId (${ref.attachmentId}) does not exist in persistent media storage.`;
  }
  return null;
}

export function validateInvitationPayload(
  data: AqeeqaInvitationData,
  requirePublishReadiness = false
): string[] {
  const errors: string[] = [];

  if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Shareable URL slug must contain only lowercase letters, numbers, and hyphens.');
  }
  if (!data.childName?.trim()) {
    errors.push("Child's name is required.");
  }
  if (!data.fatherName?.trim()) {
    errors.push("Father's name is required.");
  }

  if (requirePublishReadiness) {
    if (!data.aqeeqaDate?.trim()) errors.push('Aqeeqa date is required before publishing.');
    if (!data.targetDateTime?.trim() || Number.isNaN(new Date(data.targetDateTime).getTime())) {
      errors.push('A valid countdown target date & time is required before publishing.');
    }
    if (!data.venueName?.trim()) {
      errors.push('Venue name is required before publishing.');
    }
    if (data.music?.enabled && !data.music.audio) {
      errors.push('Background music is enabled, but no audio track has been uploaded.');
    }
  }

  const babyErr = validateMediaRef(data.babyPhoto, 'Baby Photograph');
  if (babyErr) errors.push(babyErr);

  const familyErr = validateMediaRef(data.familyPhoto, 'Family Photograph');
  if (familyErr) errors.push(familyErr);

  const envelopeErr = validateMediaRef(data.envelopeCoverImage, 'Envelope Cover');
  if (envelopeErr) errors.push(envelopeErr);

  if (data.music?.audio) {
    const musicErr = validateMediaRef(data.music.audio, 'Background Music');
    if (musicErr) errors.push(musicErr);
  }

  if (data.background?.image) {
    const bgImgErr = validateMediaRef(data.background.image, 'Background Image');
    if (bgImgErr) errors.push(bgImgErr);
  }
  if (data.background?.video) {
    const bgVidErr = validateMediaRef(data.background.video, 'Background Video');
    if (bgVidErr) errors.push(bgVidErr);
  }
  if (data.background?.fallbackImage) {
    const bgFallErr = validateMediaRef(
      data.background.fallbackImage,
      'Background Fallback Image'
    );
    if (bgFallErr) errors.push(bgFallErr);
  }

  if (Array.isArray(data.gallery)) {
    data.gallery.forEach((item, idx) => {
      if (!item.attachmentId || !item.attachmentId.trim()) {
        errors.push(`Gallery Photo #${idx + 1}: attachmentId is required.`);
      } else if (!item.url || item.url.startsWith('blob:') || item.url.startsWith('data:')) {
        errors.push(`Gallery Photo #${idx + 1}: permanent uploaded file URL is required.`);
      } else if (!getMediaAttachmentById(item.attachmentId)) {
        errors.push(
          `Gallery Photo #${idx + 1}: attachmentId (${item.attachmentId}) was not found in persistent storage.`
        );
      }
    });
  }

  if (Array.isArray(data.events)) {
    data.events.forEach((ev, idx) => {
      if (!ev.title?.trim()) {
        errors.push(`Ceremony Event #${idx + 1}: title is required.`);
      }
      if (ev.photo) {
        const evPhotoErr = validateMediaRef(ev.photo, `Event "${ev.title || idx + 1}" Photo`);
        if (evPhotoErr) errors.push(evPhotoErr);
      }
    });
  }

  return errors;
}

export function rowToInvitation(row: {
  id: string;
  slug: string;
  is_default: number;
  is_published: number;
  data_json: string;
  updated_at: string;
}): AqeeqaInvitationData {
  const parsed = JSON.parse(row.data_json) as Partial<AqeeqaInvitationData>;
  return {
    ...DEFAULT_INVITATION,
    ...parsed,
    id: row.id,
    slug: row.slug,
    isDefault: Boolean(row.is_default),
    isPublished: Boolean(row.is_published),
    updatedAt: row.updated_at,
  };
}

export function listAllInvitations(): AqeeqaInvitationData[] {
  const rows = db
    .prepare('SELECT * FROM invitations ORDER BY is_default DESC, updated_at DESC')
    .all() as Array<{
    id: string;
    slug: string;
    is_default: number;
    is_published: number;
    data_json: string;
    updated_at: string;
  }>;
  return rows.map(rowToInvitation);
}

export function getPublicDefaultInvitation(): AqeeqaInvitationData | null {
  const row = db
    .prepare(
      `SELECT * FROM invitations
       WHERE is_default = 1 AND is_published = 1
       LIMIT 1`
    )
    .get() as
    | {
        id: string;
        slug: string;
        is_default: number;
        is_published: number;
        data_json: string;
        updated_at: string;
      }
    | undefined;

  if (row) return rowToInvitation(row);

  const anyPublished = db
    .prepare(
      `SELECT * FROM invitations
       WHERE is_published = 1
       ORDER BY updated_at DESC
       LIMIT 1`
    )
    .get() as
    | {
        id: string;
        slug: string;
        is_default: number;
        is_published: number;
        data_json: string;
        updated_at: string;
      }
    | undefined;

  return anyPublished ? rowToInvitation(anyPublished) : null;
}

export function getPublicInvitationBySlug(slug: string): {
  status: 'ok' | 'unpublished' | 'not_found';
  invitation?: AqeeqaInvitationData;
} {
  const row = db
    .prepare('SELECT * FROM invitations WHERE slug = ? LIMIT 1')
    .get(slug) as
    | {
        id: string;
        slug: string;
        is_default: number;
        is_published: number;
        data_json: string;
        updated_at: string;
      }
    | undefined;

  if (!row) return { status: 'not_found' };
  if (!row.is_published) return { status: 'unpublished' };
  return { status: 'ok', invitation: rowToInvitation(row) };
}

export function listRsvpsForInvitation(invitationId: string): RsvpSubmission[] {
  const rows = db
    .prepare(
      `SELECT id, invitation_id, guest_name, guest_phone, guests_count, status, blessing_message, created_at
       FROM rsvps
       WHERE invitation_id = ?
       ORDER BY created_at DESC`
    )
    .all(invitationId) as Array<{
    id: string;
    invitation_id: string;
    guest_name: string;
    guest_phone: string;
    guests_count: number;
    status: 'attending' | 'declined';
    blessing_message: string;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    invitationId: r.invitation_id,
    guestName: r.guest_name,
    guestPhone: r.guest_phone,
    guestsCount: r.guests_count,
    status: r.status,
    blessingMessage: r.blessing_message,
    createdAt: r.created_at,
  }));
}
