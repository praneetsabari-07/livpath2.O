const STORAGE_KEY = 'livpath.applications';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Seeded example applications so the screen is never empty in the demo. */
const seedApplications = [
  {
    applicationId: 'APP-101',
    jobId: 'job-4',
    jobTitle: 'Data Entry Assistant',
    company: 'XYZ Services',
    location: 'Salem',
    workType: 'Full-time',
    status: 'under_review',
    appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    applicationId: 'APP-102',
    jobId: 'job-15',
    jobTitle: 'Store Assistant',
    company: 'Metro Mart',
    location: 'Salem',
    workType: 'Full-time',
    status: 'interview',
    appliedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    applicationId: 'APP-103',
    jobId: 'job-10',
    jobTitle: 'Warehouse Assistant',
    company: 'Logistics Solutions',
    location: 'Salem',
    workType: 'Full-time',
    status: 'selected',
    appliedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStored(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — keep going in memory for this session */
  }
}

/** Newest first: user-submitted (persisted) applications, then the seed set. */
function allApplications() {
  const stored = readStored();
  const storedIds = new Set(stored.map((a) => a.applicationId));
  return [...stored, ...seedApplications.filter((a) => !storedIds.has(a.applicationId))];
}

const STATUS_FLOW = ['submitted', 'under_review', 'interview', 'decision'];

const STATUS_META = {
  submitted: {
    label: 'Application sent',
    desc: 'The employer has received your details.',
    icon: 'send',
  },
  under_review: {
    label: 'Employer reviewing',
    desc: 'They are checking your profile against the role.',
    icon: 'visibility',
  },
  interview: {
    label: 'Interview stage',
    desc: 'The employer wants to talk to you. Keep your phone reachable.',
    icon: 'record_voice_over',
  },
  decision: {
    label: 'Decision',
    desc: 'The final outcome of your application.',
    icon: 'flag',
  },
};

function buildTimeline(app) {
  const isRejected = app.status === 'not_selected';
  const reached = isRejected ? 'interview' : app.status === 'selected' ? 'decision' : app.status;
  const reachedIdx = STATUS_FLOW.indexOf(reached === 'selected' ? 'decision' : reached);

  const applied = new Date(app.appliedAt).getTime();
  const dayGap = 86400000 * 2;

  return STATUS_FLOW.map((stage, i) => {
    const done = i < reachedIdx;
    const current = i === reachedIdx;
    let label = STATUS_META[stage].label;
    let tone = 'neutral';

    if (stage === 'decision') {
      if (app.status === 'selected') {
        label = 'Selected 🎉';
        tone = 'positive';
      } else if (isRejected) {
        label = 'Not selected this time';
        tone = 'negative';
      }
    }

    return {
      stage,
      label,
      desc: STATUS_META[stage].desc,
      icon: STATUS_META[stage].icon,
      done,
      current,
      tone,
      date: i <= reachedIdx ? new Date(applied + i * dayGap).toISOString() : null,
    };
  });
}

function nextStepFor(app) {
  switch (app.status) {
    case 'submitted':
      return 'Sit tight — most employers respond within 2–3 days. We will notify you.';
    case 'under_review':
      return 'Keep your phone reachable. The employer may call to ask a few questions.';
    case 'interview':
      return 'Prepare for a short conversation about your experience. Reach the location 10 minutes early.';
    case 'selected':
      return 'Congratulations! The employer will share joining details. Confirm your start date with them.';
    case 'not_selected':
      return 'This one did not work out. Your profile is ready — apply to similar jobs today.';
    default:
      return 'We will keep this page updated as your application moves forward.';
  }
}

export const applicationService = {
  submitApplication: async (applicationData) => {
    await delay(1400);

    const newApplication = {
      applicationId: 'APP-' + Date.now(),
      jobId: applicationData.jobId,
      jobTitle: applicationData.jobTitle || 'Tailor',
      company: applicationData.company || 'ABC Garments',
      location: applicationData.location || 'Salem',
      workType: applicationData.workType || 'Full-time',
      status: 'submitted',
      appliedAt: new Date().toISOString(),
    };

    writeStored([newApplication, ...readStored()]);

    return {
      success: true,
      applicationId: newApplication.applicationId,
      status: newApplication.status,
    };
  },

  getMyApplications: async () => {
    await delay(700);
    return { success: true, applications: allApplications() };
  },

  getApplicationById: async (applicationId) => {
    await delay(600);
    const application = allApplications().find((a) => a.applicationId === applicationId);
    if (!application) return { success: false, error: 'Application not found' };

    return {
      success: true,
      application: {
        ...application,
        timeline: buildTimeline(application),
        nextStep: nextStepFor(application),
      },
    };
  },
};
