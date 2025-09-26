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
        { icon: 'pi pi-fw pi-phone', title: 'France', info: '+33 7 58 85 50 39' },
        { icon: 'pi pi-fw pi-phone', title: 'Guinée', info: '+224 666 17 70 54' },
        {
            icon: 'pi pi-fw pi-map-marker',
            title: 'Siege',
            info: '5 Rue Ostwalde, Strasbourg 64000, France',
        },
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
