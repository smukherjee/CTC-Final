export const LR_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: '#f1f5f9', text: '#475569' },
  DISPATCHED: { bg: '#dbeafe', text: '#1e40af' },
  DELIVERED: { bg: '#dcfce7', text: '#166534' },
  POD_UPLOADED: { bg: '#fef3c7', text: '#92400e' },
  POD_VERIFIED: { bg: '#d1fae5', text: '#065f46' },
  BILLED: { bg: '#e0e7ff', text: '#3730a3' },
};

export const DEFAULT_LR_STATUS_COLOR = { bg: '#f1f5f9', text: '#475569' };
