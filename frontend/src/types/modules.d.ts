// 차트 라이브러리 타입 선언
declare module 'react-chartjs-2' {
  import { ChartType, ChartData, ChartOptions } from 'chart.js';
  import { ComponentType } from 'react';

  interface ChartProps<TType extends ChartType = ChartType> {
    type?: TType;
    data: ChartData<TType>;
    options?: ChartOptions<TType>;
    height?: number;
    width?: number;
    redraw?: boolean;
    datasetIdKey?: string;
    plugins?: any[];
  }

  export const Line: ComponentType<ChartProps<'line'>>;
  export const Bar: ComponentType<ChartProps<'bar'>>;
  export const Pie: ComponentType<ChartProps<'pie'>>;
  export const Doughnut: ComponentType<ChartProps<'doughnut'>>;
  export const Scatter: ComponentType<ChartProps<'scatter'>>;
  export const Bubble: ComponentType<ChartProps<'bubble'>>;
  export const Radar: ComponentType<ChartProps<'radar'>>;
  export const PolarArea: ComponentType<ChartProps<'polarArea'>>;
  export const Chart: ComponentType<ChartProps>;
}

declare module 'chart.js' {
  export interface ChartConfiguration<TType extends ChartType = ChartType> {
    type: TType;
    data: ChartData<TType>;
    options?: ChartOptions<TType>;
  }

  export type ChartType = 
    | 'line'
    | 'bar'
    | 'pie'
    | 'doughnut'
    | 'scatter'
    | 'bubble'
    | 'radar'
    | 'polarArea';

  export interface ChartData<TType extends ChartType = ChartType> {
    labels?: string[];
    datasets: ChartDataset<TType>[];
  }

  export interface ChartDataset<TType extends ChartType = ChartType> {
    label?: string;
    data: number[] | any[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    [key: string]: any;
  }

  export interface ChartOptions<TType extends ChartType = ChartType> {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      legend?: any;
      title?: any;
      tooltip?: any;
      [key: string]: any;
    };
    scales?: any;
    [key: string]: any;
  }

  export class Chart {
    static register(...items: any[]): void;
  }

  export const CategoryScale: any;
  export const LinearScale: any;
  export const PointElement: any;
  export const LineElement: any;
  export const Title: any;
  export const Tooltip: any;
  export const Legend: any;
  export const Filler: any;
  export const BarElement: any;
  export const ArcElement: any;
  export const RadialLinearScale: any;
  export const TimeScale: any;
  export const LogarithmicScale: any;
}