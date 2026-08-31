export function getJobMatchInsights(job, profileData) {
  const prefs = profileData?.jobPreferences || {};
  const personal = profileData?.personalDetails || {};
  const userSkills = (prefs.skills || []).map((s) => s.toLowerCase());
  const jobSkills = (job.skillsRequired || []).map((s) => s.toLowerCase());

  const matchedSkills = jobSkills.filter((skill) => userSkills.includes(skill));
  const reasons = [];

  let matchScore = 0;

  // 1. Skill Match
  if (matchedSkills.length > 0) {
    if (matchedSkills.length === jobSkills.length) {
      matchScore += 3;
      reasons.push(
        `Matches your skills: ${matchedSkills
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(', ')}`
      );
    } else {
      matchScore += 2;
      reasons.push(
        `Partially matches your skills: ${matchedSkills
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(', ')}`
      );
    }
  }

  // 2. Education Match (e.g. 10th pass, school, below 10th, ITI)
  const userEdu = (personal.education || prefs.education || '').toLowerCase();
  const jobEdu = (job.educationRequired || '').toLowerCase();

  if (userEdu && jobEdu) {
    if (
      (userEdu.includes('10') && (jobEdu.includes('10') || jobEdu.includes('below'))) ||
      (userEdu.includes('12') && !jobEdu.includes('graduate')) ||
      (userEdu.includes('iti') && (jobEdu.includes('10') || jobEdu.includes('iti'))) ||
      (userEdu.includes('school') && jobEdu.includes('10'))
    ) {
      matchScore += 2;
      reasons.push(`Tailored for your education profile (${userEdu.replace('_', ' ').toUpperCase()}).`);
    }
  } else if (job.educationRequired === '10th_pass' || job.educationRequired === 'below_10th') {
    matchScore += 1;
    reasons.push('Open to 10th pass or practical vocational talent.');
  }

  // 3. Work Type Match
  if (prefs.workType && (prefs.workType === job.workType || prefs.workType === 'Any')) {
    matchScore += 1;
    reasons.push(`${job.workType} work, matching your preference.`);
  }

  // 4. Location Match
  if (prefs.locationType === 'Specific' && prefs.specificLocation) {
    if (job.location.toLowerCase().includes(prefs.specificLocation.toLowerCase())) {
      matchScore += 1;
      reasons.push(`Located in your preferred area: ${prefs.specificLocation}.`);
    }
  } else {
    matchScore += 1;
    reasons.push(`Located near you in ${job.location}.`);
  }

  // Determine Level
  let level = 'partial';
  let message = 'Partial Match: You meet several requirements.';

  if (matchScore >= 4) {
    level = 'strong';
    message = 'Strong Match: Your skills and education profile align perfectly.';
  } else if (matchScore >= 2) {
    level = 'good';
    message = 'Good Match: This job fits well with your needs.';
  }

  return {
    level,
    message,
    matchedSkills,
    reasons,
  };
}

/**
 * Qualification gap for a job: what the user already has vs. what they would
 * need to learn (missing required skills + formal qualifications), plus whether
 * training is available. Used on the Job Details page and the Discover cards.
 */
export function getQualificationGap(job, profileData) {
  const userSkills = (profileData?.jobPreferences?.skills || []).map((s) => s.toLowerCase());
  const required = job?.skillsRequired || [];
  const quals = job?.qualifications || [];

  const have = required.filter((s) => userSkills.includes(s.toLowerCase()));
  const missingSkills = required.filter((s) => !userSkills.includes(s.toLowerCase()));

  const toLearn = [
    ...missingSkills.map((label) => ({ label, type: 'skill' })),
    ...quals.map((label) => ({ label, type: 'qualification' })),
  ];

  const total = required.length + quals.length;
  const readiness = total === 0 ? 100 : Math.round((have.length / total) * 100);

  let level = 'ready';
  if (readiness < 40) level = 'stretch';
  else if (readiness < 80) level = 'close';

  return {
    have,
    toLearn,
    readiness,
    level,
    trainingAvailable: !!job?.trainingAvailable,
    trainingNote: job?.trainingNote || '',
  };
}

/** Skill and education overlap score between a job and the user's profile. */
export function skillOverlap(job, profileData) {
  const userSkills = (profileData?.jobPreferences?.skills || []).map((s) => s.toLowerCase());
  const skillCount = (job?.skillsRequired || []).filter((s) =>
    userSkills.includes(s.toLowerCase())
  ).length;

  const userEdu = (
    profileData?.personalDetails?.education ||
    profileData?.jobPreferences?.education ||
    ''
  ).toLowerCase();
  const jobEdu = (job?.educationRequired || '').toLowerCase();

  let eduBonus = 0;
  if (userEdu && jobEdu && (userEdu.includes(jobEdu) || jobEdu.includes(userEdu) || (userEdu.includes('10') && jobEdu.includes('10')))) {
    eduBonus = 1;
  }

  return skillCount * 2 + eduBonus;
}
