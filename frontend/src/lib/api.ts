import { startLoading, stopLoading } from '@/lib/loading';

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

async function fetchWithLoading(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  startLoading();

  try {
    const response = await fetch(input, init);
    return response;
  } finally {
    stopLoading();
  }
}

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

export async function getCurrentUser() {
  const response = await fetchWithLoading(`${API_URL}/api/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.user;
}

export async function setupTwoFactor() {
  const response = await fetchWithLoading(`${API_URL}/api/auth/2fa/setup`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to setup two-factor authentication',
    );
  }

  return data;
}

export async function verifyTwoFactor(code: string) {
  const response = await fetchWithLoading(`${API_URL}/api/auth/2fa/verify`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to verify two-factor authentication',
    );
  }

  return data;
}

export async function verifyTwoFactorLogin(code: string) {
  const response = await fetchWithLoading(`${API_URL}/api/auth/2fa/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Two-factor authentication failed');
  }

  return data;
}

export async function getMyProfile() {
  const response = await fetchWithLoading(`${API_URL}/api/users/me`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch profile');
  }

  return data.user;
}

export async function updateMyProfile(data: {
  name?: string;
  avatarUrl?: string | null;
}) {
  const response = await fetchWithLoading(`${API_URL}/api/users/me`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to update profile');
  }

  return responseData;
}

export async function getMyAuctions() {
  const response = await fetchWithLoading(`${API_URL}/api/auctions/my`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch auctions');
  }

  return data.auctions;
}

export async function getAuctionImages(auctionId: string) {
  const response = await fetchWithLoading(
    `${API_URL}/api/auctions/${auctionId}/images`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch auction images');
  }

  return data.images;
}

export async function deleteAuctionImage(auctionId: string, imageId: string) {
  const response = await fetchWithLoading(
    `${API_URL}/api/auctions/${auctionId}/images/${imageId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete auction image');
  }

  return data;
}

export async function createAuction(data: {
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  reservePrice?: number;
  startTime: string;
  endTime: string;
}) {
  const response = await fetchWithLoading(`${API_URL}/api/auctions`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to create auction');
  }

  return responseData;
}

export async function uploadAuctionImages(auctionId: string, files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await fetchWithLoading(
    `${API_URL}/api/auctions/${auctionId}/images`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload auction images');
  }

  return data;
}
