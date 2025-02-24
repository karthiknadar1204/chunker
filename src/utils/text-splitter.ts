import { v4 as uuidv4 } from 'uuid';
import { ChunkOptions, ChunkMetadata, VectorChunk } from '../types';

export function splitText(text: string, options: ChunkOptions): VectorChunk<string>[] {
    const {
        chunkSize = 4000,
        overlap = 200,
        splitOn = 'character',
        preserveContext = true
    } = options;

    const chunks: VectorChunk<string>[] = [];
    const parentId = uuidv4();

    if (!preserveContext || splitOn === 'character') {

        for (let i = 0; i < text.length; i += chunkSize) {
            const content = text.slice(i, Math.min(i + chunkSize, text.length));
            console.log('Creating chunk:', { content, i, chunkSize });
            chunks.push(createChunk(content, chunks.length, Math.ceil(text.length / chunkSize), parentId));
        }
    } else {
        let segments: string[];
        if (splitOn === 'sentence') {
            segments = text.match(/[^.!?]+[.!?]+/g) || [text];
        } else if (splitOn === 'paragraph') {
            segments = text.split(/\n\s*\n/).filter(Boolean);
        } else if (splitOn === 'word') {
            segments = text.split(/\s+/);
        } else {
            segments = [text];
        }

        let currentChunk = '';
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const wouldExceedLimit = (currentChunk + (currentChunk ? ' ' : '') + segment).length > chunkSize;

            if (wouldExceedLimit && currentChunk) {
                chunks.push(createChunk(currentChunk, chunks.length, segments.length, parentId));
                currentChunk = preserveContext ? 
                    segments[i - 1]?.slice(-overlap) + segment :
                    segment;
            } else {
                currentChunk += (currentChunk ? ' ' : '') + segment;
            }
        }

        if (currentChunk) {
            chunks.push(createChunk(currentChunk, chunks.length, segments.length, parentId));
        }
    }

    console.log('Final chunks:', chunks.map(c => c.content));


    chunks.forEach((chunk, idx) => {
        chunk.metadata.previousChunk = idx > 0 ? chunks[idx - 1].metadata.id : undefined;
        chunk.metadata.nextChunk = idx < chunks.length - 1 ? chunks[idx + 1].metadata.id : undefined;
    });

    return chunks;
}

function createChunk(content: string, index: number, total: number, parentId: string): VectorChunk<string> {
    return {
        content,
        metadata: {
            id: uuidv4(),
            index,
            totalChunks: total,
            parentId,
            originalSize: content.length
        }
    };
}
