"use client";
import React, { useState } from 'react';

type User = {
  id: string;
  email: string;
  displayName: string | null;
  department?: string | null;
};

const departments = [
  "After Sales","Billing","Comercial B2B","Comercial B2C","Continuous Improvement","Controlling, Reporting & Data Analysis","Customer Service","Customer Success","Cut-off & Debt Management","Energy Management","F2F","HR","IT","Legal","Marketing","New Energy","Operations","Partnerships","Retail","Switch","Tax, Accounting & Treasury","Telemarketing","Winback","Outro"
];

export default function ProfileForm({ initialUser }: { initialUser: User }) {
  const [displayName, setDisplayName] = useState(initialUser.displayName || "");
  const [department, setDepartment] = useState(initialUser.department || "Outro");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ displayName: displayName || null, department: department || null })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Guardado com sucesso.');
        try { localStorage.setItem('auth:event', `${Date.now()}:profile`); } catch {}
        try { window.dispatchEvent(new Event('auth:changed')); } catch {}
      } else {
        setMessage(data.error || 'Erro ao guardar');
      }
    } catch {
      setMessage('Erro de ligação');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input className="input input-bordered w-full" value={initialUser.email} disabled />
      </div>
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium mb-1">Nome</label>
        <input id="displayName" className="input input-bordered w-full" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} placeholder="O teu nome" />
      </div>
      <div>
        <label htmlFor="department" className="block text-sm font-medium mb-1">Departamento</label>
        <select id="department" className="select select-bordered w-full" value={department} onChange={(e)=>setDepartment(e.target.value)}>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</button>
        {message && <span className="text-sm opacity-80">{message}</span>}
      </div>
    </form>
  );
}
