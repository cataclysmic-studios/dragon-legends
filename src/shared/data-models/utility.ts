export class Unique implements Record<string, unknown> {
  [key: string]: unknown;
  
  public constructor(
    public readonly id: string
  ) {}
}

export interface StorableVector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
