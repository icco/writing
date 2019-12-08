const colors = {
  almostBlack: "#181A1B",
  lightBlack: "#2F3336",
  almostWhite: "#E6E6E6",
  white: "#FFF",
  white10: "rgba(255, 255, 255, 0.1)",
  black: "#000",
  black10: "rgba(0, 0, 0, 0.1)",
  primary: "#1AB6FF",
  greyLight: "#F4F7FA",
  grey: "#E8EBED",
  greyMid: "#9BA6B2",
  greyDark: "#DAE1E9",
};

export const light = {
  ...colors,
  fontFamily: "Roboto",
  fontFamilyMono: "Courier,monospace",
  text: colors.almostBlack,
  code: colors.lightBlack,

  toolbarBackground: colors.lightBlack,
  toolbarInput: colors.white10,

  blockToolbarBackground: colors.greyLight,
  blockToolbarTrigger: colors.greyMid,
  blockToolbarTriggerIcon: colors.greyLight,
  blockToolbarItem: colors.almostBlack,

  tableDivider: colors.grey,
  tableSelected: colors.primary,

  quote: colors.greyDark,
  codeBorder: colors.grey,
  horizontalRule: colors.grey,
};

export default light;
