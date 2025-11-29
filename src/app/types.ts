
export enum Platform {
  TikTok = 'TikTok',
  YouTubeShorts = 'YouTube Shorts',
  Facebook = 'Facebook',
  Ads = 'Google/FB Ads',
  Poe = 'Poe (Quora)',
  Copilot = 'MS Copilot',
  Brave = 'Brave Leo',
  Llama = 'Llama Community',
  DeepSeek = 'DeepSeek (The Sage)',
  Qwen = 'Qwen (The Polymath)',
  Gemma = 'Gemma (The Muse)'
}

export interface WebsiteAnalysis {
  url: string;
  summary: string;
  targetAudience: string[];
  keySellingPoints: string[];
  tone: string;
}

export interface VideoScene {
  text: string;
  subtext: string;
  backgroundColor: string; // Hex or gradient string
  textColor: string;
  duration: number; // in seconds
  animation: 'fade' | 'zoom' | 'slide-up' | 'slide-left' | 'slide-right' | 'pop-in' | 'rotate-in' | 'static';
}

export interface VideoStoryboard {
  scenes: VideoScene[];
  audioMood: string;
}

export interface GeneratedContent {
  id: string;
  platform: Platform;
  title: string;
  content: string; // The script or post body
  visualPrompt: string; // Prompt for image/video generation
  generatedMediaUrl?: string; // URL of generated image/video
  mediaType?: 'image' | 'video';
  storyboard?: VideoStoryboard; // New: Stores the scenes for video rendering
  status: 'draft' | 'generated' | 'completed';
}

export interface VideoGenerationConfig {
  prompt: string;
  resolution: '720p' | '1080p';
  aspectRatio: '16:9' | '9:16';
}

export interface ImageGenerationConfig {
  prompt: string;
  aspectRatio: '1:1' | '9:16' | '16:9';
}
