/**
 * Builds a minimal Lexical editor state (the JSON shape Payload's
 * richText fields store) from an array of plain-text paragraphs. Only
 * paragraph nodes are produced — enough for seeded placeholder copy,
 * which editors can then reformat freely in the admin rich-text editor.
 */
export function paragraphsToLexical(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'text',
            format: 0,
            style: '',
            mode: 'normal',
            detail: 0,
            version: 1,
            text,
          },
        ],
      })),
    },
  }
}
