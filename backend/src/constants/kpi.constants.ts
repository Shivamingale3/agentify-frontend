export const getKpisConstant = (
  total: number,
  open: number,
  critical: number,
  resolved: number,
): { title: string; value: number; subtitle: string; style?: string }[] => {
  return [
    {
      title: 'TOTAL INCIDENTS',
      value: total,
      subtitle: 'Currently tracked',
    },
    {
      title: 'OPEN INCIDENTS',
      value: open,
      subtitle: 'Needs attention',
    },
    {
      title: 'CRITICAL INCIDENTS',
      value: critical,
      subtitle: 'Immediate action required',
    },
    {
      title: 'RESOLVED INCIDENTS',
      value: resolved,
      subtitle: 'Resolved in last 24 hours',
    },
  ];
};
