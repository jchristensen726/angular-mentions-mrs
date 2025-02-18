import { ElementRef, EventEmitter, TemplateRef, AfterContentChecked } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
export declare class MentionListComponent implements AfterContentChecked {
    private element;
    labelKey: string;
    itemTemplate: TemplateRef<any>;
    itemClick: EventEmitter<any>;
    list: ElementRef;
    defaultItemTemplate: TemplateRef<any>;
    items: any[];
    activeIndex: number;
    hidden: boolean;
    dropUp: boolean;
    styleOff: boolean;
    private coords;
    private offset;
    constructor(element: ElementRef);
    ngAfterContentChecked(): void;
    position(nativeParentElement: HTMLInputElement, iframe?: HTMLIFrameElement): any;
    get activeItem(): any;
    activateNextItem(): void;
    activatePreviousItem(): void;
    reset(): void;
    private checkBounds;
    private positionElement;
    private getBlockCursorDimensions;
    static ɵfac: i0.ɵɵFactoryDeclaration<MentionListComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MentionListComponent, "mention-list", never, { "labelKey": "labelKey"; "itemTemplate": "itemTemplate"; }, { "itemClick": "itemClick"; }, never, never, false>;
}
//# sourceMappingURL=mention-list.component.d.ts.map