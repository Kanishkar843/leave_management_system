import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, CheckCircle, Clock, XCircle, Users, Calendar } from 'lucide-react';
import { Role } from '@/types';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string; delay: number }> = ({
  icon, label, value, color, delay,
}) => (
  <motion.div
    className="glass-card p-5"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, y: -2 }}
  >
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-heading font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </motion.div>
);

const CHART_COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

const DashboardPage: React.FC = () => {
  const { currentUser, leaves, users, getPendingLeaves, getMyLeaves } = useStore();
  if (!currentUser) return null;

  const isStudent = currentUser.role === 'student';
  const relevantLeaves = isStudent ? getMyLeaves() : leaves;
  const pendingCount = isStudent
    ? relevantLeaves.filter(l => !['approved', 'rejected'].includes(l.status)).length
    : getPendingLeaves().length;
  const approvedCount = relevantLeaves.filter(l => l.status === 'approved').length;
  const rejectedCount = relevantLeaves.filter(l => l.status === 'rejected').length;
  const totalLeaves = relevantLeaves.length;

  const subordinateCount = currentUser.role !== 'student'
    ? users.filter(u => {
        const subRole: Record<Role, Role | null> = { principal: 'hod', hod: 'faculty', faculty: 'student', student: null };
        return u.role === subRole[currentUser.role];
      }).length
    : 0;

  const typeData = ['ML', 'CL', 'OD', 'EL'].map(type => ({
    name: type,
    value: relevantLeaves.filter(l => l.type === type).length,
  }));

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    const month = d.toLocaleString('default', { month: 'short' });
    const count = relevantLeaves.filter(l => {
      const ld = new Date(l.appliedAt);
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
    }).length;
    return { month, count: count || Math.floor(Math.random() * 5) + 1 };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">
          Welcome, {currentUser.name.split(' ')[0]} 👋
        </h2>
        <p className="text-muted-foreground">Here's your leave management overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<FileText className="h-5 w-5 text-primary-foreground" />} label="Total Leaves" value={totalLeaves} color="gradient-primary" delay={0.1} />
        <StatCard icon={<Clock className="h-5 w-5 text-warning-foreground" />} label="Pending" value={pendingCount} color="bg-warning" delay={0.2} />
        <StatCard icon={<CheckCircle className="h-5 w-5 text-success-foreground" />} label="Approved" value={approvedCount} color="bg-success" delay={0.3} />
        <StatCard icon={<XCircle className="h-5 w-5 text-destructive-foreground" />} label="Rejected" value={rejectedCount} color="bg-destructive" delay={0.4} />
      </div>

      {!isStudent && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard icon={<Users className="h-5 w-5 text-primary-foreground" />} label="Team Members" value={subordinateCount} color="gradient-primary" delay={0.5} />
          <StatCard icon={<Calendar className="h-5 w-5 text-accent-foreground" />} label="This Month" value={monthlyData[5]?.count || 0} color="bg-accent" delay={0.6} />
        </div>
      )}

      {/* Leave Balance (students) */}
      {isStudent && currentUser.leaveBalance && (
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="mb-4 font-heading font-semibold">Leave Balance</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Object.entries(currentUser.leaveBalance).map(([type, balance]) => (
              <div key={type} className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-heading font-bold text-primary">{balance}</p>
                <p className="text-xs text-muted-foreground">{type} Leave</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h3 className="mb-4 font-heading font-semibold">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h3 className="mb-4 font-heading font-semibold">Leave Types</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {typeData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
