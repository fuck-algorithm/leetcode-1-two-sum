import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import type { CanvasProps, CanvasTransform } from '../types'
import styles from './Canvas.module.css'

const CELL_WIDTH = 70
const CELL_HEIGHT = 55
const CELL_GAP = 20
const ARRAY_Y = 260
const HASHMAP_Y_OFFSET = 450
const POINTER_AREA_HEIGHT = 80
const STATUS_AREA_Y = 30

export function Canvas({ step, inputData }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 })

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    const container = containerRef.current

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 2.5])
      .on('zoom', (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          scale: event.transform.k,
        })
      })

    svg.call(zoom).on('dblclick.zoom', null)

    const fitContent = () => {
      const contentWidth = Math.max(
        inputData.nums.length * (CELL_WIDTH + CELL_GAP) + 340,
        520,
      )
      const contentHeight = HASHMAP_Y_OFFSET + 110
      const width = svgRef.current?.clientWidth ?? container.clientWidth
      const height = svgRef.current?.clientHeight ?? container.clientHeight
      svg.attr('viewBox', `0 0 ${width} ${height}`)
      const scale = Math.min(width / (contentWidth + 24), height / (contentHeight + 24), 1.2)
      const initialX = 20
      const initialY = 0
      svg.call(zoom.transform, d3.zoomIdentity.translate(initialX, initialY).scale(scale))
    }

    fitContent()
    const observer = new ResizeObserver(fitContent)
    observer.observe(container)

    return () => {
      observer.disconnect()
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
          {/* 集中说明区域：状态展示面板 */}
          {(step.actionLabel || step.statusText || step.algorithmHint) && (
            <g transform={`translate(0, ${STATUS_AREA_Y})`} style={{ zIndex: 100 }}>
              <g>
                {/* 面板背景 */}
                <rect
                  x={-15}
                  y={-25}
                  width={Math.max(
                    260,
                    (step.actionLabel?.length || 0) * 9 + 70,
                    (step.statusText?.length || 0) * 9 + 70,
                    (step.algorithmHint?.length || 0) * 9 + 70
                  )}
                  height={100}
                  rx={12}
                  className={styles.statusBg}
                />

                {/* 面板标题装饰 */}
                <circle cx={-2} cy={-12} r={3} fill="#4caf50" opacity={0.8} />
                <circle cx={10} cy={-12} r={3} fill="#ffeb3b" opacity={0.8} />
                <circle cx={22} cy={-12} r={3} fill="#2196f3" opacity={0.8} />

                {/* 当前操作标签 */}
                {step.actionLabel && (
                  <>
                    <text x={8} y={8} className={styles.statusSectionLabel}>
                      当前操作
                    </text>
                    <text x={8} y={26} className={styles.actionLabel}>
                      {step.actionLabel}
                    </text>
                  </>
                )}

                {/* 状态说明 */}
                {step.statusText && (
                  <>
                    <text x={8} y={42} className={styles.statusSectionLabel}>
                      💡 状态说明
                    </text>
                    <text x={8} y={58} className={styles.statusText}>
                      {step.statusText}
                    </text>
                  </>
                )}

                {/* 算法提示 */}
                {step.algorithmHint && (
                  <text x={8} y={74} className={styles.hintText}>
                    🔍 {step.algorithmHint}
                  </text>
                )}

                {/* 装饰边框 */}
                <line
                  x1={-10}
                  y1={0}
                  x2={Math.max(
                    250,
                    (step.actionLabel?.length || 0) * 9 + 60,
                    (step.statusText?.length || 0) * 9 + 60,
                    (step.algorithmHint?.length || 0) * 9 + 60
                  )}
                  y2={0}
                  stroke="#4caf50"
                  strokeWidth={1}
                  opacity={0.3}
                />
              </g>
            </g>
          )}

          {/* 数组标题 */}
          <text x={0} y={ARRAY_Y - 30} className={styles.sectionTitle}>
            📊 数组 nums (长度: {inputData.nums.length})
          </text>

          {/* 指针标注 - 增加状态标识 */}
          {step.pointers?.map((pointer, idx) => {
            const targetX = getCellX(pointer.targetIndex)

            // 如果有多个指针指向同一位置，自动错开 + 允许 stepGenerator 传入额外 offset
            const sameTargetPointers = step.pointers?.filter((p) => p.targetIndex === pointer.targetIndex) || []
            const sameTargetIdx = sameTargetPointers.findIndex((p) => p === pointer)
            const totalSameTarget = sameTargetPointers.length

            const autoXOffset = totalSameTarget > 1 ? (sameTargetIdx - (totalSameTarget - 1) / 2) * 70 : 0
            const extraXOffset = pointer.offset?.x ?? 0
            const extraYOffset = pointer.offset?.y ?? 0

            const pointerX = targetX + autoXOffset + extraXOffset

            return (
              <g
                key={`pointer-${idx}`}
                transform={`translate(${pointerX}, ${ARRAY_Y - POINTER_AREA_HEIGHT + extraYOffset})`}
                style={{ zIndex: 10 }}
              >
                {/* 指针标签背景 */}
                <rect
                  x={-pointer.label.length * 4 - 8}
                  y={-24}
                  width={pointer.label.length * 8 + 16}
                  height={20}
                  rx={4}
                  fill="rgba(0, 0, 0, 0.85)"
                  stroke={pointer.color}
                  strokeWidth={1.5}
                  className={styles.pointerLabelBg}
                />
                {/* 指针标签文本 */}
                <text
                  x={0}
                  y={-10}
                  className={styles.pointerLabel}
                  style={{ fill: pointer.color }}
                >
                  {pointer.label}
                </text>
                {/* 箭头形状 */}
                <path
                  d="M 0 8 L -6 -4 L 6 -4 Z"
                  fill={pointer.color}
                  className={styles.pointerArrow}
                />
                {/* 连接线到元素 - 从指针位置斜向连接到目标元素，带动画效果 */}
                <line
                  x1={0}
                  y1={8}
                  x2={targetX - pointerX}
                  y2={POINTER_AREA_HEIGHT - 10 - extraYOffset}
                  stroke={pointer.color}
                  strokeWidth={2.5}
                  strokeDasharray="6,3"
                  opacity={0.7}
                  className={styles.pointerLine}
                />
                {/* 目标位置标记圆点 */}
                <circle
                  cx={targetX - pointerX}
                  cy={POINTER_AREA_HEIGHT - 10 - extraYOffset}
                  r={5}
                  fill={pointer.color}
                  opacity={0.8}
                  className={styles.pointerTargetDot}
                />
              </g>
            )
          })}

          {/* 数组元素 - 增加状态标识 */}
          {step.arrayState.map((element, index) => {
            const x = index * (CELL_WIDTH + CELL_GAP)
            const isHighlighted = element.isHighlighted

            return (
              <g key={index} transform={`translate(${x}, ${ARRAY_Y})`}>
                {/* 高亮元素的光晕效果 */}
                {isHighlighted && (
                  <rect
                    x={-3}
                    y={-3}
                    width={CELL_WIDTH + 6}
                    height={CELL_HEIGHT + 6}
                    rx={6}
                    fill="none"
                    stroke={element.highlightColor || '#4caf50'}
                    strokeWidth={3}
                    className={styles.cellGlow}
                    opacity={0.6}
                  />
                )}
                {/* 元素背景 */}
                <rect
                  x={0}
                  y={0}
                  width={CELL_WIDTH}
                  height={CELL_HEIGHT}
                  rx={4}
                  className={`${styles.cell} ${isHighlighted ? styles.highlighted : ''}`}
                  style={element.highlightColor ? { fill: element.highlightColor } : undefined}
                />
                {/* 值标签 */}
                <text x={5} y={-6} className={styles.cellFieldLabel}>
                  值
                </text>
                {/* 元素值 */}
                <text x={CELL_WIDTH / 2} y={CELL_HEIGHT / 2 + 5} className={styles.cellValue}>
                  {element.value}
                </text>
                {/* 索引标签 */}
                <text x={CELL_WIDTH / 2} y={CELL_HEIGHT + 18} className={styles.cellIndex}>
                  索引 {index}
                </text>
                {/* 高亮状态指示器 */}
                {isHighlighted && (
                  <circle
                    cx={CELL_WIDTH - 8}
                    cy={8}
                    r={5}
                    fill={element.highlightColor || '#4caf50'}
                    className={styles.cellStatusDot}
                  />
                )}
              </g>
            )
          })}

          {/* 计算展示区域 - 放在数组右侧，增加状态标识 */}
          {step.calculation && (
            <g transform={`translate(${step.calculation.x}, ${ARRAY_Y - 10})`} style={{ zIndex: 5 }}>
              {/* 计算区域背景 */}
              <rect
                x={-15}
                y={-25}
                width={280}
                height={90}
                rx={10}
                className={styles.calculationBg}
              />
              {/* 计算区域标题 */}
              <text x={5} y={-8} className={styles.calculationTitle}>
                💭 计算过程
              </text>
              {/* 分隔线 */}
              <line
                x1={-10}
                y1={0}
                x2={260}
                y2={0}
                stroke="#2196f3"
                strokeWidth={1}
                opacity={0.3}
              />
              {/* 计算表达式 */}
              <text x={5} y={20} className={styles.calculationExpr}>
                {step.calculation.expression}
              </text>
              {/* 计算结果 */}
              <text x={5} y={48} className={styles.calculationResult}>
                {step.calculation.result}
              </text>
              {/* 装饰性图标 */}
              <circle
                cx={245}
                cy={30}
                r={8}
                fill="none"
                stroke="#2196f3"
                strokeWidth={2}
                className={styles.calculationIcon}
              />
              <text x={245} y={35} className={styles.calculationIconText}>
                ✓
              </text>
            </g>
          )}

          {/* 箭头连接 */}
          {step.arrows
            ?.slice()
            .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
            .map((arrow, idx) => {
            let x1 = 0, y1 = 0, x2 = 0, y2 = 0

            // 计算起点位置（箭头从这里开始）
            if (arrow.fromType === 'array') {
              x1 = arrow.fromIndex * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2
              y1 = ARRAY_Y + CELL_HEIGHT + 5
            } else if (arrow.fromType === 'hashmap') {
              x1 = arrow.fromIndex * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2
              y1 = HASHMAP_Y_OFFSET
            } else if (arrow.fromType === 'calculation') {
              // Calculation 右侧边缘是数据流出口，按行错开多个来源。
              x1 = (step.calculation?.x ?? 0) + 265
              y1 = (step.calculation?.y ?? 0) + ARRAY_Y + 10 + (arrow.fromIndex ?? 0) * 22
            }

            // 计算终点位置（箭头指向这里）
            if (arrow.toType === 'hashmap') {
              x2 = arrow.toIndex * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2
              y2 = HASHMAP_Y_OFFSET + CELL_HEIGHT / 2
            } else if (arrow.toType === 'array') {
              x2 = arrow.toIndex * (CELL_WIDTH + CELL_GAP) + CELL_WIDTH / 2
              y2 = ARRAY_Y + CELL_HEIGHT + 5
            } else if (arrow.toType === 'calculation') {
              x2 = (step.calculation?.x ?? 0) - 15
              y2 = (step.calculation?.y ?? 0) + ARRAY_Y + 10 + (arrow.toIndex ?? 0) * 22
            }

            const markerId =
              arrow.color === '#4caf50'
                ? 'arrowhead-green'
                : arrow.color === '#2196f3'
                  ? 'arrowhead-blue'
                  : 'arrowhead'

            const isGoingUp = y1 > y2
            const isGoingRight = x2 > x1
            const isGoingLeft = x2 < x1
            const controlOffset = Math.max(36, Math.abs(y2 - y1) * 0.42)
            // 曲线离开计算框时先向外绕行，避免穿过表达式与结果。
            const controlX1 = x1 + (arrow.fromType === 'calculation' ? 64 : isGoingRight ? 50 : -50)
            const controlX2 = x2 + (arrow.toType === 'calculation' ? -64 : isGoingLeft ? -50 : 50)
            const controlY1 = y1 + (isGoingUp ? -controlOffset : controlOffset)
            const controlY2 = y2 + (isGoingUp ? controlOffset : -controlOffset)
            const baseLabelX = (x1 + 3 * controlX1 + 3 * controlX2 + x2) / 8
            const baseLabelY = (y1 + 3 * controlY1 + 3 * controlY2 + y2) / 8 - 42
            const labelX = baseLabelX + (arrow.labelOffset?.x ?? 0)
            const labelY = baseLabelY + (arrow.labelOffset?.y ?? 0)

            return (
              <g key={`arrow-${idx}`} style={{ zIndex: arrow.zIndex ?? 0 }}>
                {/* 起点标记圆点 */}
                <circle
                  cx={x1}
                  cy={y1}
                  r={4}
                  fill={arrow.color || '#ffeb3b'}
                  className={styles.arrowStartDot}
                />
                
                {/* 曲线箭头主体 */}
                <path
                  d={`M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={arrow.color || '#ffeb3b'}
                  strokeWidth={3}
                  markerEnd={`url(#${markerId})`}
                  className={styles.arrow}
                />
                
                {/* 流动动画路径 - 使用虚线模拟数据流动 */}
                <path
                  d={`M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={arrow.color || '#ffeb3b'}
                  strokeWidth={1.5}
                  strokeDasharray="8 8"
                  className={styles.arrowFlow}
                  opacity={0.5}
                />
                
                {/* 箭头标签 */}
                {arrow.label && (
                  <g transform={`translate(${labelX}, ${labelY})`}>
                    {/* 标签背景 - 增加阴影和边框效果 */}
                    <rect
                      x={-8}
                      y={-16}
                      width={arrow.label.length * 8 + 20}
                      height={28}
                      rx={6}
                      fill="rgba(0,0,0,0.95)"
                      stroke={arrow.color || '#ffeb3b'}
                      strokeWidth={2}
                      className={styles.arrowLabelBg}
                    />
                    {/* 标签阴影效果 */}
                    <rect
                      x={-8}
                      y={-16}
                      width={arrow.label.length * 8 + 20}
                      height={28}
                      rx={6}
                      fill={arrow.color || '#ffeb3b'}
                      opacity={0.1}
                      transform="translate(0, 2)"
                    />
                    {/* 标签文本 */}
                    <text
                      x={arrow.label.length * 4 + 2}
                      y={4}
                      className={styles.arrowLabel}
                      style={{ fill: arrow.color || '#ffeb3b' }}
                    >
                      {arrow.label}
                    </text>
                    {/* 标签装饰 - 小三角形指示方向 */}
                    <path
                      d="M -12 0 L -18 -4 L -18 4 Z"
                      fill={arrow.color || '#ffeb3b'}
                      opacity={0.6}
                    />
                  </g>
                )}
              </g>
            )
          })}

          {/* HashMap 标题 */}
          <text x={0} y={HASHMAP_Y_OFFSET - 25} className={styles.sectionTitle}>
            🗂️ HashMap (值 → 索引) | 条目数: {step.hashMapState.length}
          </text>

          {/* HashMap 条目 - 增加状态标识 */}
          {step.hashMapState.length === 0 ? (
            <g transform={`translate(0, ${HASHMAP_Y_OFFSET + 25})`}>
              <rect
                x={-10}
                y={-18}
                width={100}
                height={30}
                rx={4}
                fill="rgba(102, 102, 102, 0.1)"
                stroke="#666"
                strokeWidth={1}
                strokeDasharray="4,2"
              />
              <text x={40} y={0} className={styles.emptyText}>
                (空)
              </text>
            </g>
          ) : (
            step.hashMapState.map((entry, index) => {
              const x = index * (CELL_WIDTH + CELL_GAP)

              return (
                <g key={index} transform={`translate(${x}, ${HASHMAP_Y_OFFSET})`}>
                  {/* HashMap 条目背景 */}
                  <rect
                    x={0}
                    y={0}
                    width={CELL_WIDTH}
                    height={CELL_HEIGHT}
                    rx={4}
                    className={`${styles.hashCell} ${entry.isNew ? styles.newEntry : ''}`}
                  />
                  {/* 键值标签 */}
                  <text x={5} y={-6} className={styles.hashFieldLabel}>
                    key
                  </text>
                  <text x={CELL_WIDTH / 2} y={20} className={styles.hashKey}>
                    {entry.key}
                  </text>
                  {/* 分隔线 */}
                  <line
                    x1={5}
                    y1={CELL_HEIGHT / 2}
                    x2={CELL_WIDTH - 5}
                    y2={CELL_HEIGHT / 2}
                    className={styles.hashDivider}
                  />
                  {/* 值标签 */}
                  <text x={5} y={32} className={styles.hashFieldLabel}>
                    value
                  </text>
                  <text x={CELL_WIDTH / 2} y={45} className={styles.hashValue}>
                    {entry.value}
                  </text>
                  {/* 新增标记 */}
                  {entry.isNew && (
                    <>
                      <rect
                        x={-2}
                        y={-2}
                        width={CELL_WIDTH + 4}
                        height={CELL_HEIGHT + 4}
                        rx={6}
                        fill="none"
                        stroke="#81c784"
                        strokeWidth={3}
                        className={styles.newEntryGlow}
                      />
                      <text x={CELL_WIDTH / 2} y={CELL_HEIGHT + 18} className={styles.newLabel}>
                        ✨ 新增
                      </text>
                    </>
                  )}
                  {/* 索引位置标识 */}
                  <text x={CELL_WIDTH / 2} y={CELL_HEIGHT + 32} className={styles.hashIndexLabel}>
                    #{index}
                  </text>
                </g>
              )
            })
          )}
        </g>
      </svg>
    </div>
  )
}
