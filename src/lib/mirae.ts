/**
 * 미래AI랩 브릿지 CTA — 링크와 문구의 단일 수정 지점
 *
 * 링크를 바꿀 일이 생기면 MIRAE_LINKS 만 고치면 모든 화면에 반영된다.
 * 문구를 바꿀 일이 생기면 MIRAE_CTA_COPY 만 고치면 된다.
 * (개별 화면에서 덮어쓰고 싶을 때는 SampleBridgeCTA 의 props 로 전달한다.)
 */

export const MIRAE_LINKS = {
  /** 메인 CTA — 우리 회사도 만들어보기 */
  consult: 'https://miraeailab.com/business-diagnosis',
  /** 다른 샘플 보기 */
  samples: 'https://miraeailab.com/business-services',
  /** 미래AI랩 홈페이지 */
  home: 'https://miraeailab.com/',
} as const

export const MIRAE_CTA_COPY = {
  badge: 'MIRAE AI LAB',
  eyebrow: '이 샘플은 미래AI랩이 기획·제작했습니다',
  headline: '이 샘플이 마음에 드셨다면,\n대표님 회사도 이렇게 설계해볼 수 있습니다.',
  body:
    '미래AI랩은 평범한 회사를 기술·데이터·AI 기반의 성장형 기업으로 바꾸는 ' +
    'AX / MVP / 플랫폼 기획·개발을 진행합니다.',
  note: '업종·규모·현재 운영 방식에 맞춰 무엇부터 시스템으로 바꿀지 함께 정리해 드립니다.',
  /** 메인 CTA 문구 — 전 화면 통일 */
  primary: '우리 회사도 만들어보기',
  samples: '다른 샘플 보기',
  home: '미래AI랩 홈페이지',
} as const
