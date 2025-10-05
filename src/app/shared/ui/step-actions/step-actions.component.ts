import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-step-actions',
  templateUrl: './step-actions.component.html',
  styleUrls: ['./step-actions.component.scss']   // <-- PAS de standalone ici
})
export class StepActionsComponent {
 @Input() showPrev = true;
  @Input() showNext = true;

  @Input() prevLabel = 'Precedent';
  @Input() nextLabel = 'Suivant';

  @Input() prevIcon = 'pi pi-arrow-left';
  @Input() nextIcon = 'pi pi-chevron-right';
  @Input() prevIconPos: 'left'|'right' = 'left';
  @Input() nextIconPos: 'left'|'right' = 'right';

  @Input() prevDisabled = false;
  @Input() nextDisabled = false;
  @Input() nextLoading = false;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}
