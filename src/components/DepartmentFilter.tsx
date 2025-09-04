"use client";

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Props {
  selectedDept: string;
  allDepts: string[];
  className?: string;
}

export default function DepartmentFilter({ selectedDept, allDepts, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value === 'Todos') params.delete('dept');
    else params.set('dept', value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <form className={className ?? 'flex items-center gap-2'}>
      <label htmlFor="dept" className="text-sm opacity-80">Departamento:</label>
      <select
        id="dept"
        name="dept"
        value={selectedDept}
        className="select select-bordered select-sm"
        onChange={(e) => handleChange(e.target.value)}
      >
        {allDepts.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </form>
  );
}
