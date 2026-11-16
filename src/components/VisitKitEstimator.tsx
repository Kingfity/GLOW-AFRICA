import { ClipboardCheck, PackageCheck } from 'lucide-react';
import { calculateVisitKitPlan } from '../utils/careTools';

interface VisitKitEstimatorProps {
  groupSize: number;
  childrenCount: number;
  onGroupSizeChange: (size: number) => void;
  onChildrenCountChange: (count: number) => void;
  onApplyToNotes: (checklistSummary: string) => void;
}

export function VisitKitEstimator({
  groupSize,
  childrenCount,
  onGroupSizeChange,
  onChildrenCountChange,
  onApplyToNotes,
}: VisitKitEstimatorProps) {
  const plan = calculateVisitKitPlan(groupSize, childrenCount);

  return (
    <div className="bg-gradient-to-br from-[#FFF6EE] via-[#FDF8F2] to-[#F4EEFA] border border-[#C2593F]/25 rounded-xl p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F] inline-flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5" aria-hidden="true" />
            CSR &amp; Group Planning Calculator
          </p>
          <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
            Children’s Home Visit Kit Estimator
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="kit-visitor-slider"
            className="flex items-center justify-between text-xs font-semibold text-[#1E0B2B] mb-1.5"
          >
            <span>Visiting Team Size</span>
            <span className="text-[#C2593F] tabular-nums">{plan.visitorCount} people</span>
          </label>
          <input
            id="kit-visitor-slider"
            type="range"
            min={2}
            max={60}
            value={Math.min(60, Math.max(2, plan.visitorCount))}
            onChange={(e) => onGroupSizeChange(Number(e.target.value))}
            className="w-full accent-[#C2593F] cursor-pointer"
          />
        </div>
        <div>
          <label
            htmlFor="kit-children-slider"
            className="flex items-center justify-between text-xs font-semibold text-[#1E0B2B] mb-1.5"
          >
            <span>Children at Partner Home</span>
            <span className="text-[#3B155F] tabular-nums">{plan.childrenCount} children</span>
          </label>
          <input
            id="kit-children-slider"
            type="range"
            min={15}
            max={120}
            step={5}
            value={Math.min(120, Math.max(15, plan.childrenCount))}
            onChange={(e) => onChildrenCountChange(Number(e.target.value))}
            className="w-full accent-[#3B155F] cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#FFF2E8] border border-[#C2593F]/22 rounded-lg p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#92321D]">
            Nutrition / Care Packs
          </p>
          <p className="font-serif text-2xl font-semibold text-[#1E0B2B] tabular-nums mt-0.5">
            {plan.carePacksCount}
          </p>
        </div>
        <div className="bg-[#F3ECFB] border border-[#3B155F]/20 rounded-lg p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#3B155F]">
            Book &amp; Craft Kits
          </p>
          <p className="font-serif text-2xl font-semibold text-[#3B155F] tabular-nums mt-0.5">
            {plan.stationerySetsCount}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-[#E9F6F1] border border-[#256358]/22 rounded-lg p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#256358]">
            Mentorship Ratio
          </p>
          <p className="text-xs sm:text-sm font-semibold text-[#1E4B42] mt-1">
            {plan.childrenPerVisitorLabel}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onApplyToNotes(plan.checklistSummary)}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#C2593F] hover:bg-[#A64831] rounded-md transition-colors whitespace-nowrap"
      >
        <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
        Add Checklist to Booking Notes
      </button>
    </div>
  );
}
