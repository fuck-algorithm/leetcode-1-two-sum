// 输入数据
export interface InputData {
  nums: number[]
  target: number
}

// 预设数据
export interface PresetData {
  label: string
  nums: number[]
  target: number
}

// 验证结果
export interface ValidationResult {
  isValid: boolean
  error?: string
}

// 变量状态
export interface VariableState {
  name: string
  value: string
  line: number
}

// 数组元素状态
export interface ArrayElementState {
  index: number
  value: number
  isHighlighted: boolean
  highlightColor?: string
}

// HashMap 条目
export interface HashMapEntry {
  key: number
  value: number
  isNew?: boolean
}

// 注解
export interface Annotation {
  targetIndex: number
  text: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

// 算法步骤
export interface Step {
  index: number
  description: string
  currentLine: number
  variables: VariableState[]
  arrayState: ArrayElementState[]
  hashMapState: HashMapEntry[]
  highlightedIndices: number[]
  annotations: Annotation[]
}

// 画布变换
export interface CanvasTransform {
  x: number
  y: number
  scale: number
}

// 组件 Props
export interface HeaderProps {
  title: string
  leetcodeUrl: string
  githubUrl: string
}

export interface DataInputProps {
  onSubmit: (data: InputData) => void
  presets: PresetData[]
}

export interface CodeDebuggerProps {
  code: string
  currentLine: number
  variables: VariableState[]
}

export interface CanvasProps {
  step: Step
  inputData: InputData
}

export interface ControlPanelProps {
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  onPrev: () => void
  onNext: () => void
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onSeek: (step: number) => void
}

export interface FloatingBallProps {
  qrCodeUrl: string
}
