import "./App.css";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { darkTheme, lightTheme } from "../styles/theme";
import { Stack } from "@mui/system";
import LightModeIcon from "@mui/icons-material/LightMode";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { useEffect, useState } from "react";
import axios from "axios";
import useLocalStorageState from "./hooks/useLocalStorageState";

interface Tweet {
  text: string;
  id: string;
}

interface FilteredTweet {
  tweet: Tweet;
  hide: boolean;
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      sx={{ p: 1 }}
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {children}
    </Typography>
  );
}

// use chrome.storage.local

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const [foundTweets, setFoundTweets] = useState([] as Tweet[]);
  const [filteredTweets, setFilteredTweets] = useState([] as FilteredTweet[]);

  const [filterOn, setFilterOn] = useState(true);

  const [promptText, setPromptText] = useLocalStorageState(
    "prompt",
    "Remove all negative sounding tweets"
  );

  const [newPrompt, setNewPrompt] = useState("");

  useEffect(() => {
    setNewPrompt(promptText);
  }, [promptText]);

  useEffect(() => {
    // Retrieve the texts from local storage
    chrome.storage.local.get(["filteredTweets"], function (result) {
      setFoundTweets(result.filteredTweets);
    });
  }, []);

  const handleSavePrompt = () => {
    setPromptText(newPrompt);
  };

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

  const [activeTab, setActiveTab] = useState(0);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          width: 350,
          height: 550,
          bgcolor: "background.paper",
          borderRadius: 2,
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
            mt: 1,
          }}
          variant="h5"
          align="center"
        >
          Content Filter GPT
        </Typography>
        <Stack direction={"row"} spacing={2} justifyContent={"center"}>
          <IconButton size="large" onClick={() => setFilterOn((prev) => !prev)}>
            {filterOn ? (
              <FilterAltIcon fontSize="large" />
            ) : (
              <FilterAltOffIcon fontSize="large" />
            )}
          </IconButton>
        </Stack>

        <Stack direction={"row"} spacing={2} justifyContent={"center"}>
          <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
            <Tab label="Filters" />
            <Tab label="Results" />
            <Tab label="Settings" />
          </Tabs>
        </Stack>

        <TabPanel value={activeTab} index={0}>
          <FormControl
            sx={{
              m: 1,
            }}
          >
            <FormLabel>Remove:</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={true} />}
                label="Spam"
              />
              <FormControlLabel
                control={<Checkbox checked={true} />}
                label="Politics"
              />
              <FormControlLabel
                control={<Checkbox checked={true} />}
                label="Rants"
              />
              <FormControlLabel
                control={<Checkbox checked={true} />}
                label="Racism"
              />
            </FormGroup>
          </FormControl>
          <Stack
            alignItems={"center"}
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
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
            />
            <Button onClick={handleSavePrompt}>Save Prompt</Button>
          </Stack>
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Typography align="center" variant="h5">
            Filtered Tweets
          </Typography>

          <Typography align="center" variant="subtitle1">
            Removed {filteredTweets?.filter((item) => item.hide).length}{" "}
          </Typography>

          {filteredTweets
            ?.filter((item) => item.hide)
            .map((item) => (
              <Paper sx={{ p: 2, m: 1 }}>
                <Typography variant="body2">{item.tweet.text}</Typography>
                <Typography variant="body2">
                  {item.hide ? "Hidden" : "Shown"}
                </Typography>
              </Paper>
            ))}
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <FormControl
            sx={{
              m: 1,
            }}
          >
            <FormLabel>Filter Settings</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={true} />}
                label="Blur Items"
              />
              <FormControlLabel
                control={<Checkbox checked={true} />}
                label="Auto Hide"
              />
            </FormGroup>
          </FormControl>
        </TabPanel>
      </Box>
    </ThemeProvider>
  );
}

export default App;
