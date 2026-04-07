import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LeaveApplication, AuditLog, Notification, Role, LeaveType, LeaveStatus } from '@/types';
import { mockUsers, mockLeaves, mockAuditLogs, mockNotifications } from '@/data/mockData';

interface AppState {
  currentUser: User | null;
  users: User[];
  leaves: LeaveApplication[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  darkMode: boolean;

  login: (email: string, password: string) => User | null;
  logout: () => void;
  toggleDarkMode: () => void;

  addUser: (user: Omit<User, 'id' | 'leaveBalance'>) => void;
  getSubordinates: () => User[];

  applyLeave: (leave: Omit<LeaveApplication, 'id' | 'status' | 'appliedAt' | 'approvalChain'>) => void;
  approveLeave: (leaveId: string, remarks: string) => void;
  rejectLeave: (leaveId: string, reason: string) => void;
  getPendingLeaves: () => LeaveApplication[];
  getMyLeaves: () => LeaveApplication[];

  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const genId = () => Math.random().toString(36).substring(2, 10);

const getNextApprovalRole = (status: LeaveStatus, userRole: Role): LeaveStatus | null => {
  if (status === 'pending' && userRole === 'faculty') return 'approved_by_faculty';
  if ((status === 'pending' || status === 'approved_by_faculty') && userRole === 'hod') return 'approved_by_hod';
  if ((status === 'pending' || status === 'approved_by_hod') && userRole === 'principal') return 'approved';
  return null;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      leaves: mockLeaves,
      auditLogs: mockAuditLogs,
      notifications: mockNotifications,
      darkMode: false,

      login: (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (user) {
          set({ currentUser: user });
          return user;
        }
        return null;
      },

      logout: () => set({ currentUser: null }),

      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),

      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: genId(),
          leaveBalance: { ML: 12, CL: 8, OD: 5, EL: 15 },
        };
        set(s => ({ users: [...s.users, newUser] }));
        get().addAuditLog({
          actorId: get().currentUser!.id,
          actorName: get().currentUser!.name,
          actorRole: get().currentUser!.role,
          action: 'Added member',
          targetId: newUser.id,
          targetName: newUser.name,
          remarks: `Added ${newUser.role} - ${newUser.name}`,
        });
        get().addNotification({
          userId: newUser.id,
          message: `Welcome! Your account has been created. Login: ${newUser.email} / ${newUser.password}`,
          type: 'info',
        });
      },

      getSubordinates: () => {
        const user = get().currentUser;
        if (!user) return [];
        const roleMap: Record<Role, Role | null> = {
          principal: 'hod',
          hod: 'faculty',
          faculty: 'student',
          student: null,
        };
        const subRole = roleMap[user.role];
        if (!subRole) return [];
        return get().users.filter(u => u.role === subRole && (u.department === user.department || user.role === 'principal'));
      },

      applyLeave: (leaveData) => {
        const user = get().currentUser!;
        const chain: { role: Role; action: 'pending' | 'approved' | 'rejected' }[] = [];
        if (user.role === 'student') {
          chain.push({ role: 'faculty', action: 'pending' }, { role: 'hod', action: 'pending' }, { role: 'principal', action: 'pending' });
        } else if (user.role === 'faculty') {
          chain.push({ role: 'hod', action: 'pending' }, { role: 'principal', action: 'pending' });
        } else if (user.role === 'hod') {
          chain.push({ role: 'principal', action: 'pending' });
        }

        const leave: LeaveApplication = {
          ...leaveData,
          id: genId(),
          status: 'pending',
          appliedAt: new Date().toISOString(),
          approvalChain: chain,
        };
        set(s => ({ leaves: [...s.leaves, leave] }));
        get().addAuditLog({
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          action: 'Applied leave',
          targetId: leave.id,
          remarks: `${leave.type} leave from ${leave.fromDate} to ${leave.toDate}`,
        });
      },

      approveLeave: (leaveId, remarks) => {
        const user = get().currentUser!;
        set(s => {
          const leaves = s.leaves.map(l => {
            if (l.id !== leaveId) return l;
            const nextStatus = getNextApprovalRole(l.status, user.role);
            if (!nextStatus) return l;
            const chain = l.approvalChain.map(step =>
              step.role === user.role
                ? { ...step, action: 'approved' as const, actorId: user.id, actorName: user.name, timestamp: new Date().toISOString(), remarks }
                : step
            );
            const updated = { ...l, status: nextStatus, approvalChain: chain };

            // Deduct balance if fully approved
            if (nextStatus === 'approved') {
              const applicant = s.users.find(u => u.id === l.userId);
              if (applicant) {
                const days = Math.ceil((new Date(l.toDate).getTime() - new Date(l.fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                applicant.leaveBalance[l.type] = Math.max(0, applicant.leaveBalance[l.type] - days);
              }
            }
            return updated;
          });
          return { leaves };
        });
        get().addAuditLog({
          actorId: user.id, actorName: user.name, actorRole: user.role,
          action: 'Approved leave', targetId: leaveId, remarks,
        });
        const leave = get().leaves.find(l => l.id === leaveId)!;
        get().addNotification({
          userId: leave.userId,
          message: `Your leave has been approved by ${user.name} (${user.role})`,
          type: 'success',
        });
      },

      rejectLeave: (leaveId, reason) => {
        const user = get().currentUser!;
        set(s => ({
          leaves: s.leaves.map(l =>
            l.id === leaveId
              ? {
                  ...l,
                  status: 'rejected' as LeaveStatus,
                  rejectionReason: reason,
                  approvalChain: l.approvalChain.map(step =>
                    step.role === user.role
                      ? { ...step, action: 'rejected' as const, actorId: user.id, actorName: user.name, timestamp: new Date().toISOString(), remarks: reason }
                      : step
                  ),
                }
              : l
          ),
        }));
        get().addAuditLog({
          actorId: user.id, actorName: user.name, actorRole: user.role,
          action: 'Rejected leave', targetId: leaveId, remarks: reason,
        });
        const leave = get().leaves.find(l => l.id === leaveId)!;
        get().addNotification({
          userId: leave.userId,
          message: `Your leave was rejected by ${user.name}: ${reason}`,
          type: 'error',
        });
      },

      getPendingLeaves: () => {
        const user = get().currentUser;
        if (!user) return [];
        const roleStatusMap: Record<Role, LeaveStatus[]> = {
          faculty: ['pending'],
          hod: ['pending', 'approved_by_faculty'],
          principal: ['pending', 'approved_by_faculty', 'approved_by_hod'],
          student: [],
        };
        const validStatuses = roleStatusMap[user.role] || [];
        return get().leaves.filter(l => {
          if (!validStatuses.includes(l.status)) return false;
          const step = l.approvalChain.find(s => s.role === user.role);
          return step && step.action === 'pending';
        });
      },

      getMyLeaves: () => {
        const user = get().currentUser;
        if (!user) return [];
        return get().leaves.filter(l => l.userId === user.id);
      },

      addAuditLog: (log) => {
        set(s => ({
          auditLogs: [{ ...log, id: genId(), timestamp: new Date().toISOString() }, ...s.auditLogs],
        }));
      },

      addNotification: (notif) => {
        set(s => ({
          notifications: [{ ...notif, id: genId(), timestamp: new Date().toISOString(), read: false }, ...s.notifications],
        }));
      },

      markNotificationRead: (id) => {
        set(s => ({
          notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        }));
      },

      markAllNotificationsRead: () => {
        set(s => ({
          notifications: s.notifications.map(n => ({ ...n, read: true })),
        }));
      },
    }),
    {
      name: 'leave-mgmt-store',
      version: 2,
      migrate: () => ({} as any),
    }
  )
);
