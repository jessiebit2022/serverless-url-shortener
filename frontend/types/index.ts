export interface ShortenUrlRequest {
  url: string;
  customCode?: string;
}

export interface ShortenUrlResponse {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
}

export interface UrlStats {
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  lastClicked?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface UrlValidationResult {
  isValid: boolean;
  message?: string;
}