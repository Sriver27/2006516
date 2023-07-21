const express = require("express");
const axios = require("axios");
const app = express();
const port = 8008;

const cors = require("cors");
app.use(cors());

const isValidURL = (string) => {
  try {
    new URL(string);
    return true;
  } catch (error) {
    return false;
  }
};

app.get("/numbers", async (req, res) => {
  const urls = req.query.url;
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({
      error:
        'Invalid request. Please provide at least one URL in the "url" query parameter.',
    });
  }

  try {
    const responsePromises = urls.filter(isValidURL).map(async (url) => {
      try {
        const response = await axios.get(url);
        return response.data.numbers;
      } catch (error) {
        return [];
      }
    });

    const responses = await Promise.allSettled(responsePromises);
    const mergedNumbers = Array.from(
      new Set(
        responses.flatMap((result) =>
          result.status === "fulfilled" ? result.value : []
        )
      )
    ).sort((a, b) => a - b);

    return res.json({ numbers: mergedNumbers });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
