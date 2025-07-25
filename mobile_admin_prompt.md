# Mobile-Responsive Admin Dashboard Requirements

## Problem Statement
The current admin dashboard is not mobile-compatible. While the background adapts to mobile screens, core components (charts, tables, graphs, and bottom navigation) are overflowing and becoming unusable on phone devices.

## Required Solution
Create a dedicated mobile UI layout for the admin dashboard with the following specifications:

### Mobile Layout Requirements
1. **Responsive Design**: Implement a completely separate UI layout optimized specifically for phone devices (screens ≤ 768px width)
2. **Component Adaptation**: Ensure all dashboard components are mobile-friendly:
   - Charts: Make them scrollable horizontally or stack vertically
   - Tables: Implement responsive tables with horizontal scroll or card-based layout
   - Graphs: Optimize for touch interaction and smaller screens
   - All UI elements should fit within viewport without horizontal overflow

### Bottom Navigation Redesign
1. **Icon Limitation**: Reduce bottom tab icons to exactly 5 items
2. **Layout Structure**: 
   - Position "Overview" as the center/middle icon
   - Distribute 4 other primary functions around it
3. **Sub-categorization**: Group remaining dashboard functions into logical sub-categories accessible through the main 5 icons
4. **Navigation Hierarchy**: Implement a drill-down navigation system where tapping main icons reveals sub-category options

### Technical Specifications
- Use responsive breakpoints to detect mobile devices
- Implement touch-friendly interactions (minimum 44px touch targets)
- Ensure smooth transitions between desktop and mobile layouts
- Maintain all dashboard functionality while optimizing for mobile UX
- Consider implementing swipe gestures for navigation where appropriate

### Expected Deliverables
1. Mobile-responsive admin dashboard layout
2. Redesigned 5-icon bottom navigation with Overview in center
3. Sub-category organization system for additional functions
4. Cross-device compatibility testing
5. Smooth responsive transitions between screen sizes