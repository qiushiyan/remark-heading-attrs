import assert from "node:assert";
import { describe, it } from "node:test";
import { fromMarkdown } from "mdast-util-from-markdown";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import remarkHeadingAttrs from "../dist/index.js";

const processor = unified()
	.use(remarkParse)
	.use(remarkHeadingAttrs)
	.use(remarkStringify);

describe("plugin works", () => {
	it("add attribute", async () => {
		const md = "## Hello World {#id .class1 .class2 other-attr=1}";
		const ast = fromMarkdown(md);

		const result = processor.runSync(ast);
		assert.deepEqual(getHeadingProps(result), {
			id: "id",
			className: "class1 class2",
			dataOtherAttr: "1",
		});
	});

	it("add single id", async () => {
		const md = "## Hello World {#id #id2}";
		const ast = fromMarkdown(md);

		const result = processor.runSync(ast);

		assert.deepEqual(getHeadingProps(result), { id: "id" });
	});

	it("concatenate classes", async () => {
		const md = "## Hello World {.class .class2 .class3}";
		const ast = fromMarkdown(md);

		const result = processor.runSync(ast);

		assert.deepEqual(getHeadingProps(result), {
			className: "class class2 class3",
		});
	});

	it("add data attributes", async () => {
		const md = "## Hello World {one-thing=1 two-thing=2}";
		const ast = fromMarkdown(md);

		const result = processor.runSync(ast);

		assert.deepEqual(getHeadingProps(result), {
			dataOneThing: "1",
			dataTwoThing: "2",
		});
	});
});

const getHeadingProps = (node) => {
	const heading = node.children.find((child) => child.type === "heading");
	const attrs = heading.data.hProperties;
	return attrs;
};
