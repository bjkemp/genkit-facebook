import { generate } from '@genkit-ai/ai';
import { initializeGenkit } from '@genkit-ai/core';
import { defineFlow, startFlowsServer } from '@genkit-ai/flow';
import { geminiPro } from '@genkit-ai/googleai';
import * as z from 'zod';
import config from './genkit.config.js';
import playwright from 'playwright';

import dotenv from 'dotenv';
dotenv.config();

// Set up playwright
const playwrightConfig = {
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

const playwrightBrowser = playwright.chromium;

initializeGenkit(config);

export const facebookFlow = defineFlow(
  {
    name: 'facebookFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const browser = await playwrightBrowser.launch(playwrightConfig);
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.facebook.com/');

    await page.fill('input[name="email"]', process.env.FACEBOOK_EMAIL || '');
    await page.fill('input[name="pass"]', process.env.FACEBOOK_PASSWORD || ''); // Fix: Provide a default value of an empty string if FACEBOOK_PASSWORD is undefined

    await page.click('button[name="login"]');
    await page.waitForNavigation();

    await page.goto('https://www.facebook.com/groups/');

    await page.fill('input[name="q"]', subject);

    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    const posts
      = await page.$$eval('div[role="article"]', (elements) => {
        return elements.map((element) => element.innerText);
      });

    await browser.close();

    return posts.join('\n');

  }
);


export const jokeFlow = defineFlow(
  {
    name: 'jokeFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const llmResponse = await generate({
      prompt: `Tell me a long joke about ${subject}`,
      model: geminiPro,
      config: {
        temperature: 1,
      },
    });

    return llmResponse.text();
  }
);

startFlowsServer();
