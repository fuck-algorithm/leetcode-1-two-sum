# Requirements Document

## Introduction

本功能为 LeetCode 两数之和算法可视化工具添加一个"算法思路"按钮，位于现有"讲解视频"按钮的左侧。点击该按钮时，将弹出一个模态框，以清晰易懂的方式展示两数之和算法的核心思路，帮助用户理解算法的工作原理。模态框中包含一个交互式动画演示，通过丰富的文本标签和箭头示意，直观展示算法的执行过程。

## Glossary

- **Header**: 页面顶部导航栏组件，包含返回链接、标题、视频按钮和 GitHub 链接
- **Algorithm_Explanation_Modal**: 算法思路弹窗，用于展示算法的核心思路和步骤说明
- **Two_Sum_Algorithm**: 两数之和算法，使用哈希表在 O(n) 时间复杂度内找到数组中两个数之和等于目标值的索引
- **Animation_Demo**: 交互式动画演示区域，展示算法执行过程的可视化
- **Text_Label**: 文本标签，用于标注动画中各元素的含义和状态
- **Arrow_Indicator**: 箭头指示器，用于展示数据流向、指针移动和元素关系

## Requirements

### Requirement 1

**User Story:** As a user, I want to click an "算法思路" button to view the algorithm explanation, so that I can understand how the Two Sum algorithm works before or during the visualization.

#### Acceptance Criteria

1. WHEN the Header component renders THEN the system SHALL display an "算法思路" button positioned to the left of the existing "讲解视频" button
2. WHEN a user clicks the "算法思路" button THEN the system SHALL display the Algorithm_Explanation_Modal with algorithm explanation content
3. WHEN the Algorithm_Explanation_Modal is displayed THEN the system SHALL show a clear, step-by-step explanation of the Two_Sum_Algorithm including the hash map approach
4. WHEN a user clicks outside the Algorithm_Explanation_Modal or clicks the close button THEN the system SHALL close the modal and return to the normal view

### Requirement 2

**User Story:** As a user, I want the algorithm explanation to be easy to understand, so that I can learn the algorithm concept even without deep programming knowledge.

#### Acceptance Criteria

1. WHEN the Algorithm_Explanation_Modal displays content THEN the system SHALL present the explanation using simple language with visual aids such as icons or diagrams
2. WHEN the Algorithm_Explanation_Modal displays content THEN the system SHALL organize the explanation into logical sections: problem description, core idea, step-by-step process, and complexity analysis
3. WHEN the Algorithm_Explanation_Modal displays content THEN the system SHALL use consistent styling that matches the existing application theme

### Requirement 3

**User Story:** As a user, I want the algorithm explanation modal to be accessible and responsive, so that I can view it on different devices and use keyboard navigation.

#### Acceptance Criteria

1. WHEN the Algorithm_Explanation_Modal is open THEN the system SHALL allow closing via the Escape key
2. WHEN the Algorithm_Explanation_Modal is displayed THEN the system SHALL render properly on both desktop and mobile screen sizes
3. WHEN the "算法思路" button is rendered THEN the system SHALL include appropriate aria-label attributes for screen reader accessibility

### Requirement 4

**User Story:** As a user, I want to see an interactive animation demo with rich visual annotations, so that I can clearly understand each step of the algorithm execution.

#### Acceptance Criteria

1. WHEN the Animation_Demo displays the array THEN the system SHALL show Text_Label for each array element including its value and index position
2. WHEN the Animation_Demo shows the current iteration THEN the system SHALL display an Arrow_Indicator pointing to the current element with a label showing "当前元素" and its value
3. WHEN the Animation_Demo calculates the complement THEN the system SHALL display a Text_Label showing the calculation formula "补数 = target - 当前值 = [result]"
4. WHEN the Animation_Demo searches the hash map THEN the system SHALL display an Arrow_Indicator from the current element to the hash map with a label showing "查找补数"
5. WHEN the Animation_Demo finds a match THEN the system SHALL display Arrow_Indicator connecting the matched elements with a success label showing "找到配对！"
6. WHEN the Animation_Demo adds to hash map THEN the system SHALL display an Arrow_Indicator from the current element to the hash map entry with a label showing "存入哈希表"
7. WHEN the Animation_Demo displays the hash map THEN the system SHALL show Text_Label for each entry displaying "值: [value] → 索引: [index]" format

### Requirement 5

**User Story:** As a user, I want the animation to have clear state indicators, so that I can understand what is happening at each moment.

#### Acceptance Criteria

1. WHEN the Animation_Demo is in any state THEN the system SHALL display a status Text_Label at the top showing the current step description
2. WHEN the Animation_Demo highlights an element THEN the system SHALL display a Text_Label below the element indicating its role such as "正在检查" or "已存入哈希表"
3. WHEN the Animation_Demo completes successfully THEN the system SHALL display Arrow_Indicator connecting the two result elements with a Text_Label showing the sum equation "[num1] + [num2] = target"
4. WHEN the Animation_Demo transitions between steps THEN the system SHALL animate the Arrow_Indicator and Text_Label with smooth transitions for visual continuity
