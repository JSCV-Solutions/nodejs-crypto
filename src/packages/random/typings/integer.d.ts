/** Bounds for bounded random integer generation. */
export interface IntegerOptions {
  /** Inclusive lower bound. Defaults to `0` when omitted. */
  readonly min?: number;
  /** Exclusive upper bound. */
  readonly max: number;
}
