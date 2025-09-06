"use strict";

export type OptionKind = "boolean" | "integer" | "number" | "string";
export type OptionType<T extends OptionKind> = T extends "string"
  ? string
  : T extends "integer"
  ? number
  : T extends "number"
  ? number
  : T extends "boolean"
  ? boolean
  : never;

export type ParsedOptions<T extends Record<string, OptionKind>> = {
  [K in keyof T]?: OptionType<T[K]>;
};

export type ParseArgsResult<
  T extends Record<string, OptionKind>,
  TDefault extends ParsedOptions<T> = {}
> = {
  args: string[];
  options: ParsedOptions<T> & TDefault;
  error: Error | undefined;
};

export function parseArgs<
  T extends Record<string, OptionKind>,
  TDefault extends ParsedOptions<T> = {}
>(
  argv: Iterable<string>,
  expected: T,
  defaults: TDefault
): ParseArgsResult<T, TDefault> {
  const args: string[] = [];
  const options: Record<string, unknown> = {};
  let error: Error | undefined;

  const flags: Array<[string, string | number | boolean]> = [];

  try {
    let option: [string, OptionKind] | undefined;

    for (const arg of argv) {
      if (typeof option !== "undefined") {
        flags.push(parseOption(option, arg));
        option = undefined;
        continue;
      }

      if (arg.startsWith("--")) {
        const name = arg.substring(2);
        let kind = expected[name];

        if (typeof kind === "undefined") {
          if (name.startsWith("no-")) {
            kind = expected[name.substring(3)];
            if (kind !== "boolean") {
              kind = undefined;
            }
          }
        }

        if (typeof kind === "undefined") {
          throw new RangeError(`Unknown flag/switch '${name}'`);
        }

        option = [name, kind];

        if (!needsValue(kind)) {
          flags.push(parseOption(option, ""));
          option = undefined;
        }

        continue;
      }

      args.push(arg);
    }

    if (option) {
      assert(needsValue(option[1]));

      throw new RangeError(`Flag --${option[0]} requires ${option[1]} value.`);
    }

    flags.reduce(function (prev, [name, value]) {
      prev[name] = value;

      return prev;
    }, options);
  } catch (e) {
    error = Error.isError(e) ? e : new Error(String(e));
  }

  return {
    args: args,
    options: { ...defaults, ...options },
    error: error,
  };
}

function parseOption(
  option: [string, OptionKind],
  value: string
): [string, string | number | boolean] {
  const [name, kind] = option;

  switch (kind) {
    case "string": {
      return [name, value];
    }

    case "integer": {
      const result = Number.parseFloat(value);

      if (!Number.isInteger(result) || Number.isNaN(value)) {
        throw new RangeError(
          `Flag --${name} requires ${kind} value.`
        );
      }

      return [name, result];
    }

    case "number": {
      const result = Number.parseFloat(value);

      if (Number.isNaN(result) || Number.isNaN(value)) {
        throw new RangeError(
          `Flag --${name} requires ${kind} value.`
        );
      }

      return [name, result];
    }
    case "boolean": {
      if (name.startsWith("no-")) {
        return [name.substring(3), false];
      }

      return [name, true];
    }

    default: {
      assert(false);
    }
  }
}

function needsValue(kind: OptionKind): boolean {
  return kind != "boolean";
}

function assert(value: unknown): asserts value {
  if (value) {
    return;
  }

  throw new Error("assert");
}
