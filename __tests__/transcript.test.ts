import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TranscriptManager } from '../lib/transcript';
import * as firestore from '../lib/firestore';

// Mock firestore functions
vi.mock('../lib/firestore', () => ({
  saveTranscriptLine: vi.fn().mockResolvedValue(undefined),
  getRoomTranscripts: vi.fn(),
  saveGeneratedQuiz: vi.fn(),
}));

describe('TranscriptManager', () => {
  let mockRecognitionInstance: any;
  let mockSpeechRecognition: any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    mockRecognitionInstance = {
      start: vi.fn(),
      stop: vi.fn(),
      continuous: false,
      interimResults: false,
      lang: '',
      onstart: null,
      onresult: null,
      onerror: null,
      onend: null,
    };

    mockSpeechRecognition = vi.fn().mockImplementation(() => mockRecognitionInstance);
    
    // Inject mock into global window object
    if (typeof window !== 'undefined') {
      (window as any).SpeechRecognition = mockSpeechRecognition;
    } else {
      global.window = {
        SpeechRecognition: mockSpeechRecognition,
      } as any;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes speech recognition and starts it', () => {
    const manager = new TranscriptManager('room-123', 'Dr. Smith');
    manager.start();

    expect(mockSpeechRecognition).toHaveBeenCalled();
    expect(mockRecognitionInstance.start).toHaveBeenCalled();
    expect(mockRecognitionInstance.continuous).toBe(true);
    expect(mockRecognitionInstance.lang).toBe('en-US');
  });

  it('accumulates results and flushes after 1 minute', async () => {
    const manager = new TranscriptManager('room-123', 'Dr. Smith');
    manager.start();

    // Simulate speech recognition result
    const event = {
      resultIndex: 0,
      results: [
        {
          isFinal: true,
          0: { transcript: 'Hello class' }
        }
      ]
    };
    mockRecognitionInstance.onresult(event);

    // Should not have saved yet
    expect(firestore.saveTranscriptLine).not.toHaveBeenCalled();

    // Advance time by 60 seconds (1 minute)
    await vi.advanceTimersByTimeAsync(60000);

    expect(firestore.saveTranscriptLine).toHaveBeenCalledWith('room-123', 'Hello class', 'Dr. Smith');
  });

  it('flushes remaining text and stops recognition on stop()', async () => {
    const manager = new TranscriptManager('room-123', 'Dr. Smith');
    manager.start();

    const event = {
      resultIndex: 0,
      results: [
        {
          isFinal: true,
          0: { transcript: 'Final announcement' }
        }
      ]
    };
    mockRecognitionInstance.onresult(event);

    await manager.stop();

    expect(mockRecognitionInstance.stop).toHaveBeenCalled();
    expect(firestore.saveTranscriptLine).toHaveBeenCalledWith('room-123', 'Final announcement', 'Dr. Smith');
  });
});
