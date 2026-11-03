import { getCalculationX } from './canvasLayout'
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

/** Build short, visual beats: discover complement → save → match → return. */
export function generateSteps(nums: number[], target: number): Step[] {
  const steps: Step[] = []
  const hashMap: HashMapEntry[] = []
  const calculationX = getCalculationX(nums.length)
  let index = 0

  const add = (params: Omit<CreateStepParams, 'index' | 'nums'>) => {
    steps.push(createStep({ ...params, index: index++, nums }))
  }

  add({
    scene: 'intro',
    description: '从左到右找一对和为目标值的数字。',
    currentLine: 1,
    variables: [],
    hashMapState: [],
    highlightedIndices: [],
    annotations: [],
    actionLabel: '目标',
    statusText: `凑出 ${target}`,
  })

  for (let i = 0; i < nums.length; i++) {
    const value = nums[i]
    const complement = target - value
    const variables: VariableState[] = [
      { name: 'i', value: String(i), line: 3 },
      { name: '补数', value: String(complement), line: 4 },
    ]
    const matchIndex = hashMap.findIndex((entry) => entry.key === complement)

    if (matchIndex >= 0) {
      const previousIndex = hashMap[matchIndex].value
      const foundEntry = hashMap.map((entry) => ({ ...entry, isNew: entry.key === complement }))
      const pointers: PointerAnnotation[] = [
        { targetIndex: previousIndex, label: `${nums[previousIndex]}`, color: '#4caf50' },
        { targetIndex: i, label: `${value}`, color: '#e9b86e' },
      ]

      add({
        scene: 'scan',
        description: `查看 ${value}，它需要 ${complement}；这个数已经保存。`,
        currentLine: 5,
        variables,
        hashMapState: foundEntry,
        highlightedIndices: [i],
        annotations: [],
        actionLabel: `找 ${complement}`,
        pointers,
        calculation: { expression: `${target} − ${value}`, result: `${complement}`, x: calculationX, y: 0 },
        arrows: [{
          fromType: 'calculation', fromIndex: 0, toType: 'hashmap', toIndex: matchIndex,
          label: `命中 ${complement}`, color: '#8fd5b5', zIndex: 2,
        }],
        statusText: '已保存',
      })

      add({
        scene: 'match',
        description: `${nums[previousIndex]} 和 ${value} 正好凑成 ${target}。`,
        currentLine: 6,
        variables: [...variables, { name: '结果', value: `[${previousIndex}, ${i}]`, line: 6 }],
        hashMapState: foundEntry,
        highlightedIndices: [previousIndex, i],
        annotations: [],
        actionLabel: '配对成功',
        pointers,
        calculation: { expression: `${nums[previousIndex]} + ${value}`, result: `${target}`, x: calculationX, y: 0 },
        statusText: `${previousIndex} + ${i} = ${target}`,
      })

      add({
        scene: 'result',
        description: `返回这两个位置：${previousIndex} 和 ${i}。`,
        currentLine: 6,
        variables: [{ name: '结果', value: `[${previousIndex}, ${i}]`, line: 6 }],
        hashMapState: foundEntry,
        highlightedIndices: [previousIndex, i],
        annotations: [],
        actionLabel: `答案：${previousIndex}、${i}`,
        pointers: [
          { targetIndex: previousIndex, label: `${previousIndex}`, color: '#8fd5b5' },
          { targetIndex: i, label: `${i}`, color: '#8fd5b5' },
        ],
        calculation: { expression: `${nums[previousIndex]} + ${value}`, result: `${target} ✓`, x: calculationX, y: 0 },
        statusText: '返回下标',
      })
      return steps
    }

    add({
      scene: 'scan',
      description: `查看 ${value}；要凑成 ${target}，还差 ${complement}。`,
      currentLine: 4,
      variables,
      hashMapState: [...hashMap],
      highlightedIndices: [i],
      annotations: [],
      actionLabel: `找 ${complement}`,
      pointers: [{ targetIndex: i, label: `${value}`, color: '#e9b86e' }],
      calculation: { expression: `${target} − ${value}`, result: `${complement}`, x: calculationX, y: 0 },
      arrows: [{
        fromType: 'array', fromIndex: i, toType: 'calculation', toIndex: 0,
        label: `还差 ${complement}`, color: '#e9b86e', zIndex: 1,
      }],
      statusText: '还没找到',
    })

    hashMap.push({ key: value, value: i, isNew: true })
    add({
      scene: 'write',
      description: `先记住 ${value} 在位置 ${i}，后面可以用它配对。`,
      currentLine: 8,
      variables,
      hashMapState: hashMap.map((entry, entryIndex) => ({
        ...entry,
        isNew: entryIndex === hashMap.length - 1,
      })),
      highlightedIndices: [i],
      annotations: [],
      actionLabel: `记住 ${value}`,
      pointers: [{ targetIndex: i, label: `${value}`, color: '#8fd5b5' }],
      arrows: [{
        fromType: 'array', fromIndex: i, toType: 'hashmap', toIndex: hashMap.length - 1,
        label: `记住 ${value}`, color: '#8fd5b5', zIndex: 2,
      }],
      statusText: `位置 ${i}`,
    })
    hashMap[hashMap.length - 1].isNew = false
  }

  add({
    scene: 'result',
    description: '遍历结束，没有找到符合条件的一对。',
    currentLine: 10,
    variables: [],
    hashMapState: [...hashMap],
    highlightedIndices: [],
    annotations: [],
    actionLabel: '没有配对',
    statusText: '返回空数组',
  })

  return steps
}

interface CreateStepParams {
  index: number
  scene: Step['scene']
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
  statusText?: string
}

function createStep(params: CreateStepParams): Step {
  const arrayState: ArrayElementState[] = params.nums.map((value, idx) => ({
    index: idx,
    value,
    isHighlighted: params.highlightedIndices.includes(idx),
    highlightColor: params.highlightedIndices.includes(idx) ? '#8fd5b5' : undefined,
  }))

  return {
    ...params,
    arrayState,
    hashMapState: [...params.hashMapState],
  }
}

export function getResultFromSteps(steps: Step[]): [number, number] | null {
  const lastStep = steps[steps.length - 1]
  if (lastStep?.highlightedIndices.length === 2) {
    return [lastStep.highlightedIndices[0], lastStep.highlightedIndices[1]]
  }
  return null
}
