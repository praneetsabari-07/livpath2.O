import { mockJobs } from '../data/mockData';
import { skillOverlap } from '../utils/jobMatchUtils';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function matchesForLocal(profileData) {
  const withOverlap = mockJobs
    .map((job) => ({ job, overlap: skillOverlap(job, profileData) }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .map((x) => x.job);

  if (withOverlap.length > 0) return withOverlap;
  return mockJobs.filter((j) => j.category === 'match');
}

function discoverForLocal(profileData) {
  const noOverlap = mockJobs.filter((job) => skillOverlap(job, profileData) === 0);
  const list = noOverlap.length > 0 ? noOverlap : mockJobs.filter((j) => j.category === 'discover');
  return [...list].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return (rank[a.demandLevel] ?? 1) - (rank[b.demandLevel] ?? 1);
  });
}

function applyFiltersLocal(jobs, { query = '', workType = 'All' } = {}) {
  const q = query.trim().toLowerCase();
  return jobs.filter((job) => {
    if (workType !== 'All' && job.workType !== workType) return false;
    if (!q) return true;
    const haystack = [
      job.title,
      job.company,
      job.location,
      job.district,
      ...(job.skillsRequired || []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export const jobService = {
  /** Top skill matches — used by the Job Matching entry screen. */
  getMatchedJobs: async (profileData) => {
    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profileData, tab: 'matches' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          return { success: true, jobs: data.jobs, totalMatches: data.jobs.length };
        }
      }
    } catch (e) {
      console.warn('API /api/jobs/match fetch fallback:', e);
    }

    await delay(600);
    const matched = matchesForLocal(profileData);
    return { success: true, jobs: matched, totalMatches: matched.length };
  },

  /** Discover feed — nearby roles that need a new skill / short course. */
  getDiscoverJobs: async (profileData) => {
    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profileData, tab: 'discover' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          return { success: true, jobs: data.jobs, total: data.jobs.length };
        }
      }
    } catch (e) {
      console.warn('API /api/jobs/match discover fetch fallback:', e);
    }

    await delay(400);
    const jobs = discoverForLocal(profileData);
    return { success: true, jobs, total: jobs.length };
  },

  /**
   * Listing page data. `tab` is 'matches' | 'discover'; `query` and `workType`
   * are optional client-side filters.
   */
  getJobs: async ({ tab = 'matches', query = '', workType = 'All', location = '' } = {}, profileData) => {
    try {
      const params = new URLSearchParams({
        tab,
        query,
        workType,
        location,
      });
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          // If profileData provided, apply smart ordering
          let resultJobs = data.jobs;
          if (profileData && profileData.skills?.length > 0) {
            resultJobs = resultJobs.map((j) => ({
              ...j,
              overlap: skillOverlap(j, profileData),
            }));
            if (tab === 'matches') {
              resultJobs.sort((a, b) => (b.overlap || 0) - (a.overlap || 0));
            }
          }
          return { success: true, jobs: resultJobs, total: resultJobs.length, tab };
        }
      }
    } catch (e) {
      console.warn('API /api/jobs fetch fallback:', e);
    }

    await delay(400);
    const base = tab === 'discover' ? discoverForLocal(profileData) : matchesForLocal(profileData);
    const jobs = applyFiltersLocal(base, { query, workType });
    return { success: true, jobs, total: jobs.length, tab };
  },

  getJobById: async (jobId) => {
    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.job) return { success: true, job: data.job };
      }
    } catch (e) {
      console.warn(`API /api/jobs/${jobId} fetch fallback:`, e);
    }

    await delay(300);
    const job = mockJobs.find((j) => j.id === jobId);
    return job ? { success: true, job } : { success: false, error: 'Job not found' };
  },
};
