/**
 * API 에러 응답에서 사용자에게 보여줄 메시지를 안전하게 추출
 */
export const extractErrorMessage = (error: any, defaultMessage: string = '오류가 발생했습니다.'): string => {
  // error가 없으면 기본 메시지
  if (!error) {
    return defaultMessage;
  }

  // error.response가 없으면 네트워크 오류 등
  if (!error.response) {
    return error.message || defaultMessage;
  }

  const { data } = error.response;
  
  // data가 없으면 기본 메시지
  if (!data) {
    return defaultMessage;
  }

  // data.error가 문자열인 경우
  if (typeof data.error === 'string') {
    return data.error;
  }

  // data.error가 객체인 경우
  if (typeof data.error === 'object' && data.error !== null) {
    // 한국어 메시지 우선
    if (data.error.message_ko) {
      return data.error.message_ko;
    }
    // 일반 메시지
    if (data.error.message) {
      return data.error.message;
    }
    // 객체를 문자열로 변환하지 않고 기본 메시지 반환
    return defaultMessage;
  }

  // data.message가 있는 경우
  if (data.message) {
    return data.message;
  }

  // data.message_ko가 있는 경우
  if (data.message_ko) {
    return data.message_ko;
  }

  // 그 외의 경우 기본 메시지
  return defaultMessage;
};