import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface DashboardOverviewProps {
  data: {
    name: string;
    customers: number;
    proposals: number;
    sales: number;
  }[];
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={10}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) {
              return null;
            }
            return (
              <div className="bg-background rounded-lg border p-2 shadow-sm">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[0.70rem] uppercase">
                      Müşteriler
                    </span>
                    <span className="text-muted-foreground font-bold">
                      {payload[0]?.value}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[0.70rem] uppercase">
                      Teklifler
                    </span>
                    <span className="text-muted-foreground font-bold">
                      {payload[1]?.value}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[0.70rem] uppercase">
                      Satışlar
                    </span>
                    <span className="text-muted-foreground font-bold">
                      {payload[2]?.value}
                    </span>
                  </div>
                </div>
              </div>
            );
          }}
        />
        <Bar
          dataKey="customers"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
          maxBarSize={40}
        />
        <Bar
          dataKey="proposals"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary/80"
          maxBarSize={40}
        />
        <Bar
          dataKey="sales"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary/60"
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
