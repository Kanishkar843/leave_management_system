import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import SwipeableLeaveCard from '@/components/SwipeableLeaveCard';
import BottomSheet from '@/components/BottomSheet';
import { LeaveApplication, LeaveType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const LeavesPage: React.FC = () => {
  const { currentUser, getMyLeaves, applyLeave } = useStore();
  const [showApply, setShowApply] = useState(false);
  const [showDetails, setShowDetails] = useState<LeaveApplication | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    type: '' as LeaveType | '',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  if (!currentUser) return null;

  const myLeaves = getMyLeaves();
  const filtered = myLeaves.filter(l => {
    const matchSearch = l.reason.toLowerCase().includes(search.toLowerCase()) || l.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleApply = () => {
    if (!formData.type || !formData.fromDate || !formData.toDate || !formData.reason) {
      toast.error('Please fill all fields');
      return;
    }
    applyLeave({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      department: currentUser.department,
      type: formData.type as LeaveType,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      reason: formData.reason,
    });
    toast.success('Leave application submitted!');
    setFormData({ type: '', fromDate: '', toDate: '', reason: '' });
    setShowApply(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">My Leaves</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} applications</p>
        </div>
        <Button onClick={() => setShowApply(true)} className="gradient-primary">
          <Plus className="mr-2 h-4 w-4" /> Apply Leave
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leaves..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leave Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <motion.div className="glass-card p-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-muted-foreground">No leave applications found</p>
          </motion.div>
        ) : (
          filtered.map((leave, i) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <SwipeableLeaveCard
                leave={leave}
                showActions={false}
                onViewDetails={setShowDetails}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Apply Leave Bottom Sheet */}
      <BottomSheet isOpen={showApply} onClose={() => setShowApply(false)} title="Apply Leave">
        <div className="space-y-4">
          <div>
            <Label>Leave Type</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as LeaveType }))}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ML">Medical Leave (ML)</SelectItem>
                <SelectItem value="CL">Casual Leave (CL)</SelectItem>
                <SelectItem value="OD">On Duty (OD)</SelectItem>
                <SelectItem value="EL">Earned Leave (EL)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>From Date</Label>
              <Input type="date" value={formData.fromDate} onChange={e => setFormData(p => ({ ...p, fromDate: e.target.value }))} />
            </div>
            <div>
              <Label>To Date</Label>
              <Input type="date" value={formData.toDate} onChange={e => setFormData(p => ({ ...p, toDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Reason</Label>
            <Textarea
              placeholder="Describe your reason..."
              value={formData.reason}
              onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))}
              rows={3}
            />
          </div>
          <div>
            <Label>Upload Proof (Optional)</Label>
            <Input type="file" className="cursor-pointer" />
          </div>
          <Button onClick={handleApply} className="w-full gradient-primary">
            Submit Application
          </Button>
        </div>
      </BottomSheet>

      {/* Leave Details Bottom Sheet */}
      <BottomSheet isOpen={!!showDetails} onClose={() => setShowDetails(null)} title="Leave Details">
        {showDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{showDetails.type}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <span className="font-medium capitalize">{showDetails.status.replace(/_/g, ' ')}</span></div>
              <div><span className="text-muted-foreground">From:</span> <span className="font-medium">{format(new Date(showDetails.fromDate), 'MMM dd, yyyy')}</span></div>
              <div><span className="text-muted-foreground">To:</span> <span className="font-medium">{format(new Date(showDetails.toDate), 'MMM dd, yyyy')}</span></div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Reason:</span>
              <p className="mt-1 text-sm">{showDetails.reason}</p>
            </div>
            {showDetails.rejectionReason && (
              <div className="rounded-lg bg-destructive/10 p-3">
                <span className="text-sm font-medium text-destructive">Rejection Reason:</span>
                <p className="mt-1 text-sm">{showDetails.rejectionReason}</p>
              </div>
            )}
            {/* Approval Timeline */}
            <div>
              <h4 className="mb-3 font-heading font-semibold">Approval Chain</h4>
              <div className="space-y-3">
                {showDetails.approvalChain.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1 h-3 w-3 rounded-full ${
                      step.action === 'approved' ? 'bg-success' :
                      step.action === 'rejected' ? 'bg-destructive' : 'bg-muted-foreground/30'
                    }`} />
                    <div>
                      <p className="text-sm font-medium capitalize">{step.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {step.action === 'pending' ? 'Awaiting review' :
                          `${step.actorName} - ${step.action} ${step.timestamp ? format(new Date(step.timestamp), 'MMM dd, HH:mm') : ''}`}
                      </p>
                      {step.remarks && <p className="text-xs text-muted-foreground italic">"{step.remarks}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default LeavesPage;
