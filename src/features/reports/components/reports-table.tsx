import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { type Report } from '../data/schema';

interface ReportsTableProps {
  data: Report[];
}

export function ReportsTable({ data }: ReportsTableProps) {
  const getPerformanceBadge = (item: Report) => {
    const conversionRate =
      item.contacts.total > 0
        ? (item.sales.total / item.contacts.total) * 100
        : 0;

    if (conversionRate >= 3)
      return { variant: 'default' as const, text: 'Yüksek' };
    if (conversionRate >= 1.5)
      return { variant: 'secondary' as const, text: 'Orta' };
    return { variant: 'outline' as const, text: 'Düşük' };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sortedData = [...data].sort((a, b) => b.sales.total - a.sales.total);

  return (
    <div className="bg-card rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Danışman</th>
              <th className="px-4 py-3 text-center font-semibold">
                <div className="flex flex-col">
                  <span>İletişimler</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    Toplam
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 text-center font-semibold">
                <div className="flex flex-col">
                  <span>Teklifler</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    Toplam / Oran
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 text-center font-semibold">
                <div className="flex flex-col">
                  <span>Satışlar</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    Toplam / Oran
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 text-center font-semibold">
                <div className="flex flex-col">
                  <span>İptal Edilen</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    Toplam / Oran
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 text-center font-semibold">
                Performans
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => {
              const performanceBadge = getPerformanceBadge(item);
              const conversionRate =
                item.contacts.total > 0
                  ? (item.sales.total / item.contacts.total) * 100
                  : 0;

              return (
                <tr
                  key={item.name}
                  className="hover:bg-muted/50 border-b transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              index === 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : index === 1
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {index + 1}
                          </div>
                        )}
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs font-medium">
                            {getInitials(item.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <div className="text-muted-foreground text-xs">
                          %{conversionRate.toFixed(2)} dönüşüm
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="font-semibold">
                      {item.contacts.total.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {item.offers.total.toLocaleString()}
                      </span>
                      <span className="text-sm text-orange-600">
                        %{item.offers.percentage.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col">
                      <span className="font-semibold text-green-600">
                        {item.sales.total.toLocaleString()}
                      </span>
                      <span className="text-sm text-green-600">
                        %{item.sales.percentage.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col">
                      <span className="font-semibold text-red-600">
                        {item.canceled.total.toLocaleString()}
                      </span>
                      <span className="text-sm text-red-600">
                        %{item.canceled.percentage.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={performanceBadge.variant}>
                      {performanceBadge.text}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
