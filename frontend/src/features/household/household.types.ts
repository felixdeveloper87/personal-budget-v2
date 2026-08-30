export type AttachmentTarget =
  | { kind: 'expense'; id: number }
  | { kind: 'settlement'; id: number }
