const STATUS_STYLES = {
  pending:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS = {
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${style}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
