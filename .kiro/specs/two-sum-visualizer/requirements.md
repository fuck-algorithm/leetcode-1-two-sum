# Requirements Document

## Introduction

本项目是一个算法教学演示网站，用于可视化展示LeetCode第1题"两数之和"的算法执行过程。网站使用TypeScript+React+D3.js构建，部署在GitHub Pages上。核心功能包括：分步骤算法演示、代码调试效果展示、交互式画布、用户自定义输入数据等。

## Glossary

- **Algorithm_Visualizer**: 算法可视化演示系统，负责展示算法执行的每个步骤
- **Canvas**: 交互式画布组件，用于绘制数据结构和动画效果
- **Control_Panel**: 控制面板，包含播放、暂停、上一步、下一步、重置等控制按钮
- **Code_Debugger**: 代码调试器组件，展示带行号的代码并高亮当前执行行，显示变量值
- **Progress_Bar**: 进度条组件，展示算法执行进度
- **Data_Input**: 数据输入组件，支持用户自定义输入、预设样例和随机生成
- **Step**: 算法执行的单个步骤，包含当前状态、变量值、高亮行等信息
- **Two_Sum**: 两数之和算法，在数组中找出和为目标值的两个数的下标

## Requirements

### Requirement 1

**User Story:** 作为用户，我希望看到与LeetCode一致的页面标题，并能跳转到原题，以便快速访问题目详情。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Algorithm_Visualizer SHALL 在页面顶部显示标题"1. 两数之和"
2. WHEN 用户点击标题 THEN Algorithm_Visualizer SHALL 在新标签页打开LeetCode题目链接
3. WHEN 页面加载完成 THEN Algorithm_Visualizer SHALL 在页面右上角显示GitHub图标
4. WHEN 用户点击GitHub图标 THEN Algorithm_Visualizer SHALL 在新标签页打开项目仓库页面

### Requirement 2

**User Story:** 作为用户，我希望能够控制算法演示的播放，以便按自己的节奏学习算法。

#### Acceptance Criteria

1. WHEN 用户点击"下一步"按钮或按右方向键 THEN Control_Panel SHALL 前进到下一个算法步骤
2. WHEN 用户点击"上一步"按钮或按左方向键 THEN Control_Panel SHALL 回退到上一个算法步骤
3. WHEN 用户点击"播放"按钮或按空格键 THEN Control_Panel SHALL 自动连续播放算法步骤
4. WHEN 用户点击"暂停"按钮或按空格键 THEN Control_Panel SHALL 暂停自动播放
5. WHEN 用户点击"重置"按钮 THEN Control_Panel SHALL 将算法演示重置到初始状态
6. WHEN 控制按钮渲染完成 THEN Control_Panel SHALL 在按钮上显示对应的快捷键提示文案

### Requirement 3

**User Story:** 作为用户，我希望通过进度条直观了解算法执行进度，并能快速跳转到任意步骤。

#### Acceptance Criteria

1. WHEN 算法演示进行中 THEN Progress_Bar SHALL 以绿色显示已播放部分，灰色显示未播放部分
2. WHEN 用户拖动进度条 THEN Progress_Bar SHALL 跳转到对应的算法步骤
3. WHEN 进度条渲染完成 THEN Progress_Bar SHALL 宽度占满容器100%

### Requirement 4

**User Story:** 作为用户，我希望看到带调试效果的代码展示，以便理解算法执行过程中的变量变化。

#### Acceptance Criteria

1. WHEN 算法演示进行中 THEN Code_Debugger SHALL 高亮显示当前执行的代码行
2. WHEN 变量值发生变化 THEN Code_Debugger SHALL 在对应代码行后面显示变量的当前值
3. WHEN 代码渲染完成 THEN Code_Debugger SHALL 显示行号
4. WHEN 代码渲染完成 THEN Code_Debugger SHALL 保持正确的代码缩进对齐
5. WHEN 代码渲染完成 THEN Code_Debugger SHALL 应用语法高亮样式

### Requirement 5

**User Story:** 作为用户，我希望画布能够交互操作，以便更好地观察数据结构。

#### Acceptance Criteria

1. WHEN 用户在画布上拖动 THEN Canvas SHALL 平移画布视图
2. WHEN 用户在画布上滚动鼠标滚轮 THEN Canvas SHALL 缩放画布视图
3. WHEN 数据结构较大 THEN Canvas SHALL 自适应调整视图以完整显示

### Requirement 6

**User Story:** 作为用户，我希望画布上展示丰富的算法执行信息，以便深入理解算法逻辑。

#### Acceptance Criteria

1. WHEN 算法演示进行中 THEN Canvas SHALL 可视化展示数组元素及其下标
2. WHEN 算法演示进行中 THEN Canvas SHALL 高亮显示当前正在比较或操作的元素
3. WHEN 算法演示进行中 THEN Canvas SHALL 展示HashMap的键值对状态
4. WHEN 状态转移发生 THEN Canvas SHALL 通过动画展示数据的变化过程
5. WHEN 算法演示进行中 THEN Canvas SHALL 在元素旁显示文字说明（如"当前元素"、"目标值"等）

### Requirement 7

**User Story:** 作为用户，我希望能够输入自定义数据来测试算法，以便验证不同场景下的算法行为。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Data_Input SHALL 在标题下方显示数据输入区域
2. WHEN 用户输入自定义数据 THEN Data_Input SHALL 接受用户输入的数组和目标值
3. WHEN 页面加载完成 THEN Data_Input SHALL 平铺展示多个预设数据样例供用户选择
4. WHEN 用户点击"随机生成" THEN Data_Input SHALL 生成合法的随机测试数据
5. WHEN 用户提交数据 THEN Data_Input SHALL 验证输入数据的合法性
6. IF 用户输入的数据不合法 THEN Data_Input SHALL 显示错误提示并阻止提交

### Requirement 8

**User Story:** 作为用户，我希望能够加入算法交流群，以便与其他学习者交流讨论。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Algorithm_Visualizer SHALL 在页面右下角显示交流群悬浮球
2. WHEN 用户将鼠标悬停在悬浮球上 THEN Algorithm_Visualizer SHALL 显示微信二维码图片
3. WHEN 二维码显示 THEN Algorithm_Visualizer SHALL 保持图片原有比例不变形
4. WHEN 悬浮球渲染完成 THEN Algorithm_Visualizer SHALL 显示"交流群"字样图标

### Requirement 9

**User Story:** 作为开发者，我希望项目能够自动部署到GitHub Pages，以便代码提交后自动更新网站。

#### Acceptance Criteria

1. WHEN 代码推送到仓库 THEN GitHub_Action SHALL 自动触发构建和部署流程
2. WHEN 构建完成 THEN GitHub_Action SHALL 将产物部署到GitHub Pages
3. WHEN 本地开发完成 THEN Algorithm_Visualizer SHALL 确保无编译错误和linter错误

### Requirement 10

**User Story:** 作为用户，我希望网站是单屏幕应用，以便在一个视图内看到所有内容。

#### Acceptance Criteria

1. WHEN 页面加载完成 THEN Algorithm_Visualizer SHALL 将所有组件布局在单个屏幕内
2. WHEN 页面加载完成 THEN Algorithm_Visualizer SHALL 保持紧凑的排版布局
