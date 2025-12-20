import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import type { CanvasProps, CanvasTransform } from '../types'
import styles from './Canvas.module.css'

const CELL_WIDTH = 70
const CELL_HEIGHT = 55
const CELL_GAP = 20
const ARRAY_Y = 120
const HASHMAP_Y_OFFSET = 380
const POINTER_AREA_HEIGHT = 80

export function Canvas({ step, inputData }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 })

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    const container = containerRef.current

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          scale: event.transform.k,
        })
      })

    svg.call(zoom)

    const contentWidth = inputData.nums.length * (CELL_WIDTH + CELL_GAP)
    const contentHeight = HASHMAP_Y_OFFSET + 150
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const scale = Math.min(
      containerWidth / (contentWidth + 100),
      containerHeight / (contentHeight + 50),
      1
    )

    const initialX = (containerWidth - contentWidth * scale) / 2
    const initialY = 20

    svg.call(zoom.transform, d3.zoomIdentity.translate(initialX, initialY).scale(scale))

    return () => {
      svg.on('.zoom', null)
    }
  }, [inputData.nums.length])

  const getCellX = (index: number) => index * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.header}>可视化画布</div>
      <svg ref={svgRef} className={styles.svg}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#ffeb3b" />
          </marker>
          <marker
            id="arrowhead-green"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#4caf50" />
          </marker>
          <marker
            id="arrowhead-blue"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#2196f3" />
          </marker>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* 操作标签 */}
          {step.actionLabel && (
            <g transform={`translate(${(inputData.nums.length * (CELL_WIDTH + CELL_GAP)) / 2}, 10)`}>
              <rect
                x={-100}
                y={-12}
                width={200}
                height={24}
                rx={12}
                className={styles.actionLabelBg}
              />
              <text x={0} y={5} className={styles.actionLabel}>
                {step.actionLabel}
              </text>
            </g>
          )}

          {/* 数组标题 */}
          <text x={0} y={ARRAY_Y - 25} className={styles.sectionTitle}>
            数组 nums
          </text>

          {/* 指针标注 */}
          {step.pointers?.map((pointer, idx) => {
            const targetX = getCellX(pointer.targetIndex)
            // 如果有多个指针指向同一位置，水平错开显示
            const sameTargetPointers = step.pointers?.filter(p => p.targetIndex === pointer.targetIndex) || []
            const sameTargetIdx = sameTargetPointers.findIndex(p => p === pointer)
            const totalSameTarget = sameTargetPointers.length
            // 水平错开：每个指针偏移一定距离
            const xOffset = totalSameTarget > 1 ? (sameTargetIdx - (totalSameTarget - 1) / 2) * 60 : 0
            const pointerX = targetX + xOffset
            
            return (
              <g key={`pointer-${idx}`} transform={`translate(${pointerX}, ${ARRAY_Y - POINTER_AREA_HEIGHT})`}>
                <text
                  x={0}
                  y={-8}
                  className={styles.pointerLabel}
                  style={{ fill: pointer.color }}
                >
                  {pointer.label}
                </text>
                <path
                  d="M 0 8 L -6 -4 L 6 -4 Z"
                  fill={pointer.color}
                  className={styles.pointerArrow}
                />
                {/* 连接线到元素 - 从指针位置斜向连接到目标元素 */}
                <line
                  x1={0}
                  y1={8}
                  x2={targetX - pointerX}
                  y2={POINTER_AREA_HEIGHT - 10}
                  stroke={pointer.color}
                  strokeWidth={2}
                  strokeDasharray="4,2"
                  opacity={0.6}
                />
              </g>
            )
          })}

          {/* 数组元素 */}
          {step.arrayState.map((element, index) => {
            const x = index * (CELL_WIDTH + CELL_GAP)

            return (
              <g key={index} transform={`translate(${x}, ${ARRAY_Y})`}>
                <rect
                  x={0}
                  y={0}
                  width={CELL_WIDTH}
                  height={CELL_HEIGHT}
                  rx={4}
                  className={`${styles.cell} ${element.isHighlighted ? styles.highlighted : ''}`}
                  style={element.highlightColor ? { fill: element.highlightColor } : undefined}
                />
                <text x={CELL_WIDTH / 2} y={CELL_HEIGHT / 2 + 5} className={styles.cellValue}>
                  {element.value}
                </text>
                <text x={CELL_WIDTH / 2} y={CELL_HEIGHT + 18} className={styles.cellIndex}>
                  [{index}]
                </text>
              </g>
            )
          })}

          {/* 计算展示区域 - 放在数组右侧 */}
          {step.calculation && (
            <g transform={`translate(${step.calculation.x}, ${ARRAY_Y - 10})`}>
              <rect
                x={-10}
                y={-20}
                width={250}
                height={80}
                rx={8}
                className={styles.calculationBg}
              />
              <text x={0} y={5} className={styles.calculationExpr}>
                {step.calculation.expression}
              </text>
              <text x={0} y={35} className={styles.calculationResult}>
                = {step.calculation.result}
              </text>
            </g>
          )}

          {/* 箭头连接 */}
          {step.arrows?.map((arrow, idx) => {
            let x1 = 0, y1 = 0, x2 = 0, y2 = 0

            // 计算起点位置（箭头从这里开始）
            if (arrow.fromType === 'array') {
              x1 = arrow.fromIndex * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2
              y1 = ARRAY_Y + CELL_HEIGHT + 25
            } else if (arrow.fromType === 'hashmap') {
              x1 = arrow.fromIndex * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2
              y1 = HASHMAP_Y_OFFSET - 10
            }

            // 计算终点位置（箭头指向这里）
            if (arrow.toType === 'hashmap') {
              x2 = arrow.toIndex * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2
              y2 = HASHMAP_Y_OFFSET - 10
            } else if (arrow.toType === 'array') {
              x2 = arrow.toIndex * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2
              y2 = ARRAY_Y + CELL_HEIGHT + 25
            }

            const markerId =
              arrow.color === '#4caf50'
                ? 'arrowhead-green'
                : arrow.color === '#2196f3'
                  ? 'arrowhead-blue'
                  : 'arrowhead'

            // 计算标签位置 - 放在箭头中间位置的右侧
            const midY = (y1 + y2) / 2
            const labelX = Math.max(x1, x2) + 60
            const labelY = midY
            
            // 根据方向调整控制点，使曲线更自然
            const isGoingUp = y1 > y2
            const controlOffset = Math.abs(y2 - y1) * 0.3

            return (
              <g key={`arrow-${idx}`}>
                {/* 曲线箭头 */}
                <path
                  d={`M ${x1} ${y1} C ${x1 + 30} ${isGoingUp ? y1 - controlOffset : y1 + controlOffset}, ${x2 + 30} ${isGoingUp ? y2 + controlOffset : y2 - controlOffset}, ${x2} ${y2}`}
                  fill="none"
                  stroke={arrow.color || '#ffeb3b'}
                  strokeWidth={3}
                  markerEnd={`url(#${markerId})`}
                  className={styles.arrow}
                />
                {/* 箭头标签 */}
                {arrow.label && (
                  <g transform={`translate(${labelX}, ${labelY})`}>
                    <rect
                      x={-5}
                      y={-14}
                      width={arrow.label.length * 8 + 16}
                      height={24}
                      rx={4}
                      fill="rgba(0,0,0,0.9)"
                      stroke={arrow.color || '#ffeb3b'}
                      strokeWidth={1}
                    />
                    <text
                      x={arrow.label.length * 4 + 3}
                      y={4}
                      className={styles.arrowLabel}
                      style={{ fill: arrow.color || '#ffeb3b' }}
                    >
                      {arrow.label}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* HashMap 标题 */}
          <text x={0} y={HASHMAP_Y_OFFSET - 25} className={styles.sectionTitle}>
            HashMap (值 → 索引)
          </text>

          {/* HashMap 条目 */}
          {step.hashMapState.length === 0 ? (
            <text x={0} y={HASHMAP_Y_OFFSET + 25} className={styles.emptyText}>
              (空)
            </text>
          ) : (
            step.hashMapState.map((entry, index) => {
              const x = index * (CELL_WIDTH + CELL_GAP)

              return (
                <g key={index} transform={`translate(${x}, ${HASHMAP_Y_OFFSET})`}>
                  <rect
                    x={0}
                    y={0}
                    width={CELL_WIDTH}
                    height={CELL_HEIGHT}
                    rx={4}
                    className={`${styles.hashCell} ${entry.isNew ? styles.newEntry : ''}`}
                  />
                  <text x={CELL_WIDTH / 2} y={20} className={styles.hashKey}>
                    {entry.key}
                  </text>
                  <line
                    x1={5}
                    y1={CELL_HEIGHT / 2}
                    x2={CELL_WIDTH - 5}
                    y2={CELL_HEIGHT / 2}
                    className={styles.hashDivider}
                  />
                  <text x={CELL_WIDTH / 2} y={40} className={styles.hashValue}>
                    {entry.value}
                  </text>
                  {entry.isNew && (
                    <text x={CELL_WIDTH / 2} y={CELL_HEIGHT + 18} className={styles.newLabel}>
                      新增
                    </text>
                  )}
                </g>
              )
            })
          )}
        </g>
      </svg>
    </div>
  )
}
