import { Injectable } from "@/core/decorators/injectable";

type CompensationFunction = () => Promise<void>;

@Injectable()
export class Saga {
  private compensations: CompensationFunction[] = [];

  public addCompensation(fn: CompensationFunction): void {
    this.compensations.push(fn);
  }

  public async run<TResult>(fn: () => Promise<TResult>): Promise<TResult> {
    try {
      return await fn();
    } catch (error) {
      await this.compensate();
      throw error;
    }
  }

  public async compensate(): Promise<void> {
    for await (const compensation of this.compensations.toReversed()) {
      try {
        await compensation();
      } catch (error) {
        console.error(error);
      }
    }
  }
}
