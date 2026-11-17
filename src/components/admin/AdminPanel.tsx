import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Eye,
  Globe,
  ImagePlus,
  Loader2,
  LogOut,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { THEME_PRESETS } from '../../data/defaultInvitation';
import {
  adminLogout,
  createAdminInvitation,
  deleteAdminInvitation,
  listAdminInvitations,
  listInvitationRsvps,
  publishAdminInvitation,
  saveAdminInvitation,
  setDefaultAdminInvitation,
  updateAdminCredentials,
  uploadMediaFile,
} from '../../lib/api';
import {
  AqeeqaInvitationData,
  CeremonyEventItem,
  ContactPerson,
  GalleryPhotoItem,
  RsvpSubmission,
  ThemeSettings,
} from '../../types/wedding';
import { InvitationView } from '../invitation/InvitationView';
import { MediaUploaderField } from './MediaUploaderField';

type AdminTab =
  | 'family'
  | 'ceremony'
  | 'events'
  | 'gallery'
  | 'media'
  | 'theme'
  | 'rsvps';

interface AdminPanelProps {
  adminUser: { id: string; email: string; name: string };
  onLoggedOut: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminUser,
  onLoggedOut,
}) => {
  const [invitations, setInvitations] = useState<AqeeqaInvitationData[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [draft, setDraft] = useState<AqeeqaInvitationData | null>(null);
  const [rsvps, setRsvps] = useState<RsvpSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('family');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newFatherName, setNewFatherName] = useState('');
  const [newGrandfatherName, setNewGrandfatherName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Admin password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [adminEmailEdit, setAdminEmailEdit] = useState(adminUser.email);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const notify = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await listAdminInvitations();
        if (!mounted) return;
        setInvitations(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
          setDraft(structuredClone(list[0]));
        }
      } catch (err) {
        notify('error', err instanceof Error ? err.message : 'Failed to load invitations.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const found = invitations.find((i) => i.id === selectedId);
    if (found) {
      setDraft(structuredClone(found));
    }
    listInvitationRsvps(selectedId)
      .then(setRsvps)
      .catch(() => setRsvps([]));
  }, [selectedId, invitations]);

  const handleSaveDraft = async (): Promise<AqeeqaInvitationData | null> => {
    if (!draft) return null;
    setSaving(true);
    try {
      const saved = await saveAdminInvitation(draft.id, draft);
      setInvitations((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
      setDraft(structuredClone(saved));
      notify('success', 'Changes saved to database.');
      return saved;
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save changes.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!draft) return;
    setPublishing(true);
    try {
      const saved = await saveAdminInvitation(draft.id, draft);
      const updated = await publishAdminInvitation(saved.id, !saved.isPublished);
      setInvitations((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setDraft(structuredClone(updated));
      notify(
        'success',
        updated.isPublished
          ? `Published! Live at /i/${updated.slug}`
          : 'Invitation unpublished (moved to draft).'
      );
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Publish failed.');
    } finally {
      setPublishing(false);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim() || !newFatherName.trim()) return;
    try {
      const created = await createAdminInvitation({
        childName: newChildName.trim(),
        fatherName: newFatherName.trim(),
        grandfatherName: newGrandfatherName.trim() || undefined,
        slug: newSlug.trim() || undefined,
      });
      setInvitations((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setShowNewModal(false);
      setNewChildName('');
      setNewFatherName('');
      setNewGrandfatherName('');
      setNewSlug('');
      notify('success', `Created new Aqeeqa invitation (${created.slug}).`);
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Could not create invitation.');
    }
  };

  const handleSetDefault = async () => {
    if (!draft) return;
    try {
      const updatedList = await setDefaultAdminInvitation(draft.id);
      setInvitations(updatedList);
      notify('success', 'Set as default homepage invitation (/).');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to set default.');
    }
  };

  const handleDeleteInvitation = async () => {
    if (!draft || draft.isDefault) return;
    try {
      await deleteAdminInvitation(draft.id);
      const remaining = invitations.filter((i) => i.id !== draft.id);
      setInvitations(remaining);
      if (remaining[0]) setSelectedId(remaining[0].id);
      notify('success', 'Invitation deleted.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to delete invitation.');
    }
  };

  const handleGalleryMultiUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !draft) return;
    setGalleryUploading(true);
    try {
      const uploadedItems: GalleryPhotoItem[] = [];
      let nextOrder = draft.gallery.length;
      for (const file of Array.from(files)) {
        const ref = await uploadMediaFile(file, 'image');
        uploadedItems.push({
          id: `gal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          attachmentId: ref.attachmentId,
          url: ref.url,
          caption: file.name.replace(/\.[^.]+$/, ''),
          category: 'baby',
          order: nextOrder++,
        });
      }
      setDraft((prev) =>
        prev ? { ...prev, gallery: [...prev.gallery, ...uploadedItems] } : prev
      );
      notify('success', `Uploaded ${uploadedItems.length} photo(s). Click Save to persist.`);
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Gallery upload failed.');
    } finally {
      setGalleryUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const moveGalleryItem = (index: number, direction: -1 | 1) => {
    if (!draft) return;
    const target = index + direction;
    if (target < 0 || target >= draft.gallery.length) return;
    const next = [...draft.gallery];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setDraft({
      ...draft,
      gallery: next.map((item, idx) => ({ ...item, order: idx })),
    });
  };

  const addEvent = () => {
    if (!draft) return;
    const ev: CeremonyEventItem = {
      id: `event-${Date.now()}`,
      title: 'Dua & Family Dinner',
      date: `${draft.aqeeqaDay}, ${draft.aqeeqaDate}`,
      hijriDate: draft.hijriDate,
      time: draft.aqeeqaTime,
      venue: draft.venueName,
      address: draft.venueAddress,
      description: 'Joyous family gathering and prayers for the blessed child.',
      googleMapsUrl: draft.googleMapsUrl,
      photo: null,
    };
    setDraft({ ...draft, events: [...draft.events, ev] });
  };

  const addContact = () => {
    if (!draft) return;
    const c: ContactPerson = {
      id: `contact-${Date.now()}`,
      name: 'Family Host',
      relation: 'Family Member',
      phone: '0000000000',
    };
    setDraft({ ...draft, contacts: [...draft.contacts, c] });
  };

  const shareUrl = draft ? `${window.location.origin}/i/${draft.slug}` : '';

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAdminCredentials({
        currentPassword: currentPw,
        newPassword: newPw || undefined,
        email: adminEmailEdit,
      });
      setCurrentPw('');
      setNewPw('');
      notify('success', 'Administrator credentials updated.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to update credentials.');
    }
  };

  if (loading || !draft) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="flex items-center gap-2 text-stone-700 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading Royal Aqeeqa Studio...</span>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'family', label: 'Child & Family' },
    { id: 'ceremony', label: 'Date, Venue & Contacts' },
    { id: 'events', label: `Ceremony Events (${draft.events.length})` },
    { id: 'gallery', label: `Baby & Family Photos (${draft.gallery.length})` },
    { id: 'media', label: 'Music & Backdrop' },
    { id: 'theme', label: 'Theme & Fonts' },
    { id: 'rsvps', label: `Confirmations (${rsvps.length})` },
  ];

  // Format ISO targetDateTime cleanly for datetime-local input
  const localDatetimeInputValue = draft.targetDateTime.slice(0, 16);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col">
      {/* Clean Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-serif-display text-lg font-bold text-emerald-950 whitespace-nowrap shrink-0">
            Royal Aqeeqa Studio
          </span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            aria-label="Select invitation"
            className="max-w-[220px] px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-medium truncate"
          >
            {invitations.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.childName}
                {inv.isDefault ? ' (Default)' : ''}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>New Invitation</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="xl:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => void handleSaveDraft()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold whitespace-nowrap cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => void handleTogglePublish()}
            disabled={publishing}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white whitespace-nowrap cursor-pointer disabled:opacity-60 ${
              draft.isPublished
                ? 'bg-emerald-800 hover:bg-emerald-700'
                : 'bg-amber-700 hover:bg-amber-600'
            }`}
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {publishing
                ? 'Updating...'
                : draft.isPublished
                  ? 'Published'
                  : 'Publish Live'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              void adminLogout().then(onLoggedOut);
            }}
            title="Sign out"
            className="p-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Shareable URL & Toast Bar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500 font-medium">Shareable URL:</span>
          <a
            href={`/i/${draft.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-emerald-900 hover:underline font-medium"
          >
            /i/{draft.slug}
          </a>
          <button
            type="button"
            onClick={() => void copyShareUrl()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-stone-300 bg-stone-50 hover:bg-stone-100 text-[11px] font-medium cursor-pointer"
          >
            {copiedUrl ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
            <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
          </button>
          <span className="text-stone-400">·</span>
          <span className="text-stone-600">
            Status: <strong>{draft.isPublished ? 'Published (Public)' : 'Draft (Hidden)'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!draft.isDefault && (
            <>
              <button
                type="button"
                onClick={() => void handleSetDefault()}
                className="px-2.5 py-1 rounded border border-stone-300 text-xs font-medium hover:bg-stone-50 cursor-pointer"
              >
                Set as Homepage (/)
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteInvitation()}
                className="px-2.5 py-1 rounded border border-red-200 text-red-700 text-xs font-medium hover:bg-red-50 cursor-pointer"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {toast && (
        <div
          className={`mx-4 sm:mx-6 mt-3 px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Workspace Split: Editor Left + Live Preview Right on XL */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 p-2 bg-stone-50 border-b border-stone-200 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* TAB 1: CHILD & FAMILY */}
            {activeTab === 'family' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Child&apos;s Name
                    </label>
                    <input
                      type="text"
                      value={draft.childName}
                      onChange={(e) => setDraft({ ...draft, childName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Occasion Title
                    </label>
                    <input
                      type="text"
                      value={draft.occasionTitle}
                      onChange={(e) => setDraft({ ...draft, occasionTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Grandfather&apos;s Name
                    </label>
                    <input
                      type="text"
                      value={draft.grandfatherName}
                      onChange={(e) => setDraft({ ...draft, grandfatherName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Father&apos;s Name
                    </label>
                    <input
                      type="text"
                      value={draft.fatherName}
                      onChange={(e) => setDraft({ ...draft, fatherName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Brand Header Title
                    </label>
                    <input
                      type="text"
                      value={draft.brandTitle}
                      onChange={(e) => setDraft({ ...draft, brandTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Shareable URL Slug
                    </label>
                    <input
                      type="text"
                      value={draft.slug}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Invitation Message
                  </label>
                  <textarea
                    rows={2}
                    value={draft.invitationMessage}
                    onChange={(e) => setDraft({ ...draft, invitationMessage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Warm Prayer / Closing Invitation Line
                  </label>
                  <textarea
                    rows={2}
                    value={draft.invitationClosingLine}
                    onChange={(e) =>
                      setDraft({ ...draft, invitationClosingLine: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                  />
                </div>

                <div className="pt-3 border-t border-stone-200 space-y-3">
                  <h3 className="text-sm font-bold text-stone-800">
                    Special Gift Policy &amp; Closing Messages
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Gift Policy Message (Hindi / Primary)
                      </label>
                      <input
                        type="text"
                        value={draft.giftPolicyPrimary}
                        onChange={(e) =>
                          setDraft({ ...draft, giftPolicyPrimary: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Gift Policy Message (Roman Urdu / Secondary)
                      </label>
                      <input
                        type="text"
                        value={draft.giftPolicySecondary}
                        onChange={(e) =>
                          setDraft({ ...draft, giftPolicySecondary: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Closing Wishes for Child
                      </label>
                      <input
                        type="text"
                        value={draft.closingWishes}
                        onChange={(e) => setDraft({ ...draft, closingWishes: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Family Sign-off Note
                      </label>
                      <input
                        type="text"
                        value={draft.footerCompliments}
                        onChange={(e) =>
                          setDraft({ ...draft, footerCompliments: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <MediaUploaderField
                  label="Envelope Opening Cover Image"
                  kind="image"
                  accept="image/*"
                  value={draft.envelopeCoverImage}
                  onChange={(ref) => setDraft({ ...draft, envelopeCoverImage: ref })}
                  helperText="Background stationery artwork behind the golden seal"
                />
              </div>
            )}

            {/* TAB 2: DATE, VENUE & CONTACTS */}
            {activeTab === 'ceremony' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Aqeeqa Date
                    </label>
                    <input
                      type="text"
                      value={draft.aqeeqaDate}
                      onChange={(e) => setDraft({ ...draft, aqeeqaDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Day of Week
                    </label>
                    <input
                      type="text"
                      value={draft.aqeeqaDay}
                      onChange={(e) => setDraft({ ...draft, aqeeqaDay: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Ceremony Time
                    </label>
                    <input
                      type="text"
                      value={draft.aqeeqaTime}
                      onChange={(e) => setDraft({ ...draft, aqeeqaTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Hijri Date
                    </label>
                    <input
                      type="text"
                      value={draft.hijriDate}
                      onChange={(e) => setDraft({ ...draft, hijriDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Countdown Target Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      value={localDatetimeInputValue}
                      onChange={(e) =>
                        setDraft({ ...draft, targetDateTime: `${e.target.value}:00+05:30` })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Post-Event Celebration Message
                    </label>
                    <input
                      type="text"
                      value={draft.postEventMessage}
                      onChange={(e) => setDraft({ ...draft, postEventMessage: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <h3 className="text-sm font-bold text-stone-800">Ceremony Venue &amp; Location</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Venue Name
                      </label>
                      <input
                        type="text"
                        value={draft.venueName}
                        onChange={(e) => setDraft({ ...draft, venueName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Complete Address
                      </label>
                      <textarea
                        rows={2}
                        value={draft.venueAddress}
                        onChange={(e) => setDraft({ ...draft, venueAddress: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Google Maps Link
                      </label>
                      <input
                        type="url"
                        value={draft.googleMapsUrl}
                        onChange={(e) => setDraft({ ...draft, googleMapsUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-800">Contact Numbers</h3>
                    <button
                      type="button"
                      onClick={addContact}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-900 text-white text-xs font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Contact</span>
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {draft.contacts.map((c, idx) => (
                      <div key={c.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={c.name}
                          placeholder="Name"
                          onChange={(e) => {
                            const next = [...draft.contacts];
                            next[idx] = { ...c, name: e.target.value };
                            setDraft({ ...draft, contacts: next });
                          }}
                          className="sm:col-span-4 px-2.5 py-2 rounded-lg border border-stone-300 text-xs"
                        />
                        <input
                          type="text"
                          value={c.relation}
                          placeholder="Relation"
                          onChange={(e) => {
                            const next = [...draft.contacts];
                            next[idx] = { ...c, relation: e.target.value };
                            setDraft({ ...draft, contacts: next });
                          }}
                          className="sm:col-span-3 px-2.5 py-2 rounded-lg border border-stone-300 text-xs"
                        />
                        <input
                          type="text"
                          value={c.phone}
                          placeholder="Phone Number"
                          onChange={(e) => {
                            const next = [...draft.contacts];
                            next[idx] = { ...c, phone: e.target.value };
                            setDraft({ ...draft, contacts: next });
                          }}
                          className="sm:col-span-4 px-2.5 py-2 rounded-lg border border-stone-300 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              contacts: draft.contacts.filter((x) => x.id !== c.id),
                            })
                          }
                          className="sm:col-span-1 p-2 rounded-lg border border-stone-300 text-red-700 hover:bg-red-50 flex justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CEREMONY EVENTS */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-800">Aqeeqa Ceremony Program</h3>
                    <p className="text-xs text-stone-500">
                      Manage ceremony gatherings, Dua timings, dinner details, and event photos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addEvent}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Event</span>
                  </button>
                </div>

                {draft.events.map((ev, idx) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        Ceremony {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            events: draft.events.filter((x) => x.id !== ev.id),
                          })
                        }
                        className="inline-flex items-center gap-1 text-xs text-red-700 hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Title"
                        value={ev.title}
                        onChange={(e) => {
                          const next = [...draft.events];
                          next[idx] = { ...ev, title: e.target.value };
                          setDraft({ ...draft, events: next });
                        }}
                        className="px-3 py-2 rounded-lg bg-white border border-stone-300 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Date"
                        value={ev.date}
                        onChange={(e) => {
                          const next = [...draft.events];
                          next[idx] = { ...ev, date: e.target.value };
                          setDraft({ ...draft, events: next });
                        }}
                        className="px-3 py-2 rounded-lg bg-white border border-stone-300 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Time"
                        value={ev.time}
                        onChange={(e) => {
                          const next = [...draft.events];
                          next[idx] = { ...ev, time: e.target.value };
                          setDraft({ ...draft, events: next });
                        }}
                        className="px-3 py-2 rounded-lg bg-white border border-stone-300 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Hijri Date (Optional)"
                        value={ev.hijriDate || ''}
                        onChange={(e) => {
                          const next = [...draft.events];
                          next[idx] = { ...ev, hijriDate: e.target.value };
                          setDraft({ ...draft, events: next });
                        }}
                        className="px-3 py-2 rounded-lg bg-white border border-stone-300 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Venue"
                        value={ev.venue}
                        onChange={(e) => {
                          const next = [...draft.events];
                          next[idx] = { ...ev, venue: e.target.value };
                          setDraft({ ...draft, events: next });
                        }}
                        className="px-3 py-2 rounded-lg bg-white border border-stone-300 text-sm"
                      />
                      <input
                        type="url"
                        placeholder="Google Maps URL"
                        value={ev.googleMapsUrl}
                        onChange={(e) => {
                          const next = [...draft.events];
                          next[idx] = { ...ev, googleMapsUrl: e.target.value };
                          setDraft({ ...draft, events: next });
                        }}
                        className="px-3 py-2 rounded-lg bg-white border border-stone-300 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={ev.address}
                        onChange={(e) => {
                          const next = [...draft.events];
                          next[idx] = { ...ev, address: e.target.value };
                          setDraft({ ...draft, events: next });
                        }}
                        className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-stone-300 text-sm"
                      />
                      <textarea
                        rows={2}
                        placeholder="Description"
                        value={ev.description}
                        onChange={(e) => {
                          const next = [...draft.events];
                          next[idx] = { ...ev, description: e.target.value };
                          setDraft({ ...draft, events: next });
                        }}
                        className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-stone-300 text-sm"
                      />
                    </div>

                    <MediaUploaderField
                      label="Ceremony Photograph (Optional)"
                      kind="image"
                      accept="image/*"
                      value={ev.photo || null}
                      onChange={(ref) => {
                        const next = [...draft.events];
                        next[idx] = { ...ev, photo: ref };
                        setDraft({ ...draft, events: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: BABY & FAMILY GALLERY */}
            {activeTab === 'gallery' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <MediaUploaderField
                      label="Baby Photograph"
                      kind="image"
                      accept="image/*"
                      value={draft.babyPhoto}
                      onChange={(ref) => setDraft({ ...draft, babyPhoto: ref })}
                      helperText="Featured first in the Baby & Family Gallery"
                    />
                    <input
                      type="text"
                      value={draft.babyPhotoCaption}
                      onChange={(e) => setDraft({ ...draft, babyPhotoCaption: e.target.value })}
                      placeholder="Baby photo caption"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <MediaUploaderField
                      label="Family Photograph"
                      kind="image"
                      accept="image/*"
                      value={draft.familyPhoto}
                      onChange={(ref) => setDraft({ ...draft, familyPhoto: ref })}
                      helperText="Featured family celebration photo"
                    />
                    <input
                      type="text"
                      value={draft.familyPhotoCaption}
                      onChange={(e) => setDraft({ ...draft, familyPhotoCaption: e.target.value })}
                      placeholder="Family photo caption"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-800">Additional Gallery Photographs</h3>
                    <p className="text-xs text-stone-500">
                      Upload multiple photos of the baby, family, and venue, then reorder or edit captions.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={galleryUploading}
                    onClick={() => galleryInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
                  >
                    {galleryUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="w-3.5 h-3.5" />
                    )}
                    <span>{galleryUploading ? 'Uploading...' : 'Upload Gallery Photos'}</span>
                  </button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => void handleGalleryMultiUpload(e.target.files)}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2.5">
                  {draft.gallery.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    >
                      <img
                        src={item.url}
                        alt={item.caption || 'Gallery item'}
                        referrerPolicy="no-referrer"
                        className="w-16 h-12 rounded-lg object-cover shrink-0 bg-stone-200"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <input
                          type="text"
                          value={item.caption || ''}
                          placeholder="Photo caption"
                          onChange={(e) => {
                            const next = [...draft.gallery];
                            next[idx] = { ...item, caption: e.target.value };
                            setDraft({ ...draft, gallery: next });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs"
                        />
                        <p className="text-[10px] text-stone-500 font-mono truncate">
                          Ref: {item.attachmentId}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveGalleryItem(idx, -1)}
                          title="Move up"
                          className="p-1.5 rounded-lg border border-stone-300 bg-white disabled:opacity-40 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === draft.gallery.length - 1}
                          onClick={() => moveGalleryItem(idx, 1)}
                          title="Move down"
                          className="p-1.5 rounded-lg border border-stone-300 bg-white disabled:opacity-40 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              gallery: draft.gallery
                                .filter((x) => x.id !== item.id)
                                .map((g, i) => ({ ...g, order: i })),
                            })
                          }
                          title="Remove photo"
                          className="p-1.5 rounded-lg border border-stone-300 bg-white text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: MUSIC & BACKGROUND */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-800">Background Music (MP3)</h3>
                    <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.music.enabled}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            music: { ...draft.music, enabled: e.target.checked },
                          })
                        }
                        className="rounded border-stone-300"
                      />
                      <span>Enable Music Player</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Track Title
                    </label>
                    <input
                      type="text"
                      value={draft.music.trackTitle}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          music: { ...draft.music, trackTitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                    />
                  </div>

                  <MediaUploaderField
                    label="MP3 / Audio Track"
                    kind="audio"
                    accept="audio/*"
                    value={draft.music.audio}
                    onChange={(ref) =>
                      setDraft({
                        ...draft,
                        music: {
                          ...draft.music,
                          audio: ref,
                          enabled: ref ? true : draft.music.enabled,
                          trackTitle: ref?.originalName || draft.music.trackTitle,
                        },
                      })
                    }
                    helperText="Persisted permanently on server and verified with attachmentId"
                  />
                </div>

                <div className="pt-5 border-t border-stone-200 space-y-4">
                  <h3 className="text-sm font-bold text-stone-800">
                    Ambient Background Image &amp; Video
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    {(['gradient', 'image', 'video'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            background: { ...draft.background, mode },
                          })
                        }
                        className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border cursor-pointer ${
                          draft.background.mode === mode
                            ? 'bg-emerald-900 text-white border-emerald-900'
                            : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <MediaUploaderField
                    label="Custom Background Image"
                    kind="image"
                    accept="image/*"
                    value={draft.background.image}
                    onChange={(ref) =>
                      setDraft({
                        ...draft,
                        background: {
                          ...draft.background,
                          image: ref,
                          fallbackImage: ref || draft.background.fallbackImage,
                        },
                      })
                    }
                  />

                  <MediaUploaderField
                    label="Custom Background Video (MP4 / WebM)"
                    kind="video"
                    accept="video/*"
                    value={draft.background.video}
                    onChange={(ref) =>
                      setDraft({
                        ...draft,
                        background: { ...draft.background, video: ref },
                      })
                    }
                    helperText="Plays muted inline on mobile with automatic fallback image"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Background Positioning
                      </label>
                      <select
                        value={draft.background.position}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            background: {
                              ...draft.background,
                              position: e.target.value as 'center' | 'top' | 'bottom',
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Overlay Scrim Opacity ({Math.round(draft.background.overlayOpacity * 100)}%)
                      </label>
                      <input
                        type="range"
                        min="0.15"
                        max="0.92"
                        step="0.02"
                        value={draft.background.overlayOpacity}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            background: {
                              ...draft.background,
                              overlayOpacity: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.background.particlesEnabled}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            background: {
                              ...draft.background,
                              particlesEnabled: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Floating Jasmine Petals &amp; Golden Particles</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.background.shimmerEnabled}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            background: {
                              ...draft.background,
                              shimmerEnabled: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Soft Golden Shimmer Sweep</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: THEME & TYPOGRAPHY */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 mb-2">Theme Presets</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(Object.keys(THEME_PRESETS) as Array<ThemeSettings['preset']>).map(
                      (presetKey) => {
                        const preset = THEME_PRESETS[presetKey];
                        const active = draft.theme.preset === presetKey;
                        return (
                          <button
                            key={presetKey}
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                theme: {
                                  ...draft.theme,
                                  preset: presetKey,
                                  canvasBg: preset.canvasBg,
                                  cardBg: preset.cardBg,
                                  primaryAccent: preset.primaryAccent,
                                  goldAccent: preset.goldAccent,
                                  textColor: preset.textColor,
                                },
                              })
                            }
                            className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 cursor-pointer ${
                              active
                                ? 'border-emerald-800 bg-emerald-50/70'
                                : 'border-stone-200 bg-white hover:bg-stone-50'
                            }`}
                          >
                            <span className="text-xs font-semibold">{preset.label}</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <span
                                className="w-4 h-4 rounded-full border border-black/15"
                                style={{ backgroundColor: preset.primaryAccent }}
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-black/15"
                                style={{ backgroundColor: preset.goldAccent }}
                              />
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(
                    [
                      ['primaryAccent', 'Emerald Accent'],
                      ['goldAccent', 'Champagne Gold'],
                      ['cardBg', 'Card Ivory'],
                      ['canvasBg', 'Backdrop'],
                      ['textColor', 'Body Text'],
                    ] as const
                  ).map(([field, label]) => (
                    <label
                      key={field}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-stone-200 bg-stone-50 text-xs font-medium cursor-pointer"
                    >
                      <span>{label}</span>
                      <input
                        type="color"
                        value={draft.theme[field]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            theme: { ...draft.theme, [field]: e.target.value },
                          })
                        }
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Typography Pairing
                  </label>
                  <select
                    value={draft.theme.typographyPreset}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        theme: {
                          ...draft.theme,
                          typographyPreset: e.target.value as ThemeSettings['typographyPreset'],
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                  >
                    <option value="royal-script">Royal Calligraphy Script + Cormorant Garamond</option>
                    <option value="mughal-classic">Mughal Classic Italic Serif</option>
                    <option value="modern-editorial">Modern Editorial Serif + Clean Sans</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 7: GUEST CONFIRMATIONS & ADMIN SECURITY */}
            {activeTab === 'rsvps' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 mb-2">
                    Guest Confirmations &amp; Duas ({rsvps.length})
                  </h3>
                  {rsvps.length === 0 ? (
                    <p className="text-xs text-stone-500 p-4 rounded-xl bg-stone-50 border border-stone-200">
                      No guest confirmations or Duas submitted yet for this invitation.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {rsvps.map((r) => (
                        <div
                          key={r.id}
                          className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-stone-900">{r.guestName}</span>
                            <span className="text-stone-600">
                              {r.status === 'attending'
                                ? `Attending (${r.guestsCount})`
                                : 'Sent Duas'}
                            </span>
                          </div>
                          {r.blessingMessage && (
                            <p className="text-xs italic text-stone-700">
                              &ldquo;{r.blessingMessage}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => void handleCredentialsSubmit(e)}
                  className="pt-5 border-t border-stone-200 space-y-3"
                >
                  <h3 className="text-sm font-bold text-stone-800">
                    Administrator Security Credentials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="email"
                      value={adminEmailEdit}
                      onChange={(e) => setAdminEmailEdit(e.target.value)}
                      placeholder="Admin email"
                      className="px-3 py-2 rounded-lg border border-stone-300 text-xs"
                    />
                    <input
                      type="password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="Current password"
                      required
                      className="px-3 py-2 rounded-lg border border-stone-300 text-xs"
                    />
                    <input
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="New password (optional)"
                      className="px-3 py-2 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    Update Credentials
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Live Desktop Preview Column */}
        <div className="hidden xl:block xl:col-span-5 sticky top-24">
          <div className="rounded-3xl border border-stone-300 bg-stone-900 overflow-hidden shadow-xl max-h-[82vh] overflow-y-auto no-scrollbar">
            <div className="px-4 py-2.5 bg-stone-800 text-stone-200 text-xs font-medium flex items-center justify-between">
              <span>Live Aqeeqa Invitation Preview</span>
              <a
                href={`/i/${draft.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 hover:underline"
              >
                Open Public Page ↗
              </a>
            </div>
            <InvitationView data={draft} isPreview />
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          <div className="p-3 bg-stone-900 text-white flex items-center justify-between">
            <span className="text-xs font-semibold">Live Aqeeqa Invitation Preview</span>
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="px-3 py-1 rounded-lg bg-white/15 text-xs font-medium cursor-pointer"
            >
              Close Preview
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <InvitationView data={draft} isPreview />
          </div>
        </div>
      )}

      {/* Create New Aqeeqa Invitation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={(e) => void handleCreateInvitation(e)}
            className="w-full max-w-md rounded-2xl bg-white p-6 space-y-4 shadow-2xl"
          >
            <h2 className="font-serif-display text-xl font-bold">
              Create New Aqeeqa Invitation
            </h2>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Child&apos;s Name
              </label>
              <input
                type="text"
                required
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="e.g., Syed Zayd Ali"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Father&apos;s Name
              </label>
              <input
                type="text"
                required
                value={newFatherName}
                onChange={(e) => setNewFatherName(e.target.value)}
                placeholder="e.g., Syed Imran Ali"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Grandfather&apos;s Name (Optional)
              </label>
              <input
                type="text"
                value={newGrandfatherName}
                onChange={(e) => setNewGrandfatherName(e.target.value)}
                placeholder="e.g., Syed Yusuf Ali"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Custom Shareable URL Slug (Optional)
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) =>
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                }
                placeholder="syed-zayd-aqeeqa"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-lg border border-stone-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
              >
                Create Invitation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
