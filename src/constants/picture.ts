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


export const PICTURE_EDIT_MESSAGE_TYPE_ENUM = {
  INFO: 'INFO',
  ERROR: 'ERROR',
  ENTER_EDIT: 'ENTER_EDIT',
  EXIT_EDIT: 'EXIT_EDIT',
  EDIT_ACTION: 'EDIT_ACTION',
};

export const PICTURE_EDIT_MESSAGE_TYPE_MAP = {
  INFO: '发送通知',
  ERROR: '发送错误',
  ENTER_EDIT: '进入编辑状态',
  EXIT_EDIT: '退出编辑状态',
  EDIT_ACTION: '执行编辑操作',
};

export const PICTURE_EDIT_ACTION_ENUM = {
  ZOOM_IN: 'ZOOM_IN',
  ZOOM_OUT: 'ZOOM_OUT',
  ROTATE_LEFT: 'ROTATE_LEFT',
  ROTATE_RIGHT: 'ROTATE_RIGHT',
};

export const PICTURE_EDIT_ACTION_MAP = {
  ZOOM_IN: '放大操作',
  ZOOM_OUT: '缩小操作',
  ROTATE_LEFT: '左旋操作',
  ROTATE_RIGHT: '右旋操作',
};
