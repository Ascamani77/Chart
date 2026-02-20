
import { ToolType } from "../icons/toolTypes";
import { activateDrawingTool, activateBrushTool, activatePatternTool, activateTextTool, activatePositionTool, activateAnchoredVwapTool, DrawingInstance } from "./trendline";

let currentActiveHandler: { cleanup: () => void } | null = null;

export function activateTool(
  tool: ToolType,
  chart: any,
  mainSeries: any,
  container: HTMLElement,
  onComplete: (drawing: Omit<DrawingInstance, 'series' | 'selected'>) => void,
  onUpdate: (points: any[]) => void,
  deactivate: () => void
) {
  deactivateTool();

  if (!tool || tool === 'cursor') return;

  if (tool === 'brush') {
      currentActiveHandler = activateBrushTool(chart, mainSeries, container, onComplete, onUpdate, deactivate);
  } else if (tool === ('icons' as ToolType)) {
      // Mapping 'icons' to XABCD Pattern (5 points)
      currentActiveHandler = activatePatternTool('icons', 5, chart, mainSeries, container, onComplete, deactivate);
  } else if (tool === ('text' as ToolType)) {
      currentActiveHandler = activateTextTool(chart, mainSeries, container, onComplete, deactivate);
  } else if (tool === 'long_position' || tool === 'short_position') {
      currentActiveHandler = activatePositionTool(tool, chart, mainSeries, container, onComplete, deactivate);
  } else if (tool === 'fib') {
      currentActiveHandler = activateDrawingTool('fib', chart, mainSeries, container, onComplete, deactivate);
  } else if (tool === 'measure') {
      currentActiveHandler = activateDrawingTool('measure', chart, mainSeries, container, onComplete, deactivate);
  } else if (tool === 'rectangle') {
      currentActiveHandler = activateDrawingTool('rectangle', chart, mainSeries, container, onComplete, deactivate);
  } else if (tool === 'fib_fan') {
      currentActiveHandler = activateDrawingTool('fib_fan', chart, mainSeries, container, onComplete, deactivate);
  } else if (tool === 'projection') {
      // Projection updated to 3 points: apex, top boundary, bottom boundary
      currentActiveHandler = activatePatternTool('projection', 3, chart, mainSeries, container, onComplete, deactivate);
  } else if (tool === 'anchored_vwap') {
      currentActiveHandler = activateAnchoredVwapTool(chart, mainSeries, container, onComplete, deactivate);
  } else {
      currentActiveHandler = activateDrawingTool(tool, chart, mainSeries, container, onComplete, deactivate);
  }
}

export function deactivateTool() {
  if (currentActiveHandler) {
    currentActiveHandler.cleanup();
    currentActiveHandler = null;
  }
}
