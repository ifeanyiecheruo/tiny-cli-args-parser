import { Transform } from "node:stream";
import type { EventData } from "node:test";
import type { TestEvent } from "node:test/reporters";

class HtmlReporter extends Transform {
    private _out: string[] = [];
    private _lastTestSummary?: EventData.TestSummary;
    private _lastCoverageSummary?: EventData.TestCoverage;

    constructor() {
        super({ writableObjectMode: true });
        this._html(
            `<html>
    <head>
        <title>Test Report</title>
        <style>
            table {
                border-collapse: collapse;
            }

            th {
                background: rgba(224, 252, 236, 1);
                border-bottom: 1px solid #ccc;
            }

            th.error {
                background: rgba(255, 219, 219, 1);
            }

            tr {
                border-bottom: 1px solid #ccc;
            }

            th,
            td {
                text-align: left;
                padding: 0.5em;
            }
        </style>
    </head>
    <body>`,
        );
    }

    _transform(event: TestEvent, _encoding: string, callback: () => void) {
        switch (event.type) {
            case "test:summary": {
                this._lastTestSummary = event.data;

                break;
            }

            case "test:coverage": {
                this._lastCoverageSummary = event.data;

                break;
            }
        }

        callback();
    }

    _flush(callback) {
        if (this._lastTestSummary) {
            const { tests, passed, cancelled, skipped, todo, suites } =
                this._lastTestSummary.counts;
            const { duration_ms } = this._lastTestSummary;
            const failed = tests - (passed + cancelled + skipped + todo);

            this._html("<h1>Test Summary</h1>");

            this._htmlTable(
                [
                    {
                        Suites: suites,
                        Tests: tests,
                        Passed: passed,
                        Failed: failed,
                        Cancelled: cancelled,
                        Skipped: skipped,
                        "To Do": todo,
                        Duration: `${duration_ms.toFixed(1)}ms`,
                    },
                ],
                {
                    Tests: failed > 0,
                    Passed: failed > 0,
                    Failed: failed > 0,
                    Suites: failed > 0,
                },
            );
        }

        if (this._lastCoverageSummary) {
            const thresholds = this._lastCoverageSummary.summary.thresholds;

            const {
                coveredLinePercent,
                coveredFunctionPercent,
                coveredBranchPercent,
            } = this._lastCoverageSummary.summary.totals;

            this._html("<h1>Coverage Summary</h1>");

            this._htmlTable(
                [
                    {
                        Lines: `${coveredLinePercent.toFixed(1)}%`,
                        Functions: `${coveredFunctionPercent.toFixed(1)}%`,
                        Branches: `${coveredBranchPercent.toFixed(1)}%`,
                    },
                ],
                {
                    Lines: coveredLinePercent < thresholds.line,
                    Functions: coveredFunctionPercent < thresholds.function,
                    Branches: coveredBranchPercent < thresholds.branch,
                },
            );
        }

        this._html(`</body></html>`);

        const lines = this._out
            .join("")
            .replaceAll("<", "\n<")
            .replaceAll(">", ">\n")
            .replaceAll("{", "\n{\n")
            .replaceAll("}", "\n}\n")
            .split("\n")
            .map((line) => line.trim());

        const indentation: string[] = [];

        for (const line of lines) {
            if (line.length < 1) {
                continue;
            }

            let indentDirective = 0;

            if ((line.startsWith("</") && line.endsWith(">")) || line === "}") {
                indentDirective = -1;
            } else if (
                (line.startsWith("<") && line.endsWith(">")) ||
                line === "{"
            ) {
                indentDirective = 1;
            } else {
                indentDirective = 0;
            }

            if (indentDirective < 0) {
                indentation.pop();
            }

            for (const item of indentation) {
                this.push(item);
            }
            this.push(line);
            this.push("\n");

            if (indentDirective > 0) {
                indentation.push("  ");
            }
        }

        callback();
    }

    _htmlTable(
        rows: Record<string, unknown>[],
        errorColumns: Record<string, boolean>,
    ): void {
        const headers: Set<string> = new Set();

        for (const row of rows) {
            for (const name of Object.keys(row)) {
                headers.add(name);
            }
        }

        this._html(`<table><thead><tr>`);
        for (const header of headers) {
            if (errorColumns[header]) {
                this._html(`<th class="error">`);
            } else {
                this._html(`<th>`);
            }
            this._html(header);
            this._html(`</th>`);
        }
        this._html(`</tr></thead><tbody>`);

        for (const row of rows) {
            this._html(`<tr>`);
            for (const header of headers) {
                this._html(`<td>`);
                const value = row[header];

                if (typeof value !== "undefined" && value !== null) {
                    this._html(String(value));
                }

                this._html(`</td>`);
            }
            this._html(`</tr>`);
        }

        this._html(`</tbody></table>`);
    }

    private _html(value: string): void {
        this._out.push(value);
    }
}

export default new HtmlReporter();
