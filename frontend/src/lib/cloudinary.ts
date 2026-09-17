import { API_URL } from '@/lib/api';

type AvatarUploadResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: 'buyer' | 'seller';
    isTwoFactorEnabled: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();

  formData.append('avatar', file);

  const response = await fetch(`${API_URL}/api/users/me/avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data: AvatarUploadResponse | { message?: string } =
    await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload avatar');
  }

  if (!('user' in data) || !data.user.avatarUrl) {
    throw new Error('Avatar URL was not returned');
  }

  return data.user.avatarUrl;
}
