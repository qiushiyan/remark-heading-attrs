# remark-heading-attrs

A remark plugin to support [pandoc-style heading attributes](https://pandoc.org/chunkedhtml-demo/8.3-headings.html#extension-header_attributes).

```markdown
## Heading {#id .class1 .class2 key1=value1 key2=value2}
```

becomes

```html
<h2 id="id" class="class1 class2" data-key1="value1" data-key2="value2">Heading</h2>
```

## Installation

```bash
npm install remark-heading-attrs
```
