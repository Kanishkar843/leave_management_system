import { User, LeaveApplication, AuditLog, Notification } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'p1', name: 'Dr. Ramesh Kumar', email: 'principal@college.edu', password: 'admin123',
    role: 'principal', department: 'Administration',
    leaveBalance: { ML: 12, CL: 8, OD: 5, EL: 15 },
  },
  {
    id: 'h1', name: 'Dr. Anita Sharma', email: 'hod.cs@college.edu', password: 'hod123',
    role: 'hod', department: 'Computer Science', employeeId: 'HOD-CS-001', addedBy: 'p1',
    leaveBalance: { ML: 12, CL: 8, OD: 5, EL: 15 },
  },
  {
    id: 'h2', name: 'Dr. Vikram Patel', email: 'hod.ece@college.edu', password: 'hod123',
    role: 'hod', department: 'Electronics', employeeId: 'HOD-ECE-001', addedBy: 'p1',
    leaveBalance: { ML: 12, CL: 8, OD: 5, EL: 15 },
  },
  {
    id: 'f1', name: 'Prof. Sunita Reddy', email: 'faculty1@college.edu', password: 'fac123',
    role: 'faculty', department: 'Computer Science', employeeId: 'FAC-CS-001', designation: 'Assistant Professor', addedBy: 'h1',
    leaveBalance: { ML: 12, CL: 8, OD: 5, EL: 15 },
  },
  {
    id: 'f2', name: 'Prof. Manoj Gupta', email: 'faculty2@college.edu', password: 'fac123',
    role: 'faculty', department: 'Computer Science', employeeId: 'FAC-CS-002', designation: 'Associate Professor', addedBy: 'h1',
    leaveBalance: { ML: 12, CL: 8, OD: 5, EL: 15 },
  },
  {
    id: 's1', name: 'Rahul Verma', email: 'student1@college.edu', password: 'stu123',
    role: 'student', department: 'Computer Science', rollNumber: 'CS2024001', addedBy: 'f1',
    leaveBalance: { ML: 10, CL: 6, OD: 5, EL: 10 },
  },
  {
    id: 's2', name: 'Priya Singh', email: 'student2@college.edu', password: 'stu123',
    role: 'student', department: 'Computer Science', rollNumber: 'CS2024002', addedBy: 'f1',
    leaveBalance: { ML: 10, CL: 6, OD: 5, EL: 10 },
  },
  {
    id: 's3', name: 'Amit Desai', email: 'student3@college.edu', password: 'stu123',
    role: 'student', department: 'Computer Science', rollNumber: 'CS2024003', addedBy: 'f2',
    leaveBalance: { ML: 10, CL: 6, OD: 5, EL: 10 },
  },
];

export const mockLeaves: LeaveApplication[] = [
  {
    id: 'l1', userId: 's1', userName: 'Rahul Verma', userRole: 'student', department: 'Computer Science',
    type: 'CL', reason: 'Family function', fromDate: '2026-04-10', toDate: '2026-04-12',
    status: 'pending', appliedAt: '2026-04-05T10:00:00Z',
    approvalChain: [
      { role: 'faculty', action: 'pending' },
      { role: 'hod', action: 'pending' },
      { role: 'principal', action: 'pending' },
    ],
  },
  {
    id: 'l2', userId: 's2', userName: 'Priya Singh', userRole: 'student', department: 'Computer Science',
    type: 'ML', reason: 'Medical appointment', fromDate: '2026-04-08', toDate: '2026-04-09',
    status: 'approved_by_faculty', appliedAt: '2026-04-04T14:00:00Z',
    approvalChain: [
      { role: 'faculty', action: 'approved', actorId: 'f1', actorName: 'Prof. Sunita Reddy', timestamp: '2026-04-04T16:00:00Z', remarks: 'Approved' },
      { role: 'hod', action: 'pending' },
      { role: 'principal', action: 'pending' },
    ],
  },
  {
    id: 'l3', userId: 'f1', userName: 'Prof. Sunita Reddy', userRole: 'faculty', department: 'Computer Science',
    type: 'EL', reason: 'Personal work', fromDate: '2026-04-15', toDate: '2026-04-18',
    status: 'pending', appliedAt: '2026-04-03T09:00:00Z',
    approvalChain: [
      { role: 'hod', action: 'pending' },
      { role: 'principal', action: 'pending' },
    ],
  },
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'a1', actorId: 's1', actorName: 'Rahul Verma', actorRole: 'student',
    action: 'Applied leave', targetId: 'l1', remarks: 'CL leave from 2026-04-10 to 2026-04-12',
    timestamp: '2026-04-05T10:00:00Z',
  },
  {
    id: 'a2', actorId: 'f1', actorName: 'Prof. Sunita Reddy', actorRole: 'faculty',
    action: 'Approved leave', targetId: 'l2', remarks: 'Approved',
    timestamp: '2026-04-04T16:00:00Z',
  },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', userId: 's1', message: 'Your CL leave application has been submitted', read: false, timestamp: '2026-04-05T10:00:00Z', type: 'info' },
  { id: 'n2', userId: 's2', message: 'Your ML leave has been approved by Prof. Sunita Reddy', read: false, timestamp: '2026-04-04T16:00:00Z', type: 'success' },
  { id: 'n3', userId: 'f1', message: 'New leave request from Rahul Verma', read: false, timestamp: '2026-04-05T10:01:00Z', type: 'info' },
];
