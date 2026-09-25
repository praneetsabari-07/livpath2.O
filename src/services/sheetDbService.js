/**
 * SheetDB Integration Service
 * Endpoint: https://sheetdb.io/api/v1/uqr783wgkwt62
 * Spreadsheet columns: 'name', 'phone number', 'lang', 'skills', 'location', 'work type'
 */

const SHEETDB_URL = 'https://sheetdb.io/api/v1/uqr783wgkwt62';

/**
 * Clean phone number to standard 10 digits
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Check if a user with this phone number already exists in SheetDB
 * @param {string} phoneNumber
 * @returns {Promise<{ exists: boolean, user: object | null }>}
 */
export async function lookupUserInSheet(phoneNumber) {
  const clean = cleanPhoneNumber(phoneNumber);
  if (!clean || clean.length < 10) {
    return { exists: false, user: null };
  }

  try {
    // 1. Try server proxy endpoint first for CORS safety
    const proxyRes = await fetch(`/api/sheet/user/${clean}`).catch(() => null);
    if (proxyRes && proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.exists && data.user) {
        return { exists: true, user: normalizeSheetRow(data.user) };
      }
    }

    // 2. Direct fetch from SheetDB search endpoint
    const res = await fetch(`${SHEETDB_URL}/search?phone%20number=${clean}`);
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const found = rows.find(r => cleanPhoneNumber(r['phone number']) === clean) || rows[0];
        return {
          exists: true,
          user: normalizeSheetRow(found),
        };
      }
    }

    // 3. Fallback: fetch all rows if search didn't match due to formatting
    const allRes = await fetch(SHEETDB_URL);
    if (allRes.ok) {
      const allRows = await allRes.json();
      if (Array.isArray(allRows)) {
        const matched = allRows.find(r => cleanPhoneNumber(r['phone number'] || r.phone) === clean);
        if (matched) {
          return {
            exists: true,
            user: normalizeSheetRow(matched),
          };
        }
      }
    }
  } catch (error) {
    console.warn('[SheetDB lookup error]:', error);
  }

  return { exists: false, user: null };
}

/**
 * Save or update user data in SheetDB Excel sheet
 * @param {object} userData
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function saveUserToSheet(userData) {
  try {
    const cleanPhone = cleanPhoneNumber(userData.phone || userData.phoneNumber || userData['phone number']);
    if (!cleanPhone) {
      throw new Error('Phone number is required to save to SheetDB');
    }

    const existingCheck = await lookupUserInSheet(cleanPhone);
    const existingName = existingCheck?.user?.fullName;
    const providedName = String(userData.fullName || userData.name || '').trim();

    // Only update name if user actually provided a specific name; otherwise retain existing name
    const resolvedName = (providedName && providedName !== 'LivPath User' && providedName !== 'Ramesh Kumar')
      ? providedName
      : (existingName && existingName !== 'LivPath User' && existingName !== 'Ramesh Kumar' ? existingName : (providedName || 'User'));

    const row = {
      'name': resolvedName,
      'phone number': cleanPhone,
      'lang': userData.lang || userData.language || existingCheck?.user?.language || 'en',
      'skills': Array.isArray(userData.skills) ? userData.skills.join(', ') : (userData.skills || (Array.isArray(existingCheck?.user?.skills) ? existingCheck.user.skills.join(', ') : '')),
      'location': userData.location || userData.specificLocation || userData.district || existingCheck?.user?.location || 'Salem, Tamil Nadu',
      'work type': userData.workType || userData['work type'] || existingCheck?.user?.workType || 'Full-time',
    };

    // 1. Try server proxy endpoint
    const proxyRes = await fetch('/api/sheet/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    }).catch(() => null);

    if (proxyRes && proxyRes.ok) {
      const result = await proxyRes.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
    }

    // 2. Direct SheetDB write: check if user already exists
    if (existingCheck.exists) {
      // Update existing row
      const patchRes = await fetch(`${SHEETDB_URL}/phone%20number/${cleanPhone}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ data: row }),
      });
      if (patchRes.ok) {
        return { success: true, updated: true };
      }
    }

    // Create new row
    const postRes = await fetch(SHEETDB_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ data: [row] }),
    });

    if (postRes.ok) {
      const data = await postRes.json();
      return { success: true, data };
    } else {
      const errText = await postRes.text();
      console.warn('SheetDB direct write error:', errText);
      return { success: false, error: errText };
    }
  } catch (err) {
    console.error('[SheetDB saveUserToSheet error]:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Normalize row from SheetDB to standard application profile structure
 */
function normalizeSheetRow(row) {
  if (!row) return null;
  const rawSkills = row['skills'] || '';
  const skillsArray = typeof rawSkills === 'string'
    ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
    : Array.isArray(rawSkills) ? rawSkills : [];

  return {
    fullName: row['name'] || row.fullName || 'User',
    phone: cleanPhoneNumber(row['phone number'] || row.phone),
    language: row['lang'] || row.language || 'en',
    skills: skillsArray.length > 0 ? skillsArray : ['Vocational Trainee'],
    location: row['location'] || 'Tamil Nadu',
    workType: row['work type'] || 'Full-time',
    raw: row,
  };
}
