import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, XCircle, UserPlus, FileText } from 'lucide-react';

const actionIcons: Record<string, React.ReactNode> = {
  'Applied leave': <FileText className="h-4 w-4 text-primary" />,
  'Approved leave': <CheckCircle className="h-4 w-4 text-success" />,
  'Rejected leave': <XCircle className="h-4 w-4 text-destructive" />,
  'Added member': <UserPlus className="h-4 w-4 text-accent" />,
};

const AuditPage: React.FC = () => {
  const { auditLogs } = useStore();
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter(log =>
    log.actorName.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.remarks.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Audit Log</h2>
        <p className="text-sm text-muted-foreground">System activity timeline</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 h-full w-px bg-border" />

        <div className="space-y-4">
          {filtered.map((log, i) => (
            <motion.div
              key={log.id}
              className="relative flex gap-4 pl-12"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="absolute left-3 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-card ring-2 ring-border">
                {actionIcons[log.action] || <FileText className="h-3 w-3" />}
              </div>
              <div className="glass-card flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      <span className="font-semibold">{log.actorName}</span>
                      <span className="text-muted-foreground"> • {log.actorRole}</span>
                    </p>
                    <p className="text-sm text-primary font-medium">{log.action}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{log.remarks}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditPage;
