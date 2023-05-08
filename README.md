# Next.js x LangChain bug reproduction

This basic demo shows that LangChain does not work on the Edge Runtime (e.g. Vercel/Next.js)

To reproduce, grab an [OpenAI API key](https://platform.openai.com/account/api-keys) and rename the `.env.local.example` to `.env.local`. 


```
git clone
pnpm i 
pnpm dev
```

You'll get the following error when setting `./app/api/generate` to `export const runtime = 'edge'`

```shell
- error ./node_modules/.pnpm/@dqbd+tiktoken@1.0.7/node_modules/@dqbd/tiktoken/tiktoken_bg.wasm
Module parse failed: Unexpected character '' (1:0)
The module seem to be a WebAssembly module, but module is not flagged as WebAssembly module for webpack.
BREAKING CHANGE: Since webpack 5 WebAssembly is not enabled by default and flagged as experimental feature.
You need to enable one of the WebAssembly experiments via 'experiments.asyncWebAssembly: true' (based on async modules) or 'experiments.syncWebAssembly: true' (like webpack 4, deprecated).
For files that transpile to WebAssembly, make sure to set the module type in the 'module.rules' section of the config (e. g. 'type: "webassembly/async"').
(Source code omitted for this binary file)

Import trace for requested module:
./node_modules/.pnpm/@dqbd+tiktoken@1.0.7/node_modules/@dqbd/tiktoken/tiktoken_bg.wasm
./node_modules/.pnpm/@dqbd+tiktoken@1.0.7/node_modules/@dqbd/tiktoken/tiktoken.js
./node_modules/.pnpm/langchain@0.0.70/node_modules/langchain/dist/base_language/count_tokens.js
./node_modules/.pnpm/langchain@0.0.70/node_modules/langchain/dist/chat_models/openai.js
./node_modules/.pnpm/langchain@0.0.70/node_modules/langchain/chat_models/openai.js
./app/api/generate/route.tsx
./node_modules/.pnpm/next@13.4.1_react-dom@18.2.0_react@18.2.0/node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fgenerate%2Froute&page=%2Fapi%2Fgenerate%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgenerate%2Froute.tsx&appDir=%2FUsers%2Fjared%2Fdev%2Fvercel%2Flangchain%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjared%2Fdev%2Fvercel%2Flangchain&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=!./app/api/generate/route.tsx?__edge_ssr_entry__
```
