/** Stable fingerprint of a question, independent of its position in the bank. */
export function identityOf(question) {
  const text = JSON.stringify([
    question.type, question.itemType, question.prompt,
    question.tokens, question.passage, question.narration,
    question.options,
  ]);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}
