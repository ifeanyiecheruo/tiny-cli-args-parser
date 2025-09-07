# Tiny Command Line Arguments Parser

This is my CLI parser. There are many like it, but this one is mine.

## Build status
[![CI](https://github.com/ifeanyiecheruo/tiny-cli-args-parser/actions/workflows/ci.yaml/badge.svg)](https://github.com/ifeanyiecheruo/tiny-cli-args-parser/actions/workflows/ci.yaml)

## Motivation

I just want a single file with a bit of procedural code to structure my CLI args in throw-away scripts, I don't need all of the fanciness of the more popular libraries.

## Limitations

- Does not support short arguments (e.g. -h)
- Does not support sub command style args parsing. (e.g. `command --verbose subcommand --out result.txt`)
- Does not do custom arg validation or argument coercion.
- Does not generate help text.

## Contributing

[CONTRIBUTING.md](./CONTRIBUTING.md)

## Usage

```typescript
import { basename } from "node:path";
import { parseArgs } from "tiny-cli-args-parser";

function help(programName: string): void {
    console.log(`${programName} --label <label> [--count <count>] [--rate <rate>] [--verbose] [--help]`);
    console.log("\tPrints <label>, <rate> time(s) per second, no more than <count> times.");
}

const cliArgs = parseArgs(
    process.argv.slice(2), // Command line arguments
    { // expected options 
        label: "string",    // switch,  accepts --label <arbitrary-string>
        count: "integer",   // integer, accepts --count <integer>
        rate: "number",     // number,  accepts --rate <number>
        verbose: "boolean", // flag,    accepts --verbose, --no-verbose 
        help: "boolean",    // flag,    accepts --help, --no-help 
    },    
    { // default values 
        verbose: false,
        count: 1,
        rate: 1.0,
    }
);

try {
    if (cliArgs.error) {
        throw cliArgs.error;
    }

    if (cliArgs.label !== "string") {
        throw new Error("--label is required");
    }

    if (cliArgs.count < 1) {
        throw new Error("--count must be larger than 0");
    }

    if (cliArgs.rate <= 0) {
        throw new Error("--rate must be larger than 0");
    }
} catch (error) {
    console.error(error.message);
    cliArgs.help = true;
}

if (cliArgs.help) {
    help(basename(process.argv[1]));
    return;
}

if (cliArgs.verbose) {
    console.log(`Printing '${cliArgs.label}' ${cliArgs.count} time(s) at a rate of ${cliArgs.rate} time(s) per second.`);
}

let i = 0;
let handle = setInterval(function () {
    if (i >= cliArgs.count) {
        clearInterval(handle);
        handle = -1;
        return;
    }
    i++;

    console.log(cliArgs.label);
}, 1000 / cliArgs.rate);

```

## API

```typescript
interface TResults {
    // Positional arguments
    args: string[],

    // Parsed switches and flags
    options: TParsedOptions,

    // Parse error, if any
    error: Error | undefined;
}
function parseArgs<TExpected, TDefaults, TResults>(
    argv: Iterable<string>, 
    expected: TExpected, 
    defaults: TDefaults
): TResults;
```

Where...

- `TExpected` is an object whose keys are option names. Each key having a value of...

  - `"string"`
  - `"integer"`
  - `"number"`
  - `"boolean"`

- `TDefaults` is an object providing default values for the option names specified in `TExpected`.

- `TParsedOptions` is an object providing parsed switches and flags. It's keys are a union of the keys in `TExpected` and `TDefaults`.
