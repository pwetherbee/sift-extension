import "./App.css";
import {
  Box,
  IconButton,
  Paper,
  ThemeProvider,
  Typography,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { darkTheme, lightTheme } from "../styles/theme";
import { Stack } from "@mui/system";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useEffect, useState } from "react";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const [foundTweets, setFoundTweets] = useState([]);

  console.log("App");

  // useEffect(() => {
  //   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //     if (request.action === "getSource") {
  //       console.log(request.source); // This will log the source text sent from the content script
  //     }
  //   });
  // }, []);

  useEffect(() => {
    // Retrieve the texts from local storage
    chrome.storage.local.get(["texts"], function (result) {
      console.log("Value currently is " + result.texts);
      setFoundTweets(result.texts);
    });
  }, []);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          width: 350,
          height: 550,
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={"row"}
          spacing={2}
          justifyContent={"flex-end"}
          sx={{
            m: 1,
          }}
        >
          <IconButton onClick={() => setDarkMode((prev) => !prev)}>
            <LightModeIcon />
          </IconButton>
        </Stack>
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
        {foundTweets?.map((tweet) => (
          <Paper sx={{ p: 2, m: 1 }}>
            <Typography variant="body2">{tweet}</Typography>
          </Paper>
        ))}
      </Box>
    </ThemeProvider>
  );
}

export default App;
