
export class AddNoteToBudgetCommand {
 
  constructor(
    public readonly orgId: string,
    public readonly budgetId: string,
    public readonly content: string,
    public readonly authorId: string,
    public readonly authorName?: string,
    public readonly category?: 'general' | 'approval' | 'revision' | 'alert'
  ) {}
}
