'use client';

import { useEffect, useState } from 'react';
import { uploadAvatar } from '@/lib/cloudinary';
import { getMyProfile, updateMyProfile } from '@/lib/api';
import Image from 'next/image';

type Profile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'buyer' | 'seller';
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar image must be smaller than 5 MB.');
      event.target.value = '';
      return;
    }

    setError('');
    setMessage('');
    setUploadingAvatar(true);

    try {
      const secureUrl = await uploadAvatar(file);

      setAvatarUrl(secureUrl);

      setProfile((currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              avatarUrl: secureUrl,
            }
          : currentProfile,
      );

      setMessage('Avatar uploaded successfully.');
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to upload avatar',
      );
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMyProfile();

        setProfile(data);
        setName(data.name);
        setAvatarUrl(data.avatarUrl ?? '');
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to load profile',
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage('');
    setError('');
    setSaving(true);

    try {
      const result = await updateMyProfile({
        name,
      });

      setProfile(result.user);
      setName(result.user.name);
      setAvatarUrl(result.user.avatarUrl ?? '');
      setMessage('Profile updated successfully.');
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to update profile',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#000080]" />
        <p className="text-sm font-medium text-slate-500">
          Loading your profile details...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-center text-rose-700 shadow-sm">
        <p className="text-sm font-semibold">{error || 'Profile not found.'}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alert Banners */}
      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs sm:text-sm font-medium text-emerald-800 shadow-sm transition-all animate-fadeIn">
          <svg
            className="h-5 w-5 shrink-0 text-emerald-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs sm:text-sm font-medium text-rose-700 shadow-sm transition-all animate-fadeIn">
          <svg
            className="h-5 w-5 shrink-0 text-rose-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Card 1: Avatar Upload & Status Overview */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Public Identity
        </h3>

        <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Graphic with Camera Overlay */}
          <div className="relative group shrink-0">
            <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-slate-100 shadow-inner bg-slate-100 flex items-center justify-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Profile preview"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-2xl font-bold uppercase text-slate-500">
                  {name ? name.slice(0, 2) : 'AU'}
                </span>
              )}

              {/* Uploading Spinner Overlay */}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>

            {/* Custom File Upload Label Trigger */}
            <label
              htmlFor="avatar"
              className={`absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#000080] text-white shadow-md transition-all hover:bg-[#000066] hover:scale-105 ${
                uploadingAvatar ? 'pointer-events-none opacity-50' : ''
              }`}
              title="Change avatar"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </label>

            {/* Native Input File (Invisible, triggered by label above) */}
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploadingAvatar}
              className="sr-only"
            />
          </div>

          {/* Quick Context & Meta */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <h4 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
              {name || 'Auction Member'}
            </h4>
            <p className="text-xs text-slate-500">
              Accepted formats: JPG, PNG, WEBP. Max file size: 5 MB.
            </p>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Role: <span className="capitalize">{profile.role}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                  profile.isTwoFactorEnabled
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                    : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${profile.isTwoFactorEnabled ? 'bg-emerald-600' : 'bg-amber-600'}`}
                />
                2FA: {profile.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Personal Details Form */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Account Information
        </h3>

        {/* Name Field */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Full Name
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Your full name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-[#000080] focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Email Field (Disabled) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Email Address
            </label>
            <span className="text-[11px] font-medium text-slate-400">
              Verified & Non-editable
            </span>
          </div>

          <div className="relative">
            <input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100/70 px-4 py-3 text-sm text-slate-500 outline-none shadow-none select-none"
            />
          </div>
        </div>
      </div>

      {/* Submit Action Area */}
      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={saving || uploadingAvatar}
          className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-[#000080] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#000080]/20 transition-all hover:bg-[#000066] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Saving Changes...</span>
            </>
          ) : uploadingAvatar ? (
            <span>Uploading Avatar...</span>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </form>
  );
}
