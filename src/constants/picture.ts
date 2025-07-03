// export const PIC_REVIEW_STATUS_ENUM = {
//   REVIEWING: 0,
//   PASS: 1,
//   REJECT: 2,
// }

// export const PIC_REVIEW_STATUS_MAP = {
//   0: '审核中',
//   1: '通过',
//   2: '拒绝',
// }

// export const PIC_REVIEW_STATUS_OPTIONS = Object.keys(PIC_REVIEW_STATUS_MAP).map(key => ({
//   label: PIC_REVIEW_STATUS_MAP[key],
//   value: key,
// }))

export const PIC_REVIEW_STATUS_ENUM = {
  REVIEWING: 0,
  PASS: 1,
  REJECT: 2,
} as const;

// 使用数字字面量类型定义映射
export const PIC_REVIEW_STATUS_MAP: Record<0 | 1 | 2, string> = {
  [PIC_REVIEW_STATUS_ENUM.REVIEWING]: '审核中',
  [PIC_REVIEW_STATUS_ENUM.PASS]: '通过',
  [PIC_REVIEW_STATUS_ENUM.REJECT]: '拒绝',
};

// 正确生成选项列表，同时保持类型安全
export const PIC_REVIEW_STATUS_OPTIONS = Object.entries(PIC_REVIEW_STATUS_ENUM).map(([_, value]) => ({
  label: PIC_REVIEW_STATUS_MAP[value],
  value,
}));