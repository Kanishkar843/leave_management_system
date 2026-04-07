import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import SwipeableLeaveCard from '@/components/SwipeableLeaveCard';
import BottomSheet from '@/components/BottomSheet';
import { LeaveApplication } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ApprovalsPage: React.FC = () => {
  const { currentUser, getPendingLeaves, approveLeave, rejectLeave } = useStore();
  const [search, setSearch] = useState('');
  const [showReject, setShowReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showDetails, setShowDetails] = useState<LeaveApplication | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState<string | null>(null);
  const [approveRemarks, setApproveRemarks] = useState('');

  if (!currentUser) return null;

  const pending = getPendingLeaves().filter(l =>
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.reason.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (id: string) => {
    setShowApproveConfirm(id);
    setApproveRemarks('Approved');
  };

  const confirmApprove = () => {
    if (showApproveConfirm) {
      approveLeave(showApproveConfirm, approveRemarks);
      toast.success('Leave approved!');
      setShowApproveConfirm(null);
      setApproveRemarks('');
    }
  };

  const handleReject = (id: string) => {
    setShowReject(id);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (showReject && rejectReason) {
      rejectLeave(showReject, rejectReason);
      toast.error('Leave rejected');
      setShowReject(null);
      setRejectReason('');
    }
  };

  const bulkApprove = () => {
    pending.forEach(l => approveLeave(l.id, 'Bulk approved'));
    toast.success(`${pending.length} leaves approved!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Pending Approvals</h2>
          <p className="text-sm text-muted-foreground">{pending.length} awaiting your review</p>
        </div>
        {pending.length > 1 && (
          <Button onClick={bulkApprove} variant="outline" size="sm">
            <CheckCheck className="mr-2 h-4 w-4" /> Approve All
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-3">
        {pending.length === 0 ? (
          <motion.div className="glass-card p-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CheckCheck className="mx-auto mb-3 h-12 w-12 text-success" />
            <p className="font-heading font-semibold">All caught up!</p>
            <p className="text-sm text-muted-foreground">No pending approvals</p>
          </motion.div>
        ) : (
          pending.map((leave, i) => (
            <motion.div key={leave.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <SwipeableLeaveCard
                leave={leave}
                onApprove={handleApprove}
                onReject={handleReject}
                onViewDetails={setShowDetails}
                showActions={true}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Approve Confirmation */}
      <BottomSheet isOpen={!!showApproveConfirm} onClose={() => setShowApproveConfirm(null)} title="Approve Leave">
        <div className="space-y-4">
          <div>
            <Label>Remarks</Label>
            <Textarea value={approveRemarks} onChange={e => setApproveRemarks(e.target.value)} placeholder="Add remarks..." rows={2} />
          </div>
          <Button onClick={confirmApprove} className="w-full bg-success text-success-foreground hover:bg-success/90">
            Confirm Approval
          </Button>
        </div>
      </BottomSheet>

      {/* Reject Bottom Sheet */}
      <BottomSheet isOpen={!!showReject} onClose={() => setShowReject(null)} title="Reject Leave">
        <div className="space-y-4">
          <div>
            <Label>Rejection Reason (required)</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Provide reason for rejection..." rows={3} />
          </div>
          <Button onClick={confirmReject} variant="destructive" className="w-full" disabled={!rejectReason.trim()}>
            Confirm Rejection
          </Button>
        </div>
      </BottomSheet>

      {/* Details Bottom Sheet */}
      <BottomSheet isOpen={!!showDetails} onClose={() => setShowDetails(null)} title="Leave Details">
        {showDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Applicant:</span> <span className="font-medium">{showDetails.userName}</span></div>
              <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{showDetails.type}</span></div>
              <div><span className="text-muted-foreground">From:</span> <span className="font-medium">{format(new Date(showDetails.fromDate), 'MMM dd, yyyy')}</span></div>
              <div><span className="text-muted-foreground">To:</span> <span className="font-medium">{format(new Date(showDetails.toDate), 'MMM dd, yyyy')}</span></div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Reason:</span>
              <p className="mt-1 text-sm">{showDetails.reason}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { handleApprove(showDetails.id); setShowDetails(null); }} className="flex-1 bg-success text-success-foreground hover:bg-success/90">
                Approve
              </Button>
              <Button onClick={() => { handleReject(showDetails.id); setShowDetails(null); }} variant="destructive" className="flex-1">
                Reject
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default ApprovalsPage;
