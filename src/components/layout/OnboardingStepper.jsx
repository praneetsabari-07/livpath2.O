/**
 * OnboardingStepper — the single progress indicator for the guided flow.
 *
 * One canonical set of steps, one visual language, used on every onboarding
 * screen so the header-area progress reads consistently from Verify through
 * Ready. Pass the 1-indexed `currentStep`:
 *
 *   Certificate Verification -> 2
 *   Personal Details         -> 3
 *   Job Preferences          -> 4
 *   Profile Setup Complete   -> 5
 */
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';

const STEP_DEFINITIONS = [
  { key: 'stepper_account', fallback: 'Account' },
  { key: 'stepper_verify', fallback: 'Verify' },
  { key: 'stepper_aboutYou', fallback: 'About You' },
  { key: 'stepper_workPrefs', fallback: 'Work Prefs' },
  { key: 'stepper_ready', fallback: 'Ready' },
];

export default function OnboardingStepper({ currentStep, className = '' }) {
  const { language } = useLanguageContext();
  const t = (key, fallback) => translations[language]?.[key] || translations['en']?.[key] || fallback || key;

  const currentStepDef = STEP_DEFINITIONS[currentStep - 1] || STEP_DEFINITIONS[0];

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Compact context on small screens (labels are hidden there) */}
      <p className="sm:hidden text-center font-label-sm text-label-sm text-on-surface-variant mb-1">
        {t('stepper_step', 'Step')} {currentStep} {t('stepper_of', 'of')} {STEP_DEFINITIONS.length}
      </p>
      <p className="sm:hidden text-center font-label-md text-label-md text-primary-container font-bold mb-4">
        {t(currentStepDef.key, currentStepDef.fallback)}
      </p>

      <ol className="flex items-center pb-0 sm:pb-7">
        {STEP_DEFINITIONS.map((def, i) => {
          const step = i + 1;
          const done = step < currentStep;
          const current = step === currentStep;
          const last = i === STEP_DEFINITIONS.length - 1;
          const label = t(def.key, def.fallback);

          return (
            <li key={def.key} className={last ? 'flex items-center' : 'flex flex-1 items-center'}>
              <div className="relative flex shrink-0 flex-col items-center">
                <span
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full text-label-sm font-label-sm transition-colors',
                    done && 'bg-secondary text-on-secondary shadow-sm',
                    current &&
                      'bg-primary-container text-on-primary ring-4 ring-primary-container/15 shadow-sm',
                    !done && !current && 'bg-surface border border-outline-variant text-outline',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {done ? (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  ) : (
                    step
                  )}
                </span>
                <span
                  className={[
                    'absolute top-full mt-2 hidden whitespace-nowrap font-label-sm text-label-sm sm:block',
                    done && 'text-secondary',
                    current && 'text-primary-container font-bold',
                    !done && !current && 'text-outline',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {label}
                </span>
              </div>

              {!last && (
                <span
                  className={`mx-2 h-0.5 flex-1 rounded-full ${
                    done ? 'bg-secondary' : 'bg-outline-variant/40'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
