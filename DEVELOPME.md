
# DEVELOP


## Storage
### S3 (Simple Storage Service)

무엇인가요?: AWS에서 제공하는 클라우드 파일 저장소
언제 쓰나요?: 이미지, 동영상, PDF 등 정적 파일을 저장할 때
왜 쓰나요?:

서버 용량 걱정 없음 (무제한 확장)
파일마다 고유 URL 제공
저렴함 (사용한 만큼만 과금)


실사용 예시:

```
  export async function POST(request: Request) {
    const data = await request.json();
    // 이 코드가 Vercel에 배포하면 자동으로 Lambda가 됨!
    await saveToGoogleSheets(data);
    return Response.json({ success: true });
  }
```
  → Vercel은 이걸 자동으로 AWS Lambda처럼 동작하게 만들어줌

---

### CloudFront (CDN)

무엇인가요?: 전 세계에 파일을 빠르게 전달하는 서비스
왜 필요한가요?:

S3가 서울에 있어도, 미국 사용자가 접속하면 느림
CloudFront는 전 세계 서버에 복사본을 둬서 빠르게 제공


비유: S3 = 중앙 창고, CloudFront = 동네마다 있는 편의점

## 🗄️ 데이터베이스 옵션

### Google Sheets (스프레드시트)
- **장점**: 
  - 설정 초간단 (API 키만 있으면 됨)
  - 클라이언트가 직접 볼 수 있음
  - 무료
- **단점**: 
  - 느림 (1만 줄 이상 비추)
  - 복잡한 쿼리 불가
- **추천 용도**: STANDARD 랜딩페이지의 간단한 문의 폼

### Supabase / PlanetScale (서버리스 DB)
- **Supabase**: PostgreSQL 기반, 실시간 기능 제공
- **PlanetScale**: MySQL 기반, 빠름
- **공통점**: 
  - 서버 관리 불필요
  - 무료 플랜 제공
  - REST API 자동 제공
- **추천 용도**: DELUXE 관리자 페이지

## 🚀 배포 환경

### Vercel (추천)
```
GitHub에 코드 푸시 
→ 자동으로 빌드 & 배포 
→ 전 세계 CDN 적용
→ API Routes는 자동으로 서버리스 함수로 변환
```

**장점**:
- Next.js 만든 회사 서비스 (최적화 최고)
- 무료 플랜 충분함
- 도메인 연결 쉬움
- 자동 HTTPS

**비용**: 
- Hobby (무료): 개인 프로젝트
- Pro ($20/월): 상업용

### AWS 직접 사용
```
Next.js 빌드 
→ S3에 정적 파일 업로드 
→ Lambda로 API 배포 
→ CloudFront로 배포
```

**언제 쓰나요?**: 
- 회사에서 이미 AWS 쓰고 있을 때
- 커스터마이징 필요할 때
- 매우 큰 규모

## 📊 실제 아키텍처 예시

### STANDARD 랜딩페이지
```
사용자 접속
  ↓
Vercel (Next.js SSR)
  ↓
폼 제출
  ↓
API Route (Vercel Serverless Function)
  ↓
Google Sheets API
  ↓
완료
```

**월 예상 비용**: $0 (무료)

### DELUXE 랜딩페이지
```
사용자 접속
  ↓
Vercel (Next.js SSR)
  ↓
파일 업로드
  ↓
API Route
  ├─→ S3 (파일 저장)
  └─→ Supabase (메타데이터 저장)
  ↓
관리자 페이지에서 조회