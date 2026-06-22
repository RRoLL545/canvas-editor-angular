import { Component, inject, signal } from '@angular/core';
import { CanvasStore } from '@store/canvas-store.service';
import { CanvasRenderComponent } from '@features/canvas-render/ui/canvas-render/canvas-render.component';
import { ShapeFactory } from '@entities/shape/lib/shape-factory';

@Component({
  selector: 'app-main-page',
  imports: [CanvasRenderComponent],
  templateUrl: 'main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
  store = inject(CanvasStore);
  debugMode = signal(true);

  addRectangle(): void {
    const color = this.store.selectedColor();
    const shape = ShapeFactory.createRectangle(
      100 + Math.random() * 200,
      100 + Math.random() * 200,
      color
    );
    this.store.addShape(shape);
  }

  addArrow(): void {
    const color = this.store.selectedColor();
    const shape = ShapeFactory.createArrow(
      100 + Math.random() * 200,
      100 + Math.random() * 200,
      color
    );
    this.store.addShape(shape);
  }

  addTestShapes(): void {
    // Добавляем несколько тестовых фигур
    const shapes = [
      ShapeFactory.createRectangle(150, 150, '#4A90D9'),
      ShapeFactory.createRectangle(300, 200, '#E53E3E'),
      ShapeFactory.createRectangle(200, 300, '#38A169'),
      ShapeFactory.createArrow(100, 100, '#D69E2E'),
      ShapeFactory.createArrow(400, 300, '#805AD5'),
    ];

    // Обновляем размеры для тестовых фигур
    const updatedShapes = shapes.map((shape, index) => {
      const baseSize = 80 + index * 20;
      return {
        ...shape,
        width: baseSize,
        height: baseSize * 0.7,
        endX: shape.x + baseSize * 1.5,
        endY: shape.y + baseSize * 0.3,
      };
    });

    updatedShapes.forEach(shape => this.store.addShape(shape));
  }

  clearShapes(): void {
    this.store.deleteAllShapes();
  }onCanvasWheel(event: WheelEvent): void {
    // Определяем направление прокрутки
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    // Вычисляем новый зум
    const newZoom = this.store.zoom() + delta;
    // Сохраняем в сторе (метод setZoom уже ограничивает от 0.1 до 3)
    this.store.setZoom(newZoom);
  }

  onCanvasClick(event: { x: number; y: number }): void {
    console.log('Canvas clicked at:', event.x, event.y);
  }
}
