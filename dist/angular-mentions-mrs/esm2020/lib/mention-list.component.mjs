<<<<<<< HEAD
import { Component, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { isInputOrTextAreaElement, getContentEditableCaretCoords } from './mention-utils';
import { getCaretCoordinates } from './caret-coords';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const _c0 = ["list"];
const _c1 = ["defaultItemTemplate"];
function MentionListComponent_ng_template_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const item_r4 = ctx.item;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", item_r4[ctx_r1.labelKey], " ");
} }
function MentionListComponent_li_4_ng_template_2_Template(rf, ctx) { }
const _c2 = function (a0) { return { "item": a0 }; };
function MentionListComponent_li_4_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "a", 4);
    i0.ɵɵlistener("mousedown", function MentionListComponent_li_4_Template_a_mousedown_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r9); const i_r6 = restoredCtx.index; const ctx_r8 = i0.ɵɵnextContext(); ctx_r8.activeIndex = i_r6; ctx_r8.itemClick.emit(); return i0.ɵɵresetView($event.preventDefault()); });
    i0.ɵɵtemplate(2, MentionListComponent_li_4_ng_template_2_Template, 0, 0, "ng-template", 5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const i_r6 = ctx.index;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("active", ctx_r3.activeIndex == i_r6)("mention-active", !ctx_r3.styleOff && ctx_r3.activeIndex == i_r6);
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("mention-item", !ctx_r3.styleOff);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngTemplateOutlet", ctx_r3.itemTemplate)("ngTemplateOutletContext", i0.ɵɵpureFunction1(8, _c2, item_r5));
} }
/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
export class MentionListComponent {
    constructor(element) {
        this.element = element;
        this.labelKey = 'label';
        this.itemClick = new EventEmitter();
        this.items = [];
        this.activeIndex = 0;
        this.hidden = false;
        this.dropUp = false;
        this.styleOff = false;
        this.coords = { top: 0, left: 0 };
        this.offset = 0;
    }
    ngAfterContentChecked() {
        if (!this.itemTemplate) {
            this.itemTemplate = this.defaultItemTemplate;
        }
    }
    // lots of confusion here between relative coordinates and containers
    position(nativeParentElement, iframe = null) {
        if (isInputOrTextAreaElement(nativeParentElement)) {
            // parent elements need to have postition:relative for this to work correctly?
            this.coords = getCaretCoordinates(nativeParentElement, nativeParentElement.selectionStart, null);
            this.coords.top = nativeParentElement.offsetTop + this.coords.top - nativeParentElement.scrollTop;
            this.coords.left = nativeParentElement.offsetLeft + this.coords.left - nativeParentElement.scrollLeft;
            // getCretCoordinates() for text/input elements needs an additional offset to position the list correctly
            this.offset = this.getBlockCursorDimensions(nativeParentElement).height;
        }
        else if (iframe) {
            let context = { iframe: iframe, parent: iframe.offsetParent };
            this.coords = getContentEditableCaretCoords(context);
        }
        else {
            let doc = document.documentElement;
            let scrollLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
            let scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
            // bounding rectangles are relative to view, offsets are relative to container?
            let caretRelativeToView = getContentEditableCaretCoords({ iframe: iframe });
            let parentRelativeToContainer = nativeParentElement.getBoundingClientRect();
            this.coords.top = caretRelativeToView.top - parentRelativeToContainer.top + nativeParentElement.offsetTop - scrollTop;
            this.coords.left = caretRelativeToView.left - parentRelativeToContainer.left + nativeParentElement.offsetLeft - scrollLeft;
        }
        // set the default/inital position
        this.positionElement();
    }
    get activeItem() {
        return this.items[this.activeIndex];
    }
    activateNextItem() {
        // adjust scrollable-menu offset if the next item is out of view
        let listEl = this.list.nativeElement;
        let activeEl = listEl.getElementsByClassName('active').item(0);
        if (activeEl) {
            let nextLiEl = activeEl.nextSibling;
            if (nextLiEl && nextLiEl.nodeName == "LI") {
                let nextLiRect = nextLiEl.getBoundingClientRect();
                if (nextLiRect.bottom > listEl.getBoundingClientRect().bottom) {
                    listEl.scrollTop = nextLiEl.offsetTop + nextLiRect.height - listEl.clientHeight;
                }
            }
        }
        // select the next item
        this.activeIndex = Math.max(Math.min(this.activeIndex + 1, this.items.length - 1), 0);
    }
    activatePreviousItem() {
        // adjust the scrollable-menu offset if the previous item is out of view
        let listEl = this.list.nativeElement;
        let activeEl = listEl.getElementsByClassName('active').item(0);
        if (activeEl) {
            let prevLiEl = activeEl.previousSibling;
            if (prevLiEl && prevLiEl.nodeName == "LI") {
                let prevLiRect = prevLiEl.getBoundingClientRect();
                if (prevLiRect.top < listEl.getBoundingClientRect().top) {
                    listEl.scrollTop = prevLiEl.offsetTop;
                }
            }
        }
        // select the previous item
        this.activeIndex = Math.max(Math.min(this.activeIndex - 1, this.items.length - 1), 0);
    }
    // reset for a new mention search
    reset() {
        this.list.nativeElement.scrollTop = 0;
        this.checkBounds();
    }
    // final positioning is done after the list is shown (and the height and width are known)
    // ensure it's in the page bounds
    checkBounds() {
        let left = this.coords.left, top = this.coords.top, dropUp = this.dropUp;
        const bounds = this.list.nativeElement.getBoundingClientRect();
        // if off right of page, align right
        if (bounds.left + bounds.width > window.innerWidth) {
            left -= bounds.left + bounds.width - window.innerWidth + 10;
        }
        // if more than half off the bottom of the page, force dropUp
        // if ((bounds.top+bounds.height/2)>window.innerHeight) {
        //   dropUp = true;
        // }
        // if top is off page, disable dropUp
        if (bounds.top < 0) {
            dropUp = false;
        }
        // set the revised/final position
        this.positionElement(left, top, dropUp);
    }
    positionElement(left = this.coords.left, top = this.coords.top, dropUp = this.dropUp) {
        const el = this.element.nativeElement;
        top += dropUp ? 0 : this.offset; // top of list is next line
        el.className = dropUp ? 'dropup' : null;
        el.style.position = "absolute";
        el.style.left = left + 'px';
        el.style.top = top + 'px';
    }
    getBlockCursorDimensions(nativeParentElement) {
        const parentStyles = window.getComputedStyle(nativeParentElement);
        return {
            height: parseFloat(parentStyles.lineHeight),
            width: parseFloat(parentStyles.fontSize)
        };
    }
}
MentionListComponent.ɵfac = function MentionListComponent_Factory(t) { return new (t || MentionListComponent)(i0.ɵɵdirectiveInject(i0.ElementRef)); };
MentionListComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MentionListComponent, selectors: [["mention-list"]], viewQuery: function MentionListComponent_Query(rf, ctx) { if (rf & 1) {
        i0.ɵɵviewQuery(_c0, 7);
        i0.ɵɵviewQuery(_c1, 7);
    } if (rf & 2) {
        let _t;
        i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.list = _t.first);
        i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.defaultItemTemplate = _t.first);
    } }, inputs: { labelKey: "labelKey", itemTemplate: "itemTemplate" }, outputs: { itemClick: "itemClick" }, decls: 5, vars: 6, consts: [["defaultItemTemplate", ""], [1, "dropdown-menu", "scrollable-menu", 3, "hidden"], ["list", ""], [3, "active", "mention-active", 4, "ngFor", "ngForOf"], [1, "dropdown-item", 3, "mousedown"], [3, "ngTemplateOutlet", "ngTemplateOutletContext"]], template: function MentionListComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtemplate(0, MentionListComponent_ng_template_0_Template, 1, 1, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
        i0.ɵɵelementStart(2, "ul", 1, 2);
        i0.ɵɵtemplate(4, MentionListComponent_li_4_Template, 3, 10, "li", 3);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵclassProp("mention-menu", !ctx.styleOff)("mention-dropdown", !ctx.styleOff && ctx.dropUp);
        i0.ɵɵproperty("hidden", ctx.hidden);
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngForOf", ctx.items);
    } }, dependencies: [i1.NgForOf, i1.NgTemplateOutlet], styles: [".mention-menu[_ngcontent-%COMP%]{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:11em;padding:.5em 0;margin:.125em 0 0;font-size:1em;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25em}.mention-item[_ngcontent-%COMP%]{display:block;padding:.2em 1.5em;line-height:1.5em;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.mention-active[_ngcontent-%COMP%] > a[_ngcontent-%COMP%]{color:#fff;text-decoration:none;background-color:#337ab7;outline:0}.scrollable-menu[_ngcontent-%COMP%]{display:block;height:auto;max-height:292px;overflow:auto}[hidden][_ngcontent-%COMP%]{display:none}.mention-dropdown[_ngcontent-%COMP%]{bottom:100%;top:auto;margin-bottom:2px}"] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MentionListComponent, [{
        type: Component,
        args: [{ selector: 'mention-list', template: `
    <ng-template #defaultItemTemplate let-item="item">
      {{item[labelKey]}}
    </ng-template>
    <ul #list [hidden]="hidden" class="dropdown-menu scrollable-menu"
      [class.mention-menu]="!styleOff" [class.mention-dropdown]="!styleOff && dropUp">
      <li *ngFor="let item of items; let i = index"
        [class.active]="activeIndex==i" [class.mention-active]="!styleOff && activeIndex==i">
        <a class="dropdown-item" [class.mention-item]="!styleOff"
          (mousedown)="activeIndex=i;itemClick.emit();$event.preventDefault()">
          <ng-template [ngTemplateOutlet]="itemTemplate" [ngTemplateOutletContext]="{'item':item}"></ng-template>
        </a>
      </li>
    </ul>
    `, styles: [".mention-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:11em;padding:.5em 0;margin:.125em 0 0;font-size:1em;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25em}.mention-item{display:block;padding:.2em 1.5em;line-height:1.5em;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.mention-active>a{color:#fff;text-decoration:none;background-color:#337ab7;outline:0}.scrollable-menu{display:block;height:auto;max-height:292px;overflow:auto}[hidden]{display:none}.mention-dropdown{bottom:100%;top:auto;margin-bottom:2px}\n"] }]
    }], function () { return [{ type: i0.ElementRef }]; }, { labelKey: [{
            type: Input
        }], itemTemplate: [{
            type: Input
        }], itemClick: [{
            type: Output
        }], list: [{
            type: ViewChild,
            args: ['list', { static: true }]
        }], defaultItemTemplate: [{
            type: ViewChild,
            args: ['defaultItemTemplate', { static: true }]
        }] }); })();
=======
import { Component, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { isInputOrTextAreaElement, getContentEditableCaretCoords } from './mention-utils';
import { getCaretCoordinates } from './caret-coords';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
const _c0 = ["list"];
const _c1 = ["defaultItemTemplate"];
function MentionListComponent_ng_template_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const item_r4 = ctx.item;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", item_r4[ctx_r1.labelKey], " ");
} }
function MentionListComponent_li_4_ng_template_2_Template(rf, ctx) { }
const _c2 = function (a0) { return { "item": a0 }; };
function MentionListComponent_li_4_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "a", 4);
    i0.ɵɵlistener("mousedown", function MentionListComponent_li_4_Template_a_mousedown_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r9); const i_r6 = restoredCtx.index; const ctx_r8 = i0.ɵɵnextContext(); ctx_r8.activeIndex = i_r6; ctx_r8.itemClick.emit(); return i0.ɵɵresetView($event.preventDefault()); });
    i0.ɵɵtemplate(2, MentionListComponent_li_4_ng_template_2_Template, 0, 0, "ng-template", 5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const i_r6 = ctx.index;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("active", ctx_r3.activeIndex == i_r6)("mention-active", !ctx_r3.styleOff && ctx_r3.activeIndex == i_r6);
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("mention-item", !ctx_r3.styleOff);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngTemplateOutlet", ctx_r3.itemTemplate)("ngTemplateOutletContext", i0.ɵɵpureFunction1(8, _c2, item_r5));
} }
/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
export class MentionListComponent {
    constructor(element) {
        this.element = element;
        this.labelKey = 'label';
        this.itemClick = new EventEmitter();
        this.items = [];
        this.activeIndex = 0;
        this.hidden = false;
        this.dropUp = false;
        this.styleOff = false;
        this.coords = { top: 0, left: 0 };
        this.offset = 0;
    }
    ngAfterContentChecked() {
        if (!this.itemTemplate) {
            this.itemTemplate = this.defaultItemTemplate;
        }
    }
    // lots of confusion here between relative coordinates and containers
    position(nativeParentElement, iframe = null) {
        if (isInputOrTextAreaElement(nativeParentElement)) {
            // parent elements need to have postition:relative for this to work correctly?
            this.coords = getCaretCoordinates(nativeParentElement, nativeParentElement.selectionStart, null);
            this.coords.top = nativeParentElement.offsetTop + this.coords.top - nativeParentElement.scrollTop;
            this.coords.left = nativeParentElement.offsetLeft + this.coords.left - nativeParentElement.scrollLeft;
            // getCretCoordinates() for text/input elements needs an additional offset to position the list correctly
            this.offset = this.getBlockCursorDimensions(nativeParentElement).height;
        }
        else if (iframe) {
            let context = { iframe: iframe, parent: iframe.offsetParent };
            this.coords = getContentEditableCaretCoords(context);
        }
        else {
            let doc = document.documentElement;
            let scrollLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
            let scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
            // bounding rectangles are relative to view, offsets are relative to container?
            let caretRelativeToView = getContentEditableCaretCoords({ iframe: iframe });
            let parentRelativeToContainer = nativeParentElement.getBoundingClientRect();
            this.coords.top = caretRelativeToView.top - parentRelativeToContainer.top + nativeParentElement.offsetTop - scrollTop;
            this.coords.left = caretRelativeToView.left - parentRelativeToContainer.left + nativeParentElement.offsetLeft - scrollLeft;
        }
        // set the default/inital position
        this.positionElement();
    }
    get activeItem() {
        return this.items[this.activeIndex];
    }
    activateNextItem() {
        // adjust scrollable-menu offset if the next item is out of view
        let listEl = this.list.nativeElement;
        let activeEl = listEl.getElementsByClassName('active').item(0);
        if (activeEl) {
            let nextLiEl = activeEl.nextSibling;
            if (nextLiEl && nextLiEl.nodeName == "LI") {
                let nextLiRect = nextLiEl.getBoundingClientRect();
                if (nextLiRect.bottom > listEl.getBoundingClientRect().bottom) {
                    listEl.scrollTop = nextLiEl.offsetTop + nextLiRect.height - listEl.clientHeight;
                }
            }
        }
        // select the next item
        this.activeIndex = Math.max(Math.min(this.activeIndex + 1, this.items.length - 1), 0);
    }
    activatePreviousItem() {
        // adjust the scrollable-menu offset if the previous item is out of view
        let listEl = this.list.nativeElement;
        let activeEl = listEl.getElementsByClassName('active').item(0);
        if (activeEl) {
            let prevLiEl = activeEl.previousSibling;
            if (prevLiEl && prevLiEl.nodeName == "LI") {
                let prevLiRect = prevLiEl.getBoundingClientRect();
                if (prevLiRect.top < listEl.getBoundingClientRect().top) {
                    listEl.scrollTop = prevLiEl.offsetTop;
                }
            }
        }
        // select the previous item
        this.activeIndex = Math.max(Math.min(this.activeIndex - 1, this.items.length - 1), 0);
    }
    // reset for a new mention search
    reset() {
        this.list.nativeElement.scrollTop = 0;
        this.checkBounds();
    }
    // final positioning is done after the list is shown (and the height and width are known)
    // ensure it's in the page bounds
    checkBounds() {
        let left = this.coords.left, top = this.coords.top, dropUp = this.dropUp;
        const bounds = this.list.nativeElement.getBoundingClientRect();
        // if off right of page, align right
        if (bounds.left + bounds.width > window.innerWidth) {
            left -= bounds.left + bounds.width - window.innerWidth + 10;
        }
        // if more than half off the bottom of the page, force dropUp
        // if ((bounds.top+bounds.height/2)>window.innerHeight) {
        //   dropUp = true;
        // }
        // if top is off page, disable dropUp
        if (bounds.top < 0) {
            dropUp = false;
        }
        // set the revised/final position
        this.positionElement(left, top, dropUp);
    }
    positionElement(left = this.coords.left, top = this.coords.top, dropUp = this.dropUp) {
        const el = this.element.nativeElement;
        top += dropUp ? 0 : this.offset; // top of list is next line
        el.className = dropUp ? 'dropup' : null;
        el.style.position = "absolute";
        el.style.left = left + 'px';
        el.style.top = top + 'px';
    }
    getBlockCursorDimensions(nativeParentElement) {
        const parentStyles = window.getComputedStyle(nativeParentElement);
        return {
            height: parseFloat(parentStyles.lineHeight),
            width: parseFloat(parentStyles.fontSize)
        };
    }
}
MentionListComponent.ɵfac = function MentionListComponent_Factory(t) { return new (t || MentionListComponent)(i0.ɵɵdirectiveInject(i0.ElementRef)); };
MentionListComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MentionListComponent, selectors: [["mention-list"]], viewQuery: function MentionListComponent_Query(rf, ctx) { if (rf & 1) {
        i0.ɵɵviewQuery(_c0, 7);
        i0.ɵɵviewQuery(_c1, 7);
    } if (rf & 2) {
        let _t;
        i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.list = _t.first);
        i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.defaultItemTemplate = _t.first);
    } }, inputs: { labelKey: "labelKey", itemTemplate: "itemTemplate" }, outputs: { itemClick: "itemClick" }, decls: 5, vars: 6, consts: [["defaultItemTemplate", ""], [1, "dropdown-menu", "scrollable-menu", 3, "hidden"], ["list", ""], [3, "active", "mention-active", 4, "ngFor", "ngForOf"], [1, "dropdown-item", 3, "mousedown"], [3, "ngTemplateOutlet", "ngTemplateOutletContext"]], template: function MentionListComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtemplate(0, MentionListComponent_ng_template_0_Template, 1, 1, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
        i0.ɵɵelementStart(2, "ul", 1, 2);
        i0.ɵɵtemplate(4, MentionListComponent_li_4_Template, 3, 10, "li", 3);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵclassProp("mention-menu", !ctx.styleOff)("mention-dropdown", !ctx.styleOff && ctx.dropUp);
        i0.ɵɵproperty("hidden", ctx.hidden);
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngForOf", ctx.items);
    } }, dependencies: [i1.NgForOf, i1.NgTemplateOutlet], styles: [".mention-menu[_ngcontent-%COMP%]{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:11em;padding:.5em 0;margin:.125em 0 0;font-size:1em;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25em}.mention-item[_ngcontent-%COMP%]{display:block;padding:.2em 1.5em;line-height:1.5em;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.mention-active[_ngcontent-%COMP%] > a[_ngcontent-%COMP%]{color:#fff;text-decoration:none;background-color:#337ab7;outline:0}.scrollable-menu[_ngcontent-%COMP%]{display:block;height:auto;max-height:292px;overflow:auto}[hidden][_ngcontent-%COMP%]{display:none}.mention-dropdown[_ngcontent-%COMP%]{bottom:100%;top:auto;margin-bottom:2px}"] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MentionListComponent, [{
        type: Component,
        args: [{ selector: 'mention-list', template: `
    <ng-template #defaultItemTemplate let-item="item">
      {{item[labelKey]}}
    </ng-template>
    <ul #list [hidden]="hidden" class="dropdown-menu scrollable-menu"
      [class.mention-menu]="!styleOff" [class.mention-dropdown]="!styleOff && dropUp">
      <li *ngFor="let item of items; let i = index"
        [class.active]="activeIndex==i" [class.mention-active]="!styleOff && activeIndex==i">
        <a class="dropdown-item" [class.mention-item]="!styleOff"
          (mousedown)="activeIndex=i;itemClick.emit();$event.preventDefault()">
          <ng-template [ngTemplateOutlet]="itemTemplate" [ngTemplateOutletContext]="{'item':item}"></ng-template>
        </a>
      </li>
    </ul>
    `, styles: [".mention-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:11em;padding:.5em 0;margin:.125em 0 0;font-size:1em;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25em}.mention-item{display:block;padding:.2em 1.5em;line-height:1.5em;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.mention-active>a{color:#fff;text-decoration:none;background-color:#337ab7;outline:0}.scrollable-menu{display:block;height:auto;max-height:292px;overflow:auto}[hidden]{display:none}.mention-dropdown{bottom:100%;top:auto;margin-bottom:2px}\n"] }]
    }], function () { return [{ type: i0.ElementRef }]; }, { labelKey: [{
            type: Input
        }], itemTemplate: [{
            type: Input
        }], itemClick: [{
            type: Output
        }], list: [{
            type: ViewChild,
            args: ['list', { static: true }]
        }], defaultItemTemplate: [{
            type: ViewChild,
            args: ['defaultItemTemplate', { static: true }]
        }] }); })();
>>>>>>> 4b11fe9 (dist)
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbi1saXN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItbWVudGlvbnMvc3JjL2xpYi9tZW50aW9uLWxpc3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQWMsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUM5RCxNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMxRixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7O0lBYS9DLFlBQ0Y7Ozs7SUFERSx5REFDRjs7Ozs7O0lBR0UsMEJBQ3VGLFdBQUE7SUFFbkYsaVBBQTJCLHVCQUFnQixTQUFDLGVBQUEsdUJBQXVCLENBQUEsSUFBQztJQUNwRSwwRkFBdUc7SUFDekcsaUJBQUksRUFBQTs7Ozs7SUFKSixvREFBK0Isa0VBQUE7SUFDTixlQUFnQztJQUFoQyxnREFBZ0M7SUFFMUMsZUFBaUM7SUFBakMsc0RBQWlDLGdFQUFBOztBQW5CeEQ7Ozs7O0dBS0c7QUFvQkgsTUFBTSxPQUFPLG9CQUFvQjtJQWEvQixZQUFvQixPQUFtQjtRQUFuQixZQUFPLEdBQVAsT0FBTyxDQUFZO1FBWjlCLGFBQVEsR0FBVyxPQUFPLENBQUM7UUFFMUIsY0FBUyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFHekMsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUNYLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFDeEIsV0FBTSxHQUFZLEtBQUssQ0FBQztRQUN4QixhQUFRLEdBQVksS0FBSyxDQUFDO1FBQ2xCLFdBQU0sR0FBOEIsRUFBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLElBQUksRUFBQyxDQUFDLEVBQUMs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QUFTOzJCQUNFLGNBQWMsWUFFZDs7Ozs7Ozs7Ozs7Ozs7S0FjUDs2REFHTSxRQUFRO2tCQUFoQixLQUFLO1lBQ0csWUFBWTtrQkFBcEIsS0FBSztZQUNJLFNBQVM7a0JBQWxCLE1BQU07WUFDOEIsSUFBSTtrQkFBeEMsU0FBUzttQkFBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO1lBQ2lCLG1CQUFtQjtrQkFBdEUsU0FBUzttQkFBQyxxQkFBcUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIENvbXBvbmVudCwgRWxlbWVudFJlZiwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFZpZXdDaGlsZCwgSW5wdXQsIFRlbXBsYXRlUmVmLCBBZnRlckNvbnRlbnRDaGVja2VkXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgeyBpc0lucHV0T3JUZXh0QXJlYUVsZW1lbnQsIGdldENvbnRlbnRFZGl0YWJsZUNhcmV0Q29vcmRzIH0gZnJvbSAnLi9tZW50aW9uLXV0aWxzJztcclxuaW1wb3J0IHsgZ2V0Q2FyZXRDb29yZGluYXRlcyB9IGZyb20gJy4vY2FyZXQtY29vcmRzJztcclxuXHJcbi8qKlxyXG4gKiBBbmd1bGFyIE1lbnRpb25zLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZG1hY2ZhcmxhbmUvYW5ndWxhci1tZW50aW9uc1xyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYgRGFuIE1hY0ZhcmxhbmVcclxuICovXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbWVudGlvbi1saXN0JyxcclxuICBzdHlsZVVybHM6IFsnLi9tZW50aW9uLWxpc3QuY29tcG9uZW50LnNjc3MnXSxcclxuICB0ZW1wbGF0ZTogYFxyXG4gICAgPG5nLXRlbXBsYXRlICNkZWZhdWx0SXRlbVRlbXBsYXRlIGxldC1pdGVtPVwiaXRlbVwiPlxyXG4gICAgICB7e2l0ZW1bbGFiZWxLZXldfX1cclxuICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICA8dWwgI2xpc3QgW2hpZGRlbl09XCJoaWRkZW5cIiBjbGFzcz1cImRyb3Bkb3duLW1lbnUgc2Nyb2xsYWJsZS1tZW51XCJcclxuICAgICAgW2NsYXNzLm1lbnRpb24tbWVudV09XCIhc3R5bGVPZmZcIiBbY2xhc3MubWVudGlvbi1kcm9wZG93bl09XCIhc3R5bGVPZmYgJiYgZHJvcFVwXCI+XHJcbiAgICAgIDxsaSAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtczsgbGV0IGkgPSBpbmRleFwiXHJcbiAgICAgICAgW2NsYXNzLmFjdGl2ZV09XCJhY3RpdmVJbmRleD09aVwiIFtjbGFzcy5tZW50aW9uLWFjdGl2ZV09XCIhc3R5bGVPZmYgJiYgYWN0aXZlSW5kZXg9PWlcIj5cclxuICAgICAgICA8YSBjbGFzcz1cImRyb3Bkb3duLWl0ZW1cIiBbY2xhc3MubWVudGlvbi1pdGVtXT1cIiFzdHlsZU9mZlwiXHJcbiAgICAgICAgICAobW91c2Vkb3duKT1cImFjdGl2ZUluZGV4PWk7aXRlbUNsaWNrLmVtaXQoKTskZXZlbnQucHJldmVudERlZmF1bHQoKVwiPlxyXG4gICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIml0ZW1UZW1wbGF0ZVwiIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7J2l0ZW0nOml0ZW19XCI+PC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICA8L2E+XHJcbiAgICAgIDwvbGk+XHJcbiAgICA8L3VsPlxyXG4gICAgYFxyXG59KVxyXG5leHBvcnQgY2xhc3MgTWVudGlvbkxpc3RDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRDaGVja2VkIHtcclxuICBASW5wdXQoKSBsYWJlbEtleTogc3RyaW5nID0gJ2xhYmVsJztcclxuICBASW5wdXQoKSBpdGVtVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcbiAgQE91dHB1dCgpIGl0ZW1DbGljayA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBAVmlld0NoaWxkKCdsaXN0JywgeyBzdGF0aWM6IHRydWUgfSkgbGlzdDogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKCdkZWZhdWx0SXRlbVRlbXBsYXRlJywgeyBzdGF0aWM6IHRydWUgfSkgZGVmYXVsdEl0ZW1UZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuICBpdGVtcyA9IFtdO1xyXG4gIGFjdGl2ZUluZGV4OiBudW1iZXIgPSAwO1xyXG4gIGhpZGRlbjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIGRyb3BVcDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHN0eWxlT2ZmOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBjb29yZHM6IHt0b3A6bnVtYmVyLCBsZWZ0Om51bWJlcn0gPSB7dG9wOjAsIGxlZnQ6MH07XHJcbiAgcHJpdmF0ZSBvZmZzZXQ6IG51bWJlciA9IDA7XHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OiBFbGVtZW50UmVmKSB7fVxyXG5cclxuICBuZ0FmdGVyQ29udGVudENoZWNrZWQoKSB7XHJcbiAgICBpZiAoIXRoaXMuaXRlbVRlbXBsYXRlKSB7XHJcbiAgICAgIHRoaXMuaXRlbVRlbXBsYXRlID0gdGhpcy5kZWZhdWx0SXRlbVRlbXBsYXRlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gbG90cyBvZiBjb25mdXNpb24gaGVyZSBiZXR3ZWVuIHJlbGF0aXZlIGNvb3JkaW5hdGVzIGFuZCBjb250YWluZXJzXHJcbiAgcG9zaXRpb24obmF0aXZlUGFyZW50RWxlbWVudDogSFRNTElucHV0RWxlbWVudCwgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCA9IG51bGwpOiBhbnkge1xyXG4gICAgaWYgKGlzSW5wdXRPclRleHRBcmVhRWxlbWVudChuYXRpdmVQYXJlbnRFbGVtZW50KSkge1xyXG4gICAgICAvLyBwYXJlbnQgZWxlbWVudHMgbmVlZCB0byBoYXZlIHBvc3RpdGlvbjpyZWxhdGl2ZSBmb3IgdGhpcyB0byB3b3JrIGNvcnJlY3RseT9cclxuICAgICAgdGhpcy5jb29yZHMgPSBnZXRDYXJldENvb3JkaW5hdGVzKG5hdGl2ZVBhcmVudEVsZW1lbnQsIG5hdGl2ZVBhcmVudEVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsIG51bGwpO1xyXG4gICAgICB0aGlzLmNvb3Jkcy50b3AgPSBuYXRpdmVQYXJlbnRFbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuY29vcmRzLnRvcCAtIG5hdGl2ZVBhcmVudEVsZW1lbnQuc2Nyb2xsVG9wO1xyXG4gICAgICB0aGlzLmNvb3Jkcy5sZWZ0ID0gbmF0aXZlUGFyZW50RWxlbWVudC5vZmZzZXRMZWZ0ICsgdGhpcy5jb29yZHMubGVmdCAtIG5hdGl2ZVBhcmVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcclxuICAgICAgLy8gZ2V0Q3JldENvb3JkaW5hdGVzKCkgZm9yIHRleHQvaW5wdXQgZWxlbWVudHMgbmVlZHMgYW4gYWRkaXRpb25hbCBvZmZzZXQgdG8gcG9zaXRpb24gdGhlIGxpc3QgY29ycmVjdGx5XHJcbiAgICAgIHRoaXMub2Zmc2V0ID0gdGhpcy5nZXRCbG9ja0N1cnNvckRpbWVuc2lvbnMobmF0aXZlUGFyZW50RWxlbWVudCkuaGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoaWZyYW1lKSB7XHJcbiAgICAgIGxldCBjb250ZXh0OiB7IGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQsIHBhcmVudDogRWxlbWVudCB9ID0geyBpZnJhbWU6IGlmcmFtZSwgcGFyZW50OiBpZnJhbWUub2Zmc2V0UGFyZW50IH07XHJcbiAgICAgIHRoaXMuY29vcmRzID0gZ2V0Q29udGVudEVkaXRhYmxlQ2FyZXRDb29yZHMoY29udGV4dCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbGV0IGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgbGV0IHNjcm9sbExlZnQgPSAod2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvYy5zY3JvbGxMZWZ0KSAtIChkb2MuY2xpZW50TGVmdCB8fCAwKTtcclxuICAgICAgbGV0IHNjcm9sbFRvcCA9ICh3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jLnNjcm9sbFRvcCkgLSAoZG9jLmNsaWVudFRvcCB8fCAwKTtcclxuICAgICAgLy8gYm91bmRpbmcgcmVjdGFuZ2xlcyBhcmUgcmVsYXRpdmUgdG8gdmlldywgb2Zmc2V0cyBhcmUgcmVsYXRpdmUgdG8gY29udGFpbmVyP1xyXG4gICAgICBsZXQgY2FyZXRSZWxhdGl2ZVRvVmlldyA9IGdldENvbnRlbnRFZGl0YWJsZUNhcmV0Q29vcmRzKHsgaWZyYW1lOiBpZnJhbWUgfSk7XHJcbiAgICAgIGxldCBwYXJlbnRSZWxhdGl2ZVRvQ29udGFpbmVyOiBDbGllbnRSZWN0ID0gbmF0aXZlUGFyZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgdGhpcy5jb29yZHMudG9wID0gY2FyZXRSZWxhdGl2ZVRvVmlldy50b3AgLSBwYXJlbnRSZWxhdGl2ZVRvQ29udGFpbmVyLnRvcCArIG5hdGl2ZVBhcmVudEVsZW1lbnQub2Zmc2V0VG9wIC0gc2Nyb2xsVG9wO1xyXG4gICAgICB0aGlzLmNvb3Jkcy5sZWZ0ID0gY2FyZXRSZWxhdGl2ZVRvVmlldy5sZWZ0IC0gcGFyZW50UmVsYXRpdmVUb0NvbnRhaW5lci5sZWZ0ICsgbmF0aXZlUGFyZW50RWxlbWVudC5vZmZzZXRMZWZ0IC0gc2Nyb2xsTGVmdDtcclxuICAgIH1cclxuICAgIC8vIHNldCB0aGUgZGVmYXVsdC9pbml0YWwgcG9zaXRpb25cclxuICAgIHRoaXMucG9zaXRpb25FbGVtZW50KCk7XHJcbiAgfVxyXG5cclxuICBnZXQgYWN0aXZlSXRlbSgpIHtcclxuICAgIHJldHVybiB0aGlzLml0ZW1zW3RoaXMuYWN0aXZlSW5kZXhdO1xyXG4gIH1cclxuXHJcbiAgYWN0aXZhdGVOZXh0SXRlbSgpIHtcclxuICAgIC8vIGFkanVzdCBzY3JvbGxhYmxlLW1lbnUgb2Zmc2V0IGlmIHRoZSBuZXh0IGl0ZW0gaXMgb3V0IG9mIHZpZXdcclxuICAgIGxldCBsaXN0RWw6IEhUTUxFbGVtZW50ID0gdGhpcy5saXN0Lm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICBsZXQgYWN0aXZlRWwgPSBsaXN0RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYWN0aXZlJykuaXRlbSgwKTtcclxuICAgIGlmIChhY3RpdmVFbCkge1xyXG4gICAgICBsZXQgbmV4dExpRWw6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PiBhY3RpdmVFbC5uZXh0U2libGluZztcclxuICAgICAgaWYgKG5leHRMaUVsICYmIG5leHRMaUVsLm5vZGVOYW1lID09IFwiTElcIikge1xyXG4gICAgICAgIGxldCBuZXh0TGlSZWN0OiBDbGllbnRSZWN0ID0gbmV4dExpRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgaWYgKG5leHRMaVJlY3QuYm90dG9tID4gbGlzdEVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbSkge1xyXG4gICAgICAgICAgbGlzdEVsLnNjcm9sbFRvcCA9IG5leHRMaUVsLm9mZnNldFRvcCArIG5leHRMaVJlY3QuaGVpZ2h0IC0gbGlzdEVsLmNsaWVudEhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHNlbGVjdCB0aGUgbmV4dCBpdGVtXHJcbiAgICB0aGlzLmFjdGl2ZUluZGV4ID0gTWF0aC5tYXgoTWF0aC5taW4odGhpcy5hY3RpdmVJbmRleCArIDEsIHRoaXMuaXRlbXMubGVuZ3RoIC0gMSksIDApO1xyXG4gIH1cclxuXHJcbiAgYWN0aXZhdGVQcmV2aW91c0l0ZW0oKSB7XHJcbiAgICAvLyBhZGp1c3QgdGhlIHNjcm9sbGFibGUtbWVudSBvZmZzZXQgaWYgdGhlIHByZXZpb3VzIGl0ZW0gaXMgb3V0IG9mIHZpZXdcclxuICAgIGxldCBsaXN0RWw6IEhUTUxFbGVtZW50ID0gdGhpcy5saXN0Lm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICBsZXQgYWN0aXZlRWwgPSBsaXN0RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYWN0aXZlJykuaXRlbSgwKTtcclxuICAgIGlmIChhY3RpdmVFbCkge1xyXG4gICAgICBsZXQgcHJldkxpRWw6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PiBhY3RpdmVFbC5wcmV2aW91c1NpYmxpbmc7XHJcbiAgICAgIGlmIChwcmV2TGlFbCAmJiBwcmV2TGlFbC5ub2RlTmFtZSA9PSBcIkxJXCIpIHtcclxuICAgICAgICBsZXQgcHJldkxpUmVjdDogQ2xpZW50UmVjdCA9IHByZXZMaUVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGlmIChwcmV2TGlSZWN0LnRvcCA8IGxpc3RFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3ApIHtcclxuICAgICAgICAgIGxpc3RFbC5zY3JvbGxUb3AgPSBwcmV2TGlFbC5vZmZzZXRUb3A7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBzZWxlY3QgdGhlIHByZXZpb3VzIGl0ZW1cclxuICAgIHRoaXMuYWN0aXZlSW5kZXggPSBNYXRoLm1heChNYXRoLm1pbih0aGlzLmFjdGl2ZUluZGV4IC0gMSwgdGhpcy5pdGVtcy5sZW5ndGggLSAxKSwgMCk7XHJcbiAgfVxyXG5cclxuICAvLyByZXNldCBmb3IgYSBuZXcgbWVudGlvbiBzZWFyY2hcclxuICByZXNldCgpIHtcclxuICAgIHRoaXMubGlzdC5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IDA7XHJcbiAgICB0aGlzLmNoZWNrQm91bmRzKCk7XHJcbiAgfVxyXG5cclxuICAvLyBmaW5hbCBwb3NpdGlvbmluZyBpcyBkb25lIGFmdGVyIHRoZSBsaXN0IGlzIHNob3duIChhbmQgdGhlIGhlaWdodCBhbmQgd2lkdGggYXJlIGtub3duKVxyXG4gIC8vIGVuc3VyZSBpdCdzIGluIHRoZSBwYWdlIGJvdW5kc1xyXG4gIHByaXZhdGUgY2hlY2tCb3VuZHMoKSB7XHJcbiAgICBsZXQgbGVmdCA9IHRoaXMuY29vcmRzLmxlZnQsIHRvcCA9IHRoaXMuY29vcmRzLnRvcCwgZHJvcFVwID0gdGhpcy5kcm9wVXA7XHJcbiAgICBjb25zdCBib3VuZHM6IENsaWVudFJlY3QgPSB0aGlzLmxpc3QubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIC8vIGlmIG9mZiByaWdodCBvZiBwYWdlLCBhbGlnbiByaWdodFxyXG4gICAgaWYgKGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoID4gd2luZG93LmlubmVyV2lkdGgpIHtcclxuICAgICAgbGVmdCAtPSBib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCAtIHdpbmRvdy5pbm5lcldpZHRoICsgMTA7XHJcbiAgICB9XHJcbiAgICAvLyBpZiBtb3JlIHRoYW4gaGFsZiBvZmYgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZSwgZm9yY2UgZHJvcFVwXHJcbiAgICAvLyBpZiAoKGJvdW5kcy50b3ArYm91bmRzLmhlaWdodC8yKT53aW5kb3cuaW5uZXJIZWlnaHQpIHtcclxuICAgIC8vICAgZHJvcFVwID0gdHJ1ZTtcclxuICAgIC8vIH1cclxuICAgIC8vIGlmIHRvcCBpcyBvZmYgcGFnZSwgZGlzYWJsZSBkcm9wVXBcclxuICAgIGlmIChib3VuZHMudG9wPDApIHtcclxuICAgICAgZHJvcFVwID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICAvLyBzZXQgdGhlIHJldmlzZWQvZmluYWwgcG9zaXRpb25cclxuICAgIHRoaXMucG9zaXRpb25FbGVtZW50KGxlZnQsIHRvcCwgZHJvcFVwKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcG9zaXRpb25FbGVtZW50KGxlZnQ6bnVtYmVyPXRoaXMuY29vcmRzLmxlZnQsIHRvcDpudW1iZXI9dGhpcy5jb29yZHMudG9wLCBkcm9wVXA6Ym9vbGVhbj10aGlzLmRyb3BVcCkge1xyXG4gICAgY29uc3QgZWw6IEhUTUxFbGVtZW50ID0gdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICB0b3AgKz0gZHJvcFVwID8gMCA6IHRoaXMub2Zmc2V0OyAvLyB0b3Agb2YgbGlzdCBpcyBuZXh0IGxpbmVcclxuICAgIGVsLmNsYXNzTmFtZSA9IGRyb3BVcCA/ICdkcm9wdXAnIDogbnVsbDtcclxuICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG4gICAgZWwuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnO1xyXG4gICAgZWwuc3R5bGUudG9wID0gdG9wICsgJ3B4JztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0QmxvY2tDdXJzb3JEaW1lbnNpb25zKG5hdGl2ZVBhcmVudEVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICAgIGNvbnN0IHBhcmVudFN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG5hdGl2ZVBhcmVudEVsZW1lbnQpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaGVpZ2h0OiBwYXJzZUZsb2F0KHBhcmVudFN0eWxlcy5saW5lSGVpZ2h0KSxcclxuICAgICAgd2lkdGg6IHBhcnNlRmxvYXQocGFyZW50U3R5bGVzLmZvbnRTaXplKVxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuIl19