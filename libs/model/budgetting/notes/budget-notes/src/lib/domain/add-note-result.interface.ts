import { BudgetNote } from './budget-note.interface';

export interface AddNoteToBudgetResult {
  success: boolean;

  note?: BudgetNote;

  errorMessage?: string;
  errorCode?:
    | 'INVALID_CONTENT'
    | 'BUDGET_NOT_FOUND'
    | 'NOT AUTHORIZED'
    | 'UNKNOWN';
}
