import { supabase, isDemoMode } from '../lib/supabase';

/**
 * Converts a file to base64 data URL for local offline/demo fallback
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Sanitizes a filename to be safe for Supabase storage paths
 */
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Upload an event banner / cover image to 'event-images' bucket
 */
export async function uploadEventImage(file: File): Promise<string> {
  if (isDemoMode) {
    try {
      return await fileToBase64(file);
    } catch {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000';
    }
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `events/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      console.warn('Storage upload error, falling back to base64:', uploadError.message);
      return await fileToBase64(file);
    }

    const { data } = supabase.storage.from('event-images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn('Fallback due to storage exception:', err);
    return await fileToBase64(file);
  }
}

/**
 * Upload a teacher / admin assignment attachment to 'assignment-files' bucket
 */
export async function uploadAssignmentAttachment(file: File): Promise<string> {
  if (isDemoMode) {
    try {
      return await fileToBase64(file);
    } catch {
      return 'https://example.com/attachments/' + file.name;
    }
  }

  try {
    const cleanName = sanitizeFileName(file.name);
    const filePath = `assignments/${Date.now()}_${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from('assignment-files')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      console.warn('Assignment file upload error, falling back to base64:', uploadError.message);
      return await fileToBase64(file);
    }

    const { data } = supabase.storage.from('assignment-files').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn('Fallback due to storage exception:', err);
    return await fileToBase64(file);
  }
}

/**
 * Upload a student submission file to 'student-submissions' bucket
 */
export async function uploadStudentSubmission(file: File, studentId: string): Promise<string> {
  if (isDemoMode) {
    try {
      return await fileToBase64(file);
    } catch {
      return 'https://example.com/submissions/' + file.name;
    }
  }

  try {
    const cleanName = sanitizeFileName(file.name);
    const filePath = `${studentId}/${Date.now()}_${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from('student-submissions')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      console.warn('Submission upload error, falling back to base64:', uploadError.message);
      return await fileToBase64(file);
    }

    // Try getting signed URL since bucket is private, or public URL fallback
    const { data: signedData, error: signedError } = await supabase.storage
      .from('student-submissions')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

    if (!signedError && signedData?.signedUrl) {
      return signedData.signedUrl;
    }

    const { data } = supabase.storage.from('student-submissions').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn('Fallback due to storage exception:', err);
    return await fileToBase64(file);
  }
}

/**
 * Upload an issued certificate file to 'certificates' bucket
 */
export async function uploadCertificate(file: File, certId: string): Promise<string> {
  if (isDemoMode) {
    try {
      return await fileToBase64(file);
    } catch {
      return 'https://example.com/certs/' + certId;
    }
  }

  try {
    const filePath = `issued/${certId}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, file, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      console.warn('Certificate upload error, falling back:', uploadError.message);
      return await fileToBase64(file);
    }

    const { data } = supabase.storage.from('certificates').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    return await fileToBase64(file);
  }
}
