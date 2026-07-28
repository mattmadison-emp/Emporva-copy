export function getStatusColor(status: string): string {
  switch (status) {
    case 'in-progress':
    case 'In Progress':
      return 'bg-[#0B1F33]/10 text-[#0B1F33] border-[#0B1F33]/20';
    case 'assigned':
    case 'Scheduled':
      return 'bg-[#D4B483]/10 text-[#D4B483] border-[#D4B483]/20';
    case 'quoted':
    case 'Pending Approval':
      return 'bg-orange-50 text-orange-600 border-orange-200';
    case 'completed':
    case 'Completed':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'open':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'cancelled':
      return 'bg-red-50 text-red-600 border-red-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'in-progress': return 'In Progress';
    case 'assigned': return 'Scheduled';
    case 'quoted': return 'Pending Approval';
    case 'completed': return 'Completed';
    case 'open': return 'Open';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
}
