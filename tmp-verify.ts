import { sanitizeHtml } from './lib/blocks/sanitize';

const cases = [
  '<p>Hello</p>',
  '<strong>bold</strong>',
  '<a href="https://example.com">link</a>',
  '<p onclick="alert(1)">hover</p>',
  '<div>content</div>',
  '<p style="color:red" class="x">text</p>',
  '<a href="javascript:alert(1)">xss</a>',
];

for (const value of cases) {
  console.log(JSON.stringify(sanitizeHtml(value)));
}
