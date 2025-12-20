import { useState } from 'react'
import type { DataInputProps, InputData } from '../types'
import { validateInput, parseArrayString } from '../utils/validation'
import { generateRandomData } from '../utils/randomGenerator'
import styles from './DataInput.module.css'

export function DataInput({ onSubmit, presets }: DataInputProps) {
  const [arrayInput, setArrayInput] = useState('[2,7,11,15]')
  const [targetInput, setTargetInput] = useState('9')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    const nums = parseArrayString(arrayInput)
    if (!nums) {
      setError('请输入有效的数组格式，如：[2,7,11,15]')
      return
    }

    const target = Number(targetInput)
    if (isNaN(target)) {
      setError('请输入有效的目标值')
      return
    }

    const data: InputData = { nums, target }
    const validation = validateInput(data)

    if (!validation.isValid) {
      setError(validation.error || '输入数据无效')
      return
    }

    setError(null)
    onSubmit(data)
  }

  const handlePreset = (preset: { nums: number[]; target: number }) => {
    setArrayInput(JSON.stringify(preset.nums))
    setTargetInput(String(preset.target))
    setError(null)
    onSubmit({ nums: preset.nums, target: preset.target })
  }

  const handleRandom = () => {
    const data = generateRandomData()
    setArrayInput(JSON.stringify(data.nums))
    setTargetInput(String(data.target))
    setError(null)
    onSubmit(data)
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>数组 nums:</label>
          <input
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            className={styles.input}
            placeholder="[2,7,11,15]"
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>目标值 target:</label>
          <input
            type="text"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            className={styles.input}
            placeholder="9"
          />
        </div>
        <button onClick={handleSubmit} className={styles.submitBtn}>
          运行
        </button>
        <button onClick={handleRandom} className={styles.randomBtn}>
          随机生成
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.presets}>
        <span className={styles.presetsLabel}>预设样例:</span>
        {presets.map((preset, index) => (
          <button
            key={index}
            onClick={() => handlePreset(preset)}
            className={styles.presetBtn}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
