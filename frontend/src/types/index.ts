export type Role = 'principal' | 'hod' | 'faculty' | 'student';

export type LeaveType = 'ML' | 'CL' | 'OD' | 'EL';
export type LeaveStatus = 'pending' | 'approved_by_faculty' | 'approved_by_hod' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  employeeId?: string;
  rollNumber?: string;
  designation?: string;
  addedBy?: string;
  leaveBalance: {
    ML: number;
    CL: number;
    OD: number;
    EL: number;
  };
}

export interface LeaveApplication {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  department: string;
  type: LeaveType;
  reason: string;
  fromDate: string;
  toDate: string;
  status: LeaveStatus;
  proofUrl?: string;
  appliedAt: string;
  approvalChain: ApprovalStep[];
  rejectionReason?: string;
}

export interface ApprovalStep {
  role: Role;
  actorId?: string;
  actorName?: string;
  action: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  targetId?: string;
  targetName?: string;
  remarks: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
