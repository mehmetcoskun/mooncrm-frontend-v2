import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface OverviewProps {
  data: {
    name: string;
    customers: number;
    proposals: number;
    sales: number;
  }[];
}

export function Overview({ data }: OverviewProps) {
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
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                      Müşteriler
                    </span>
                    <span className="font-bold text-muted-foreground">
                      {payload[0]?.value}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                      Teklifler
                    </span>
                    <span className="font-bold text-muted-foreground">
                      {payload[1]?.value}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                      Satışlar
                    </span>
                    <span className="font-bold text-muted-foreground">
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


