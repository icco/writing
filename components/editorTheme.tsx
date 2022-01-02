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

export const base = {
  ...colors,
  fontFamily: "Roboto",
  fontFamilyMono: "Courier,monospace",
};

export const light = {
  ...base,
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
  tableSelected: colors.primary,
  tableSelectedBackground: "#E5F7FF",

  quote: colors.greyDark,
  codeBorder: colors.grey,
  horizontalRule: colors.grey,
  imageErrorBackground: colors.greyLight,
};

export default light;
