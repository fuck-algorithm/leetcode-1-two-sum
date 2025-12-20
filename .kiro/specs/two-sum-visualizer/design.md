# Design Document

## Overview

本项目是一个基于TypeScript+React+D3.js的算法可视化教学网站，用于展示LeetCode第1题"两数之和"的算法执行过程。网站采用单屏幕设计，包含以下核心模块：

- 页面头部：标题、GitHub链接
- 数据输入区：自定义输入、预设样例、随机生成
- 控制面板：播放控制按钮、进度条
- 代码调试器：带行号的代码展示、语法高亮、变量值显示
- 交互式画布：数组可视化、HashMap状态、动画效果
- 悬浮组件：交流群二维码

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App (Root)                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Header                            │   │
│  │  [Title + Link]                    [GitHub Icon]     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  DataInput                           │   │
│  │  [Input Fields] [Presets] [Random] [Submit]          │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │                      │  │                          │    │
│  │    CodeDebugger      │  │       Canvas             │    │
│  │                      │  │                          │    │
│  │  - Line numbers      │  │  - Array visualization   │    │
│  │  - Syntax highlight  │  │  - HashMap display       │    │
│  │  - Variable values   │  │  - Animations            │    │
│  │  - Current line      │  │  - Pan & Zoom            │    │
│  │                      │  │                          │    │
│  └──────────────────────┘  └──────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  ControlPanel                        │   │
│  │  [Reset] [Prev ←] [Play/Pause ␣] [Next →]           │   │
│  │  ════════════════════════════════════════════       │   │
│  │              Progress Bar (draggable)                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                              [FloatingBall] ↘
```

### 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **可视化**: D3.js
- **样式**: CSS Modules
- **代码高亮**: Prism.js
- **部署**: GitHub Actions + GitHub Pages

## Components and Interfaces

### 1. App (根组件)

```typescript
interface AppState {
  inputData: InputData;
  steps: Step[];
  currentStepIndex: number;
  isPlaying: boolean;
}
```

### 2. Header

```typescript
interface HeaderProps {
  title: string;
  leetcodeUrl: string;
  githubUrl: string;
}
```

### 3. DataInput

```typescript
interface DataInputProps {
  onSubmit: (data: InputData) => void;
  presets: PresetData[];
}

interface InputData {
  nums: number[];
  target: number;
}

interface PresetData {
  label: string;
  nums: number[];
  target: number;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}
```

### 4. CodeDebugger

```typescript
interface CodeDebuggerProps {
  code: string;
  currentLine: number;
  variables: VariableState[];
}

interface VariableState {
  name: string;
  value: string;
  line: number;
}
```

### 5. Canvas

```typescript
interface CanvasProps {
  step: Step;
  inputData: InputData;
}

interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}
```

### 6. ControlPanel

```typescript
interface ControlPanelProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (step: number) => void;
}
```

### 7. FloatingBall

```typescript
interface FloatingBallProps {
  qrCodeUrl: string;
}
```

## Data Models

### Step (算法步骤)

```typescript
interface Step {
  index: number;
  description: string;
  currentLine: number;
  variables: VariableState[];
  arrayState: ArrayElementState[];
  hashMapState: HashMapEntry[];
  highlightedIndices: number[];
  annotations: Annotation[];
}

interface ArrayElementState {
  index: number;
  value: number;
  isHighlighted: boolean;
  highlightColor?: string;
}

interface HashMapEntry {
  key: number;
  value: number;
  isNew?: boolean;
}

interface Annotation {
  targetIndex: number;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}
```

### 算法步骤生成器

```typescript
function generateSteps(nums: number[], target: number): Step[] {
  // 生成两数之和算法的所有执行步骤
  // 包括：初始化HashMap、遍历数组、查找补数、更新HashMap、找到结果
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 步骤导航一致性

*For any* 算法步骤序列和当前步骤索引，执行"下一步"操作后步骤索引应增加1（除非已在最后一步），执行"上一步"操作后步骤索引应减少1（除非已在第一步）。

**Validates: Requirements 2.1, 2.2**

### Property 2: 重置状态一致性

*For any* 算法演示状态，执行"重置"操作后，当前步骤索引应为0，播放状态应为暂停。

**Validates: Requirements 2.5**

### Property 3: 进度条跳转一致性

*For any* 进度条位置（0到totalSteps-1之间），拖动到该位置后，当前步骤索引应等于该位置值。

**Validates: Requirements 3.2**

### Property 4: 代码调试器状态一致性

*For any* 算法步骤，代码调试器高亮的行号应与步骤中指定的currentLine一致，显示的变量值应与步骤中的variables状态一致。

**Validates: Requirements 4.1, 4.2**

### Property 5: 画布状态一致性

*For any* 算法步骤，画布上显示的数组元素应与inputData.nums一致，高亮的元素索引应与步骤中的highlightedIndices一致，HashMap显示应与步骤中的hashMapState一致。

**Validates: Requirements 6.1, 6.2, 6.3, 6.5**

### Property 6: 随机数据合法性

*For any* 随机生成的测试数据，应满足：数组长度在2到10000之间，数组元素在-10^9到10^9之间，存在唯一有效解。

**Validates: Requirements 7.4**

### Property 7: 数据验证正确性

*For any* 输入数据，验证函数应正确判断：数组长度是否在有效范围内，元素值是否在有效范围内，是否存在有效解。对于不合法输入应返回错误信息。

**Validates: Requirements 7.5, 7.6**

### Property 8: 算法步骤生成正确性

*For any* 合法的输入数据（nums和target），生成的步骤序列的最后一步应包含正确的结果（两个下标i和j，使得nums[i] + nums[j] === target）。

**Validates: Requirements 6.1, 6.2, 6.3**

## Error Handling

### 输入验证错误

- 数组为空或长度不足：显示"数组长度必须至少为2"
- 数组长度超限：显示"数组长度不能超过10000"
- 元素值超限：显示"元素值必须在-10^9到10^9之间"
- 无有效解：显示"输入数据不存在有效解"
- 格式错误：显示"请输入有效的数组格式，如：[2,7,11,15]"

### 运行时错误

- 画布渲染失败：显示降级的静态视图
- 动画播放失败：跳过动画直接显示最终状态

## Testing Strategy

### 单元测试

使用Vitest进行单元测试：

- 数据验证函数测试
- 算法步骤生成器测试
- 状态管理逻辑测试

### 属性测试

使用fast-check进行属性测试：

- 每个属性测试运行至少100次迭代
- 测试注释格式：`**Feature: two-sum-visualizer, Property {number}: {property_text}**`

### 集成测试

使用Playwright进行E2E测试：

- 页面加载测试
- 用户交互流程测试
- 快捷键功能测试

### 测试文件结构

```
src/
├── components/
│   ├── __tests__/
│   │   ├── ControlPanel.test.tsx
│   │   ├── DataInput.test.tsx
│   │   └── CodeDebugger.test.tsx
├── utils/
│   ├── __tests__/
│   │   ├── stepGenerator.test.ts
│   │   ├── stepGenerator.property.test.ts
│   │   ├── validation.test.ts
│   │   └── validation.property.test.ts
```
