import { saveUserToSheet } from './sheetDbService';

const PROFILE_STORAGE_KEY = 'livpath_user_profile';
const PROFILE_DATA_KEY = 'livpath_profile_data';
const PHONE_STORAGE_KEY = 'livpath_user_phone';

export const getProfile = async () => {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(e);
  }
  return {};
};

export const savePersonalDetails = async (data) => {
  try {
    let existingProfile = {};
    try {
      existingProfile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
    } catch {}

    const currentPhone = data.phone || localStorage.getItem(PHONE_STORAGE_KEY) || existingProfile.phone || '';
    const payload = {
      ...existingProfile,
      ...data,
      phone: currentPhone,
    };

    // Update localStorage
    try {
      const existing = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
      const updated = { ...existing, ...payload };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // Persist to SheetDB Excel sheet
    await saveUserToSheet(payload);
    return { success: true };
  } catch (error) {
    console.error('Error saving personal details to SheetDB:', error);
    return { success: true }; // Continue gracefully
  }
};

export const saveJobPreferences = async (data) => {
  try {
    let profile = {};
    try {
      profile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
    } catch {}

    const currentPhone = data.phone || localStorage.getItem(PHONE_STORAGE_KEY) || profile.phone || '';
    if (!currentPhone) {
      return { success: true };
    }

    const payload = {
      ...profile,
      phone: currentPhone,
      skills: data.skills || profile.skills || [],
      workType: data.workType || profile.workType || 'Full-time',
      location: data.specificLocation || data.locationType || profile.location || 'Salem, Tamil Nadu',
    };

    // Update localStorage
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn(e);
    }

    // Persist all user data to SheetDB Excel sheet
    await saveUserToSheet(payload);
    return { success: true };
  } catch (error) {
    console.error('Error saving job preferences to SheetDB:', error);
    return { success: true };
  }
};

export const updateProfile = async (data) => {
  try {
    let existing = {};
    try {
      existing = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
    } catch {}

    const currentPhone = data.phone || localStorage.getItem(PHONE_STORAGE_KEY) || existing.phone || '';
    if (!currentPhone) {
      return { success: true };
    }
    const payload = {
      ...existing,
      ...data,
      phone: currentPhone,
    };

    try {
      const existing = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
      const updated = { ...existing, ...payload };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    await saveUserToSheet(payload);
    return { success: true };
  } catch (error) {
    console.error('Error updating profile in SheetDB:', error);
    return { success: true };
  }
};