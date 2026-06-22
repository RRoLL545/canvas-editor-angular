import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  input,
  output,
  effect,
  viewChild,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Shape, ShapeType } from '@entities/shape/model/shape.model';

@Component({
  selector: 'app-canvas-render',
  templateUrl: './canvas-render.component.html',
  styleUrl: './canvas-render.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasRenderComponent implements AfterViewInit {
  // ---- Входные параметры (сигналы) ----
  width = input<number>(800);
  height = input<number>(600);
  shapes = input<Shape[]>([]);
  zoom = input<number>(1);
  panX = input<number>(0);
  panY = input<number>(0);
  backgroundColor = input<string>('#ffffff');
  backgroundImage = input<string | null>(null);
  showGrid = input<boolean>(true);
  gridSize = input<number>(20);
  debugMode = input<boolean>(false);

  // ---- Выходные события ----
  canvasClick = output<{ x: number; y: number }>();
  canvasMouseDown = output<{ x: number; y: number; event: MouseEvent }>();
  canvasMouseMove = output<{ x: number; y: number; event: MouseEvent }>();
  canvasMouseUp = output<{ x: number; y: number; event: MouseEvent }>();
  canvasWheel = output<WheelEvent>();

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  constructor() {
    // ✅ effect() в конструкторе — правильное место!
    effect(() => {
      const shapes = this.shapes();
      const zoom = this.zoom();
      const panX = this.panX();
      const panY = this.panY();
      const bgColor = this.backgroundColor();
      const bgImage = this.backgroundImage();
      const showGrid = this.showGrid();
      const gridSize = this.gridSize();

      // Но! ctx ещё не инициализирован, поэтому проверяем
      if (this.ctx) {
        this.render(shapes, { zoom, panX, panY }, bgColor, bgImage, showGrid, gridSize);
      }
    });
  }

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;

    // Первый рендеринг
    this.forceRender();
  }

  private forceRender() {
    const shapes = this.shapes();
    const zoom = this.zoom();
    const panX = this.panX();
    const panY = this.panY();
    const bgColor = this.backgroundColor();
    const bgImage = this.backgroundImage();
    const showGrid = this.showGrid();
    const gridSize = this.gridSize();

    if (this.ctx) {
      this.render(shapes, { zoom, panX, panY }, bgColor, bgImage, showGrid, gridSize);
    }
  }

  private render(
    shapes: Shape[],
    transform: { zoom: number; panX: number; panY: number },
    bgColor: string,
    bgImage: string | null,
    showGrid: boolean,
    gridSize: number
  ): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    const { zoom, panX, panY } = transform;

    // 1. Очистка
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Заливка фона
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Рисуем сетку (в мировых координатах)
    if (showGrid) {
      this.renderGrid(ctx, zoom, panX, panY, gridSize);
    }

    // 4. Применяем трансформацию (Zoom + Pan)
    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, panX, panY);

    // 5. Рисуем фоновое изображение
    if (bgImage) {
      this.renderBackgroundImage(ctx, bgImage);
    }

    // 6. Рисуем фигуры
    shapes.forEach(shape => {
      if (shape.type === 'rectangle') {
        this.renderRectangle(ctx, shape);
      } else if (shape.type === 'arrow') {
        this.renderArrow(ctx, shape);
      }
    });

    ctx.restore();
  }

  private renderGrid(
    ctx: CanvasRenderingContext2D,
    zoom: number,
    panX: number,
    panY: number,
    gridSize: number
  ): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    // Вычисляем видимую область в мировых координатах
    const minX = -panX / zoom;
    const maxX = (width - panX) / zoom;
    const minY = -panY / zoom;
    const maxY = (height - panY) / zoom;

    const step = gridSize;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;

    // Вертикальные линии
    const startX = Math.floor(minX / step) * step;
    for (let x = startX; x <= maxX; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
      ctx.stroke();
    }

    // Горизонтальные линии
    const startY = Math.floor(minY / step) * step;
    for (let y = startY; y <= maxY; y += step) {
      ctx.beginPath();
      ctx.moveTo(minX, y);
      ctx.lineTo(maxX, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderBackgroundImage(ctx: CanvasRenderingContext2D, imageUrl: string): void {
    // Для простоты используем Image, но в реальном проекте лучше кешировать
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  }

  private renderRectangle(ctx: CanvasRenderingContext2D, shape: Shape): void {
    const { x, y, width, height, color } = shape;

    // Заливка
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);

    // Обводка
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, width, height);
  }

  private renderArrow(ctx: CanvasRenderingContext2D, shape: Shape): void {
    const startX = shape.x;
    const startY = shape.y;
    const endX = shape.endX ?? shape.x + shape.width;
    const endY = shape.endY ?? shape.y + shape.height;

    // Линия
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Наконечник (треугольник)
    const angle = Math.atan2(endY - startY, endX - startX);
    const headLen = 12;
    const headAngle = Math.PI / 6;

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLen * Math.cos(angle - headAngle),
      endY - headLen * Math.sin(angle - headAngle)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLen * Math.cos(angle + headAngle),
      endY - headLen * Math.sin(angle + headAngle)
    );
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Заливка наконечника
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLen * Math.cos(angle - headAngle),
      endY - headLen * Math.sin(angle - headAngle)
    );
    ctx.lineTo(
      endX - headLen * Math.cos(angle + headAngle),
      endY - headLen * Math.sin(angle + headAngle)
    );
    ctx.closePath();
    ctx.fillStyle = shape.color;
    ctx.fill();
  }

  // ---- Обработчики событий мыши ----

  onCanvasClick(event: MouseEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const worldX = (x - this.panX()) / this.zoom();
    const worldY = (y - this.panY()) / this.zoom();

    this.canvasClick.emit({ x: worldX, y: worldY });
  }

  onMouseDown(event: MouseEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const worldX = (x - this.panX()) / this.zoom();
    const worldY = (y - this.panY()) / this.zoom();

    this.canvasMouseDown.emit({ x: worldX, y: worldY, event });
  }

  onMouseMove(event: MouseEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const worldX = (x - this.panX()) / this.zoom();
    const worldY = (y - this.panY()) / this.zoom();

    this.canvasMouseMove.emit({ x: worldX, y: worldY, event });
  }

  onMouseUp(event: MouseEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const worldX = (x - this.panX()) / this.zoom();
    const worldY = (y - this.panY()) / this.zoom();

    this.canvasMouseUp.emit({ x: worldX, y: worldY, event });
  }

  onMouseLeave(event: MouseEvent): void {
    // Можно добавить логику, если нужно
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.canvasWheel.emit(event);
  }
}
