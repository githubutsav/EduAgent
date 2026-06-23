import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TranscriptManager } from '../lib/transcript';
import * as firestore from '../lib/firestore';

vi.mock('../lib/firestore', () => ({
  saveTranscriptLine: vi.fn().mockResolvedValue(undefined),
  getRoomTranscripts: vi.fn(),
  saveGeneratedQuiz: vi.fn(),
}));

describe('TranscriptManager', () => {
  let mockMediaRecorderInstance: any;
  let mockMediaRecorder: any;
  let mockGetUserMedia: any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Mock getUserMedia
    mockGetUserMedia = vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
    });

    if (typeof window === 'undefined') {
      global.window = {
        navigator: {
          mediaDevices: {
            getUserMedia: mockGetUserMedia,
          },
        },
      } as any;
    } else {
      (window as any).navigator.mediaDevices = {
        getUserMedia: mockGetUserMedia,
      };
    }

    // Mock MediaRecorder
    mockMediaRecorderInstance = {
      start: vi.fn(),
      stop: vi.fn().mockImplementation(function (this: any) {
        if (this.onstop) {
          this.onstop();
        }
      }),
      state: 'recording',
      ondataavailable: null,
      onstop: null,
      mimeType: 'audio/webm',
    };

    mockMediaRecorder = vi.fn().mockImplementation(() => mockMediaRecorderInstance);
    (global as any).MediaRecorder = mockMediaRecorder;
    
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ text: 'Hello class' }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes MediaRecorder and starts it', async () => {
    const manager = new TranscriptManager('room-123', 'Dr. Smith');
    await manager.start();

    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(mockMediaRecorder).toHaveBeenCalled();
    expect(mockMediaRecorderInstance.start).toHaveBeenCalled();
  });

  it('rotates recording chunk and transcribes it', async () => {
    const manager = new TranscriptManager('room-123', 'Dr. Smith');
    await manager.start();

    // Simulate data available event
    mockMediaRecorderInstance.ondataavailable({
      data: new Blob(['audio data'], { type: 'audio/webm' }),
    });

    // Stop and rotate
    mockMediaRecorderInstance.stop();

    // Wait for async ticks
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/transcribe', expect.any(Object));
      expect(firestore.saveTranscriptLine).toHaveBeenCalledWith('room-123', 'Hello class', 'Dr. Smith');
    });
  });
});
