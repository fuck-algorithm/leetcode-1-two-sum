import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import type { CanvasProps, CanvasTransform } from '../types'
import styles from './Canvas.module.css'

const CELL_WIDTH = 60
const CELL_HEIGHT = 50
const CELL_GAP = 8
const HASHMAP_Y_OFFSET = 120

export function Canvas({ step, inputData }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 })

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    const container = containerRef.current

    // 设置缩放和平移
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

    // 自适应视图
    const contentWidth = inputData.nums.length * (CELL_WIDTH + CELL_GAP)
    const contentHeight = HASHMAP_Y_OFFSET + 100
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const scale = Math.min(
      containerWidth / (contentWidth + 100),
      containerHeight / (contentHeight + 50),
      1
    )

    const initialX = (containerWidth - contentWidth * scale) / 2
    const initialY = 30

    svg.call(zoom.transform, d3.zoomIdentity.translate(initialX, initialY).scale(scale))

    return () => {
      svg.on('.zoom', null)
    }
  }, [inputData.nums.length])

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.header}>可视化画布</div>
      <svg ref={svgRef} className={styles.svg}>
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* 数组标题 */}
          <text x={0} y={-10} className={styles.sectionTitle}>
            数组 nums
          </text>

          {/* 数组元素 */}
          {step.arrayState.map((element, index) => {
            const x = index * (CELL_WIDTH + CELL_GAP)
            const annotation = step.annotations.find((a) => a.targetIndex === index)

            return (
              <g key={index} transform={`translate(${x}, 0)`}>
                {/* 元素方块 */}
                <rect
                  x={0}
                  y={0}
                  width={CELL_WIDTH}
                  height={CELL_HEIGHT}
                  rx={4}
                  className={`${styles.cell} ${element.isHighlighted ? styles.highlighted : ''}`}
                  style={element.highlightColor ? { fill: element.highlightColor } : undefined}
                />
                {/* 元素值 */}
                <text x={CELL_WIDTH / 2} y={CELL_HEIGHT / 2 + 5} className={styles.cellValue}>
                  {element.value}
                </text>
                {/* 下标 */}
                <text x={CELL_WIDTH / 2} y={CELL_HEIGHT + 18} className={styles.cellIndex}>
                  [{index}]
                </text>
                {/* 注解 */}
                {annotation && (
                  <text
                    x={CELL_WIDTH / 2}
                    y={annotation.position === 'top' ? -15 : CELL_HEIGHT + 35}
                    className={styles.annotation}
                  >
                    {annotation.text}
                  </text>
                )}
              </g>
            )
          })}

          {/* HashMap 标题 */}
          <text x={0} y={HASHMAP_Y_OFFSET - 10} className={styles.sectionTitle}>
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
                </g>
              )
            })
          )}
        </g>
      </svg>

      {/* 步骤描述 */}
      <div className={styles.description}>{step.description}</div>
    </div>
  )
}
