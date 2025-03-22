export function parseMarkdown(text) {
  if (!text) return "";

  return text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Bold
    .replace(/\*(.*?)\*/g, "<i>$1</i>") // Italic
    .replace(/`(.*?)`/g, "<code>$1</code>") // Code
    .replace(/^# (.*$)/gm, "<h1>$1</h1>") // H1
    .replace(/^- (.*$)/gm, "<ul><li>$1</li></ul>"); // List
}
