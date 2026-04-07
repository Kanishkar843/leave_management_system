import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Check, X, ChevronUp } from 'lucide-react';
import { LeaveApplication } from '@/types';
import { format } from 'date-fns';

interface SwipeableLeaveCardProps {
  leave: LeaveApplication;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetails?: (leave: LeaveApplication) => void;
  showActions?: boolean;
}

const typeColors: Record<string, string> = {
  ML: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  CL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  OD: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  EL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const statusStyles: Record<string, string> = {
  pending: 'status-pending',
  approved_by_faculty: 'status-pending',
  approved_by_hod: 'status-pending',
  approved: 'status-approved',
  rejected: 'status-rejected',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved_by_faculty: 'Faculty Approved',
  approved_by_hod: 'HOD Approved',
  approved: 'Approved',
  rejected: 'Rejected',
};

const SwipeableLeaveCard: React.FC<SwipeableLeaveCardProps> = ({
  leave, onApprove, onReject, onViewDetails, showActions = true,
}) => {
  const [swipeDirection, setSwipeDirection] = React.useState<'left' | 'right' | null>(null);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 120 && onApprove && showActions) {
      onApprove(leave.id);
    } else if (info.offset.x < -120 && onReject && showActions) {
      onReject(leave.id);
    } else if (info.offset.y < -80 && onViewDetails) {
      onViewDetails(leave);
    }
    setSwipeDirection(null);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (info.offset.x > 50) setSwipeDirection('right');
    else if (info.offset.x < -50) setSwipeDirection('left');
    else setSwipeDirection(null);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe indicators */}
      {showActions && (
        <>
          <div className={`absolute inset-y-0 left-0 flex w-20 items-center justify-center rounded-l-xl bg-green-500 transition-opacity ${swipeDirection === 'right' ? 'opacity-100' : 'opacity-0'}`}>
            <Check className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className={`absolute inset-y-0 right-0 flex w-20 items-center justify-center rounded-r-xl bg-destructive transition-opacity ${swipeDirection === 'left' ? 'opacity-100' : 'opacity-0'}`}>
            <X className="h-8 w-8 text-destructive-foreground" />
          </div>
        </>
      )}

      <motion.div
        className="glass-card relative cursor-grab p-4 active:cursor-grabbing"
        drag={showActions ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-heading font-semibold">{leave.userName}</h4>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[leave.type]}`}>
                {leave.type}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{leave.reason}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{format(new Date(leave.fromDate), 'MMM dd')} - {format(new Date(leave.toDate), 'MMM dd, yyyy')}</span>
              <span>•</span>
              <span>{leave.department}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[leave.status]}`}>
              {statusLabels[leave.status]}
            </span>
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(leave)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ChevronUp className="h-3 w-3" /> Details
              </button>
            )}
          </div>
        </div>

        {showActions && (
          <p className="mt-3 text-center text-xs text-muted-foreground/60">
            ← Swipe to reject • Swipe to approve →
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default SwipeableLeaveCard;
