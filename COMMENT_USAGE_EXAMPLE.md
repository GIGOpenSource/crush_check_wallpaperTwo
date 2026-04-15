# 评论功能使用指南

## 📋 概述

本项目已实现完整的壁纸评论功能，包括：
- ✅ 评论列表获取（支持分页）
- ✅ 自定义 Hook (`useWallpaperComments`)
- ✅ 评论展示组件 (`CommentSection`)
- ✅ 响应式设计 & 深色模式支持

---

## 🚀 快速开始

### 1. API 接口

**接口地址**: `GET /api/wallpapers/comments/`

**请求参数**:
```typescript
{
  currentPage: number;      // 当前页码
  pageSize: number;         // 每页数量
  wallpaper_id: string | number;  // 壁纸ID
}
```

**响应格式**:
```typescript
{
  list: CommentItem[];
  total?: number;
}
```

**CommentItem 字段**:
```typescript
{
  id: number;                    // 评论ID
  content: string;               // 评论内容
  wallpaper_id: number | string; // 壁纸ID
  user_id: number;               // 用户ID
  username?: string;             // 用户名
  avatar_url?: string;           // 用户头像URL
  likes?: number;                // 点赞数
  is_liked?: boolean;            // 是否已点赞
  created_at?: string;           // 创建时间
  parent_id?: number | null;     // 回复的评论ID（如果是回复）
}
```

---

## 💻 使用方法

### 方式一：使用 Custom Hook

```typescript
import { useWallpaperComments } from '@/app/hooks/useWallpaperComments';

function MyComponent() {
  const wallpaperId = '123';
  
  const { 
    comments,      // 评论列表
    total,         // 评论总数
    loading,       // 首次加载状态
    loadingMore,   // 加载更多状态
    error,         // 错误状态
    hasMore,       // 是否有更多数据
    loadMore,      // 加载更多函数
    refresh        // 刷新函数
  } = useWallpaperComments(wallpaperId);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div>
      <p>共 {total} 条评论</p>
      {comments.map(comment => (
        <div key={comment.id}>
          <img src={comment.avatar_url} alt={comment.username} />
          <span>{comment.username}</span>
          <p>{comment.content}</p>
          <span>{comment.likes} 点赞</span>
        </div>
      ))}
      {hasMore && <button onClick={loadMore}>加载更多</button>}
    </div>
  );
}
```

### 方式二：使用现成组件

```typescript
import CommentSection from '@/app/components/CommentSection';

function WallpaperDetailPage({ wallpaperId }: { wallpaperId: string }) {
  return (
    <div>
      {/* 壁纸详情内容 */}
      
      {/* 评论区域 */}
      <CommentSection wallpaperId={wallpaperId} />
    </div>
  );
}
```

---

## 🎨 组件特性

### CommentSection 组件

**Props**:
- `wallpaperId`: 壁纸ID（必填）

**功能**:
- ✅ 自动加载评论列表
- ✅ 显示评论总数
- ✅ 支持"加载更多"分页
- ✅ 支持刷新功能
- ✅ 加载/错误/空状态提示
- ✅ 响应式布局
- ✅ 深色模式适配
- ✅ 用户头像显示（带默认占位符）
- ✅ 时间格式化（相对时间）
- ✅ 区分一级评论和回复

**样式特点**:
- 使用 Tailwind CSS
- 支持 `dark:` 变体
- 渐变头像占位符
- 平滑过渡动画

---

## 🔧 高级用法

### 自定义评论项渲染

如果需要自定义评论项的样式或行为，可以基于 `useWallpaperComments` Hook 创建自己的组件：

```typescript
import { useWallpaperComments } from '@/app/hooks/useWallpaperComments';

function CustomCommentList({ wallpaperId }: { wallpaperId: string }) {
  const { comments, loading, loadMore, hasMore } = useWallpaperComments(wallpaperId);

  return (
    <div className="custom-comment-list">
      {comments.map(comment => (
        <CustomCommentItem key={comment.id} comment={comment} />
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
```

### 无限滚动集成

结合 Intersection Observer 实现自动加载更多：

```typescript
import { useEffect, useRef } from 'react';
import { useWallpaperComments } from '@/app/hooks/useWallpaperComments';

function InfiniteScrollComments({ wallpaperId }: { wallpaperId: string }) {
  const { comments, loadingMore, hasMore, loadMore } = useWallpaperComments(wallpaperId);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  return (
    <div>
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
      <div ref={observerRef} className="h-10" />
      {loadingMore && <div>Loading...</div>}
    </div>
  );
}
```

---

## 📝 注意事项

1. **wallpaperId 变化时自动刷新**: 当传入的 `wallpaperId` 改变时，Hook 会自动重新加载评论列表。

2. **性能优化**: 
   - `CommentItem` 组件已使用 `React.memo` 优化
   - 建议对用户头像使用懒加载

3. **错误处理**: Hook 内部已处理网络错误，可通过 `error` 状态判断。

4. **类型安全**: 所有接口都有完整的 TypeScript 类型定义。

5. **日期格式化**: 组件内置了 `date-fns` 进行时间格式化，支持中文 locale。

---

## 🐛 常见问题

### Q: 评论列表不显示？
A: 检查以下几点：
- 确认 `wallpaperId` 是否正确传递
- 检查 Network 面板中 `/api/wallpapers/comments/` 接口的响应
- 查看控制台是否有错误信息

### Q: 如何添加评论功能？
A: 目前仅实现了评论列表获取。如需添加评论、删除、点赞等功能，需要：
1. 在 `wallpaper.ts` 中添加相应的 API 函数
2. 创建对应的 Custom Hook
3. 在 UI 组件中集成

### Q: 如何修改每页显示的评论数量？
A: 修改 `useWallpaperComments.ts` 中的 `PAGE_SIZE` 常量即可。

---

## 📚 相关文件

- **API 定义**: `src/api/wallpaper.ts` - `getComments`, `CommentItem`, `GetCommentsParams`
- **Custom Hook**: `src/app/hooks/useWallpaperComments.ts`
- **UI 组件**: `src/app/components/CommentSection.tsx`
- **使用示例**: 壁纸详情页 `src/app/pages/WallpaperDetailPage.tsx`

---

## 🎯 下一步

可能的扩展功能：
- [ ] 发表评论
- [ ] 回复评论
- [ ] 点赞/取消点赞
- [ ] 删除评论（管理员）
- [ ] 评论排序（最新/最热）
- [ ] @用户功能
- [ ] 表情支持
