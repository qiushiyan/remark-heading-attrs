import type { Root } from "mdast";
import { SKIP, visit } from "unist-util-visit";

const attributeRegex = / {(?<attributes>[^}]+)}$/;
const idRegex = /#(?<id>[^\s}]+)/;
const classRegex = /\.(?<className>[^\s}]+)/g;
const keyValueRegex = /(?<key>[^\s=]+)=(?<value>[^\s}]+)/g;

const remarkHeadingAttr = () => {
	return (node: Root) => {
		visit(node, "heading", (node) => {
			const textNode = node.children.at(-1);
			if (textNode?.type !== "text") {
				return SKIP;
			}

			const text = textNode.value.trimEnd();
			const matched = attributeRegex.exec(text);
			if (!matched) {
				return SKIP;
			}

			const { attributes } = matched.groups!;
			textNode.value = text.slice(0, matched.index);

			const hProperties: Record<string, any> = {};
			const classes: string[] = [];

			// Extract id
			const idMatch = idRegex.exec(attributes);
			if (idMatch) {
				const { id } = idMatch.groups!;
				hProperties.id = id;
			}

			// Extract classes
			let classMatch;
			while ((classMatch = classRegex.exec(attributes)) !== null) {
				const { className } = classMatch.groups!;
				classes.push(className);
			}
			if (classes.length > 0) {
				hProperties.className = classes.join(" ");
			}

			// Extract key-value pairs
			let keyValueMatch;
			while ((keyValueMatch = keyValueRegex.exec(attributes)) !== null) {
				const { key, value } = keyValueMatch.groups!;
				const camelCaseKey = `data${toCamelCase(key)}`;
				hProperties[camelCaseKey] = value;
			}

			node.data ??= {};
			node.data;
			node.data.hProperties = hProperties;
		});
	};
};

const toCamelCase = (str: string) => {
	return str
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join("");
};

export default remarkHeadingAttr;
