# 关注和粉丝功能实现说明

## 概述
在"我的"页面新增了关注和粉丝列表功能，用户可以通过Tab切换查看自己关注的用户列表和粉丝列表。

## 实현 내용

### 1. 多语言支持
已在 `src/app/locales/translations.ts` 中添加了以下翻译：

**中文 (zh-CN):**
- following: '关注'
- followers: '粉丝'
- noFollowingYet: '还没有关注'
- noFollowersYet: '还没有粉丝'
- startFollowing: '开始关注你感兴趣的用户'
- followBack: '回关'
- unfollow: '取消关注'
- follow: '关注'

**英文 (en):**
- following: 'Following'
- followers: 'Followers'
- noFollowingYet: 'Not following anyone yet'
- noFollowersYet: 'No followers yet'
- startFollowing: 'Start following users you are interested in'
- followBack: 'Follow Back'
- unfollow: 'Unfollow'
- follow: 'Follow'

**日文 (ja):**
- following: 'フォロー中'
- followers: 'フォロワー'
- noFollowingYet: 'まだフォローしていません'
- noFollowersYet: 'フォロワーがいません'
- startFollowing: '興味のあるユーザーをフォローしましょう'
- followBack: 'フォローバック'
- unfollow: 'フォロー解除'
- follow: 'フォロー'

**韩文 (ko):**
- following: '팔로잉'
- followers: '팔로워'
- noFollowingYet: '아직 팔로우한 사용자가 없습니다'
- noFollowersYet: '팔로워가 없습니다'
- startFollowing: '관심 있는 사용자를 팔로우해보세요'
- followBack: '맞팔로우'
- unfollow: '언팔로우'
- follow: '팔로우'

### 1. **数据解析规范**

前端Custom Hook需兼容多种后端API响应格式，确保健壮성：

**实际接口格式** (优先解析):
``typescript
{
  code: 200,
  message: "success",
  data: {
    pagination: { page: 1, page_size: 20, total: 100, total_pages: 5 },
    results: [ /* 用户列表 */ ]
  }
}
```

**兼容的其他格式**:
- 格式1: 직접 반환 배열 `[]`
- 형식2: `{ code: 200, message: "ok", data: [] }`
- 형식3: `{ code: 200, message: "ok", data: { list: [], total: 0 } }`
- 형식4: `{ list: [], total: 0 }`

**解析 로직**:
1. 优先检查 `response.data.data.results` (실제 인터페이스 형식)
2. 그 다음 `response.data.data.list` (표준 중첩 형식)
3. 그 다음 `response.data.list` (단순 형식)
4. 마지막으로 배열인지 확인
5. 총 수는 우선 `pagination.total`에서 가져오고, 대체로 `total` 또는 배열 길이

### 2. API接口实现

已在 `src/api/wallpaper.ts` 중 다음과 같은 인터페이스를 구현했습니다:

#### 2.1. **粉丝 목록 가져오기**
``typescript
GET /api/wallpapers/followers/
파라미터: { currentPage: number, pageSize: number }
반환: { list: FollowUserItem[], total?: number }
```

#### 2.2. **粉丝 목록 가져오기**
``typescript
GET /api/wallpapers/followers/my-followers/
파라미터: { currentPage: number, pageSize: number }
반환: { list: FollowUserItem[], total?: number }
```

#### 2.3. **关注/取消关注用户**
``typescript
POST /api/wallpapers/followers/toggle/
请求体: { following_id: number | string }  // 用户ID（关注列表/粉丝列表中的id）
返回: { is_followed: boolean }  // 是否已关注
```

#### 2.4. **데이터 구조**

**실제 인터페이스 반환 형식**:
``json
{
  "code": 200,
  "message": "success",
  "data": {
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 1,
      "total_pages": 1
    },
    "results": [
      {
        "id": 1,
        "email": "liangwater@163.com",
        "nickname": "Liang",
        "gender": 1,
        "avatar_url": null,
        "collection_count": 5,
        "is_followed": true,
        "level": 1,
        "points": 0,
        "upload_count": 10
      }
    ]
  }
}
```

**FollowUserItem 필드 설명**:
``typescript
interface FollowUserItem {
  id: number | string;           // 사용자ID
  email?: string;                 // 이메일
  nickname?: string;              // 닉네임
  gender?: number;                // 성별: 1-남, 2-여, 그 외-알 수 없음
  avatar_url?: string | null;     // 프로필 사진 URL
  avatar?: string;                // 프로필 사진(대체 필드)
  username?: string;              // 사용자 이름(대체 필드)
  is_followed?: boolean;          // 팔로워 목록에서 팔로우 여부(회신 여부 판단용)
  is_following?: boolean;         // 팔로우 여부(호환 필드)
  upload_count?: number;          // 업로드 수량
  collection_count?: number;      // 즐겨찾기 수량
  follower_count?: number;        // 팔로워 수량
  level?: number;                 // 등급
  points?: number;                // 포인트
}
```

**PaginationInfo 필드 설명**:
``typescript
interface PaginationInfo {
  page: number;         // 현재 페이지 번호
  page_size: number;    // 페이지당 항목 수
  total: number;        // 총 항목 수
  total_pages: number;  // 총 페이지 수
}
```

### 3. Custom Hooks 구현

`src/app/hooks/useFollowingList.ts` 파일을 생성하여 다음과 같은 두 개의 Hook을 포함했습니다:

#### 3.1. **useFollowingList - 팔로워 목록 관리**
``typescript
const {
  users,              // 팔로워 사용자 목록
  total,              // 총 수
  loading,            // 최초 로딩 상태
  loadingMore,        // 더 로딩 상태
  error,              // 오류 정보
  hasMore,            // 더 데이터 여부
  loadMore,           // 더 로딩 메소드
  refresh,            // 새로고침 목록 메소드
} = useFollowingList(pageSize);
```

#### 3.2. **useFollowersList - 팔로워 목록 관리**
``typescript
const {
  users,              // 팔로워 사용자 목록
  total,              // 총 수
  loading,            // 최초 로딩 상태
  loadingMore,        // 더 로딩 상태
  error,              // 오류 정보
  hasMore,            // 더 데이터 여부
  loadMore,           // 더 로딩 메소드
  refresh,            // 새로고침 목록 메소드
} = useFollowersList(pageSize);
```

**프로젝트 규칙 준수**:
- ✅ 로직 집약화: 데이터 요청, 상태 관리, 오류 처리
- ✅ 페이징 관리: 페이지 로딩 지원, 최초 로딩과 더 로딩 구분
- ✅ 경쟁 조건 처리: AbortController를 사용하여 미완료 요청 취소
- ✅ 중복 요청 방지: fetchingRef를 사용하여 동시 요청 방지
- ✅ 데이터 중복 제거: 새 데이터와 기존 데이터 자동 병합
- ✅ 데이터 파싱: 다양한 응답 형식 지원, `{ code: 200, data: { pagination, results } }` 형식 우선 파싱

### 4. 페이지 컴포넌트

#### 4.1. **모바일 페이지 (ProfilePage.tsx)**
- ✅ 탭 영역: 이미 업로드, 즐겨찾기, **팔로잉**, **팔로워**
- ✅ 수직 목록 레이아웃, 조밀한 디자인
- ✅ 사용자 카드: 프로필 사진, 닉네임, 업로드 수량, 팔로워 수량
- ✅ 작업 버튼: 팔로잉 목록 표시 "언팔로우", 팔로워 목록 표시 "맞팔로우"
- ✅ 로딩 상태: 최초 로딩, 더 로딩, 오류 메시지
- ✅ 빈 상태: 친절한 안내와 가이드

#### 4.2. **데스크톱 페이지 (DesktopProfilePage.tsx)**
- ✅ 탭 영역: 이미 업로드, 즐겨찾기, **팔로잉**, **팔로워**
- ✅ 1-2-3 반응형 3열 그리드 레이아웃
- ✅ 사용자 카드: 프로필 사진, 닉네임, 업로드 수량, 팔로워 수량
- ✅ 작업 버튼: 팔로잉 목록에서는 "언팔로우" 버튼(회색), 팔로워 목록에서는 팔로우 여부에 따라 "언팔로우"(회색) 또는 "맞팔로우"(파란색) 버튼 표시
- ✅ 로딩 상태: 최초 로딩, 더 로딩, 오류 메시지 표시
- ✅ 빈 상태: 친절한 안내 메시지와 가이드 표시

### 5. 상호작용 기능

#### 5.1. **팔로우/언팔로우 작업**
- ✅ 버튼 클릭 시 즉시 작업 실행
- ✅ 작업 중 로딩 상태 표시(버튼 텍스트 "로딩 중"으로 변경)
- ✅ 작업 성공 시 알림 메시지 표시
- ✅ 현재 목록 자동 새로고침
- ✅ 오류 처리 및 사용자 알림

#### 5.2. **팔로워 목록의 맞팔로우 기능**
- ✅ 이미 팔로우한 팔로워는 "언팔로우" 버튼(회색) 표시
- ✅ 팔로우하지 않은 팔로워는 "맞팔로우" 버튼(파란색) 표시
- ✅ `user.is_following` 필드를 사용하여 상태 판단

### 6. 라우팅 구성(백업)
`src/app/routes.tsx`에 두 개의 독립 페이지 라우트 추가:
- `/following` - 독립 팔로잉 페이지
- `/followers` - 독립 팔로워 페이지

### 7. 타입 정의 업데이트
`src/api/wallpaper.ts`의 `UserProfile` 타입에 추가:
```
/** 팔로잉 수량 */
following_count?: number;
/** 팔로워 수량 */
follower_count?: number;
```

## 사용 방법

### 팔로잉 및 팔로워 목록에 액세스
1. 계정 로그인
2. "내 정보" 페이지로 이동
3. 탭 영역에서 네 가지 옵션 탭 확인: **업로드**, **즐겨찾기**, **팔로잉**, **팔로워**
4. "팔로잉" 또는 "팔로워" 탭 클릭하여 해당 목록 보기

### 페이지 기능
- **탭 전환**: 업로드, 즐겨찾기, 팔로잉, 팔로워 간 전환 지원
- **사용자 카드 표시**: 사용자 프로필 사진, 닉네임, 업로드 수량, 팔로워 수량 표시
- **작업 버튼**:
  - 팔로잉 목록: "언팔로우" 버튼(회색) 표시
  - 팔로워 목록: 팔로우한 경우 "언팔로우", 팔로우하지 않은 경우 "맞팔로우"(파란색) 버튼 표시
- **로딩 상태**: 최초 로딩 시 로딩 표시, 더 로딩 시 버튼 표시
- **빈 상태 안내**: 목록이 비어 있을 때 친절한 안내 메시지 및 가이드 표시
- **더 로딩**: 페이징 로딩 지원, 추가 데이터 여부 자동 판단

### 반응형 디자인
- **모바일**: 수직 목록 레이아웃, 조밀한 카드 디자인
- **데스크톱**: 1-2-3 반응형 3열 그리드 레이아웃, 더 큰 카드 크기

## 기술 구현 세부 사항

### 탭 전환 로직
```
type TabType = 'uploaded' | 'favorites' | 'following' | 'followers';
const [activeTab, setActiveTab] = useState<TabType>('uploaded');
```

### 조건부 렌더링
`activeTab`의 값에 따라 다른 내용 렌더링:
```
{activeTab === 'following' ? (
  // 팔로잉 목록 내용
) : activeTab === 'followers' ? (
  // 팔로워 목록 내용
) : activeTab === 'uploaded' ? (
  // 업로드 목록 내용
) : (
  // 즐겨찾기 목록 내용
)}
```

### 애니메이션 효과
`motion.div`의 `layoutId` 속성을 사용하여 탭 밑줄의 부드러운 애니메이션 전환 구현.

### 팔로우 작업 처리
```
const handleToggleFollow = async (userId: number | string, currentIsFollowing: boolean) => {
  setFollowingActionId(userId);
  try {
    await toggleFollowUser(userId);
    message.success(currentIsFollowing ? '팔로우 취소됨' : '팔로우됨');
    // 목록 새로고침
    if (activeTab === 'following') {
      refreshFollowing();
    } else if (activeTab === 'followers') {
      refreshFollowers();
    }
  } catch (err) {
    message.error('작업 실패, 다시 시도해주세요');
  } finally {
    setFollowingActionId(null);
  }
};
```

## 주의 사항
1. ✅ API인터페이스가 완전히 구현되었으며, 백엔드 연동 테스트 대기 중
2. ⚠️ **중요**: 
   - 팔로워 목록 인터페이스 경로는 `/api/wallpapers/followers/`입니다(아닌 `/api/wallpapers/followers/`)
   - 팔로워 목록 인터페이스 경로는 `/api/wallpapers/followers/my-followers/`입니다(아닌 `/api/wallpapers/followers/`)
3. ✅ 팔로잉 수량 표시는 `profile.following_count` 및 `profile.follower_count` 필드에 의존
4. ✅ 모든 텍스트가 다국어 전환을 지원합니다(중, 영, 일, 한)
5. ✅ 모바일 및 데스크톱 모두 완전히 구현되었습니다
6. ✅ 독립 페이지 라우트 및 컴포넌트를 백업으로 유지
7. ✅ 프로젝트 규칙 준수: 로직 집약화, 페이징 관리, 경쟁 조건 처리, 플랫폼 적응
8. ✅ 데이터 파싱이 다양한 응답 형식(직접 배열, 중첩된 data 객체, 표준 형식 등)을 지원
