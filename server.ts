import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_INVITATION } from './src/data/defaultInvitation';
import {
  createSession,
  db,
  getAdminBySessionToken,
  getPublicDefaultInvitation,
  getPublicInvitationBySlug,
  hashPassword,
  listAllInvitations,
  listRsvpsForInvitation,
  registerMediaAttachment,
  rowToInvitation,
  UPLOADS_DIR,
  validateInvitationPayload,
  verifyPassword,
} from './src/server/db';
import { MediaKind, WeddingInvitationData } from './src/types/wedding';

interface AuthedRequest extends Request {
  adminUser?: { id: string; email: string; name: string };
  sessionToken?: string;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      result[key] = decodeURIComponent(val);
    }
  }
  return result;
}

function extractSessionToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies['wedding_admin_session'];
}

function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractSessionToken(req);
  const admin = getAdminBySessionToken(token);
  if (!admin) {
    res.status(401).json({ error: 'Administrator authentication is required.' });
    return;
  }
  req.adminUser = admin;
  req.sessionToken = token;
  next();
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .slice(0, 40);
    cb(null, `${crypto.randomUUID()}-${safeBase || 'media'}${ext}`);
  },
});

const ALLOWED_MIME_PREFIXES = ['image/', 'audio/', 'video/'];

const upload = multer({
  storage,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60 MB max for video/audio/high-res photos
  },
  fileFilter: (_req, file, cb) => {
    const ok = ALLOWED_MIME_PREFIXES.some((prefix) => file.mimetype.startsWith(prefix));
    if (!ok) {
      cb(new Error(`Unsupported file type (${file.mimetype}). Please upload an image, audio, or video file.`));
      return;
    }
    cb(null, true);
  },
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '4mb' }));

  // Serve uploaded persistent media files
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      maxAge: '7d',
      acceptRanges: true,
    })
  );

  // --- Auth Routes ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db
      .prepare('SELECT id, email, name, password_hash FROM admin_users WHERE email = ?')
      .get(email) as
      | { id: string; email: string; name: string; password_hash: string }
      | undefined;

    if (!user || !verifyPassword(password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid administrator email or password.' });
      return;
    }

    const session = createSession(user.id);
    res.setHeader(
      'Set-Cookie',
      `wedding_admin_session=${encodeURIComponent(session.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`
    );
    res.json({
      token: session.token,
      expiresAt: session.expiresAt,
      user: { id: user.id, email: user.email, name: user.name },
    });
  });

  app.post('/api/auth/logout', (req: AuthedRequest, res: Response) => {
    const token = extractSessionToken(req);
    if (token) {
      db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    }
    res.setHeader(
      'Set-Cookie',
      'wedding_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    );
    res.json({ ok: true });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const token = extractSessionToken(req);
    const admin = getAdminBySessionToken(token);
    if (!admin) {
      res.status(401).json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, user: admin });
  });

  app.post('/api/auth/update-credentials', requireAdmin, (req: AuthedRequest, res: Response) => {
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    const newEmail = String(req.body?.email || '').trim().toLowerCase();
    const newName = String(req.body?.name || '').trim();

    if (!currentPassword) {
      res.status(400).json({ error: 'Current password is required.' });
      return;
    }

    const userRow = db
      .prepare('SELECT id, email, name, password_hash FROM admin_users WHERE id = ?')
      .get(req.adminUser!.id) as
      | { id: string; email: string; name: string; password_hash: string }
      | undefined;

    if (!userRow || !verifyPassword(currentPassword, userRow.password_hash)) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }

    const nextEmail = newEmail || userRow.email;
    const nextName = newName || userRow.name;
    const nextHash = newPassword
      ? newPassword.length >= 6
        ? hashPassword(newPassword)
        : null
      : userRow.password_hash;

    if (!nextHash) {
      res.status(400).json({ error: 'New password must be at least 6 characters.' });
      return;
    }

    db.prepare(
      'UPDATE admin_users SET email = ?, name = ?, password_hash = ? WHERE id = ?'
    ).run(nextEmail, nextName, nextHash, userRow.id);

    res.json({ ok: true, user: { id: userRow.id, email: nextEmail, name: nextName } });
  });

  // --- Persistent Media Upload Endpoint ---
  app.post('/api/media/upload', requireAdmin, (req: AuthedRequest, res: Response) => {
    upload.single('file')(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : 'File upload failed.';
        res.status(400).json({ error: message });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file received. Please select a file to upload.' });
        return;
      }

      const rawKind = String(req.body?.kind || '').toLowerCase();
      let kind: MediaKind = 'image';
      if (rawKind === 'audio' || req.file.mimetype.startsWith('audio/')) {
        kind = 'audio';
      } else if (rawKind === 'video' || req.file.mimetype.startsWith('video/')) {
        kind = 'video';
      }

      const storagePath = `data/uploads/${req.file.filename}`;
      const url = `/uploads/${req.file.filename}`;

      try {
        const attachmentRef = registerMediaAttachment({
          kind,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          storagePath,
          url,
        });

        if (!attachmentRef.attachmentId || !attachmentRef.url) {
          res.status(500).json({
            error: 'Upload verification failed: missing attachmentId or file reference.',
          });
          return;
        }

        res.status(201).json({
          ...attachmentRef,
          kind,
        });
      } catch (dbErr) {
        console.error('Failed to register uploaded media:', dbErr);
        res.status(500).json({
          error: 'Failed to persist uploaded media reference to database.',
        });
      }
    });
  });

  // --- Public Invitation Endpoints (No Login Required) ---
  app.get('/api/public/invitation', (_req: Request, res: Response) => {
    const inv = getPublicDefaultInvitation();
    if (!inv) {
      res.status(404).json({
        status: 'unpublished',
        error: 'No published Aqeeqa invitation is currently available.',
      });
      return;
    }
    res.json({ status: 'ok', invitation: inv });
  });

  app.get('/api/public/invitation/:slug', (req: Request, res: Response) => {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const result = getPublicInvitationBySlug(slug);
    if (result.status === 'not_found') {
      res.status(404).json({ status: 'not_found', error: 'Invitation not found.' });
      return;
    }
    if (result.status === 'unpublished') {
      res.status(403).json({
        status: 'unpublished',
        error: 'This Aqeeqa invitation is currently in draft mode and not yet published.',
      });
      return;
    }
    res.json({ status: 'ok', invitation: result.invitation });
  });

  app.post('/api/public/invitation/:slug/rsvp', (req: Request, res: Response) => {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const result = getPublicInvitationBySlug(slug);
    if (result.status !== 'ok' || !result.invitation) {
      res.status(404).json({ error: 'Published invitation not found.' });
      return;
    }

    const guestName = String(req.body?.guestName || '').trim();
    const guestPhone = String(req.body?.guestPhone || '').trim();
    const guestsCount = Math.min(Math.max(Number(req.body?.guestsCount) || 1, 1), 25);
    const status = req.body?.status === 'declined' ? 'declined' : 'attending';
    const blessingMessage = String(req.body?.blessingMessage || '').trim().slice(0, 600);

    if (!guestName) {
      res.status(400).json({ error: 'Please enter your name to submit your RSVP.' });
      return;
    }

    const id = `rsvp_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO rsvps
        (id, invitation_id, guest_name, guest_phone, guests_count, status, blessing_message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      result.invitation.id,
      guestName.slice(0, 120),
      guestPhone.slice(0, 40),
      guestsCount,
      status,
      blessingMessage,
      now
    );

    res.status(201).json({
      ok: true,
      rsvp: {
        id,
        invitationId: result.invitation.id,
        guestName,
        guestPhone,
        guestsCount,
        status,
        blessingMessage,
        createdAt: now,
      },
    });
  });

  // --- Admin Invitation CRUD & Publish Endpoints ---
  app.get('/api/admin/invitations', requireAdmin, (_req: AuthedRequest, res: Response) => {
    res.json({ invitations: listAllInvitations() });
  });

  app.get('/api/admin/invitations/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const row = db
      .prepare('SELECT * FROM invitations WHERE id = ?')
      .get(req.params.id) as
      | {
          id: string;
          slug: string;
          is_default: number;
          is_published: number;
          data_json: string;
          updated_at: string;
        }
      | undefined;

    if (!row) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }
    res.json({ invitation: rowToInvitation(row) });
  });

  app.post('/api/admin/invitations', requireAdmin, (req: AuthedRequest, res: Response) => {
    const childName = String(
      req.body?.childName || req.body?.brideName || 'Child Name'
    ).trim();
    const fatherName = String(
      req.body?.fatherName || req.body?.groomName || 'Father Name'
    ).trim();
    const grandfatherName = String(
      req.body?.grandfatherName || DEFAULT_INVITATION.grandfatherName
    ).trim();

    const rawSlug =
      String(req.body?.slug || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/g, '') ||
      `${childName}-aqeeqa`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') ||
      `aqeeqa-${Date.now()}`;

    let finalSlug = rawSlug;
    const existingSlug = db
      .prepare('SELECT id FROM invitations WHERE slug = ?')
      .get(finalSlug);
    if (existingSlug) {
      finalSlug = `${rawSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const id = `inv_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const newData: WeddingInvitationData = {
      ...DEFAULT_INVITATION,
      id,
      slug: finalSlug,
      isDefault: false,
      isPublished: false,
      updatedAt: now,
      childName,
      fatherName,
      grandfatherName,
    };

    db.prepare(
      `INSERT INTO invitations (id, slug, is_default, is_published, data_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, finalSlug, 0, 0, JSON.stringify(newData), now, now);

    res.status(201).json({ invitation: newData });
  });

  app.put('/api/admin/invitations/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const existing = db
      .prepare('SELECT * FROM invitations WHERE id = ?')
      .get(req.params.id) as
      | {
          id: string;
          slug: string;
          is_default: number;
          is_published: number;
          data_json: string;
          updated_at: string;
        }
      | undefined;

    if (!existing) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }

    const incoming = req.body?.invitation as WeddingInvitationData | undefined;
    if (!incoming) {
      res.status(400).json({ error: 'Invitation payload is required.' });
      return;
    }

    const normalizedSlug = String(incoming.slug || existing.slug)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '');

    const payload: WeddingInvitationData = {
      ...incoming,
      id: existing.id,
      slug: normalizedSlug,
      isDefault: Boolean(existing.is_default),
      isPublished: Boolean(existing.is_published),
    };

    const errors = validateInvitationPayload(payload, Boolean(existing.is_published));
    if (errors.length > 0) {
      res.status(400).json({
        error: errors[0],
        validationErrors: errors,
      });
      return;
    }

    const slugConflict = db
      .prepare('SELECT id FROM invitations WHERE slug = ? AND id != ?')
      .get(normalizedSlug, existing.id);
    if (slugConflict) {
      res.status(409).json({
        error: `Shareable URL slug "${normalizedSlug}" is already in use by another invitation.`,
      });
      return;
    }

    const now = new Date().toISOString();
    payload.updatedAt = now;

    db.prepare(
      `UPDATE invitations
       SET slug = ?, data_json = ?, updated_at = ?
       WHERE id = ?`
    ).run(normalizedSlug, JSON.stringify(payload), now, existing.id);

    res.json({ invitation: payload });
  });

  app.post('/api/admin/invitations/:id/publish', requireAdmin, (req: AuthedRequest, res: Response) => {
    const existing = db
      .prepare('SELECT * FROM invitations WHERE id = ?')
      .get(req.params.id) as
      | {
          id: string;
          slug: string;
          is_default: number;
          is_published: number;
          data_json: string;
          updated_at: string;
        }
      | undefined;

    if (!existing) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }

    const publish = req.body?.isPublished !== false;
    const currentData = rowToInvitation(existing);

    if (publish) {
      const errors = validateInvitationPayload(currentData, true);
      if (errors.length > 0) {
        res.status(400).json({
          error: errors[0],
          validationErrors: errors,
        });
        return;
      }
    }

    const now = new Date().toISOString();
    currentData.isPublished = publish;
    currentData.updatedAt = now;

    db.prepare(
      `UPDATE invitations
       SET is_published = ?, data_json = ?, updated_at = ?
       WHERE id = ?`
    ).run(publish ? 1 : 0, JSON.stringify(currentData), now, existing.id);

    res.json({ invitation: currentData });
  });

  app.post('/api/admin/invitations/:id/set-default', requireAdmin, (req: AuthedRequest, res: Response) => {
    const existing = db
      .prepare('SELECT id FROM invitations WHERE id = ?')
      .get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }

    db.prepare('UPDATE invitations SET is_default = 0').run();
    db.prepare('UPDATE invitations SET is_default = 1 WHERE id = ?').run(req.params.id);
    res.json({ ok: true, invitations: listAllInvitations() });
  });

  app.delete('/api/admin/invitations/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const existing = db
      .prepare('SELECT is_default FROM invitations WHERE id = ?')
      .get(req.params.id) as { is_default: number } | undefined;

    if (!existing) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }
    if (existing.is_default) {
      res.status(400).json({ error: 'Cannot delete the active default invitation.' });
      return;
    }
    db.prepare('DELETE FROM invitations WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  });

  app.get('/api/admin/invitations/:id/rsvps', requireAdmin, (req: AuthedRequest, res: Response) => {
    res.json({ rsvps: listRsvpsForInvitation(req.params.id) });
  });

  // Return clean JSON 404 for unknown /api routes
  app.all('/api/*splat', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Vite dev middleware or production static assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*splat', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Royal Aqeeqa Invitation server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
