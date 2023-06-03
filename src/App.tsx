import "./App.css";
import {
  Box,
  Button,
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
import axios from "axios";

interface FilteredTweet {
  tweet: string;
  hide: boolean;
}

interface Tweet {
  text: string;
  id: string;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const [foundTweets, setFoundTweets] = useState([] as Tweet[]);
  const [filteredTweets, setFilteredTweets] = useState([] as FilteredTweet[]);

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
    chrome.storage.local.get(["tweets"], function (result) {
      console.log("Value currently is " + result.tweets);
      setFoundTweets(result.tweets);
    });
  }, []);

  const handleFilterTweets = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/filter-tweets",
        {
          tweets: foundTweets,
          prompt: "Remove all negative sounding tweets",
        }
      );
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

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
        <Button onClick={handleFilterTweets}>Filter Tweets</Button>
        {foundTweets?.map((tweet) => (
          <Paper sx={{ p: 2, m: 1 }}>
            <Typography variant="body2">{tweet.text}</Typography>
          </Paper>
        ))}
      </Box>
    </ThemeProvider>
  );
}

export default App;
