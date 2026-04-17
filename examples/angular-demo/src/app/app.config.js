import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideLumina } from '@continuouslabs/lumina-angular';
export const appConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter([]),
        provideLumina({
            defaultLocale: 'en',
            locales: ['en', 'es'],
            autoDetect: true
        })
    ]
};
//# sourceMappingURL=app.config.js.map