const test = require("node:test");
const assert = require("node:assert");

test("Basic application test", () => {
    const message = "Hello 👋 I am Working Fine 🚀";

    assert.strictEqual(
        message,
        "Hello 👋 I am Working Fine 🚀"
    );
});