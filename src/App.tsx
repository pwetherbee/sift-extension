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

  const handleSavePrompt = () => {
    chrome.storage.local.set({ prompt: promptText }, function () {
      console.log("Value is set to " + promptText);
    });
  };

  useEffect(() => {
    // Retrieve the texts from local storage
    chrome.storage.local.get(["filteredTweets"], function (result) {
      setFoundTweets(result.filteredTweets);
    });

    chrome.storage.local.get(["prompt"], function (result) {
      setPromptText(result.prompt);
    });
  }, []);

  const handleFilterTweets = async () => {
    try {
      const { data } = await axios.post("http://localhost:3000/api/filter", {
        tweets: foundTweets,
        prompt: promptText,
      });

      setFilteredTweets(data.filteredTweets);

      chrome.runtime.sendMessage({
        executeFilter: true,
        filteredTweets: data.filteredTweets,
      });
    } catch (error) {
      alert(error);
      console.error(error);
    }
  };

  useEffect(() => {
    chrome.storage.local.get(["filteredTweets"], function (result) {
      setFilteredTweets(result.filteredTweets);
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
          variant="h4"
          align="center"
        >
          Content Filter GPT
        </Typography>
        <Typography align="center">
          Found {foundTweets.length} tweets
        </Typography>
        <Box
          sx={{
            m: 1,
          }}
        >
          <TextField
            fullWidth
            minRows={2}
            maxRows={4}
            multiline
            label="Prompt"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
          />
        </Box>
        <Button onClick={handleSavePrompt}>Save Prompt</Button>
        <Stack alignItems={"center"}>
          <Button
            sx={{
              m: 1,
            }}
            variant="contained"
            onClick={handleFilterTweets}
          >
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
