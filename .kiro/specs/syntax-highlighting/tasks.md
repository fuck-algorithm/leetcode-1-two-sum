# Implementation Plan

- [x] 1. 验证并修复 Prism.js 配置
  - [x] 1.1 检查 Prism.js 语言组件是否正确加载
    - 验证 prism-java, prism-python, prism-go, prism-javascript 组件导入
    - 确认 Prism.languages 对象包含所有需要的语言语法
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  - [x] 1.2 创建语法高亮工具函数
    - 将高亮逻辑抽取为独立的工具函数 `src/utils/syntaxHighlight.ts`
    - 实现 `highlightCode(code: string, language: CodeLanguage): string` 函数
    - 添加错误处理和降级逻辑
    - _Requirements: 5.3_
  - [x] 1.3 编写属性测试：关键字 Token 分类
    - **Property 1: Keyword Token Classification**
    - **Validates: Requirements 1.1, 2.1, 3.1, 4.1**
  - [x] 1.4 编写属性测试：字符串 Token 分类
    - **Property 3: String Literal Token Classification**
    - **Validates: Requirements 1.3, 2.3, 3.3, 4.3**
  - [x] 1.5 编写属性测试：数字 Token 分类
    - **Property 4: Number Literal Token Classification**
    - **Validates: Requirements 1.4, 2.4, 3.4, 4.4**

- [x] 2. 完善 CSS 语法高亮主题
  - [x] 2.1 审查并更新 Prism token CSS 样式
    - 确保所有 token 类型都有对应的颜色定义
    - 验证 :global() 选择器正确应用于 CSS Modules
    - 添加缺失的 token 类型样式
    - _Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.5, 4.1-4.5_
  - [x] 2.2 编写属性测试：跨语言 Token 一致性
    - **Property 6: Cross-Language Token Consistency**
    - **Validates: Requirements 5.1**

- [x] 3. 更新 CodeDebugger 组件
  - [x] 3.1 重构 CodeDebugger 使用新的高亮工具函数
    - 导入并使用 `highlightCode` 函数
    - 移除组件内的重复高亮逻辑
    - _Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.5, 4.1-4.5_
  - [x] 3.2 编写属性测试：类型/类名 Token 分类
    - **Property 2: Type/Class-name Token Classification**
    - **Validates: Requirements 1.2, 2.2, 3.2, 4.2**
  - [x] 3.3 编写属性测试：函数名 Token 分类
    - **Property 5: Function Name Token Classification**
    - **Validates: Requirements 1.5, 2.5, 3.5, 4.5**

- [x] 4. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.
