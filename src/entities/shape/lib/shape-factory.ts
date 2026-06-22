import { v4 as uuidv4 } from 'uuid';
import { Shape, ShapeType } from '../model/shape.model';

export class ShapeFactory {
  static create(type: ShapeType, x: number, y: number, color: string = '#4A90D9'): Shape {
    const base = {
      id: uuidv4(),
      type,
      x,
      y,
      color,
      width: 0,
      height: 0,
    };

    if (type === 'rectangle') {
      return { ...base, width: 1, height: 1 };
    } else { // arrow
      return { ...base, width: 1, height: 1, endX: x, endY: y };
    }
  }

  static createRectangle(x: number, y: number, color: string = '#4A90D9'): Shape {
    return this.create('rectangle', x, y, color);
  }

  static createArrow(x: number, y: number, color: string = '#4A90D9'): Shape {
    return this.create('arrow', x, y, color);
  }

  static updateSize(shape: Shape, x: number, y: number, endX?: number, endY?: number): Shape {
    const updated = {
      ...shape,
      width: Math.abs(x - shape.x),
      height: Math.abs(y - shape.y),
      x: Math.min(shape.x, x),
      y: Math.min(shape.y, y),
    };

    if (shape.type === 'arrow' && endX !== undefined && endY !== undefined) {
      return { ...updated, endX, endY };
    }

    return updated;
  }
}
