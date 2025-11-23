'use client';

interface StatsChartProps {
  data: {
    label: string;
    value: number;
    max?: number;
  }[];
  title?: string;
  type?: 'bar' | 'line';
}

export default function StatsChart({ data, title, type = 'bar' }: StatsChartProps) {
  const maxValue = Math.max(...data.map(d => d.max || d.value));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-neutral-800">{title}</h3>
      )}

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const maxPercentage = item.max ? (item.max / maxValue) * 100 : 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-neutral-700">{item.label}</span>
                <span className="font-bold text-orange-600">
                  {item.value}{item.max ? `/${item.max}` : ''}
                </span>
              </div>

              <div className="relative h-8 bg-neutral-100 rounded-full overflow-hidden">
                {/* Barre de fond (max) */}
                {item.max && (
                  <div
                    className="absolute inset-y-0 left-0 bg-neutral-200 rounded-full transition-all duration-500"
                    style={{ width: `${maxPercentage}%` }}
                  />
                )}

                {/* Barre de valeur */}
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 20 && (
                    <span className="text-white text-xs font-bold">
                      {item.value}
                    </span>
                  )}
                </div>
              </div>

              {/* Pourcentage si applicable */}
              {item.max && (
                <div className="text-xs text-neutral-500 text-right">
                  {((item.value / item.max) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

