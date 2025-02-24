export interface ChunkOptions {
    chunkSize?: number;
    allowOversized?: boolean;
    format?: 'text' | 'json';
    overlap?: number;
    splitOn?: 'sentence' | 'paragraph' | 'word' | 'character';
    metadata?: Record<string, any>;
    preserveContext?: boolean;
  }

export interface ChunkMetadata {
  id: string;
  index: number;
  totalChunks: number;
  parentId?: string;
  previousChunk?: string;
  nextChunk?: string;
  context?: string;
  originalSize: number;
}

export interface VectorChunk<T> {
  content: T;
  metadata: ChunkMetadata;
}