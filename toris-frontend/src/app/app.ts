import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertsComponent } from './layouts/alerts/alerts';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, AlertsComponent],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {
    protected readonly title = signal('toris-frontend');
}
