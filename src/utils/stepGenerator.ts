import type {
  Step,
  ArrayElementState,
  HashMapEntry,
  VariableState,
  Annotation,
  ArrowConnection,
  CalculationDisplay,
  PointerAnnotation,
} from '../types'

const CELL_WIDTH = 70
const CELL_GAP = 20

/**
 * 两数之和算法的 Java 代码
 */
export const TWO_SUM_CODE = `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    return new int[] {};
}`

/**
 * 生成两数之和算法的所有执行步骤（详细版）
 */
export function generateSteps(nums: number[], target: number): Step[] {
  const steps: Step[] = []
  const hashMap: HashMapEntry[] = []
  let stepIndex = 0

  const arrayWidth = nums.length * (CELL_WIDTH + CELL_GAP)

  // 步骤1: 初始化 - 展示问题
  steps.push(
    createStep({
      index: stepIndex++,
      description: '开始执行两数之和算法',
      currentLine: 1,
      variables: [],
      nums,
      hashMapState: [],
      highlightedIndices: [],
      annotations: [],
      actionLabel: `目标: 找两数之和 = ${target}`,
    })
  )

  // 步骤2: 创建 HashMap
  steps.push(
    createStep({
      index: stepIndex++,
      description: '创建空的 HashMap',
      currentLine: 2,
      variables: [],
      nums,
      hashMapState: [],
      highlightedIndices: [],
      annotations: [],
      actionLabel: '创建 HashMap<值, 索引>',
    })
  )

  // 遍历数组
  for (let i = 0; i < nums.length; i++) {
    const currentNum = nums[i]
    const complement = target - currentNum

    // 步骤: 进入循环，设置 i
    const loopVariables: VariableState[] = [{ name: 'i', value: String(i), line: 3 }]

    steps.push(
      createStep({
        index: stepIndex++,
        description: `循环: i = ${i}`,
        currentLine: 3,
        variables: loopVariables,
        nums,
        hashMapState: [...hashMap],
        highlightedIndices: [],
        annotations: [],
        actionLabel: `进入循环 i = ${i}`,
        pointers: [{ targetIndex: i, label: `i = ${i}`, color: '#ffeb3b' }],
      })
    )

    // 步骤: 读取当前元素
    steps.push(
      createStep({
        index: stepIndex++,
        description: `读取 nums[${i}]`,
        currentLine: 4,
        variables: loopVariables,
        nums,
        hashMapState: [...hashMap],
        highlightedIndices: [i],
        annotations: [],
        actionLabel: `读取 nums[${i}] = ${currentNum}`,
        pointers: [{ targetIndex: i, label: `值: ${currentNum}`, color: '#ffeb3b' }],
      })
    )

    // 步骤: 计算补数
    const complementVariables: VariableState[] = [
      { name: 'i', value: String(i), line: 3 },
      { name: 'complement', value: String(complement), line: 4 },
    ]

    steps.push(
      createStep({
        index: stepIndex++,
        description: `计算补数`,
        currentLine: 4,
        variables: complementVariables,
        nums,
        hashMapState: [...hashMap],
        highlightedIndices: [i],
        annotations: [],
        actionLabel: '计算补数 complement',
        pointers: [{ targetIndex: i, label: `当前: ${currentNum}`, color: '#ffeb3b' }],
        calculation: {
          expression: `complement = target - nums[${i}]`,
          result: `${target} - ${currentNum} = ${complement}`,
          x: arrayWidth + 30,
          y: 0,
        },
      })
    )

    // 检查 HashMap 中是否存在补数
    const hasComplement = hashMap.some((entry) => entry.key === complement)
    const complementMapIndex = hashMap.findIndex((entry) => entry.key === complement)

    // 步骤: 在 HashMap 中查找补数
    steps.push(
      createStep({
        index: stepIndex++,
        description: `查找补数 ${complement}`,
        currentLine: 5,
        variables: complementVariables,
        nums,
        hashMapState: hashMap.map((entry) => ({
          ...entry,
          isNew: entry.key === complement,
        })),
        highlightedIndices: [i],
        annotations: [],
        actionLabel: `在 HashMap 中查找 ${complement}`,
        pointers: [{ targetIndex: i, label: `当前`, color: '#ffeb3b' }],
        calculation: {
          expression: `map.containsKey(${complement})`,
          result: hasComplement ? 'true ✓' : 'false ✗',
          x: arrayWidth + 30,
          y: 0,
        },
      })
    )

    if (hasComplement) {
      const complementIndex = hashMap.find((entry) => entry.key === complement)!.value

      // 步骤: 找到补数，获取索引
      steps.push(
        createStep({
          index: stepIndex++,
          description: `找到补数!`,
          currentLine: 5,
          variables: complementVariables,
          nums,
          hashMapState: hashMap.map((entry) => ({
            ...entry,
            isNew: entry.key === complement,
          })),
          highlightedIndices: [complementIndex, i],
          annotations: [],
          actionLabel: `✓ 补数 ${complement} 在索引 ${complementIndex}`,
          pointers: [
            { targetIndex: complementIndex, label: `补数位置`, color: '#4caf50' },
            { targetIndex: i, label: `当前`, color: '#ffeb3b' },
          ],
          arrows: [
            {
              fromType: 'hashmap',
              fromIndex: complementMapIndex,
              toType: 'array',
              toIndex: complementIndex,
              label: `map[${complement}] → ${complementIndex}`,
              color: '#4caf50',
            },
          ],
        })
      )

      // 步骤: 验证两数之和
      steps.push(
        createStep({
          index: stepIndex++,
          description: `验证结果`,
          currentLine: 6,
          variables: [
            ...complementVariables,
            { name: 'result', value: `[${complementIndex}, ${i}]`, line: 6 },
          ],
          nums,
          hashMapState: hashMap.map((entry) => ({
            ...entry,
            isNew: entry.key === complement,
          })),
          highlightedIndices: [complementIndex, i],
          annotations: [],
          actionLabel: `验证: ${nums[complementIndex]} + ${currentNum} = ?`,
          pointers: [
            { targetIndex: complementIndex, label: `${nums[complementIndex]}`, color: '#4caf50' },
            { targetIndex: i, label: `${currentNum}`, color: '#4caf50' },
          ],
          calculation: {
            expression: `nums[${complementIndex}] + nums[${i}]`,
            result: `${nums[complementIndex]} + ${currentNum} = ${target} ✓`,
            x: arrayWidth + 30,
            y: 0,
          },
        })
      )

      // 步骤: 返回结果
      steps.push(
        createStep({
          index: stepIndex++,
          description: `返回答案`,
          currentLine: 6,
          variables: [
            ...complementVariables,
            { name: 'result', value: `[${complementIndex}, ${i}]`, line: 6 },
          ],
          nums,
          hashMapState: hashMap.map((entry) => ({
            ...entry,
            isNew: entry.key === complement,
          })),
          highlightedIndices: [complementIndex, i],
          annotations: [],
          actionLabel: `🎉 答案: [${complementIndex}, ${i}]`,
          pointers: [
            { targetIndex: complementIndex, label: `答案[0]`, color: '#4caf50' },
            { targetIndex: i, label: `答案[1]`, color: '#4caf50' },
          ],
        })
      )

      return steps
    }

    // 步骤: 未找到补数
    steps.push(
      createStep({
        index: stepIndex++,
        description: `未找到补数`,
        currentLine: 5,
        variables: complementVariables,
        nums,
        hashMapState: [...hashMap],
        highlightedIndices: [i],
        annotations: [],
        actionLabel: `✗ HashMap 中无 ${complement}`,
        pointers: [{ targetIndex: i, label: `当前`, color: '#ffeb3b' }],
      })
    )

    // 步骤: 准备存入 HashMap
    steps.push(
      createStep({
        index: stepIndex++,
        description: `准备存入 HashMap`,
        currentLine: 8,
        variables: complementVariables,
        nums,
        hashMapState: [...hashMap],
        highlightedIndices: [i],
        annotations: [],
        actionLabel: `准备: map.put(${currentNum}, ${i})`,
        pointers: [{ targetIndex: i, label: `待存入`, color: '#2196f3' }],
        calculation: {
          expression: `map.put(nums[${i}], ${i})`,
          result: `map.put(${currentNum}, ${i})`,
          x: arrayWidth + 30,
          y: 0,
        },
      })
    )

    // 将当前元素加入 HashMap
    const newMapIndex = hashMap.length
    hashMap.push({ key: currentNum, value: i, isNew: true })

    // 步骤: 存入完成
    steps.push(
      createStep({
        index: stepIndex++,
        description: `存入完成`,
        currentLine: 8,
        variables: complementVariables,
        nums,
        hashMapState: hashMap.map((entry, idx) => ({
          ...entry,
          isNew: idx === hashMap.length - 1,
        })),
        highlightedIndices: [i],
        annotations: [],
        actionLabel: `✓ 已存入 map[${currentNum}] = ${i}`,
        pointers: [{ targetIndex: i, label: `已存入`, color: '#4caf50' }],
        arrows: [
          {
            fromType: 'array',
            fromIndex: i,
            toType: 'hashmap',
            toIndex: newMapIndex,
            label: `${currentNum} → ${i}`,
            color: '#2196f3',
          },
        ],
      })
    )

    // 清除 isNew 标记
    hashMap[hashMap.length - 1].isNew = false

    // 如果不是最后一个元素，添加继续循环的步骤
    if (i < nums.length - 1) {
      steps.push(
        createStep({
          index: stepIndex++,
          description: `继续下一轮`,
          currentLine: 3,
          variables: [{ name: 'i', value: String(i), line: 3 }],
          nums,
          hashMapState: [...hashMap],
          highlightedIndices: [],
          annotations: [],
          actionLabel: `i++ → 继续循环`,
        })
      )
    }
  }

  // 如果遍历完都没找到，返回空数组
  steps.push(
    createStep({
      index: stepIndex++,
      description: '未找到结果',
      currentLine: 10,
      variables: [],
      nums,
      hashMapState: [...hashMap],
      highlightedIndices: [],
      annotations: [],
      actionLabel: '遍历完成，无解',
    })
  )

  return steps
}

interface CreateStepParams {
  index: number
  description: string
  currentLine: number
  variables: VariableState[]
  nums: number[]
  hashMapState: HashMapEntry[]
  highlightedIndices: number[]
  annotations: Annotation[]
  actionLabel?: string
  pointers?: PointerAnnotation[]
  arrows?: ArrowConnection[]
  calculation?: CalculationDisplay
}

function createStep(params: CreateStepParams): Step {
  const {
    index,
    description,
    currentLine,
    variables,
    nums,
    hashMapState,
    highlightedIndices,
    annotations,
    actionLabel,
    pointers,
    arrows,
    calculation,
  } = params

  const arrayState: ArrayElementState[] = nums.map((value, idx) => ({
    index: idx,
    value,
    isHighlighted: highlightedIndices.includes(idx),
    highlightColor: highlightedIndices.includes(idx) ? '#4CAF50' : undefined,
  }))

  return {
    index,
    description,
    currentLine,
    variables,
    arrayState,
    hashMapState: [...hashMapState],
    highlightedIndices,
    annotations,
    actionLabel,
    pointers,
    arrows,
    calculation,
  }
}

/**
 * 从步骤中提取最终结果
 */
export function getResultFromSteps(steps: Step[]): [number, number] | null {
  const lastStep = steps[steps.length - 1]
  if (lastStep.highlightedIndices.length === 2) {
    return [lastStep.highlightedIndices[0], lastStep.highlightedIndices[1]]
  }
  return null
}
