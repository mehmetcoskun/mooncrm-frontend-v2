import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Statistic } from '../data/schema';
import { StatisticsTable } from './statistics-table';

interface StatisticsRowProps {
  item: Statistic;
  level: number;
}

export default function StatisticsRow({ item, level }: StatisticsRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <>
      <tr
        className={cn(
          'hover:bg-muted/50 border-b transition-colors',
          hasChildren && 'cursor-pointer'
        )}
        onClick={hasChildren ? handleToggle : undefined}
      >
        <td className="px-4 py-3">
          <div
            className={cn('flex items-center gap-2', level > 0 && 'ml-4')}
            style={{ paddingLeft: `${level * 20}px` }}
          >
            {hasChildren ? (
              <div className="p-1">
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </div>
            ) : (
              <div className="w-6" />
            )}
            <span className="font-medium">{item.type}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex flex-col">
            <span className="font-semibold">
              {item.contacts.total.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-sm">
              %{item.contacts.percentage.toFixed(1)}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex flex-col">
            <span className="font-semibold">
              {item.offers.total.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-sm">
              %{item.offers.percentage.toFixed(1)}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex flex-col">
            <span className="font-semibold">
              {item.sales.total.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-sm">
              %{item.sales.percentage.toFixed(1)}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex flex-col">
            <span className="font-semibold">
              {item.canceled.total.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-sm">
              %{item.canceled.percentage.toFixed(1)}
            </span>
          </div>
        </td>
      </tr>
      {isExpanded && hasChildren && (
        <StatisticsTable data={item.children} level={level + 1} />
      )}
    </>
  );
}
