export interface QueueConsumer<TMessage extends Record<string, unknown> = Record<string, unknown>> {
  process(message: TMessage): Promise<void>;
}
