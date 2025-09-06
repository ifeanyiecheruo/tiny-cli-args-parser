import type { TestContext } from "node:test";
import { describe, test } from "node:test";
import { parseArgs } from "./main.mts";

describe("parseArgs", () => {
    describe("no args", () => {
        test("no spec", (t: TestContext) => {
            t.assert.deepStrictEqual(parseArgs([], {}, {}), {
                args: [],
                options: {},
                error: undefined,
            });
        });

        test("flag spec", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs([], { verbose: "boolean" }, {}),
                {
                    args: [],
                    options: {},
                    error: undefined,
                },
            );
        });

        test("switch spec", (t: TestContext) => {
            t.assert.deepStrictEqual(parseArgs([], { label: "string" }, {}), {
                args: [],
                options: {},
                error: undefined,
            });
        });

        test("flag and switch spec", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs([], { verbose: "boolean", label: "string" }, {}),
                { args: [], options: {}, error: undefined },
            );
        });

        test("default", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(
                    [],
                    { verbose: "boolean", label: "string" },
                    { verbose: false, label: "Hello world" },
                ),
                {
                    args: [],
                    options: { verbose: false, label: "Hello world" },
                    error: undefined,
                },
            );
        });
    });

    describe("flag spec", () => {
        test("one flag", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(["--verbose"], { verbose: "boolean" }, {}),
                {
                    args: [],
                    options: { verbose: true },
                    error: undefined,
                },
            );
        });

        test("negate one flag", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(["--no-verbose"], { verbose: "boolean" }, {}),
                {
                    args: [],
                    options: { verbose: false },
                    error: undefined,
                },
            );
        });

        test("multi flag", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(
                    ["--no-verbose", "--use-color", "--no-watch"],
                    {
                        verbose: "boolean",
                        "use-color": "boolean",
                        watch: "boolean",
                    },
                    {},
                ),
                {
                    args: [],
                    options: {
                        verbose: false,
                        "use-color": true,
                        watch: false,
                    },
                    error: undefined,
                },
            );
        });

        test("use flag default", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(
                    ["--no-verbose"],
                    {
                        verbose: "boolean",
                        "use-color": "boolean",
                        watch: "boolean",
                    },
                    { "use-color": false, watch: false },
                ),
                {
                    args: [],
                    options: {
                        verbose: false,
                        "use-color": false,
                        watch: false,
                    },
                    error: undefined,
                },
            );
        });

        test("override flag default", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(
                    ["--no-verbose", "--use-color", "--no-watch"],
                    {
                        verbose: "boolean",
                        "use-color": "boolean",
                        watch: "boolean",
                    },
                    { verbose: true, "use-color": false, watch: false },
                ),
                {
                    args: [],
                    options: {
                        verbose: false,
                        "use-color": true,
                        watch: false,
                    },
                    error: undefined,
                },
            );
        });
    });

    describe("switch spec", () => {
        test("one switch", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(["--label", "Hello world"], { label: "string" }, {}),
                {
                    args: [],
                    options: {
                        label: "Hello world",
                    },
                    error: undefined,
                },
            );
        });

        test("multi switch", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(
                    ["--label", "Hello world", "--out", "result.txt"],
                    { label: "string", out: "string" },
                    {},
                ),
                {
                    args: [],
                    options: { label: "Hello world", out: "result.txt" },
                    error: undefined,
                },
            );
        });

        describe("numeric switch", () => {
            test("can parse integer and number", (t: TestContext) => {
                t.assert.deepStrictEqual(
                    parseArgs(
                        [
                            "--count",
                            "5",
                            "--min",
                            "-8",
                            "--max",
                            "3.6",
                            "--limit",
                            "-Infinity",
                        ],
                        {
                            count: "integer",
                            min: "number",
                            max: "number",
                            limit: "number",
                        },
                        {},
                    ),
                    {
                        args: [],
                        options: {
                            count: 5,
                            min: -8,
                            max: 3.6,
                            limit: -Infinity,
                        },
                        error: undefined,
                    },
                );
            });
        });

        test("use switch default", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(
                    ["--out", "result.txt"],
                    { label: "string", out: "string" },
                    { label: "Bye world" },
                ),
                {
                    args: [],
                    options: { label: "Bye world", out: "result.txt" },
                    error: undefined,
                },
            );
        });

        test("override switch default", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(
                    ["--label", "Hello world", "--out", "result.txt"],
                    { label: "string", out: "string" },
                    { label: "Bye world" },
                ),
                {
                    args: [],
                    options: { label: "Hello world", out: "result.txt" },
                    error: undefined,
                },
            );
        });
    });

    describe("args", () => {
        test("gather args no switches", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(["The", "laughing", "fox"], {}, {}),
                {
                    args: ["The", "laughing", "fox"],
                    options: {},
                    error: undefined,
                },
            );
        });

        test("gather args with switches", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(
                    [
                        "--label",
                        "Hello world",
                        "--verbose",
                        "The",
                        "laughing",
                        "fox",
                    ],
                    { label: "string", verbose: "boolean" },
                    {},
                ),
                {
                    args: ["The", "laughing", "fox"],
                    options: { label: "Hello world", verbose: true },
                    error: undefined,
                },
            );
        });
    });

    describe("errors", () => {
        test("unknown option", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(
                    [
                        "--label",
                        "Bye world",
                        "--unknown",
                        "--out",
                        "result.txt",
                    ],
                    { label: "string", verbose: "boolean" },
                    {},
                ),
                {
                    args: [],
                    options: {},
                    error: new RangeError("Unknown flag/switch 'unknown'"),
                },
            );
        });

        test("unknown negation option", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(
                    [
                        "--label",
                        "Bye world",
                        "--no-unknown",
                        "--out",
                        "result.txt",
                    ],
                    { label: "string", verbose: "boolean" },
                    {},
                ),
                {
                    args: [],
                    options: {},
                    error: new RangeError("Unknown flag/switch 'no-unknown'"),
                },
            );
        });

        test("flag no value at end of args", (t: TestContext) => {
            t.assert.deepStrictEqual(
                parseArgs(
                    ["--label", "Bye world", "--out"],
                    { label: "string", out: "string" },
                    {},
                ),
                {
                    args: [],
                    options: {},
                    error: new RangeError("Flag --out requires string value."),
                },
            );
        });

        describe("integer", () => {
            test("reject empty string for integer switches", (t: TestContext) => {
                t.assert.deepStrictEqual(
                    parseArgs(["--count", ""], { count: "integer" }, {}),
                    {
                        args: [],
                        options: {},
                        error: new RangeError(
                            "Flag --count requires integer value.",
                        ),
                    },
                );
            });

            test("reject float for integer switches", (t: TestContext) => {
                t.assert.deepStrictEqual(
                    parseArgs(["--count", "2.5"], { count: "integer" }, {}),
                    {
                        args: [],
                        options: {},
                        error: new RangeError(
                            "Flag --count requires integer value.",
                        ),
                    },
                );
            });

            test("reject infinity for integer switches", (t: TestContext) => {
                t.assert.deepStrictEqual(
                    parseArgs(
                        ["--count", "Infinity"],
                        { count: "integer" },
                        {},
                    ),
                    {
                        args: [],
                        options: {},
                        error: new RangeError(
                            "Flag --count requires integer value.",
                        ),
                    },
                );
            });

            test("reject non-number for integer switches", (t: TestContext) => {
                t.assert.deepStrictEqual(
                    parseArgs(
                        ["--count", "Hello world"],
                        { count: "integer" },
                        {},
                    ),
                    {
                        args: [],
                        options: {},
                        error: new RangeError(
                            "Flag --count requires integer value.",
                        ),
                    },
                );
            });
        });

        describe("numeric", () => {
            test("reject empty string for numeric switches", (t: TestContext) => {
                t.assert.deepStrictEqual(
                    parseArgs(["--limit", ""], { limit: "number" }, {}),
                    {
                        args: [],
                        options: {},
                        error: new RangeError(
                            "Flag --limit requires number value.",
                        ),
                    },
                );
            });

            test("reject non-number for numeric switches", (t: TestContext) => {
                t.assert.deepStrictEqual(
                    parseArgs(
                        ["--limit", "Hello world"],
                        { limit: "number" },
                        {},
                    ),
                    {
                        args: [],
                        options: {},
                        error: new RangeError(
                            "Flag --limit requires number value.",
                        ),
                    },
                );
            });
        });
    });
});
