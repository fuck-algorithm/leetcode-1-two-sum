import type { Step, ArrayElementState, HashMapEntry, VariableState, Annotation } from '../types'

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
 * 生成两数之和算法的所有执行步骤
 */
export function generateSteps(nums: number[], target: number): Step[] {
  const steps: Step[] = []
  const hashMap: HashMapEntry[] = []
  let stepIndex = 0

  // 初始化步骤
  steps.push(createStep(stepIndex++, '初始化 HashMap', 2, [], nums, [], [], []))

  // 遍历数组
  for (let i = 0; i < nums.length; i++) {
    const currentNum = nums[i]
    const complement = target - currentNum

    // 进入循环
    const loopVariables: VariableState[] = [{ name: 'i', value: String(i), line: 3 }]

    steps.push(
      createStep(
        stepIndex++,
        `遍历到索引 ${i}，当前元素 nums[${i}] = ${currentNum}`,
        3,
        loopVariables,
        nums,
        [...hashMap],
        [i],
        [{ targetIndex: i, text: '当前元素', position: 'top' }]
      )
    )

    // 计算补数
    const complementVariables: VariableState[] = [
      { name: 'i', value: String(i), line: 3 },
      { name: 'complement', value: String(complement), line: 4 },
    ]

    steps.push(
      createStep(
        stepIndex++,
        `计算补数 complement = ${target} - ${currentNum} = ${complement}`,
        4,
        complementVariables,
        nums,
        [...hashMap],
        [i],
        [
          { targetIndex: i, text: '当前元素', position: 'top' },
          { targetIndex: -1, text: `目标值: ${target}`, position: 'top' },
        ]
      )
    )

    // 检查 HashMap 中是否存在补数
    const hasComplement = hashMap.some((entry) => entry.key === complement)

    if (hasComplement) {
      const complementIndex = hashMap.find((entry) => entry.key === complement)!.value

      // 找到结果
      steps.push(
        createStep(
          stepIndex++,
          `在 HashMap 中找到补数 ${complement}，对应索引 ${complementIndex}`,
          5,
          complementVariables,
          nums,
          hashMap.map((entry) => ({
            ...entry,
            isNew: entry.key === complement,
          })),
          [complementIndex, i],
          [
            { targetIndex: complementIndex, text: '补数位置', position: 'top' },
            { targetIndex: i, text: '当前元素', position: 'bottom' },
          ]
        )
      )

      // 返回结果
      steps.push(
        createStep(
          stepIndex++,
          `找到答案！返回 [${complementIndex}, ${i}]`,
          6,
          [
            ...complementVariables,
            { name: 'result', value: `[${complementIndex}, ${i}]`, line: 6 },
          ],
          nums,
          hashMap.map((entry) => ({
            ...entry,
            isNew: entry.key === complement,
          })),
          [complementIndex, i],
          [
            { targetIndex: complementIndex, text: `答案[0]`, position: 'top' },
            { targetIndex: i, text: `答案[1]`, position: 'bottom' },
          ]
        )
      )

      return steps
    }

    // 未找到，检查 HashMap
    steps.push(
      createStep(
        stepIndex++,
        `HashMap 中不存在补数 ${complement}`,
        5,
        complementVariables,
        nums,
        [...hashMap],
        [i],
        [{ targetIndex: i, text: '当前元素', position: 'top' }]
      )
    )

    // 将当前元素加入 HashMap
    hashMap.push({ key: currentNum, value: i, isNew: true })

    steps.push(
      createStep(
        stepIndex++,
        `将 nums[${i}] = ${currentNum} 加入 HashMap，map[${currentNum}] = ${i}`,
        8,
        complementVariables,
        nums,
        hashMap.map((entry, idx) => ({
          ...entry,
          isNew: idx === hashMap.length - 1,
        })),
        [i],
        [{ targetIndex: i, text: '已加入HashMap', position: 'top' }]
      )
    )

    // 清除 isNew 标记
    hashMap[hashMap.length - 1].isNew = false
  }

  return steps
}

function createStep(
  index: number,
  description: string,
  currentLine: number,
  variables: VariableState[],
  nums: number[],
  hashMapState: HashMapEntry[],
  highlightedIndices: number[],
  annotations: Annotation[]
): Step {
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
