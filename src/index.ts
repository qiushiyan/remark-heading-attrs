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
			if (!matched || !matched.groups || !matched.groups.attributes) {
				return SKIP;
			}

			const { attributes } = matched.groups;

			textNode.value = text.slice(0, matched.index);

			const hProperties: Record<string, any> = {};
			const classes: string[] = [];

			// Extract id
			const idMatch = idRegex.exec(attributes);
			if (idMatch?.groups) {
				const { id } = idMatch.groups;
				hProperties.id = id;
			}

			// Extract classes
			// Extract classes
			let classMatch: RegExpExecArray | null;
			while (true) {
				classMatch = classRegex.exec(attributes);
				if (classMatch === null) break;
				const className = classMatch.groups?.className;
				if (className) {
					classes.push(className);
				}
			}
			if (classes.length > 0) {
				hProperties.className = classes.join(" ");
			}

			// Extract key-value pairs
			let keyValueMatch: RegExpExecArray | null;
			while (true) {
				keyValueMatch = keyValueRegex.exec(attributes);
				if (keyValueMatch === null) break;
				const key = keyValueMatch.groups?.key;
				const value = keyValueMatch.groups?.value;
				if (key && value) {
					const camelCaseKey = `data${toCamelCase(key)}`;
					hProperties[camelCaseKey] = value;
				}
			}

			node.data ??= {};
			// @ts-ignore
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
