import express from "express";
import { Output, streamText } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from "./prompt";
import { createOpenAI } from "@ai-sdk/openai";
import { prisma } from "./src/config/db";
import { middleware } from "./src/middleware/middleware";

const openai = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});





const client = tavily({apiKey: process.env.TAVILY_API_KEY});

const app = express();

app.use(express.json());


app.get("/",(req,res) => {
    res.send("hello world")
})


// Signup
app.post("/signup", async (req, res) => {

})

// Signin
app.post("/signin", async (req, res) => {

})

// Past conversations get
app.get("/conversations",middleware, async (req, res) => {

})

// Past conversation get
app.post("/conversation/:conversationId",middleware, async (req, res) => {

})


app.post("/perplexity_ask",middleware, async (req, res) => {
    try {
    // step -1 get the query from user.
      const { query } = req.body;
  
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

    //   step-4 get web search results
      const webSearchResponse = await client.search(query, {
        searchDepth: "advanced"
      });
      
      const webSearchResults = webSearchResponse.results;

    //   step-6 hit the LLM and stream back the response.
      const prompt = PROMPT_TEMPLATE
        .replace("{{WEB_SEARCH_RESULTS}}", webSearchResults.map(r => r.content).join("\n"))
        .replace("{{USER_QUERY}}", query);


      const result = streamText({
        model: openai("gpt-4o"),
        prompt,
        system: SYSTEM_PROMPT,
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      // stream response
      for await (const textPart of result.textStream) {
        res.write(textPart);
      }
  
      // send sources
      res.write("\n<SOURCES>\n");
      res.write("\n" + JSON.stringify(webSearchResults.map(result => ({url:result.url})))+"\n")
      res.write("\n</SOURCES>\n");



      // step 8: close the event stream
      res.end();
  
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });



app.post("/perplexity_ask/followup",async (req,res) => {
    // 1 : get existing chat
    // 2 : forward the full chat to llm
    // 2.5 : TODO: context engineering.
    // 3 : stream responses to the server.
})


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});