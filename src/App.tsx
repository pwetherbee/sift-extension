import "./App.css";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { darkTheme, lightTheme } from "../styles/theme";
import { Stack } from "@mui/system";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useEffect, useState } from "react";
import axios from "axios";

interface Tweet {
  text: string;
  id: string;
}

interface FilteredTweet {
  tweet: Tweet;
  hide: boolean;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const [foundTweets, setFoundTweets] = useState([] as Tweet[]);
  const [filteredTweets, setFilteredTweets] = useState([] as FilteredTweet[]);

  const [promptText, setPromptText] = useState(
    "Remove all negative sounding tweets"
  );

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
      setFoundTweets(result.tweets);
    });
  }, []);

  const handleFilterTweets = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/filter-tweets",
        {
          tweets: foundTweets,
          prompt: promptText,
        }
      );

      setFilteredTweets(data.filteredTweets);

      chrome.runtime.sendMessage({
        executeFilter: true,
        filteredTweets: data.filteredTweets,
      });
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
          variant="h4"
          align="center"
        >
          Content Filter GPT
        </Typography>
        <Typography align="center">
          Found {foundTweets.length} tweets
        </Typography>
        <Stack alignItems={"center"}>
          <TextField
            fullWidth
            minRows={2}
            maxRows={4}
            multiline
            label="Prompt"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
          />
          <Button variant="contained" onClick={handleFilterTweets}>
            Click to Filter Tweets
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography align="center" variant="h5">
          Filtered Tweets
        </Typography>

        <Typography align="center" variant="subtitle1">
          Removed {filteredTweets.filter((item) => item.hide).length}{" "}
        </Typography>

        {filteredTweets?.map((item) => (
          <Paper sx={{ p: 2, m: 1 }}>
            <Typography variant="body2">{item.tweet.text}</Typography>
            <Typography variant="body2">
              {item.hide ? "Hidden" : "Shown"}
            </Typography>
          </Paper>
        ))}
      </Box>
    </ThemeProvider>
  );
}

export default App;