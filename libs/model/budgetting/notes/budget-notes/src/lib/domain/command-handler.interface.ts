/**
 * Generic Command Handler Interface
 * 
 * Defines the contract for all command handlers in the system.
 * This interface promotes consistency across the codebase and enables
 * better testability through dependency injection.
 * 
 * @template TCommand - The command type this handler processes
 * 
 * Design Benefits:
 * - Testability: Easy to mock for unit tests
 * - Consistency: All handlers follow the same pattern
 * - Type Safety: TypeScript ensures correct command types
 * - Extensibility: Easy to add middleware/decorators
 */
export interface ICommandHandler<TCommand> {
  /**
   * Executes the command
   * 
   * @param command - The command instance to process
   * @returns Promise that resolves when command execution is complete
   * @throws May throw domain-specific exceptions that should be handled by infrastructure
   */
  execute(command: TCommand): Promise<void>;
}
