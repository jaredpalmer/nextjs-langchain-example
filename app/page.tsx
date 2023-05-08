'use client';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { FormEvent, useCallback, useState } from 'react';

export const runtime = 'edge';

export default function Home() {
  const [stream, setStream] = useState(true);

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [inflight, setInflight] = useState(false);
  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Prevent multiple requests at once
      if (inflight) return;

      // Reset output
      setInflight(true);
      setOutput('');

      try {
        if (stream) {
          console.log('streaming');
          // If streaming, we need to use fetchEventSource directly
          await fetchEventSource(`/api/generate`, {
            method: 'POST',
            body: JSON.stringify({ input }),
            headers: { 'Content-Type': 'application/json' },
            onmessage(ev) {
              setOutput((o) => o + ev.data);
            },
          });
          setInput('');
        } else {
          // If not streaming, we can use the supabase client
          const res = await fetch(`/api/generate`, {
            method: 'POST',
            body: JSON.stringify({ input }),
          });
          const data = await res.json();
          setOutput(data.text);
          setInput('');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setInflight(false);
      }
    },
    [input, stream, inflight]
  );

  return (
    <main className="max-w-lg p-6 lg:p-20 mx-auto">
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Ask..."
          value={input}
          className="border py-2"
          onChange={(e) => setInput(e.target.value)}
        />
        <div>
          <input
            type="checkbox"
            id="stream"
            style={{ marginRight: 5 }}
            checked={stream}
            onChange={() => setStream((s) => !s)}
          />
          <label htmlFor="stream">Stream</label>
        </div>
        <button className="border px-2 py-1 rounded text-white bg-black">
          Ask
        </button>
      </form>
      <div style={{ width: 500 }}>Response: {output}</div>
    </main>
  );
}
