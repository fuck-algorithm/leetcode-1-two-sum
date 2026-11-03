import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import type { CanvasProps, CanvasTransform } from '../types'
import styles from './Canvas.module.css'
import { getCanvasViewport } from '../utils/canvasViewport'
import { getArrowGeometry } from '../utils/canvasGeometry'
import {
  getArrayCellPosition,
  getHashMapEntryPosition,
  getCalculationX,
  CELL_WIDTH,
  CELL_HEIGHT,
  CELL_GAP,
  POINTER_AREA_HEIGHT,
  ARRAY_Y,
  HASHMAP_Y,
} from '../utils/canvasLayout'

const STATUS_AREA_Y = 90
const LABEL_GAP = 12

export function Canvas({ step, inputData }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 })

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    const container = containerRef.current

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 2.5])
      .on('zoom', (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          scale: event.transform.k,
        })
      })

    svg.call(zoom).on('dblclick.zoom', null)

    const fitContent = () => {
      const width = svgRef.current?.clientWidth ?? container.clientWidth
      const height = svgRef.current?.clientHeight ?? container.clientHeight
      svg.attr('viewBox', `0 0 ${width} ${height}`)
      const viewport = getCanvasViewport({
        width,
        height,
        arrayLength: inputData.nums.length,
      })
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(viewport.x, viewport.y).scale(viewport.scale),
      )
    }

    fitContent()
    const observer = new ResizeObserver(fitContent)
    observer.observe(container)

    return () => {
      observer.disconnect()
      svg.on('.zoom', null)
    }
  }, [inputData.nums.length])

  const getCellX = (index: number) => getArrayCellPosition(index).x + CELL_WIDTH / 2
  const getLabelCenterX = (index: number, label: string) => {
    const target = getCellX(index)
    const halfWidth = label.length * 4 + 8
    const left = -65 + halfWidth + LABEL_GAP
    const right = inputData.nums.length * (CELL_WIDTH + CELL_GAP) - halfWidth - LABEL_GAP
    return Math.max(left, Math.min(right, target))
  }

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
          <g className={styles.lessonLayer}>
          {/* 操作名用一个短词，解释留给代码与解说；不要把整段文案塞进画布。 */}
          {step.actionLabel && (
            <g
              transform={`translate(${getLabelCenterX(step.highlightedIndices[0] ?? 0, step.actionLabel)}, ${STATUS_AREA_Y})`}
              style={{ zIndex: 100 }}
            >
              <rect
                x={-15}
                y={-25}
                width={Math.max(110, step.actionLabel.length * 12 + 32)}
                height={34}
                rx={17}
                className={styles.operationPill}
              />
              <circle cx={2} cy={-8} r={3} className={styles.operationDot} />
              <text x={12} y={4} className={styles.actionLabel}>
                {step.actionLabel}
              </text>
            </g>
          )}

          {/* 数组标题 */}
          <text x={0} y={ARRAY_Y - 30} className={styles.sectionTitle}>
            nums
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
            const pointerCenterX = getLabelCenterX(
              pointer.targetIndex,
              pointer.label,
            ) + autoXOffset + extraXOffset

            const pointerX = pointerCenterX

            return (
              <g
                key={`pointer-${idx}`}
                transform={`translate(${pointerCenterX}, ${ARRAY_Y - POINTER_AREA_HEIGHT / 2 + extraYOffset})`}
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
                  y2={POINTER_AREA_HEIGHT / 2 + CELL_HEIGHT / 2 + 4 - extraYOffset}
                  stroke={pointer.color}
                  strokeWidth={2.5}
                  strokeDasharray="6,3"
                  opacity={0.7}
                  className={styles.pointerLine}
                />
                {/* 目标位置标记圆点 */}
                <circle
                  cx={targetX - pointerX}
                  cy={POINTER_AREA_HEIGHT / 2 + CELL_HEIGHT / 2 - extraYOffset}
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
            const x = getArrayCellPosition(index).x
            const isHighlighted = element.isHighlighted

            return (
              <g key={index} transform={`translate(${x}, ${getArrayCellPosition(index).y})`}>
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

          {step.calculation && step.scene !== 'write' && (
            <g
              className={styles.calculationLayer}
              transform={`translate(${getCalculationX(inputData.nums.length)}, ${ARRAY_Y - 10})`}
              style={{ zIndex: 5 }}
            >
              <rect
                x={-15}
                y={-25}
                width={260}
                height={90}
                rx={10}
                className={styles.calculationBg}
              />
              <text x={5} y={20} className={styles.calculationExpr}>
                {step.calculation.expression}
              </text>
              <text x={5} y={52} className={styles.calculationResult}>
                {step.calculation.result}
              </text>
            </g>
          )}

          </g>

          {/* 箭头连接 */}
          {step.arrows
            ?.slice()
            .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
            .map((arrow, idx) => {
            const calculationX = getCalculationX(inputData.nums.length)
            const geometry = getArrowGeometry(arrow, calculationX)
            const { start, control1, control2, end } = geometry
            const x1 = start.x
            const y1 = start.y
            const x2 = end.x
            const y2 = end.y

            const markerId =
              arrow.color === '#4caf50'
                ? 'arrowhead-green'
                : arrow.color === '#2196f3'
                  ? 'arrowhead-blue'
                  : 'arrowhead'

            const controlX1 = control1.x
            const controlY1 = control1.y
            const controlX2 = control2.x
            const controlY2 = control2.y
            const baseLabelX = (x1 + 3 * controlX1 + 3 * controlX2 + x2) / 8
            const baseLabelY = (y1 + 3 * controlY1 + 3 * controlY2 + y2) / 8 - 30
            const labelX = baseLabelX + (arrow.labelOffset?.x ?? 0)
            const labelY = baseLabelY + (arrow.labelOffset?.y ?? 0)

            return (
              <g
                key={`arrow-${idx}`}
                style={{ zIndex: arrow.zIndex ?? 0 }}
                data-arrow-kind={`${arrow.fromType}-${arrow.toType}`}
              >
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

          {/* 已看过的数字是后续配对的查找表。 */}
          {step.hashMapState.length > 0 && (
            <text x={0} y={HASHMAP_Y - 25} className={styles.sectionTitle}>
              已记住
            </text>
          )}

          {/* HashMap 条目 - 增加状态标识 */}
          {step.hashMapState.length === 0 ? (
            <g transform={`translate(0, ${HASHMAP_Y + 25})`}>
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
                等第一个
              </text>
            </g>
          ) : (
            step.hashMapState.map((entry, index) => {
              const position = getHashMapEntryPosition(index)

              return (
                <g key={index} transform={`translate(${position.x}, ${position.y})`} className={entry.isNew ? styles.hashEntryNew : styles.hashEntry}>
                  {entry.isNew && (
                    <path
                      d={`M ${CELL_WIDTH / 2} -58 C ${CELL_WIDTH / 2} -42, ${CELL_WIDTH / 2} -24, ${CELL_WIDTH / 2} -4`}
                      fill="none"
                      stroke="#8fd5b5"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      markerEnd="url(#arrowhead-green)"
                      className={styles.insertTrail}
                      aria-label={`保存 ${entry.key}`}
                    />
                  )}
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
