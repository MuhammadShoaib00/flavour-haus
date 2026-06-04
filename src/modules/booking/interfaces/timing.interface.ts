export interface Timing {
  date?: string;
  timeRange?: {
    startTime?: string;
    endTime?: string;
  };
}

export interface Timings {
  date: string;
  timeRanges: [
    {
      startTime: string;
      endTime: string;
    },
  ];
}
