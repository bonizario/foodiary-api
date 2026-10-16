import type { Constructor } from "@/shared/types/constructor";

export class Registry {
  private static instance: Registry | undefined;

  private readonly providers = new Map<string, Registry.Provider>();

  private constructor() {}

  public static getInstance(): Registry {
    if (!this.instance) {
      this.instance = new Registry();
    }

    return this.instance;
  }

  public register(impl: Constructor): void {
    const token = impl.name;

    if (this.providers.has(token)) {
      throw new Error(`Provider with token "${token}" is already registered`);
    }

    const deps = Reflect.getMetadata("design:paramtypes", impl) ?? [];

    this.providers.set(token, { impl, deps });
  }

  public resolve<T extends object>(impl: Constructor<T>): T {
    const token = impl.name;
    const provider = this.providers.get(token) as Registry.Provider<T> | undefined;

    if (!provider) {
      throw new Error(`Provider with token "${token}" is not registered`);
    }

    const deps = provider.deps.map((dep: Constructor) => this.resolve(dep));

    return new provider.impl(...deps);
  }
}

export namespace Registry {
  export type Provider<T extends object = object> = {
    impl: Constructor<T>;
    deps: Constructor[];
  };
}
