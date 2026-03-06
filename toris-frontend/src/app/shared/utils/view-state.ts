import { ChangeDetectorRef, ViewRef } from '@angular/core';

export const applyDeferredViewUpdate = (cdr: ChangeDetectorRef, update: () => void): void => {
    setTimeout(() => {
        update();

        const viewRef = cdr as ViewRef;
        if (!viewRef.destroyed) {
            cdr.markForCheck();
        }
    }, 0);
};
