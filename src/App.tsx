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
import { Delete, Remove } from "@mui/icons-material";

interface Tweet {
  text: string;
  id: string;
}

interface FilteredTweet {
  tweet: Tweet;
  hide: boolean;
}

interface Settings {
  blur: boolean;
  autoHide: boolean;
}

const defaultFilterKeys = ["No Politics", "No Racism", "No Spam", "No Rants"];

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
  const [darkMode, setDarkMode] = useLocalStorageState("darkMode", false);
  const [filteredTweets, setFilteredTweets] = useState([] as FilteredTweet[]);
  const [currentDomain, setCurrentDomain] = useState("");
  const [disabled, setDisabled] = useLocalStorageState("disabled", false);
  const [newPrompt, setNewPrompt] = useState("");
  const [filterConfig, setFilterConfig] = useLocalStorageState("filterConfig", {
    defaults: defaultFilterKeys,
    custom: [
      {
        text: "remove all negative sounding tweets",
        active: true,
      },
    ],
  });

  const [settings, setSettings] = useLocalStorageState<Settings>("settings", {
    blur: false,
    autoHide: true,
  });

  const isSettingsChecked = (key: keyof Settings) => {
    return settings[key];
  };

  const isChecked = (key: string) => {
    return filterConfig.defaults.includes(key);
  };

  const isCustomChecked = (index: number) => {
    return filterConfig.custom[index]?.active;
  };

  const handleCheck = (key: string) => (e: any) => {
    if (e.target.checked) {
      setFilterConfig((prev) => ({
        ...prev,
        defaults: [...prev.defaults, key],
      }));
    } else {
      setFilterConfig((prev) => ({
        ...prev,
        defaults: prev.defaults.filter((item) => item !== key),
      }));
    }
  };

  const handleCheckCustom = (index: number) => (e: any) => {
    if (e.target.checked) {
      setFilterConfig((prev) => ({
        ...prev,
        custom: prev.custom.map((item, i) =>
          i === index ? { ...item, active: true } : item
        ),
      }));
    } else {
      setFilterConfig((prev) => ({
        ...prev,
        custom: prev.custom.map((item, i) =>
          i === index ? { ...item, active: false } : item
        ),
      }));
    }
  };

  const handleRemoveCustom = (index: number) => {
    setFilterConfig((prev) => ({
      ...prev,
      custom: prev.custom.filter((item, i) => i !== index),
    }));
  };

  const handleSavePrompt = () => {
    setFilterConfig((prev) => ({
      ...prev,
      custom: [
        ...prev.custom,
        {
          text: newPrompt,
          active: true,
        },
      ],
    }));
    setNewPrompt("");
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0].url) return;
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
      setCurrentDomain(domain);
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.get(["filteredTweets"], function (result) {
      setFilteredTweets(result.filteredTweets);
    });
  }, []);

  const clearCache = () => {
    chrome.storage.local.clear();
  };

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
          justifyContent={"space-between"}
          sx={{
            m: 1,
          }}
          alignItems={"center"}
        >
          <Typography variant="subtitle2">
            <>{currentDomain}</>
          </Typography>
          <IconButton onClick={() => setDarkMode((prev) => !prev)}>
            <LightModeIcon />
          </IconButton>
        </Stack>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"center"}
          spacing={0}
        >
          <IconButton size="large" onClick={() => setDisabled((prev) => !prev)}>
            {!disabled ? (
              <FilterAltIcon
                sx={{
                  fontSize: 50,
                }}
              />
            ) : (
              <FilterAltOffIcon
                sx={{
                  fontSize: 50,
                }}
              />
            )}
          </IconButton>
          <Typography variant="h3">
            <strong>Sift</strong>
          </Typography>
        </Stack>
        <Typography variant="h6" align="center">
          Filter the internet
        </Typography>
        <Stack direction={"row"} spacing={2} justifyContent={"center"}></Stack>
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
              {defaultFilterKeys.map((key) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked(key)}
                      onChange={handleCheck(key)}
                    />
                  }
                  label={key}
                />
              ))}
            </FormGroup>
          </FormControl>

          <Divider />
          <FormControl
            sx={{
              m: 1,
            }}
          >
            <FormLabel>Your Filters: </FormLabel>
            {filterConfig.custom.map((item, i) => (
              <Stack
                direction={"row"}
                spacing={1}
                justifyContent={"space-between"}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCustomChecked(i)}
                      onChange={handleCheckCustom(i)}
                    />
                  }
                  label={item.text}
                />
                <IconButton onClick={() => handleRemoveCustom(i)}>
                  <Delete />
                </IconButton>
              </Stack>
            ))}
          </FormControl>

          <Stack
            alignItems={"center"}
            sx={{
              m: 1,
            }}
          >
            <Typography gutterBottom>Add Custom Filter</Typography>
            <TextField
              fullWidth
              minRows={2}
              maxRows={4}
              multiline
              label="Prompt"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
            />
            <Button onClick={handleSavePrompt}>Save</Button>
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
              <Button variant="outlined" color="error" onClick={clearCache}>
                Reset Cache
              </Button>
            </FormGroup>
          </FormControl>
        </TabPanel>
      </Box>
    </ThemeProvider>
  );
}

export default App;
