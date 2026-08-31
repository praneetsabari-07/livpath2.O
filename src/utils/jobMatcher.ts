import { Job, UserProfile, EducationLevel } from '../types';
import { EDUCATION_ORDER } from '../data/jobsData';

export function matchJobsForUser(jobs: Job[], profile: Partial<UserProfile>): Job[] {
  const userEducation: EducationLevel = profile.education || '10th_pass';
  const userEducationLevel = EDUCATION_ORDER[userEducation] || 2;
  const userSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
  const preferredWorkType = profile.workType;

  return jobs.map(job => {
    let score = 50; // base score
    const jobMinEduLevel = EDUCATION_ORDER[job.minEducation] || 2;

    // Education match criteria:
    if (userEducationLevel >= jobMinEduLevel) {
      score += 25; // Meets or exceeds required education
    } else {
      score -= 20; // Needs higher education
    }

    // Skills match:
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    job.skillsRequired.forEach(skill => {
      const skillLower = skill.toLowerCase();
      const hasSkill = userSkills.some(userSkill => 
        skillLower.includes(userSkill) || userSkill.includes(skillLower)
      );

      if (hasSkill) {
        matchingSkills.push(skill);
        score += 15;
      } else {
        missingSkills.push(skill);
      }
    });

    // Work type match:
    if (preferredWorkType && preferredWorkType !== 'Any') {
      if (job.workType === preferredWorkType) {
        score += 10;
      }
    } else {
      score += 5;
    }

    // High demand boost:
    if (job.demandLevel === 'critical') score += 10;
    else if (job.demandLevel === 'high') score += 5;

    // Training availability boost:
    if (job.trainingAvailable) score += 5;

    // Distance factor (closer is higher):
    if (job.distanceKm < 5) score += 8;
    else if (job.distanceKm < 10) score += 4;

    const finalScore = Math.min(Math.max(score, 30), 99);

    return {
      ...job,
      matchScore: finalScore,
      matchingSkills,
      missingSkills
    };
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}
