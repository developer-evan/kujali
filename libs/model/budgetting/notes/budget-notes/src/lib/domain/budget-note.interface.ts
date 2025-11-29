import { IObject } from '@iote/bricks';

export interface BudgetNote extends IObject {
  orgId: string;

  budgetId: string;

  content: string;
  authorId: string;

  authorName?: string;

  createdAt: number;

  updatedAt?: number;

  category?: 'general' | 'approval' | 'revision' | 'alert';

  isDeleted?: boolean;
}
