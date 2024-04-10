"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jokeFlow = exports.facebookFlow = void 0;
const ai_1 = require("@genkit-ai/ai");
const core_1 = require("@genkit-ai/core");
const flow_1 = require("@genkit-ai/flow");
const googleai_1 = require("@genkit-ai/googleai");
const z = __importStar(require("zod"));
const genkit_config_js_1 = __importDefault(require("./genkit.config.js"));
const playwright_1 = __importDefault(require("playwright"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Set up playwright
const playwrightConfig = {
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
};
const playwrightBrowser = playwright_1.default.chromium;
(0, core_1.initializeGenkit)(genkit_config_js_1.default);
exports.facebookFlow = (0, flow_1.defineFlow)({
    name: 'facebookFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
}, async (subject) => {
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
    const posts = await page.$$eval('div[role="article"]', (elements) => {
        return elements.map((element) => element.innerText);
    });
    await browser.close();
    return posts.join('\n');
});
exports.jokeFlow = (0, flow_1.defineFlow)({
    name: 'jokeFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
}, async (subject) => {
    const llmResponse = await (0, ai_1.generate)({
        prompt: `Tell me a long joke about ${subject}`,
        model: googleai_1.geminiPro,
        config: {
            temperature: 1,
        },
    });
    return llmResponse.text();
});
(0, flow_1.startFlowsServer)();
//# sourceMappingURL=index.js.map