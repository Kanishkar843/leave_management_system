import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import BottomSheet from '@/components/BottomSheet';
import { Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Mail, Building, Hash } from 'lucide-react';
import { toast } from 'sonner';

const canAddRole: Record<Role, Role | null> = {
  principal: 'hod',
  hod: 'faculty',
  faculty: 'student',
  student: null,
};

const roleFields: Record<Role, { label: string; fields: { name: string; label: string; icon: React.ReactNode }[] }> = {
  hod: {
    label: 'HOD',
    fields: [
      { name: 'name', label: 'Full Name', icon: <UserPlus className="h-4 w-4" /> },
      { name: 'employeeId', label: 'Employee ID', icon: <Hash className="h-4 w-4" /> },
      { name: 'department', label: 'Department', icon: <Building className="h-4 w-4" /> },
      { name: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    ],
  },
  faculty: {
    label: 'Faculty',
    fields: [
      { name: 'name', label: 'Full Name', icon: <UserPlus className="h-4 w-4" /> },
      { name: 'rollNumber', label: 'Faculty Roll No', icon: <Hash className="h-4 w-4" /> },
      { name: 'designation', label: 'Designation', icon: <Building className="h-4 w-4" /> },
      { name: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    ],
  },
  student: {
    label: 'Student',
    fields: [
      { name: 'name', label: 'Full Name', icon: <UserPlus className="h-4 w-4" /> },
      { name: 'rollNumber', label: 'Roll Number', icon: <Hash className="h-4 w-4" /> },
      { name: 'department', label: 'Department', icon: <Building className="h-4 w-4" /> },
      { name: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    ],
  },
  principal: { label: '', fields: [] },
};

const MembersPage: React.FC = () => {
  const { currentUser, getSubordinates, addUser } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Record<string, string>>({});

  if (!currentUser) return null;
  const targetRole = canAddRole[currentUser.role];
  if (!targetRole) return null;

  const subordinates = getSubordinates().filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const fields = roleFields[targetRole];

  const handleAdd = () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    addUser({
      name: form.name,
      email: form.email,
      password: 'pass123',
      role: targetRole,
      department: form.department || currentUser.department,
      employeeId: form.employeeId,
      rollNumber: form.rollNumber,
      designation: form.designation,
      addedBy: currentUser.id,
    });
    toast.success(`${fields.label} added! Credentials sent.`);
    setForm({});
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">{fields.label}s</h2>
          <p className="text-sm text-muted-foreground">{subordinates.length} members</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gradient-primary">
          <UserPlus className="mr-2 h-4 w-4" /> Add {fields.label}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={`Search ${fields.label.toLowerCase()}s...`} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subordinates.map((user, i) => (
          <motion.div
            key={user.id}
            className="glass-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">{user.department}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title={`Add ${fields.label}`}>
        <div className="space-y-4">
          {fields.fields.map(field => (
            <div key={field.name}>
              <Label>{field.label}</Label>
              <Input
                placeholder={field.label}
                value={form[field.name] || ''}
                onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
              />
            </div>
          ))}
          <Button onClick={handleAdd} className="w-full gradient-primary">
            Add {fields.label}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};

export default MembersPage;
