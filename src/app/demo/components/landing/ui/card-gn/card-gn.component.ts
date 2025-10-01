import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-card-gn',
  imports: [],
  templateUrl: './card-gn.component.html',
  styleUrl: './card-gn.component.scss'
})
export class CardGnComponent {
  @Input() title = 'Carte de la Guinée';
  @Input() subtitle = 'Clique & déplace pour explorer';
  @Input() showToolbar = true;

  @Output() mapClicked = new EventEmitter<{ x: number; y: number }>();

  // --- Zoom/Pan state
  scale = 1;
  tx = 0;
  ty = 0;

  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  // --- Zoom controls
  zoomIn(step = 0.15) {
    this.scale = Math.min(6, +(this.scale + step).toFixed(2));
  }
  zoomOut(step = 0.15) {
    this.scale = Math.max(0.5, +(this.scale - step).toFixed(2));
  }
  resetView() {
    this.scale = 1;
    this.tx = 0;
    this.ty = 0;
  }

  // --- Drag to pan
  onMouseDown(evt: MouseEvent) {
    this.dragging = true;
    this.lastX = evt.clientX;
    this.lastY = evt.clientY;
  }
  onMouseMove(evt: MouseEvent) {
    if (!this.dragging) return;
    const dx = evt.clientX - this.lastX;
    const dy = evt.clientY - this.lastY;
    this.tx += dx;
    this.ty += dy;
    this.lastX = evt.clientX;
    this.lastY = evt.clientY;
  }
  @HostListener('window:mouseup')
  onMouseUp() {
    this.dragging = false;
  }

  // --- Click callback
  onSvgClick(evt: MouseEvent) {
    // Renvoie des coords SVG approx (écran), tu peux adapter si tu veux du geo-prop.
    this.mapClicked.emit({ x: evt.offsetX, y: evt.offsetY });
  }
}
