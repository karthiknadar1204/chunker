# Vector Chunker

A flexible text and data chunking library for vector databases and LLMs. Similar to LangChain's RecursiveCharacterTextSplitter but with additional features for structured data and context preservation.

## Installation

* bash

npm install @yourusername/vector-chunker

## Usage

```typescript
import { chunk } from 'vector-chunker';

// Text chunking
const textChunks = chunk('Your long text...', {
  chunkSize: 1000,
  format: 'text',
  splitOn: 'sentence',
  preserveContext: true,
  overlap: 200
});

// Structured data chunking
const dataChunks = chunk(yourDataArray, {
  chunkSize: 4000,
  preserveContext: true
});
```

## Features

- Text chunking with multiple splitting strategies (character, word, sentence, paragraph)
- Structured data chunking with size control
- Context preservation between chunks
- Configurable overlap
- Metadata and relationship tracking
- Full TypeScript support

## API Reference

See [API Documentation](./docs/api.md) for detailed information.

## License

MIT
