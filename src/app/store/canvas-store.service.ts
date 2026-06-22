import { Injectable, signal, computed } from '@angular/core';
import { Shape, Transform, DEFAULT_TRANSFORM } from '../../entities/shape/model/shape.model';

export interface CanvasState {
  shapes: Shape[];
  selectedIds: string[];
  currentTool: 'rectangle' | 'arrow';
  selectedColor: string;
  zoom: number;
  panX: number;
  panY: number;
  backgroundColor: string;
  backgroundImage: string | null;
  showGrid: boolean;
  gridSize: number;
}

const initialState: CanvasState = {
  shapes: [],
  selectedIds: [],
  currentTool: 'rectangle',
  selectedColor: '#4A90D9',
  zoom: 1,
  panX: 0,
  panY: 0,
  backgroundColor: '#f8f9fa',
  backgroundImage: null,
  showGrid: true,
  gridSize: 20,
};

@Injectable({ providedIn: 'root' })
export class CanvasStore {
  // ---- Приватное состояние ----
  private state = signal<CanvasState>(initialState);

  // ---- Публичные сигналы (readonly) ----
  readonly shapes = computed(() => this.state().shapes);
  readonly selectedIds = computed(() => this.state().selectedIds);
  readonly selectedShape = computed(() => {
    const ids = this.state().selectedIds;
    if (ids.length !== 1) return null;
    return this.state().shapes.find(s => s.id === ids[0]) || null;
  });
  readonly currentTool = computed(() => this.state().currentTool);
  readonly selectedColor = computed(() => this.state().selectedColor);
  readonly zoom = computed(() => this.state().zoom);
  readonly panX = computed(() => this.state().panX);
  readonly panY = computed(() => this.state().panY);
  readonly backgroundColor = computed(() => this.state().backgroundColor);
  readonly backgroundImage = computed(() => this.state().backgroundImage);
  readonly showGrid = computed(() => this.state().showGrid);
  readonly gridSize = computed(() => this.state().gridSize);

  // ---- Трансформация (для удобства) ----
  readonly transform = computed<Transform>(() => ({
    zoom: this.zoom(),
    panX: this.panX(),
    panY: this.panY(),
  }));

  // ---- Методы изменения (mutators) ----

  // Фигуры
  addShape(shape: Shape): void {
    this.state.update(s => ({
      ...s,
      shapes: [...s.shapes, shape],
    }));
  }

  updateShape(id: string, updates: Partial<Shape>): void {
    this.state.update(s => ({
      ...s,
      shapes: s.shapes.map(shape =>
        shape.id === id ? { ...shape, ...updates } : shape
      ),
    }));
  }

  deleteShapes(ids: string[]): void {
    this.state.update(s => ({
      ...s,
      shapes: s.shapes.filter(shape => !ids.includes(shape.id)),
      selectedIds: s.selectedIds.filter(id => !ids.includes(id)),
    }));
  }

  deleteAllShapes(): void {
    this.state.update(s => ({
      ...s,
      shapes: [],
      selectedIds: [],
    }));
  }

  // Выделение
  selectShapes(ids: string[]): void {
    this.state.update(s => ({ ...s, selectedIds: ids }));
  }

  clearSelection(): void {
    this.state.update(s => ({ ...s, selectedIds: [] }));
  }

  toggleSelection(id: string): void {
    this.state.update(s => {
      const index = s.selectedIds.indexOf(id);
      if (index === -1) {
        return { ...s, selectedIds: [...s.selectedIds, id] };
      } else {
        return { ...s, selectedIds: s.selectedIds.filter(i => i !== id) };
      }
    });
  }

  // Инструменты
  setCurrentTool(tool: 'rectangle' | 'arrow'): void {
    this.state.update(s => ({ ...s, currentTool: tool }));
  }

  setSelectedColor(color: string): void {
    this.state.update(s => ({ ...s, selectedColor: color }));
  }

  // Трансформации
  setZoom(zoom: number): void {
    this.state.update(s => ({
      ...s,
      zoom: Math.max(0.1, Math.min(3, zoom)),
    }));
  }

  setPan(x: number, y: number): void {
    this.state.update(s => ({ ...s, panX: x, panY: y }));
  }

  resetTransform(): void {
    this.state.update(s => ({
      ...s,
      zoom: DEFAULT_TRANSFORM.zoom,
      panX: DEFAULT_TRANSFORM.panX,
      panY: DEFAULT_TRANSFORM.panY,
    }));
  }

  // Фон
  setBackgroundColor(color: string): void {
    this.state.update(s => ({ ...s, backgroundColor: color }));
  }

  setBackgroundImage(image: string | null): void {
    this.state.update(s => ({ ...s, backgroundImage: image }));
  }

  // Сетка
  toggleGrid(): void {
    this.state.update(s => ({ ...s, showGrid: !s.showGrid }));
  }

  setGridSize(size: number): void {
    this.state.update(s => ({ ...s, gridSize: size }));
  }

  // ---- Снапшот для истории ----
  snapshot(): CanvasState {
    return structuredClone(this.state());
  }

  restore(snapshot: CanvasState): void {
    this.state.set(snapshot);
  }
}
