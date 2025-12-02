import { type Statistic } from '../data/schema';
import StatisticsRow from './statistics-row';

interface StatisticsTableProps {
  data: Statistic[];
  level?: number;
}

export function StatisticsTable({ data, level = 0 }: StatisticsTableProps) {
  if (level === 0) {
    return (
      <div className="bg-card rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">
                  Kaynak Türü
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  <div className="flex flex-col">
                    <span>İletişimler</span>
                    <span className="text-muted-foreground text-xs font-normal">
                      Toplam / Yüzde
                    </span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  <div className="flex flex-col">
                    <span>Teklifler</span>
                    <span className="text-muted-foreground text-xs font-normal">
                      Toplam / Yüzde
                    </span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  <div className="flex flex-col">
                    <span>Satışlar</span>
                    <span className="text-muted-foreground text-xs font-normal">
                      Toplam / Yüzde
                    </span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  <div className="flex flex-col">
                    <span>İptal Edilen</span>
                    <span className="text-muted-foreground text-xs font-normal">
                      Toplam / Yüzde
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <StatisticsRow key={item.id} item={item} level={level} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      {data.map((item) => (
        <StatisticsRow key={item.id} item={item} level={level} />
      ))}
    </>
  );
}
