# 深色模式(Dark Mode)使用指南

## 概述

项目已实现完整的浅色/深色主题切换功能,基于Tailwind CSS的dark mode策略和CSS变量。

## 核心功能

### 1. ThemeContext - 主题管理

位置: `src/app/contexts/ThemeContext.tsx`

提供的API:
```typescript
const { theme, setTheme, toggleTheme, isDarkMode } = useTheme();
```

- `theme`: 当前主题 ('light' | 'dark')
- `setTheme(theme)`: 手动设置主题
- `toggleTheme()`: 切换主题
- `isDarkMode`: 是否为深色模式 (boolean)

### 2. 特性

✅ **持久化存储**: 主题选择保存到localStorage  
✅ **系统偏好检测**: 首次访问时自动检测系统主题偏好  
✅ **无闪烁加载**: 在HTML加载前应用主题,避免页面闪烁  
✅ **全局同步**: 所有组件通过useTheme Hook共享主题状态  

## 使用方法

### 在组件中使用主题

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <p>当前是{isDarkMode ? '深色' : '浅色'}模式</p>
      <button onClick={toggleTheme}>切换主题</button>
    </div>
  );
}
```

### Tailwind Dark Mode类名规则

在Tailwind CSS中,使用 `dark:` 前缀为深色模式指定样式:

```tsx
// 基本用法
<div className="bg-white dark:bg-gray-800">
  <h1 className="text-gray-900 dark:text-white">标题</h1>
</div>

// 边框
<div className="border border-gray-200 dark:border-gray-700">

// 悬停效果
<button className="hover:bg-gray-100 dark:hover:bg-gray-700">

// 透明度和其他变体
<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
```

### 常用颜色映射

| 元素 | 浅色模式 | 深色模式 |
|------|---------|---------|
| 背景 | `bg-gray-50` | `dark:bg-gray-900` |
| 卡片背景 | `bg-white` | `dark:bg-gray-800` |
| 主要文字 | `text-gray-900` | `dark:text-white` |
| 次要文字 | `text-gray-600` | `dark:text-gray-300` |
| 边框 | `border-gray-200` | `dark:border-gray-700` |
| 输入框背景 | `bg-gray-100` | `dark:bg-gray-700` |

## 主题切换按钮

项目中已提供两个主题切换入口:

### 1. ThemeToggle组件

位置: 右上角固定位置  
使用: 已在App.tsx中集成,无需额外配置

### 2. 设置页面

路径: `/settings`  
功能: 在"账户设置"区域有主题切换开关

## CSS变量系统

项目使用CSS变量定义主题色,位于 `src/styles/theme.css`:

```css
:root {
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  /* ... 更多变量 */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... 深色模式变量 */
}
```

这些变量已通过 `@theme inline` 映射到Tailwind工具类:
- `bg-background` / `text-foreground`
- `bg-card` / `text-card-foreground`
- 等等...

## 迁移现有组件

要将现有组件支持dark mode,需要:

1. **识别硬编码颜色**: 查找所有 `bg-white`, `bg-gray-50`, `text-gray-900` 等类
2. **添加dark variant**: 为每个浅色类添加对应的 `dark:` 类
3. **测试**: 切换主题确保所有元素正确显示

### 示例迁移

**迁移前:**
```tsx
<div className="bg-white border border-gray-200 rounded-lg p-4">
  <h2 className="text-xl font-bold text-gray-900">标题</h2>
  <p className="text-gray-600">描述文字</p>
</div>
```

**迁移后:**
```tsx
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
  <h2 className="text-xl font-bold text-gray-900 dark:text-white">标题</h2>
  <p className="text-gray-600 dark:text-gray-300">描述文字</p>
</div>
```

## 注意事项

⚠️ **避免内联样式**: 尽量使用Tailwind类而非内联style,因为内联样式不支持dark variant  
⚠️ **图片适配**: 考虑在深色模式下调整图片亮度或添加遮罩  
⚠️ **阴影效果**: 深色模式下的阴影应该更柔和或使用不同的颜色  
⚠️ **第三方组件**: Ant Design等库可能需要额外的dark mode配置  

## 调试技巧

1. **手动切换**: 使用浏览器控制台执行:
   ```javascript
   document.documentElement.classList.toggle('dark')
   ```

2. **检查主题状态**:
   ```javascript
   console.log(localStorage.getItem('theme'))
   ```

3. **强制深色模式**: 在浏览器开发者工具中手动添加 `dark` class到 `<html>` 标签

## 相关文件

- Context: `src/app/contexts/ThemeContext.tsx`
- 组件: `src/app/components/ThemeToggle.tsx`
- 样式: `src/styles/theme.css`
- 初始化: `index.html` (防止闪烁脚本)
- 主入口: `src/app/App.tsx`
