import { ChunkOptions, VectorChunk } from './types';
import { splitText } from './utils/text-splitter';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_CHUNK_SIZE = 4000;

export function chunk<T>(data: T, options: ChunkOptions = {}): VectorChunk<T[]>[] {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    allowOversized = true,
    format = 'json',
    preserveContext = true
  } = options;

  try {
    if (typeof data === 'string' && format === 'text') {
      return splitText(data, options) as unknown as VectorChunk<T[]>[];
    }

    if (preserveContext) {
      return chunkStructuredDataWithContext(data, { ...options, allowOversized });
    } else {
      return chunkStructuredData(data, chunkSize, allowOversized).map(content => ({
        content,
        metadata: {
          id: uuidv4(),
          index: 0,
          totalChunks: 1,
          originalSize: calculateElementSize(content)
        }
      }));
    }
  } catch (error) {
    throw new Error(`Chunking failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

function chunkStructuredData<T>(data: T, chunkSize: number, allowOversized: boolean): T[][] {
  const elements = Array.isArray(data) ? [...data] : [data];
  const chunks: T[][] = [];
  
  for (const element of elements) {
    const elementSize = calculateElementSize(element);
    if (elementSize > chunkSize && !allowOversized) {
      throw new Error(`Element exceeds chunk size limit (${chunkSize} characters)`);
    }
  }

  let currentChunk: T[] = [];
  let currentSize = 0;

  for (const element of elements) {
    const elementSize = calculateElementSize(element);
    
    if (elementSize > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push([...currentChunk]);
      }
      chunks.push([element]);
      currentChunk = [];
      currentSize = 0;
      continue;
    }

    if (currentSize + elementSize > chunkSize && currentChunk.length > 0) {
      chunks.push([...currentChunk]);
      currentChunk = [];
      currentSize = 0;
    }

    currentChunk.push(element);
    currentSize += elementSize;
  }

  if (currentChunk.length > 0) {
    chunks.push([...currentChunk]);
  }

  return chunks;
}

function calculateElementSize(element: any): number {
  if (typeof element === 'string') return element.length;
  return JSON.stringify(element).length;
}

function chunkStructuredDataWithContext<T>(data: T, options: ChunkOptions): VectorChunk<T[]>[] {
  const { 
    chunkSize = DEFAULT_CHUNK_SIZE,
    allowOversized = true 
  } = options;
  
  const elements = Array.isArray(data) ? [...data] : [data];
  
  for (const element of elements) {
    const elementSize = calculateElementSize(element);
    if (elementSize > chunkSize && !allowOversized) {
      throw new Error(`Element exceeds chunk size limit (${chunkSize} characters)`);
    }
  }

  const chunks: VectorChunk<T[]>[] = [];
  const parentId = uuidv4();
  let currentChunk: T[] = [];
  let currentSize = 0;

  for (const element of elements) {
    const elementSize = calculateElementSize(element);
    
    if (elementSize > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(createStructuredChunk([...currentChunk], chunks.length, parentId));
        currentChunk = [];
        currentSize = 0;
      }
      chunks.push(createStructuredChunk([element], chunks.length, parentId));
      continue;
    }

    if (currentSize + elementSize > chunkSize && currentChunk.length > 0) {
      chunks.push(createStructuredChunk([...currentChunk], chunks.length, parentId));
      currentChunk = [];
      currentSize = 0;
    }
    
    currentChunk.push(element);
    currentSize += elementSize;
  }

  if (currentChunk.length > 0) {
    chunks.push(createStructuredChunk([...currentChunk], chunks.length, parentId));
  }

  chunks.forEach((chunk, idx) => {
    chunk.metadata.totalChunks = chunks.length;
    chunk.metadata.previousChunk = idx > 0 ? chunks[idx - 1].metadata.id : undefined;
    chunk.metadata.nextChunk = idx < chunks.length - 1 ? chunks[idx + 1].metadata.id : undefined;
  });

  return chunks;
}

function createStructuredChunk<T>(content: T[], index: number, parentId: string): VectorChunk<T[]> {
  return {
    content,
    metadata: {
      id: uuidv4(),
      index,
      totalChunks: 0,
      parentId,
      originalSize: calculateElementSize(content)
    }
  };
}

export default chunk;