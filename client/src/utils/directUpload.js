import api from '../services/api';

export default async function uploadToCloudinary(file) {
  const { data: params } = await api.get('/admin/cloudinary/upload-params');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', params.apiKey);
  formData.append('timestamp', params.timestamp);
  formData.append('signature', params.signature);
  formData.append('folder', params.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Cloudinary upload failed');
  }

  const result = await res.json();
  return { url: result.secure_url, publicId: result.public_id };
}
