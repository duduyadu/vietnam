import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import koTranslation from '../locales/ko.json';
import viTranslation from '../locales/vi.json';

const resources = {
  ko: {
    translation: koTranslation
  },
  vi: {
    translation: viTranslation
  }
};

// 저장된 언어 설정 가져오기
const savedLanguage = localStorage.getItem('language') || 'ko';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false
    }
  });

// 언어 변경 시 로컬 스토리지에 저장
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;