import { HandlerTools } from '@iote/cqrs';
import { FunctionHandler, FunctionContext } from '@ngfi/functions';

import { BudgetNote } from './budget-note.interface';
import { AddNoteToBudgetCommand } from './add-note.command';
import { AddNoteToBudgetResult } from './add-note-result.interface';

const BUDGET_NOTES_REPO = (orgId: string, budgetId: string): string =>
  `orgs/${orgId}/budgets/${budgetId}/notes`;

export class AddNoteToBudgetHandler extends FunctionHandler<
  AddNoteToBudgetCommand,
  AddNoteToBudgetResult
> {
  public async execute(
    command: AddNoteToBudgetCommand,
    context: FunctionContext,
    tools: HandlerTools
  ): Promise<AddNoteToBudgetResult> {
    tools.Logger.log(
      () =>
        `[AddNoteToBudgetHandler] Starting execution for budget: ${command.budgetId}`
    );

    try {
      const validationError = this.validateCommand(command);
      if (validationError) {
        tools.Logger.log(
          () =>
            `[AddNoteToBudgetHandler] Validation failed: ${validationError.errorMessage}`
        );
        return validationError;
      }

      const notesRepo = tools.getRepository<BudgetNote>(
        BUDGET_NOTES_REPO(command.orgId, command.budgetId)
      );

      const note: BudgetNote = {
        orgId: command.orgId,
        budgetId: command.budgetId,
        content: command.content.trim(),
        authorId: command.authorId,
        authorName: command.authorName,
        category: command.category || 'general',
        createdAt: Date.now(),
        isDeleted: false,
      };

      tools.Logger.log(
        () => `[AddNoteToBudgetHandler] Persisting note to database`
      );
      const createdNote = await notesRepo.create(note);

      tools.Logger.log(
        () =>
          `[AddNoteToBudgetHandler] Note created successfully with ID: ${createdNote.id}`
      );
      return {
        success: true,
        note: createdNote,
      };
    } catch (error: any) {
      tools.Logger.log(
        () => `[AddNoteToBudgetHandler] Error occurred: ${error.message}`
      );

      return {
        success: false,
        errorMessage: error.message || 'Failed to add note to budget',
        errorCode: 'UNKNOWN',
      };
    }
  }

  private validateCommand(
    command: AddNoteToBudgetCommand
  ): AddNoteToBudgetResult | null {
    if (!command.content || command.content.trim().length === 0) {
      return {
        success: false,
        errorMessage: 'Note content cannot be empty',
        errorCode: 'INVALID_CONTENT',
      };
    }

    const MAX_CONTENT_LENGTH = 10000;
    if (command.content.length > MAX_CONTENT_LENGTH) {
      return {
        success: false,
        errorMessage: `Note content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`,
        errorCode: 'INVALID_CONTENT',
      };
    }

    if (!command.orgId || !command.budgetId || !command.authorId) {
      return {
        success: false,
        errorMessage: 'Missing required fields: orgId, budgetId, or authorId',
        errorCode: 'INVALID_CONTENT',
      };
    }

    return null;
  }
}
