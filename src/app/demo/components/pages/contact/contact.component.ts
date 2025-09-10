import { Component } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    templateUrl: './contact.component.html',
})
export class ContactComponent {
    options: any;

    overlays: any[] = [];

    dialogVisible: boolean = false;

    markerTitle: string = '';

    selectedPosition: any;

    infoWindow: any;

    draggable: boolean = false;

    name: string = '';

    email: string = '';

    message: string = '';

    content: any[] = [
        { icon: 'pi pi-fw pi-phone', title: 'Phone', info: '+33 7 58 85 50 39 / +224 666 17 70 06' },
        {
            icon: 'pi pi-fw pi-map-marker',
            title: 'Siege',
            info: '5 Rue Ostwalde, Strasbourg 64000, France',
        },
        { icon: 'pi pi-fw pi-print', title: 'Fixe', info: '+33 01 29 71 54 35' },
    ];

    constructor(private layoutService: LayoutService) {}

    get mapStyle() {
        return {
            'background-image':
                this.layoutService.config().colorScheme === 'light'
                    ? "url('assets/demo/images/contact/map-light.svg')"
                    : "url('assets/demo/images/contact/map-dark.svg')",
        };
    }
}
