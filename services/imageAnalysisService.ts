import { supabase } from '../lib/supabase';

export interface ImageAnalysisResult {
  isHomeRelated: boolean;
  analysis: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyzeImage(file: File): Promise<ImageAnalysisResult> {
  const image_base64 = await fileToBase64(file);
  const mime_type = file.type || 'image/jpeg';

  // Get current session token for auth
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    headers,
    body: JSON.stringify({ image_base64, mime_type }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Image analysis failed: ${response.status}`);
  }

  return response.json();
}
