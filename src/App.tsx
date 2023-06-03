import "./App.css";
import { Box, Paper, ThemeProvider, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { darkTheme } from "../styles/theme";

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          width: 350,
          height: 550,
          bgcolor: "background.paper",
        }}
      >
        <Typography
          sx={{
            mt: 3,
          }}
          variant="h5"
          align="center"
        >
          Content Filter GPT
        </Typography>
        <Typography variant="subtitle1" align="center">
          Content Filter GPT
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;
