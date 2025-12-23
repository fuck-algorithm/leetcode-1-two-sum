# Design Document

## Overview

本设计文档描述页面标题和导航功能的实现方案。主要修改 Header 组件，将现有的左对齐标题改为居中显示，并在左侧添加返回 LeetCode Hot 100 的链接。设计保持与现有代码风格一致，使用 CSS Module 进行样式管理。

## Architecture

### 组件结构

```
Header
├── BackLink (左侧) - 返回 LeetCode Hot 100 链接
├── TitleSection (中间) - 题目标题，可点击跳转
└── RightSection (右侧) - 视频按钮、GitHub 链接（保持不变）
```

### 布局方案

使用 CSS Grid 三列布局实现左中右对齐：
- 左列：返回链接，左对齐
- 中列：题目标题，居中
- 右列：现有功能区，右对齐

## Components and Interfaces

### Header 组件接口更新

```typescript
// 更新 HeaderProps 接口
export interface HeaderProps {
  title: string           // 题目标题（如 "1. 两数之和"）
  leetcodeUrl: string     // LeetCode 题目链接
  githubUrl: string       // GitHub 仓库链接
  backUrl?: string        // 返回链接 URL（可选，默认为 Hot 100 页面）
  backText?: string       // 返回链接文本（可选，默认为 "返回 LeetCode Hot 100"）
}
```

### 默认值

```typescript
const DEFAULT_BACK_URL = 'https://fuck-algorithm.github.io/leetcode-hot-100/'
const DEFAULT_BACK_TEXT = '← 返回 LeetCode Hot 100'
```

## Data Models

本功能不涉及新的数据模型，仅扩展现有的 `HeaderProps` 接口。

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: External links open in new tab
*For any* external link (LeetCode problem link or back link) rendered by the Header component, the link element SHALL have `target="_blank"` attribute set, ensuring all external navigation opens in a new browser tab.
**Validates: Requirements 1.3, 2.3, 3.1, 3.2**

### Property 2: External links have security attributes
*For any* external link rendered by the Header component with `target="_blank"`, the link element SHALL have `rel="noopener noreferrer"` attribute set to prevent security vulnerabilities.
**Validates: Requirements 3.3**

### Property 3: Title text preservation
*For any* valid problem title string passed to the Header component, the rendered title text SHALL contain the original title string unchanged, preserving the problem number and Chinese title format.
**Validates: Requirements 1.1**

## Error Handling

| 场景 | 处理方式 |
|------|----------|
| backUrl 为空 | 使用默认 URL |
| backText 为空 | 使用默认文本 |
| leetcodeUrl 无效 | 仍然渲染链接，由浏览器处理 |

## Testing Strategy

### 单元测试

1. 验证 Header 组件正确渲染所有元素
2. 验证默认值正确应用
3. 验证自定义 backUrl 和 backText 正确显示

### Property-Based Testing

使用 `fast-check` 库进行属性测试：

1. **链接属性测试**：验证所有外部链接都包含正确的 `target` 和 `rel` 属性
2. **标题渲染测试**：验证任意有效标题字符串都能正确渲染

### 测试框架

- 测试框架：Vitest
- 属性测试库：fast-check
- 测试文件位置：`src/components/__tests__/Header.property.test.ts`
