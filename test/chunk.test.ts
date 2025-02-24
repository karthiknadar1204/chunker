import { chunk } from '../src';

describe('chunk function', () => {
  test('chunks text input', () => {
    const result = chunk('abcdefghijklm', { chunkSize: 5, format: 'text' });
    console.log('Text chunking result:', {
      chunks: result.map(chunk => chunk.content),
      metadata: result.map(chunk => chunk.metadata)
    });
    expect(result.map(chunk => chunk.content)).toEqual(['abcde', 'fghij', 'klm']);
  });

  test('chunks array of objects', () => {
    const data = [
      { id: 1, content: 'a'.repeat(2000) },
      { id: 2, content: 'b'.repeat(2000) },
      { id: 3, content: 'c'.repeat(2000) }
    ];
    
    const result = chunk(data, { chunkSize: 4500 });
    console.log('Array chunking result:', {
      chunkLengths: result.map(chunk => chunk.content.length),
      metadata: result.map(chunk => chunk.metadata)
    });
    expect(result[0].content.length).toBe(2);
    expect(result[1].content.length).toBe(1);
  });

  test('handles oversized elements', () => {
    const data = { content: 'a'.repeat(5000) };
    const result = chunk(data, { chunkSize: 4000 });
    expect(result[0].content).toEqual([data]);
  });

  test('throws error for oversized elements when not allowed', () => {
    const data = { content: 'a'.repeat(5000) };
    expect(() => chunk(data, { chunkSize: 4000, allowOversized: false }))
      .toThrow('Element exceeds chunk size limit');
  });

  test('maintains data integrity', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' }
    ];
    
    const result = chunk(data, { chunkSize: 100 });
    const reconstructed = result.flatMap(chunk => chunk.content);
    console.log('Data integrity test:', {
      original: data,
      chunks: result.map(chunk => chunk.content),
      reconstructed
    });
    expect(reconstructed).toEqual(data);
  });

  test('maintains context between chunks with overlap', () => {
    const text = 'First sentence. Second sentence. Third sentence. Fourth sentence.';
    const result = chunk(text, { 
      chunkSize: 20, 
      format: 'text',
      preserveContext: true,
      overlap: 10 
    });

    expect(result[0].metadata.nextChunk).toBeDefined();
    expect(result[1].metadata.previousChunk).toBeDefined();
    expect(result[0].metadata.parentId).toBeDefined();
  });

  test('maintains structured data relationships', () => {
    const data = [
      { id: 1, name: 'Alice', content: 'a'.repeat(2000) },
      { id: 2, name: 'Bob', content: 'b'.repeat(2000) },
      { id: 3, name: 'Charlie', content: 'c'.repeat(2000) }
    ];
    
    const result = chunk(data, { 
      chunkSize: 4500,
      preserveContext: true 
    });

    expect(result[0].metadata.nextChunk).toBeDefined();
    expect(result[1].metadata.previousChunk).toBeDefined();
    expect(result[0].metadata.parentId).toBe(result[1].metadata.parentId);
  });
});