import type { Root } from "mdast";
import { SKIP, visit } from "unist-util-visit";

const attributeRegex = / {(?<attributes>[^}]+)}$/;
const idRegex = /#(?<id>[^\s}]+)/;
const classRegex = /(?<!\S)\.(?<className>[^\s.=}]+)(?!\S*=)/g;
const keyValueRegex = /(?<key>[^\s=]+)=(?<value>(?:"[^"]*"|'[^']*'|[^\s}]+))/g;

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
      let classMatch: RegExpExecArray | null;
      while ((classMatch = classRegex.exec(attributes)) !== null) {
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
      while ((keyValueMatch = keyValueRegex.exec(attributes)) !== null) {
        const key = keyValueMatch.groups?.key;
        let value = keyValueMatch.groups?.value;
        if (key && value) {
          // Remove surrounding quotes if present
          value = value.replace(/^["'](.*)["']$/, "$1");
          const camelCaseKey = toCamelCase(`data-${key}`);
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
    .split(/[-_]/)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
};

export default remarkHeadingAttr;
