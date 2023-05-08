import { ChatOpenAI } from 'langchain/chat_models/openai';
import { LLMChain } from 'langchain/chains';
import { CallbackManager } from 'langchain/callbacks';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';

const prompt = ChatPromptTemplate.fromPromptMessages([
  HumanMessagePromptTemplate.fromTemplate('{input}'),
]);

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    console.log('input', input);
    // Check if the request is for a streaming response.
    const streaming = req.headers.get('accept') === 'text/event-stream';
    console.log('server streaming', streaming);
    if (streaming) {
      // For a streaming response we need to use a TransformStream to
      // convert the LLM's callback-based API into a stream-based API.
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      console.log('creating llm');
      const llm = new ChatOpenAI({
        streaming,
        callbackManager: CallbackManager.fromHandlers({
          handleLLMNewToken: async (token: string) => {
            await writer.ready;
            await writer.write(encoder.encode(`data: ${token}\n\n`));
          },
          handleLLMEnd: async () => {
            await writer.ready;
            await writer.close();
          },
          handleLLMError: async (e: Error) => {
            await writer.ready;
            await writer.abort(e);
          },
        }),
      });
      console.log('creating chain');
      const chain = new LLMChain({ prompt, llm });
      // We don't need to await the result of the chain.run() call because
      // the LLM will invoke the callbackManager's handleLLMEnd() method
      chain.call({ input }).catch((e: Error) => console.error(e));
      console.log('returning response');
      return new Response(stream.readable, {
        headers: { 'Content-Type': 'text/event-stream' },
      });
    } else {
      // For a non-streaming response we can just await the result of the
      // chain.run() call and return it.
      const llm = new ChatOpenAI();
      const chain = new LLMChain({ prompt, llm });
      const response = await chain.call({ input });

      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as any).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const runtime = 'edge';
