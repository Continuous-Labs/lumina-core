import 'zone.js/node';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
export default function render(url, document) {
    return renderApplication(() => bootstrapApplication(AppComponent, appConfig), {
        url,
        document,
    });
}
//# sourceMappingURL=main.server.js.map