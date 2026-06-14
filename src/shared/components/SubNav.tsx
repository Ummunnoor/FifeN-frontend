import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

export interface SubNavItem {
  to: string;
  label: string;
  end?: boolean;
}

/** Horizontal tab-style navigation for section sub-pages (e.g. the admin area). */
export function SubNav({ items }: { items: SubNavItem[] }) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-accent-600 text-accent-700'
                : 'border-transparent text-slate-500 hover:text-slate-800',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
