// Type declarations for mammoth
declare module "mammoth" {
  interface ExtractRawTextResult {
    value: string;
    messages: any[];
  }

  interface ExtractRawTextOptions {
    buffer: Buffer;
  }

  export function extractRawText(
    options: ExtractRawTextOptions,
  ): Promise<ExtractRawTextResult>;
}
