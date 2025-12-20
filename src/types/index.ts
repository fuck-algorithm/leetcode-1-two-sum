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

// 箭头连接（用于数据传递可视化）
export interface ArrowConnection {
  fromType: 'array' | 'hashmap' | 'calculation'
  fromIndex: number
  toType: 'array' | 'hashmap' | 'calculation'
  toIndex: number
  label?: string
  color?: string
}

// 计算展示
export interface CalculationDisplay {
  expression: string
  result: string
  x: number
  y: number
}

// 指针标注
export interface PointerAnnotation {
  targetIndex: number
  label: string
  color: string
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
  arrows?: ArrowConnection[]
  calculation?: CalculationDisplay
  pointers?: PointerAnnotation[]
  actionLabel?: string
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

// 播放速率类型
export type PlaybackRate = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2 | 3

export interface ControlPanelProps {
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  playbackRate: PlaybackRate
  onPrev: () => void
  onNext: () => void
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onSeek: (step: number) => void
  onPlaybackRateChange: (rate: PlaybackRate) => void
}

export interface FloatingBallProps {
  qrCodeUrl: string
}
