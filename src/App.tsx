import { useState, useMemo } from 'react'
import type { InputData, PresetData, Step } from './types'
import { Header } from './components/Header'
import { DataInput } from './components/DataInput'
import { CodeDebugger } from './components/CodeDebugger'
import { Canvas } from './components/Canvas'
import { ControlPanel } from './components/ControlPanel'
import { FloatingBall } from './components/FloatingBall'
import { useAlgorithmPlayer } from './hooks/useAlgorithmPlayer'
import { generateSteps, TWO_SUM_CODE } from './utils/stepGenerator'
import styles from './App.module.css'

const PRESETS: PresetData[] = [
  { label: '示例1: [2,7,11,15], 9', nums: [2, 7, 11, 15], target: 9 },
  { label: '示例2: [3,2,4], 6', nums: [3, 2, 4], target: 6 },
  { label: '示例3: [3,3], 6', nums: [3, 3], target: 6 },
  { label: '较长数组', nums: [1, 5, 3, 7, 2, 8, 4, 6], target: 10 },
]

const DEFAULT_INPUT: InputData = { nums: [2, 7, 11, 15], target: 9 }

export default function App() {
  const [inputData, setInputData] = useState<InputData>(DEFAULT_INPUT)

  const steps: Step[] = useMemo(() => {
    return generateSteps(inputData.nums, inputData.target)
  }, [inputData])

  const [playerState, playerActions] = useAlgorithmPlayer(steps)

  const currentStep = steps[playerState.currentStepIndex] || steps[0]

  const handleDataSubmit = (data: InputData) => {
    setInputData(data)
  }

  return (
    <div className={styles.app}>
      <Header
        title="1. 两数之和"
        leetcodeUrl="https://leetcode.cn/problems/two-sum/"
        githubUrl="https://github.com/fuck-algorithm/leetcode-1-two-sum"
      />

      <DataInput onSubmit={handleDataSubmit} presets={PRESETS} />

      <main className={styles.main}>
        <div className={styles.codePanel}>
          <CodeDebugger
            code={TWO_SUM_CODE}
            currentLine={currentStep.currentLine}
            variables={currentStep.variables}
          />
        </div>

        <div className={styles.canvasPanel}>
          <Canvas step={currentStep} inputData={inputData} />
        </div>
      </main>

      <ControlPanel
        currentStep={playerState.currentStepIndex}
        totalSteps={playerState.totalSteps}
        isPlaying={playerState.isPlaying}
        onPrev={playerActions.prev}
        onNext={playerActions.next}
        onPlay={playerActions.play}
        onPause={playerActions.pause}
        onReset={playerActions.reset}
        onSeek={playerActions.seek}
      />

      <FloatingBall qrCodeUrl="/qrcode.svg" />
    </div>
  )
}
