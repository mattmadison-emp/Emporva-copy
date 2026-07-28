import type { ActiveJobView } from '../../../types/activeJob';

interface SmartAlertsProps {
  jobs: ActiveJobView[];
}

export default function SmartAlerts({ jobs }: SmartAlertsProps) {
  // Build alerts from real job data
  const alerts: Array<{ icon: string; color: string; bgColor: string; borderColor: string; title: string; message: string }> = [];

  for (const job of jobs) {
    // Alert for work items needing attention
    if (job.my_work_item.status === 'assigned') {
      alerts.push({
        icon: 'ri-calendar-check-line',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Job Scheduled',
        message: `"${job.title}" is assigned to you and ready to start.`,
      });
    }

    // Alert for multi-trade coordination
    if (job.is_multi_trade) {
      const inProgressSiblings = job.all_work_items.filter(
        wi => wi.id !== job.my_work_item.id && wi.status === 'in-progress'
      );
      if (inProgressSiblings.length > 0) {
        alerts.push({
          icon: 'ri-team-line',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          title: 'Trade Coordination',
          message: `${inProgressSiblings.length} other trade(s) are in progress on "${job.title}".`,
        });
      }
    }
  }

  if (alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-[#0B1F33] mb-4 flex items-center gap-2">
        <i className="ri-notification-3-line text-teal-500"></i>
        Smart Alerts
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {alerts.slice(0, 4).map((alert, i) => (
          <div key={i} className={`p-4 ${alert.bgColor} border ${alert.borderColor} rounded-lg`}>
            <div className="flex items-start gap-3">
              <i className={`${alert.icon} ${alert.color} text-xl`}></i>
              <div>
                <p className="text-sm font-semibold text-[#0B1F33] mb-1">{alert.title}</p>
                <p className="text-xs text-[#6B7C8F]">{alert.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
