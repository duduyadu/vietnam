// API 설정
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 기타 설정
export const APP_NAME = 'Vietnam Student Management System';
export const DEFAULT_LANGUAGE = 'ko';
export const SUPPORTED_LANGUAGES = ['ko', 'vi', 'en'];

// 파일 업로드 제한
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// 페이지네이션
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

// TOPIK 설정
export const TOPIK_MAX_TESTS = 8;
export const TOPIK_SCORE_RANGES = {
  reading: { min: 0, max: 60 },
  listening: { min: 0, max: 60 },
  writing: { min: 0, max: 50 },
  total: { min: 0, max: 170 }
};

export const TOPIK_LEVELS = {
  0: { min: 0, max: 79, label: '미달' },
  1: { min: 80, max: 139, label: '1급' },
  2: { min: 140, max: 170, label: '2급' }
};