export const DEFAULT_EDITOR_OPTIONS = {
  isRealTimeFetching: false, // boolean. enables/disables debouncer to provide real-time query fetching as a query is generated
  enableMiniMap: false, // boolean
  verticalScrollbar: "hidden", // 'visible' || 'hidden'
  horizontalScrollbar: "hidden", // 'visible' || 'hidden'
  glyphMargin: false, // boolean.  Default: true.  the glyph margin is the vertical area to the left of the line numbers in the editor's gutter. It is used to display icons or glyphs that represent various editor features, such as breakpoints or folding indicators.
  folding: false, // boolean.  enables/disables the ability to fold code.
  lineDecorationsWidth: 10, // number (px). Default: 0. sets the width of the line decorations in pixels. By setting this option to 0, you are effectively disabling line decorations
  lineNumbersMinChars: 3, // number (# of characters). Default: 5. sets the min # of characters that will be used to display line numbers in the editor's gutter. The gutter is the vertical area to the left of the editor's main content area, and it can be used to display line numbers, breakpoints, and other information. By setting this option to 0, you are effectively hiding the line numbers, as they will not be displayed if they require fewer than one character to be represented.
  lineNumbers: "on",
};
