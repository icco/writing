import { theme } from "rich-markdown-editor";

const colors = {
  almostBlack: "#443e3c",
  tan: "#eeeceb",
  lightBlack: "#2F3336",
  almostWhite: "#E6E6E6",
  white: "#FFF",
  white10: "rgba(255, 255, 255, 0.1)",
  black: "#000",
  black10: "rgba(0, 0, 0, 0.1)",
  greyLight: "#F4F7FA",
  grey: "#8e8785",
  greyMid: "#9BA6B2",
  greyDark: "#DAE1E9",
  blue: "#265c83",
};

export const light: typeof theme = {
  ...colors,

  fontFamily: "Roboto",
  fontFamilyMono: "Courier,monospace",

  text: colors.almostBlack,
  code: colors.lightBlack,
  link: colors.blue,

  toolbarBackground: colors.lightBlack,
  toolbarInput: colors.white10,
  toolbarItem: colors.white,

  blockToolbarBackground: colors.greyLight,
  blockToolbarTrigger: colors.greyMid,
  blockToolbarTriggerIcon: colors.white,
  blockToolbarItem: colors.almostBlack,

  tableDivider: colors.grey,
  tableSelected: colors.greyDark,
  tableSelectedBackground: "#E5F7FF",

  quote: colors.greyDark,
  codeBorder: colors.grey,
  horizontalRule: colors.grey,
  imageErrorBackground: colors.greyLight,

  background: colors.almostWhite,
  cursor: colors.black,
  divider: colors.black,

  toolbarHoverBackground: "",
  codeBackground: "",
  scrollbarBackground: "",
  scrollbarThumb: "",
  fontWeight: 0,
  zIndex: 0,
  placeholder: "",
  textSecondary: "",
  textLight: "",
  textHighlight: "",
  textHighlightForeground: "",
  selected: "",
  codeComment: "",
  codePunctuation: "",
  codeNumber: "",
  codeProperty: "",
  codeTag: "",
  codeString: "",
  codeSelector: "",
  codeAttr: "",
  codeEntity: "",
  codeKeyword: "",
  codeFunction: "",
  codeStatement: "",
  codePlaceholder: "",
  codeInserted: "",
  codeImportant: "",
  blockToolbarIcon: undefined,
  blockToolbarIconSelected: "",
  blockToolbarText: "",
  blockToolbarTextSelected: "",
  blockToolbarSelectedBackground: "",
  blockToolbarHoverBackground: "",
  blockToolbarDivider: "",
  noticeInfoBackground: "",
  noticeInfoText: "",
  noticeTipBackground: "",
  noticeTipText: "",
  noticeWarningBackground: "",
  noticeWarningText: "",
  primary: ""
};

export default light;