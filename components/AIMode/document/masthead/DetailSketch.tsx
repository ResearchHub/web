import type { ReactNode } from 'react';
import { ImageIcon, Target } from 'lucide-react';

interface DetailSketchProps {
  /** The detail to show, by its masthead widget id: `coverImage`, `contacts`, … */
  readonly highlight: string;
}

/**
 * A thumbnail of a published page in two colours: the page in grey
 * placeholders, and the hovered detail in blue, drawn as it might look with
 * a made-up value (a contact's avatar and name, an amount), under the title
 * where it will show. Not this document, and not every detail: just enough
 * to say what this one is.
 */
export function DetailSketch({ highlight }: DetailSketchProps) {
  const isCover = highlight === 'coverImage';
  const detail = isCover ? null : SAMPLES[highlight];

  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-2.5"
    >
      {isCover ? (
        <div className="flex h-12 w-full items-center justify-center rounded bg-primary-500">
          <ImageIcon className="h-4 w-4 text-white" />
        </div>
      ) : (
        <div className="h-8 w-full rounded bg-gray-100" />
      )}
      <Bar className="h-2 w-4/5 bg-gray-300" />
      {detail ?? <Bar className="h-1.5 w-1/2 bg-gray-200" />}
      <div className="flex flex-col gap-1">
        <Bar className="h-1 w-full bg-gray-100" />
        <Bar className="h-1 w-5/6 bg-gray-100" />
        <Bar className="h-1 w-3/4 bg-gray-100" />
      </div>
    </div>
  );
}

function Bar({ className }: { readonly className: string }) {
  return <div className={`rounded-sm ${className}`} />;
}

/** A made-up person, as the published page would show them: avatar and name. */
function Person({ initials, name }: { readonly initials: string; readonly name: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[7px] font-semibold text-white">
        {initials}
      </span>
      <span className="font-medium text-primary-700">{name}</span>
    </span>
  );
}

/** A detail line: its label in grey, its value in blue. */
function Line({ label, children }: { readonly label?: string; readonly children: ReactNode }) {
  return (
    <div className="flex items-center gap-1 text-[10px] leading-none">
      {label && <span className="text-gray-400">{label}</span>}
      {children}
    </div>
  );
}

const value = (text: string) => <span className="font-medium text-primary-700">{text}</span>;

/** What each detail looks like with a value, keyed by masthead widget id. */
const SAMPLES: Record<string, ReactNode> = {
  contacts: (
    <Line label="Contact">
      <Person initials="MC" name="Dr. Maya Chen" />
    </Line>
  ),
  organization: <Line label="Offered by">{value('Hartwell Foundation')}</Line>,
  fundingAmount: <Line label="Funding amount">{value('$250,000')}</Line>,
  shortDescription: (
    <p className="text-[10px] leading-snug text-primary-700">
      Early detection tools for pediatric cancers, from new biomarkers to low-cost screening.
    </p>
  ),
  authors: (
    <Line label="By">
      <Person initials="MC" name="Maya Chen" />
      <span className="text-gray-400">and</span>
      <Person initials="LP" name="Leo Park" />
    </Line>
  ),
  fundingGoal: (
    <div className="flex flex-col gap-1">
      <Line label="Funding goal">{value('$50,000')}</Line>
      <div className="h-1 w-full rounded-full bg-gray-100">
        <div className="h-1 w-2/5 rounded-full bg-primary-500" />
      </div>
    </div>
  ),
  applyingTo: (
    <Line label="Applying to">
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-1.5 py-0.5 font-medium text-primary-700">
        <Target className="h-2.5 w-2.5" />
        Cancer Early Detection RFP
      </span>
    </Line>
  ),
};
