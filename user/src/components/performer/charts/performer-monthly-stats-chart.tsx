import dynamic from 'next/dynamic';
import React from 'react';

// eslint-disable-next-line no-shadow
const Line = dynamic(() => import('@ant-design/plots').then(({ Line }) => Line), { ssr: false });

interface IProps {
  stats: any;
  color: string;
}

export function PerformerMonthlyStatsChart({ stats, color }: IProps) {
  const config = {
    data: stats,
    xField: 'label',
    yField: 'value',
    pointStyle: {
      with: 100
    },
    point: {
      size: 2,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2
      }
    },
    yAxis: {
      label: {
        formatter: (v) => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`)
      }
    },
    seriesField: 'type',
    // eslint-disable-next-line no-nested-ternary
    color: ({ type }) => (type === 'Total Lost Subscriptions' ? '#ca6a66' : type === 'Total Tips' ? '#5ad8a6' : color),
    lineStyle: ({ type }) => {
      if (type === 'Total Lost Subscriptions') {
        return {
          lineDash: [4, 4],
          opacity: 0.5
        };
      }

      return {
        opacity: 1
      };
    }
  };

  return <Line {...config} style={{ height: '250px' }} />;
}

export default PerformerMonthlyStatsChart;
