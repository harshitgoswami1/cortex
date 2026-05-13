import express from "express";
import axios from "axios"
import { streamText } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from "./prompt";
import { prisma } from "./src/config/db";
import { middleware } from "./src/middleware/middleware";
import { createOpenAI } from "@ai-sdk/openai";
import createSupabaseClient from "./src/utils/supabase/client";


const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});



const client = tavily({apiKey: process.env.TAVILY_API_KEY});

const app = express();

app.use(express.json());

// CORS — allow the Vite frontend to call the API
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/",(req,res) => {
    res.send("hello world")
})

// ─── 2-Way Auth Sync ──────────────────────────────────────────────────────────
// Called by the frontend immediately after a successful OAuth login.
// Verifies the Supabase JWT and upserts the user into the Prisma (app) DB.
app.post("/sync-user", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const { data, error } = await createSupabaseClient.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const supabaseUser = data.user;

    const user = await prisma.user.upsert({
      where: { supabaseID: supabaseUser.id },
      update: {
        email: supabaseUser.email ?? "",
        name: supabaseUser.user_metadata?.full_name
              ?? supabaseUser.user_metadata?.name
              ?? supabaseUser.email
              ?? "Anonymous",
      },
      create: {
        email: supabaseUser.email ?? "",
        supabaseID: supabaseUser.id,
        provider:
          supabaseUser.app_metadata?.provider === "google" ? "Google" : "Github",
        name: supabaseUser.user_metadata?.full_name
              ?? supabaseUser.user_metadata?.name
              ?? supabaseUser.email
              ?? "Anonymous",
      },
    });

    return res.json({ message: "User synced", userId: user.id });
  } catch (err) {
    console.error("[sync-user]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

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
        model: openrouter("openai/gpt-4o-mini"),
        prompt:prompt,
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
      res.write("\n" + JSON.stringify(webSearchResults.map(result => ({url:result.url})))+"\n");
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