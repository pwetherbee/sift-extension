import { createTheme, ThemeOptions } from "@mui/material/styles";

// Component overrides
const tabOverrides: ThemeOptions["components"] = {
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none",
      },
    },
  },
};

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  components: tabOverrides,
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
  components: tabOverrides,
});
