/**
 * Alexa response builder helpers.
 * Keep responses short (<3 sentences) for V1.
 */

export interface AlexaResponse {
  version: '1.0';
  response: {
    outputSpeech?: {
      type: 'PlainText' | 'SSML';
      text?: string;
      ssml?: string;
    };
    shouldEndSession: boolean;
  };
}

export function speak(text: string, endSession = false): AlexaResponse {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text,
      },
      shouldEndSession: endSession,
    },
  };
}

export function speakSSML(ssml: string, endSession = false): AlexaResponse {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml: `<speak>${ssml}</speak>`,
      },
      shouldEndSession: endSession,
    },
  };
}
