# Requirements Document

## Introduction

本功能旨在优化页面标题展示和导航体验，使页面标题与 LeetCode 题目标题保持一致（包含题号、中文标题），并提供便捷的导航链接。标题居中显示，左上角提供返回 LeetCode Hot 100 的链接，所有外部链接均在新页面打开。

## Glossary

- **Page_Title_System**: 页面标题展示系统，负责显示题目标题和导航链接
- **Problem_Title**: LeetCode 题目标题，包含题号和中文名称（如 "1. 两数之和"）
- **Back_Link**: 返回链接，位于页面左上角，点击后在新页面打开 LeetCode Hot 100 页面
- **LeetCode_Link**: 题目链接，点击后在新页面打开对应的 LeetCode 题目页面

## Requirements

### Requirement 1

**User Story:** As a user, I want the page title to match the LeetCode problem title format, so that I can easily identify which problem I am studying.

#### Acceptance Criteria

1. WHEN the page loads THEN the Page_Title_System SHALL display the Problem_Title containing the problem number and Chinese title (e.g., "1. 两数之和")
2. WHEN the Problem_Title is displayed THEN the Page_Title_System SHALL center the title horizontally at the top of the page
3. WHEN a user clicks on the Problem_Title THEN the Page_Title_System SHALL open the corresponding LeetCode problem page in a new browser tab

### Requirement 2

**User Story:** As a user, I want a back link to LeetCode Hot 100, so that I can easily navigate to the problem list.

#### Acceptance Criteria

1. WHEN the page loads THEN the Page_Title_System SHALL display the Back_Link in the top-left corner of the page
2. WHEN the Back_Link is displayed THEN the Page_Title_System SHALL show text similar to "返回 LeetCode Hot 100"
3. WHEN a user clicks on the Back_Link THEN the Page_Title_System SHALL open https://fuck-algorithm.github.io/leetcode-hot-100/ in a new browser tab

### Requirement 3

**User Story:** As a user, I want all external links to open in new tabs, so that I don't lose my current visualization progress.

#### Acceptance Criteria

1. WHEN a user clicks on the LeetCode_Link THEN the Page_Title_System SHALL open the link in a new browser tab using target="_blank"
2. WHEN a user clicks on the Back_Link THEN the Page_Title_System SHALL open the link in a new browser tab using target="_blank"
3. WHEN external links are rendered THEN the Page_Title_System SHALL include rel="noopener noreferrer" attribute for security

### Requirement 4

**User Story:** As a user, I want a clear visual hierarchy in the header, so that I can easily distinguish between navigation and title elements.

#### Acceptance Criteria

1. WHEN the header is displayed THEN the Page_Title_System SHALL position the Back_Link on the left side of the header
2. WHEN the header is displayed THEN the Page_Title_System SHALL position the Problem_Title in the center of the header
3. WHEN the header is displayed THEN the Page_Title_System SHALL maintain the existing right-side elements (video button, GitHub link)
