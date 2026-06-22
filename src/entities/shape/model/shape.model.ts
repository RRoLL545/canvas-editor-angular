export type ShapeType = 'rectangle' | 'arrow';

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;      // Левый верхний угол (для rect) или старт (для arrow)
  y: number;
  width: number;
  height: number;
  color: string;
  // Для стрелки (опционально)
  endX?: number;
  endY?: number;
}

export interface Transform {
  zoom: number;
  panX: number;
  panY: number;
}

export const DEFAULT_TRANSFORM: Transform = {
  zoom: 1,
  panX: 0,
  panY: 0,
};
