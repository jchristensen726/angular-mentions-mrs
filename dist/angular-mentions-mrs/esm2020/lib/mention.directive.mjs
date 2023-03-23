<<<<<<< HEAD
import { Directive } from "@angular/core";
import { EventEmitter, Input, Output } from "@angular/core";
import { getCaretPosition, getValue, insertValue, setCaretPosition } from './mention-utils';
import { MentionListComponent } from './mention-list.component';
import * as i0 from "@angular/core";
const KEY_BACKSPACE = 8;
const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_SHIFT = 16;
const KEY_ESCAPE = 27;
const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_BUFFERED = 229;
/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2017 Dan MacFarlane
 */
export class MentionDirective {
    constructor(_element, _componentResolver, _viewContainerRef) {
        this._element = _element;
        this._componentResolver = _componentResolver;
        this._viewContainerRef = _viewContainerRef;
        // the provided configuration object
        this.mentionConfig = { items: [] };
        this.DEFAULT_CONFIG = {
            items: [],
            triggerChar: '@',
            labelKey: 'label',
            maxItems: -1,
            allowSpace: false,
            returnTrigger: false,
            mentionSelect: (item, triggerChar) => {
                return this.activeConfig.triggerChar + item[this.activeConfig.labelKey];
            },
            mentionFilter: (searchString, items) => {
                const searchStringLowerCase = searchString.toLowerCase();
                return items.filter(e => e[this.activeConfig.labelKey].toLowerCase().startsWith(searchStringLowerCase));
            }
        };
        // event emitted whenever the search term changes
        this.searchTerm = new EventEmitter();
        // event emitted when an item is selected
        this.itemSelected = new EventEmitter();
        // event emitted whenever the mention list is opened or closed
        this.opened = new EventEmitter();
        this.afterPositioned = new EventEmitter();
        this.closed = new EventEmitter();
        this.triggerChars = {};
    }
    set mention(items) {
        this.mentionItems = items;
    }
    ngOnChanges(changes) {
        // console.log('config change', changes);
        if (changes['mention'] || changes['mentionConfig']) {
            this.updateConfig();
        }
    }
    updateConfig() {
        let config = this.mentionConfig;
        this.triggerChars = {};
        // use items from directive if they have been set
        if (this.mentionItems) {
            config.items = this.mentionItems;
        }
        this.addConfig(config);
        // nested configs
        if (config.mentions) {
            config.mentions.forEach(config => this.addConfig(config));
        }
    }
    // add configuration for a trigger char
    addConfig(config) {
        // defaults
        let defaults = Object.assign({}, this.DEFAULT_CONFIG);
        config = Object.assign(defaults, config);
        // items
        let items = config.items;
        if (items && items.length > 0) {
            // convert strings to objects
            if (typeof items[0] == 'string') {
                items = items.map((label) => {
                    let object = {};
                    object[config.labelKey] = label;
                    return object;
                });
            }
            if (config.labelKey) {
                // remove items without an labelKey (as it's required to filter the list)
                items = items.filter(e => e[config.labelKey]);
                if (!config.disableSort) {
                    items.sort((a, b) => a[config.labelKey].localeCompare(b[config.labelKey]));
                }
            }
        }
        config.items = items;
        // add the config
        this.triggerChars[config.triggerChar] = config;
        // for async update while menu/search is active
        if (this.activeConfig && this.activeConfig.triggerChar == config.triggerChar) {
            this.activeConfig = config;
            this.updateSearchList();
        }
    }
    setIframe(iframe) {
        this.iframe = iframe;
    }
    stopEvent(event) {
        //if (event instanceof KeyboardEvent) { // does not work for iframe
        if (!event.wasClick) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }
    blurHandler(event) {
        this.stopEvent(event);
        this.stopSearch();
    }
    inputHandler(event, nativeElement = this._element.nativeElement) {
        if (this.lastKeyCode === KEY_BUFFERED && event.data) {
            let keyCode = event.data.charCodeAt(0);
            this.keyHandler({ keyCode, inputEvent: true }, nativeElement);
        }
    }
    // @param nativeElement is the alternative text element in an iframe scenario
    keyHandler(event, nativeElement = this._element.nativeElement) {
        this.lastKeyCode = event.keyCode;
        if (event.isComposing || event.keyCode === KEY_BUFFERED) {
            return;
        }
        let val = getValue(nativeElement);
        let pos = getCaretPosition(nativeElement, this.iframe);
        let charPressed = event.key;
        if (!charPressed) {
            let charCode = event.which || event.keyCode;
            if (!event.shiftKey && (charCode >= 65 && charCode <= 90)) {
                charPressed = String.fromCharCode(charCode + 32);
            }
            // else if (event.shiftKey && charCode === KEY_2) {
            //   charPressed = this.config.triggerChar;
            // }
            else {
                // TODO (dmacfarlane) fix this for non-alpha keys
                // http://stackoverflow.com/questions/2220196/how-to-decode-character-pressed-from-jquerys-keydowns-event-handler?lq=1
                charPressed = String.fromCharCode(event.which || event.keyCode);
            }
        }
        if (event.keyCode == KEY_ENTER && event.wasClick && pos < this.startPos) {
            // put caret back in position prior to contenteditable menu click
            pos = this.startNode.length;
            setCaretPosition(this.startNode, pos, this.iframe);
        }
        //console.log("keyHandler", this.startPos, pos, val, charPressed, event);
        let config = this.triggerChars[charPressed];
        if (config) {
            this.activeConfig = config;
            this.startPos = event.inputEvent ? pos - 1 : pos;
            this.startNode = (this.iframe ? this.iframe.contentWindow.getSelection() : window.getSelection()).anchorNode;
            this.searching = true;
            this.searchString = null;
            this.showSearchList(nativeElement);
            this.updateSearchList();
            if (config.returnTrigger) {
                this.searchTerm.emit(config.triggerChar);
            }
        }
        else if (this.startPos >= 0 && this.searching) {
            if (pos <= this.startPos) {
                this.searchList.hidden = true;
            }
            // ignore shift when pressed alone, but not when used with another key
            else if (event.keyCode !== KEY_SHIFT &&
                !event.metaKey &&
                !event.altKey &&
                !event.ctrlKey &&
                pos > this.startPos) {
                if (!this.activeConfig.allowSpace && event.keyCode === KEY_SPACE) {
                    this.startPos = -1;
                }
                else if (event.keyCode === KEY_BACKSPACE && pos > 0) {
                    pos--;
                    if (pos == this.startPos) {
                        this.stopSearch();
                    }
                }
                else if (this.searchList.hidden) {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopSearch();
                        return;
                    }
                }
                else if (!this.searchList.hidden) {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopEvent(event);
                        // emit the selected list item
                        this.itemSelected.emit(this.searchList.activeItem);
                        // optional function to format the selected item before inserting the text
                        const text = this.activeConfig.mentionSelect(this.searchList.activeItem, this.activeConfig.triggerChar);
                        // value is inserted without a trailing space for consistency
                        // between element types (div and iframe do not preserve the space)
                        insertValue(nativeElement, this.startPos, pos, text, this.iframe);
                        // fire input event so angular bindings are updated
                        if ("createEvent" in document) {
                            let evt = document.createEvent("HTMLEvents");
                            if (this.iframe) {
                                // a 'change' event is required to trigger tinymce updates
                                evt.initEvent("change", true, false);
                            }
                            else {
                                evt.initEvent("input", true, false);
                            }
                            // this seems backwards, but fire the event from this elements nativeElement (not the
                            // one provided that may be in an iframe, as it won't be propogate)
                            this._element.nativeElement.dispatchEvent(evt);
                        }
                        this.startPos = -1;
                        this.stopSearch();
                        return false;
                    }
                    else if (event.keyCode === KEY_ESCAPE) {
                        this.stopEvent(event);
                        this.stopSearch();
                        return false;
                    }
                    else if (event.keyCode === KEY_DOWN) {
                        this.stopEvent(event);
                        this.searchList.activateNextItem();
                        return false;
                    }
                    else if (event.keyCode === KEY_UP) {
                        this.stopEvent(event);
                        this.searchList.activatePreviousItem();
                        return false;
                    }
                }
                if (charPressed.length != 1 && event.keyCode != KEY_BACKSPACE) {
                    this.stopEvent(event);
                    return false;
                }
                else if (this.searching) {
                    let mention = val.substring(this.startPos + 1, pos);
                    if (event.keyCode !== KEY_BACKSPACE && !event.inputEvent) {
                        mention += charPressed;
                    }
                    this.searchString = mention;
                    if (this.activeConfig.returnTrigger) {
                        const triggerChar = (this.searchString || event.keyCode === KEY_BACKSPACE) ? val.substring(this.startPos, this.startPos + 1) : '';
                        this.searchTerm.emit(triggerChar + this.searchString);
                    }
                    else {
                        this.searchTerm.emit(this.searchString);
                    }
                    this.updateSearchList();
                }
            }
        }
    }
    // exposed for external calls to open the mention list, e.g. by clicking a button
    startSearch(triggerChar, nativeElement = this._element.nativeElement) {
        triggerChar = triggerChar || this.mentionConfig.triggerChar || this.DEFAULT_CONFIG.triggerChar;
        const pos = getCaretPosition(nativeElement, this.iframe);
        insertValue(nativeElement, pos, pos, triggerChar, this.iframe);
        this.keyHandler({ key: triggerChar, inputEvent: true }, nativeElement);
    }
    stopSearch() {
        if (this.searchList && !this.searchList.hidden) {
            this.searchList.hidden = true;
            this.closed.emit();
        }
        this.activeConfig = null;
        this.searching = false;
    }
    updateSearchList() {
        let matches = [];
        if (this.activeConfig && this.activeConfig.items) {
            let objects = this.activeConfig.items;
            // disabling the search relies on the async operation to do the filtering
            if (!this.activeConfig.disableSearch && this.searchString && this.activeConfig.labelKey) {
                if (this.activeConfig.mentionFilter) {
                    objects = this.activeConfig.mentionFilter(this.searchString, objects);
                }
            }
            matches = objects;
            if (this.activeConfig.maxItems > 0) {
                matches = matches.slice(0, this.activeConfig.maxItems);
            }
        }
        // update the search list
        if (this.searchList) {
            this.searchList.items = matches;
            this.searchList.hidden = matches.length == 0;
        }
    }
    showSearchList(nativeElement) {
        this.opened.emit();
        if (this.searchList == null) {
            let componentFactory = this._componentResolver.resolveComponentFactory(MentionListComponent);
            let componentRef = this._viewContainerRef.createComponent(componentFactory);
            this.searchList = componentRef.instance;
            this.searchList.itemTemplate = this.mentionListTemplate;
            componentRef.instance['itemClick'].subscribe(() => {
                nativeElement.focus();
                let fakeKeydown = { key: 'Enter', keyCode: KEY_ENTER, wasClick: true };
                this.keyHandler(fakeKeydown, nativeElement);
            });
        }
        this.searchList.labelKey = this.activeConfig.labelKey;
        this.searchList.dropUp = this.activeConfig.dropUp;
        this.searchList.styleOff = this.mentionConfig.disableStyle;
        this.searchList.activeIndex = 0;
        this.searchList.position(nativeElement, this.iframe);
        this.afterPositioned.emit(nativeElement);
        window.requestAnimationFrame(() => this.searchList.reset());
    }
}
MentionDirective.ɵfac = function MentionDirective_Factory(t) { return new (t || MentionDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.ComponentFactoryResolver), i0.ɵɵdirectiveInject(i0.ViewContainerRef)); };
MentionDirective.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: MentionDirective, selectors: [["", "mention", ""], ["", "mentionConfig", ""]], hostAttrs: ["autocomplete", "off"], hostBindings: function MentionDirective_HostBindings(rf, ctx) { if (rf & 1) {
        i0.ɵɵlistener("keydown", function MentionDirective_keydown_HostBindingHandler($event) { return ctx.keyHandler($event); })("input", function MentionDirective_input_HostBindingHandler($event) { return ctx.inputHandler($event); })("blur", function MentionDirective_blur_HostBindingHandler($event) { return ctx.blurHandler($event); });
    } }, inputs: { mention: "mention", mentionConfig: "mentionConfig", mentionListTemplate: "mentionListTemplate" }, outputs: { searchTerm: "searchTerm", itemSelected: "itemSelected", opened: "opened", afterPositioned: "afterPositioned", closed: "closed" }, features: [i0.ɵɵNgOnChangesFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MentionDirective, [{
        type: Directive,
        args: [{
                selector: '[mention], [mentionConfig]',
                host: {
                    '(keydown)': 'keyHandler($event)',
                    '(input)': 'inputHandler($event)',
                    '(blur)': 'blurHandler($event)',
                    'autocomplete': 'off'
                }
            }]
    }], function () { return [{ type: i0.ElementRef }, { type: i0.ComponentFactoryResolver }, { type: i0.ViewContainerRef }]; }, { mention: [{
            type: Input,
            args: ['mention']
        }], mentionConfig: [{
            type: Input
        }], mentionListTemplate: [{
            type: Input
        }], searchTerm: [{
            type: Output
        }], itemSelected: [{
            type: Output
        }], opened: [{
            type: Output
        }], afterPositioned: [{
            type: Output
        }], closed: [{
            type: Output
        }] }); })();
=======
import { Directive } from "@angular/core";
import { EventEmitter, Input, Output } from "@angular/core";
import { getCaretPosition, getValue, insertValue, setCaretPosition } from './mention-utils';
import { MentionListComponent } from './mention-list.component';
import * as i0 from "@angular/core";
const KEY_BACKSPACE = 8;
const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_SHIFT = 16;
const KEY_ESCAPE = 27;
const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_BUFFERED = 229;
/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2017 Dan MacFarlane
 */
export class MentionDirective {
    constructor(_element, _componentResolver, _viewContainerRef) {
        this._element = _element;
        this._componentResolver = _componentResolver;
        this._viewContainerRef = _viewContainerRef;
        // the provided configuration object
        this.mentionConfig = { items: [] };
        this.DEFAULT_CONFIG = {
            items: [],
            triggerChar: '@',
            labelKey: 'label',
            maxItems: -1,
            allowSpace: false,
            returnTrigger: false,
            mentionSelect: (item, triggerChar) => {
                return this.activeConfig.triggerChar + item[this.activeConfig.labelKey];
            },
            mentionFilter: (searchString, items) => {
                const searchStringLowerCase = searchString.toLowerCase();
                return items.filter(e => e[this.activeConfig.labelKey].toLowerCase().startsWith(searchStringLowerCase));
            }
        };
        // event emitted whenever the search term changes
        this.searchTerm = new EventEmitter();
        // event emitted when an item is selected
        this.itemSelected = new EventEmitter();
        // event emitted whenever the mention list is opened or closed
        this.opened = new EventEmitter();
        this.afterPositioned = new EventEmitter();
        this.closed = new EventEmitter();
        this.triggerChars = {};
    }
    set mention(items) {
        this.mentionItems = items;
    }
    ngOnChanges(changes) {
        // console.log('config change', changes);
        if (changes['mention'] || changes['mentionConfig']) {
            this.updateConfig();
        }
    }
    updateConfig() {
        let config = this.mentionConfig;
        this.triggerChars = {};
        // use items from directive if they have been set
        if (this.mentionItems) {
            config.items = this.mentionItems;
        }
        this.addConfig(config);
        // nested configs
        if (config.mentions) {
            config.mentions.forEach(config => this.addConfig(config));
        }
    }
    // add configuration for a trigger char
    addConfig(config) {
        // defaults
        let defaults = Object.assign({}, this.DEFAULT_CONFIG);
        config = Object.assign(defaults, config);
        // items
        let items = config.items;
        if (items && items.length > 0) {
            // convert strings to objects
            if (typeof items[0] == 'string') {
                items = items.map((label) => {
                    let object = {};
                    object[config.labelKey] = label;
                    return object;
                });
            }
            if (config.labelKey) {
                // remove items without an labelKey (as it's required to filter the list)
                items = items.filter(e => e[config.labelKey]);
                if (!config.disableSort) {
                    items.sort((a, b) => a[config.labelKey].localeCompare(b[config.labelKey]));
                }
            }
        }
        config.items = items;
        // add the config
        this.triggerChars[config.triggerChar] = config;
        // for async update while menu/search is active
        if (this.activeConfig && this.activeConfig.triggerChar == config.triggerChar) {
            this.activeConfig = config;
            this.updateSearchList();
        }
    }
    setIframe(iframe) {
        this.iframe = iframe;
    }
    stopEvent(event) {
        //if (event instanceof KeyboardEvent) { // does not work for iframe
        if (!event.wasClick) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }
    blurHandler(event) {
        this.stopEvent(event);
        this.stopSearch();
    }
    inputHandler(event, nativeElement = this._element.nativeElement) {
        if (this.lastKeyCode === KEY_BUFFERED && event.data) {
            let keyCode = event.data.charCodeAt(0);
            this.keyHandler({ keyCode, inputEvent: true }, nativeElement);
        }
    }
    // @param nativeElement is the alternative text element in an iframe scenario
    keyHandler(event, nativeElement = this._element.nativeElement) {
        this.lastKeyCode = event.keyCode;
        if (event.isComposing || event.keyCode === KEY_BUFFERED) {
            return;
        }
        let val = getValue(nativeElement);
        let pos = getCaretPosition(nativeElement, this.iframe);
        let charPressed = event.key;
        if (!charPressed) {
            let charCode = event.which || event.keyCode;
            if (!event.shiftKey && (charCode >= 65 && charCode <= 90)) {
                charPressed = String.fromCharCode(charCode + 32);
            }
            // else if (event.shiftKey && charCode === KEY_2) {
            //   charPressed = this.config.triggerChar;
            // }
            else {
                // TODO (dmacfarlane) fix this for non-alpha keys
                // http://stackoverflow.com/questions/2220196/how-to-decode-character-pressed-from-jquerys-keydowns-event-handler?lq=1
                charPressed = String.fromCharCode(event.which || event.keyCode);
            }
        }
        if (event.keyCode == KEY_ENTER && event.wasClick && pos < this.startPos) {
            // put caret back in position prior to contenteditable menu click
            pos = this.startNode.length;
            setCaretPosition(this.startNode, pos, this.iframe);
        }
        //console.log("keyHandler", this.startPos, pos, val, charPressed, event);
        let config = this.triggerChars[charPressed];
        if (config) {
            this.activeConfig = config;
            this.startPos = event.inputEvent ? pos - 1 : pos;
            this.startNode = (this.iframe ? this.iframe.contentWindow.getSelection() : window.getSelection()).anchorNode;
            this.searching = true;
            this.searchString = null;
            this.showSearchList(nativeElement);
            this.updateSearchList();
            if (config.returnTrigger) {
                this.searchTerm.emit(config.triggerChar);
            }
        }
        else if (this.startPos >= 0 && this.searching) {
            if (pos <= this.startPos) {
                this.searchList.hidden = true;
            }
            // ignore shift when pressed alone, but not when used with another key
            else if (event.keyCode !== KEY_SHIFT &&
                !event.metaKey &&
                !event.altKey &&
                !event.ctrlKey &&
                pos > this.startPos) {
                if (!this.activeConfig.allowSpace && event.keyCode === KEY_SPACE) {
                    this.startPos = -1;
                }
                else if (event.keyCode === KEY_BACKSPACE && pos > 0) {
                    pos--;
                    if (pos == this.startPos) {
                        this.stopSearch();
                    }
                }
                else if (this.searchList.hidden) {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopSearch();
                        return;
                    }
                }
                else if (!this.searchList.hidden) {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopEvent(event);
                        // emit the selected list item
                        this.itemSelected.emit(this.searchList.activeItem);
                        // optional function to format the selected item before inserting the text
                        const text = this.activeConfig.mentionSelect(this.searchList.activeItem, this.activeConfig.triggerChar);
                        // value is inserted without a trailing space for consistency
                        // between element types (div and iframe do not preserve the space)
                        insertValue(nativeElement, this.startPos, pos, text, this.iframe);
                        // fire input event so angular bindings are updated
                        if ("createEvent" in document) {
                            let evt = document.createEvent("HTMLEvents");
                            if (this.iframe) {
                                // a 'change' event is required to trigger tinymce updates
                                evt.initEvent("change", true, false);
                            }
                            else {
                                evt.initEvent("input", true, false);
                            }
                            // this seems backwards, but fire the event from this elements nativeElement (not the
                            // one provided that may be in an iframe, as it won't be propogate)
                            this._element.nativeElement.dispatchEvent(evt);
                        }
                        this.startPos = -1;
                        this.stopSearch();
                        return false;
                    }
                    else if (event.keyCode === KEY_ESCAPE) {
                        this.stopEvent(event);
                        this.stopSearch();
                        return false;
                    }
                    else if (event.keyCode === KEY_DOWN) {
                        this.stopEvent(event);
                        this.searchList.activateNextItem();
                        return false;
                    }
                    else if (event.keyCode === KEY_UP) {
                        this.stopEvent(event);
                        this.searchList.activatePreviousItem();
                        return false;
                    }
                }
                if (charPressed.length != 1 && event.keyCode != KEY_BACKSPACE) {
                    this.stopEvent(event);
                    return false;
                }
                else if (this.searching) {
                    let mention = val.substring(this.startPos + 1, pos);
                    if (event.keyCode !== KEY_BACKSPACE && !event.inputEvent) {
                        mention += charPressed;
                    }
                    this.searchString = mention;
                    if (this.activeConfig.returnTrigger) {
                        const triggerChar = (this.searchString || event.keyCode === KEY_BACKSPACE) ? val.substring(this.startPos, this.startPos + 1) : '';
                        this.searchTerm.emit(triggerChar + this.searchString);
                    }
                    else {
                        this.searchTerm.emit(this.searchString);
                    }
                    this.updateSearchList();
                }
            }
        }
    }
    // exposed for external calls to open the mention list, e.g. by clicking a button
    startSearch(triggerChar, nativeElement = this._element.nativeElement) {
        triggerChar = triggerChar || this.mentionConfig.triggerChar || this.DEFAULT_CONFIG.triggerChar;
        const pos = getCaretPosition(nativeElement, this.iframe);
        insertValue(nativeElement, pos, pos, triggerChar, this.iframe);
        this.keyHandler({ key: triggerChar, inputEvent: true }, nativeElement);
    }
    stopSearch() {
        if (this.searchList && !this.searchList.hidden) {
            this.searchList.hidden = true;
            this.closed.emit();
        }
        this.activeConfig = null;
        this.searching = false;
    }
    updateSearchList() {
        let matches = [];
        if (this.activeConfig && this.activeConfig.items) {
            let objects = this.activeConfig.items;
            // disabling the search relies on the async operation to do the filtering
            if (!this.activeConfig.disableSearch && this.searchString && this.activeConfig.labelKey) {
                if (this.activeConfig.mentionFilter) {
                    objects = this.activeConfig.mentionFilter(this.searchString, objects);
                }
            }
            matches = objects;
            if (this.activeConfig.maxItems > 0) {
                matches = matches.slice(0, this.activeConfig.maxItems);
            }
        }
        // update the search list
        if (this.searchList) {
            this.searchList.items = matches;
            this.searchList.hidden = matches.length == 0;
        }
    }
    showSearchList(nativeElement) {
        this.opened.emit();
        if (this.searchList == null) {
            let componentFactory = this._componentResolver.resolveComponentFactory(MentionListComponent);
            let componentRef = this._viewContainerRef.createComponent(componentFactory);
            this.searchList = componentRef.instance;
            this.searchList.itemTemplate = this.mentionListTemplate;
            componentRef.instance['itemClick'].subscribe(() => {
                nativeElement.focus();
                let fakeKeydown = { key: 'Enter', keyCode: KEY_ENTER, wasClick: true };
                this.keyHandler(fakeKeydown, nativeElement);
            });
        }
        this.searchList.labelKey = this.activeConfig.labelKey;
        this.searchList.dropUp = this.activeConfig.dropUp;
        this.searchList.styleOff = this.mentionConfig.disableStyle;
        this.searchList.activeIndex = 0;
        this.searchList.position(nativeElement, this.iframe);
        this.afterPositioned.emit(nativeElement);
        window.requestAnimationFrame(() => this.searchList.reset());
    }
}
MentionDirective.ɵfac = function MentionDirective_Factory(t) { return new (t || MentionDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.ComponentFactoryResolver), i0.ɵɵdirectiveInject(i0.ViewContainerRef)); };
MentionDirective.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: MentionDirective, selectors: [["", "mention", ""], ["", "mentionConfig", ""]], hostAttrs: ["autocomplete", "off"], hostBindings: function MentionDirective_HostBindings(rf, ctx) { if (rf & 1) {
        i0.ɵɵlistener("keydown", function MentionDirective_keydown_HostBindingHandler($event) { return ctx.keyHandler($event); })("input", function MentionDirective_input_HostBindingHandler($event) { return ctx.inputHandler($event); })("blur", function MentionDirective_blur_HostBindingHandler($event) { return ctx.blurHandler($event); });
    } }, inputs: { mention: "mention", mentionConfig: "mentionConfig", mentionListTemplate: "mentionListTemplate" }, outputs: { searchTerm: "searchTerm", itemSelected: "itemSelected", opened: "opened", afterPositioned: "afterPositioned", closed: "closed" }, features: [i0.ɵɵNgOnChangesFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MentionDirective, [{
        type: Directive,
        args: [{
                selector: '[mention], [mentionConfig]',
                host: {
                    '(keydown)': 'keyHandler($event)',
                    '(input)': 'inputHandler($event)',
                    '(blur)': 'blurHandler($event)',
                    'autocomplete': 'off'
                }
            }]
    }], function () { return [{ type: i0.ElementRef }, { type: i0.ComponentFactoryResolver }, { type: i0.ViewContainerRef }]; }, { mention: [{
            type: Input,
            args: ['mention']
        }], mentionConfig: [{
            type: Input
        }], mentionListTemplate: [{
            type: Input
        }], searchTerm: [{
            type: Output
        }], itemSelected: [{
            type: Output
        }], opened: [{
            type: Output
        }], afterPositioned: [{
            type: Output
        }], closed: [{
            type: Output
        }] }); })();
>>>>>>> 4b11fe9 (dist)
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLW1lbnRpb25zL3NyYy9saWIvbWVudGlvbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUE0QixTQUFTLEVBQTZDLE1BQU0sZUFBZSxDQUFDO0FBQy9HLE9BQU8sRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFhLE1BQU0sRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFDdEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUc1RixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQzs7QUFFaEUsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNsQixNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDckIsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUN0QixNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDckIsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNsQixNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDckIsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQztBQUV6Qjs7Ozs7R0FLRztBQVVILE1BQU0sT0FBTyxnQkFBZ0I7SUFzRDNCLFlBQ1UsUUFBb0IsRUFDcEIsa0JBQTRDLEVBQzVDLGlCQUFtQztRQUZuQyxhQUFRLEdBQVIsUUFBUSxDQUFZO1FBQ3BCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBMEI7UUFDNUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFr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ZixNQUFNO1lBQ0csZUFBZTtrQkFBeEIsTUFBTTtZQUNHLE1BQU07a0JBQWYsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uQ2hhbmdlcywgT3V0cHV0LCBTaW1wbGVDaGFuZ2VzIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHsgZ2V0Q2FyZXRQb3NpdGlvbiwgZ2V0VmFsdWUsIGluc2VydFZhbHVlLCBzZXRDYXJldFBvc2l0aW9uIH0gZnJvbSAnLi9tZW50aW9uLXV0aWxzJztcclxuXHJcbmltcG9ydCB7IE1lbnRpb25Db25maWcgfSBmcm9tIFwiLi9tZW50aW9uLWNvbmZpZ1wiO1xyXG5pbXBvcnQgeyBNZW50aW9uTGlzdENvbXBvbmVudCB9IGZyb20gJy4vbWVudGlvbi1saXN0LmNvbXBvbmVudCc7XHJcblxyXG5jb25zdCBLRVlfQkFDS1NQQUNFID0gODtcclxuY29uc3QgS0VZX1RBQiA9IDk7XHJcbmNvbnN0IEtFWV9FTlRFUiA9IDEzO1xyXG5jb25zdCBLRVlfU0hJRlQgPSAxNjtcclxuY29uc3QgS0VZX0VTQ0FQRSA9IDI3O1xyXG5jb25zdCBLRVlfU1BBQ0UgPSAzMjtcclxuY29uc3QgS0VZX0xFRlQgPSAzNztcclxuY29uc3QgS0VZX1VQID0gMzg7XHJcbmNvbnN0IEtFWV9SSUdIVCA9IDM5O1xyXG5jb25zdCBLRVlfRE9XTiA9IDQwO1xyXG5jb25zdCBLRVlfQlVGRkVSRUQgPSAyMjk7XHJcblxyXG4vKipcclxuICogQW5ndWxhciBNZW50aW9ucy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL2RtYWNmYXJsYW5lL2FuZ3VsYXItbWVudGlvbnNcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IERhbiBNYWNGYXJsYW5lXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1ttZW50aW9uXSwgW21lbnRpb25Db25maWddJyxcclxuICBob3N0OiB7XHJcbiAgICAnKGtleWRvd24pJzogJ2tleUhhbmRsZXIoJGV2ZW50KScsXHJcbiAgICAnKGlucHV0KSc6ICdpbnB1dEhhbmRsZXIoJGV2ZW50KScsXHJcbiAgICAnKGJsdXIpJzogJ2JsdXJIYW5kbGVyKCRldmVudCknLFxyXG4gICAgJ2F1dG9jb21wbGV0ZSc6ICdvZmYnXHJcbiAgfVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTWVudGlvbkRpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XHJcblxyXG4gIC8vIHN0b3JlcyB0aGUgaXRlbXMgcGFzc2VkIHRvIHRoZSBtZW50aW9ucyBkaXJlY3RpdmUgYW5kIHVzZWQgdG8gcG9wdWxhdGUgdGhlIHJvb3QgaXRlbXMgaW4gbWVudGlvbkNvbmZpZ1xyXG4gIHByaXZhdGUgbWVudGlvbkl0ZW1zOiBhbnlbXTtcclxuXHJcbiAgQElucHV0KCdtZW50aW9uJykgc2V0IG1lbnRpb24oaXRlbXM6IGFueVtdKSB7XHJcbiAgICB0aGlzLm1lbnRpb25JdGVtcyA9IGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgLy8gdGhlIHByb3ZpZGVkIGNvbmZpZ3VyYXRpb24gb2JqZWN0XHJcbiAgQElucHV0KCkgbWVudGlvbkNvbmZpZzogTWVudGlvbkNvbmZpZyA9IHsgaXRlbXM6IFtdIH07XHJcblxyXG4gIHByaXZhdGUgYWN0aXZlQ29uZmlnOiBNZW50aW9uQ29uZmlnO1xyXG5cclxuICBwcml2YXRlIERFRkFVTFRfQ09ORklHOiBNZW50aW9uQ29uZmlnID0ge1xyXG4gICAgaXRlbXM6IFtdLFxyXG4gICAgdHJpZ2dlckNoYXI6ICdAJyxcclxuICAgIGxhYmVsS2V5OiAnbGFiZWwnLFxyXG4gICAgbWF4SXRlbXM6IC0xLFxyXG4gICAgYWxsb3dTcGFjZTogZmFsc2UsXHJcbiAgICByZXR1cm5UcmlnZ2VyOiBmYWxzZSxcclxuICAgIG1lbnRpb25TZWxlY3Q6IChpdGVtOiBhbnksIHRyaWdnZXJDaGFyPzogc3RyaW5nKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFjdGl2ZUNvbmZpZy50cmlnZ2VyQ2hhciArIGl0ZW1bdGhpcy5hY3RpdmVDb25maWcubGFiZWxLZXldO1xyXG4gICAgfSxcclxuICAgIG1lbnRpb25GaWx0ZXI6IChzZWFyY2hTdHJpbmc6IHN0cmluZywgaXRlbXM6IGFueVtdKSA9PiB7XHJcbiAgICAgIGNvbnN0IHNlYXJjaFN0cmluZ0xvd2VyQ2FzZSA9IHNlYXJjaFN0cmluZy50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICByZXR1cm4gaXRlbXMuZmlsdGVyKGUgPT4gZVt0aGlzLmFjdGl2ZUNvbmZpZy5sYWJlbEtleV0udG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKHNlYXJjaFN0cmluZ0xvd2VyQ2FzZSkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gdGVtcGxhdGUgdG8gdXNlIGZvciByZW5kZXJpbmcgbGlzdCBpdGVtc1xyXG4gIEBJbnB1dCgpIG1lbnRpb25MaXN0VGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gIC8vIGV2ZW50IGVtaXR0ZWQgd2hlbmV2ZXIgdGhlIHNlYXJjaCB0ZXJtIGNoYW5nZXNcclxuICBAT3V0cHV0KCkgc2VhcmNoVGVybSA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xyXG5cclxuICAvLyBldmVudCBlbWl0dGVkIHdoZW4gYW4gaXRlbSBpcyBzZWxlY3RlZFxyXG4gIEBPdXRwdXQoKSBpdGVtU2VsZWN0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuXHJcbiAgLy8gZXZlbnQgZW1pdHRlZCB3aGVuZXZlciB0aGUgbWVudGlvbiBsaXN0IGlzIG9wZW5lZCBvciBjbG9zZWRcclxuICBAT3V0cHV0KCkgb3BlbmVkID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBhZnRlclBvc2l0aW9uZWQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgY2xvc2VkID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICBwcml2YXRlIHRyaWdnZXJDaGFyczogeyBba2V5OiBzdHJpbmddOiBNZW50aW9uQ29uZmlnIH0gPSB7fTtcclxuXHJcbiAgcHJpdmF0ZSBzZWFyY2hTdHJpbmc6IHN0cmluZztcclxuICBwcml2YXRlIHN0YXJ0UG9zOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBzdGFydE5vZGU7XHJcbiAgcHJpdmF0ZSBzZWFyY2hMaXN0OiBNZW50aW9uTGlzdENvbXBvbmVudDtcclxuICBwcml2YXRlIHNlYXJjaGluZzogYm9vbGVhbjtcclxuICBwcml2YXRlIGlmcmFtZTogYW55OyAvLyBvcHRpb25hbFxyXG4gIHByaXZhdGUgbGFzdEtleUNvZGU6IG51bWJlcjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIF9lbGVtZW50OiBFbGVtZW50UmVmLFxyXG4gICAgcHJpdmF0ZSBfY29tcG9uZW50UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcclxuICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWZcclxuICApIHsgfVxyXG5cclxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZygnY29uZmlnIGNoYW5nZScsIGNoYW5nZXMpO1xyXG4gICAgaWYgKGNoYW5nZXNbJ21lbnRpb24nXSB8fCBjaGFuZ2VzWydtZW50aW9uQ29uZmlnJ10pIHtcclxuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVDb25maWcoKSB7XHJcbiAgICBsZXQgY29uZmlnID0gdGhpcy5tZW50aW9uQ29uZmlnO1xyXG4gICAgdGhpcy50cmlnZ2VyQ2hhcnMgPSB7fTtcclxuICAgIC8vIHVzZSBpdGVtcyBmcm9tIGRpcmVjdGl2ZSBpZiB0aGV5IGhhdmUgYmVlbiBzZXRcclxuICAgIGlmICh0aGlzLm1lbnRpb25JdGVtcykge1xyXG4gICAgICBjb25maWcuaXRlbXMgPSB0aGlzLm1lbnRpb25JdGVtcztcclxuICAgIH1cclxuICAgIHRoaXMuYWRkQ29uZmlnKGNvbmZpZyk7XHJcbiAgICAvLyBuZXN0ZWQgY29uZmlnc1xyXG4gICAgaWYgKGNvbmZpZy5tZW50aW9ucykge1xyXG4gICAgICBjb25maWcubWVudGlvbnMuZm9yRWFjaChjb25maWcgPT4gdGhpcy5hZGRDb25maWcoY29uZmlnKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBhZGQgY29uZmlndXJhdGlvbiBmb3IgYSB0cmlnZ2VyIGNoYXJcclxuICBwcml2YXRlIGFkZENvbmZpZyhjb25maWc6IE1lbnRpb25Db25maWcpIHtcclxuICAgIC8vIGRlZmF1bHRzXHJcbiAgICBsZXQgZGVmYXVsdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLkRFRkFVTFRfQ09ORklHKTtcclxuICAgIGNvbmZpZyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIGNvbmZpZyk7XHJcbiAgICAvLyBpdGVtc1xyXG4gICAgbGV0IGl0ZW1zID0gY29uZmlnLml0ZW1zO1xyXG4gICAgaWYgKGl0ZW1zICYmIGl0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgLy8gY29udmVydCBzdHJpbmdzIHRvIG9iamVjdHNcclxuICAgICAgaWYgKHR5cGVvZiBpdGVtc1swXSA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGl0ZW1zID0gaXRlbXMubWFwKChsYWJlbCkgPT4ge1xyXG4gICAgICAgICAgbGV0IG9iamVjdCA9IHt9O1xyXG4gICAgICAgICAgb2JqZWN0W2NvbmZpZy5sYWJlbEtleV0gPSBsYWJlbDtcclxuICAgICAgICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGNvbmZpZy5sYWJlbEtleSkge1xyXG4gICAgICAgIC8vIHJlbW92ZSBpdGVtcyB3aXRob3V0IGFuIGxhYmVsS2V5IChhcyBpdCdzIHJlcXVpcmVkIHRvIGZpbHRlciB0aGUgbGlzdClcclxuICAgICAgICBpdGVtcyA9IGl0ZW1zLmZpbHRlcihlID0+IGVbY29uZmlnLmxhYmVsS2V5XSk7XHJcbiAgICAgICAgaWYgKCFjb25maWcuZGlzYWJsZVNvcnQpIHtcclxuICAgICAgICAgIGl0ZW1zLnNvcnQoKGEsIGIpID0+IGFbY29uZmlnLmxhYmVsS2V5XS5sb2NhbGVDb21wYXJlKGJbY29uZmlnLmxhYmVsS2V5XSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uZmlnLml0ZW1zID0gaXRlbXM7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBjb25maWdcclxuICAgIHRoaXMudHJpZ2dlckNoYXJzW2NvbmZpZy50cmlnZ2VyQ2hhcl0gPSBjb25maWc7XHJcblxyXG4gICAgLy8gZm9yIGFzeW5jIHVwZGF0ZSB3aGlsZSBtZW51L3NlYXJjaCBpcyBhY3RpdmVcclxuICAgIGlmICh0aGlzLmFjdGl2ZUNvbmZpZyAmJiB0aGlzLmFjdGl2ZUNvbmZpZy50cmlnZ2VyQ2hhciA9PSBjb25maWcudHJpZ2dlckNoYXIpIHtcclxuICAgICAgdGhpcy5hY3RpdmVDb25maWcgPSBjb25maWc7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VhcmNoTGlzdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0SWZyYW1lKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpIHtcclxuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xyXG4gIH1cclxuXHJcbiAgc3RvcEV2ZW50KGV2ZW50OiBhbnkpIHtcclxuICAgIC8vaWYgKGV2ZW50IGluc3RhbmNlb2YgS2V5Ym9hcmRFdmVudCkgeyAvLyBkb2VzIG5vdCB3b3JrIGZvciBpZnJhbWVcclxuICAgIGlmICghZXZlbnQud2FzQ2xpY2spIHtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYmx1ckhhbmRsZXIoZXZlbnQ6IGFueSkge1xyXG4gICAgdGhpcy5zdG9wRXZlbnQoZXZlbnQpO1xyXG4gICAgdGhpcy5zdG9wU2VhcmNoKCk7XHJcbiAgfVxyXG5cclxuICBpbnB1dEhhbmRsZXIoZXZlbnQ6IGFueSwgbmF0aXZlRWxlbWVudDogSFRNTElucHV0RWxlbWVudCA9IHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudCkge1xyXG4gICAgaWYgKHRoaXMubGFzdEtleUNvZGUgPT09IEtFWV9CVUZGRVJFRCAmJiBldmVudC5kYXRhKSB7XHJcbiAgICAgIGxldCBrZXlDb2RlID0gZXZlbnQuZGF0YS5jaGFyQ29kZUF0KDApO1xyXG4gICAgICB0aGlzLmtleUhhbmRsZXIoeyBrZXlDb2RlLCBpbnB1dEV2ZW50OiB0cnVlIH0sIG5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHBhcmFtIG5hdGl2ZUVsZW1lbnQgaXMgdGhlIGFsdGVybmF0aXZlIHRleHQgZWxlbWVudCBpbiBhbiBpZnJhbWUgc2NlbmFyaW9cclxuICBrZXlIYW5kbGVyKGV2ZW50OiBhbnksIG5hdGl2ZUVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQgPSB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQpIHtcclxuICAgIHRoaXMubGFzdEtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xyXG5cclxuICAgIGlmIChldmVudC5pc0NvbXBvc2luZyB8fCBldmVudC5rZXlDb2RlID09PSBLRVlfQlVGRkVSRUQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB2YWw6IHN0cmluZyA9IGdldFZhbHVlKG5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgbGV0IHBvcyA9IGdldENhcmV0UG9zaXRpb24obmF0aXZlRWxlbWVudCwgdGhpcy5pZnJhbWUpO1xyXG4gICAgbGV0IGNoYXJQcmVzc2VkID0gZXZlbnQua2V5O1xyXG4gICAgaWYgKCFjaGFyUHJlc3NlZCkge1xyXG4gICAgICBsZXQgY2hhckNvZGUgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xyXG4gICAgICBpZiAoIWV2ZW50LnNoaWZ0S2V5ICYmIChjaGFyQ29kZSA+PSA2NSAmJiBjaGFyQ29kZSA8PSA5MCkpIHtcclxuICAgICAgICBjaGFyUHJlc3NlZCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUgKyAzMik7XHJcbiAgICAgIH1cclxuICAgICAgLy8gZWxzZSBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgY2hhckNvZGUgPT09IEtFWV8yKSB7XHJcbiAgICAgIC8vICAgY2hhclByZXNzZWQgPSB0aGlzLmNvbmZpZy50cmlnZ2VyQ2hhcjtcclxuICAgICAgLy8gfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBUT0RPIChkbWFjZmFybGFuZSkgZml4IHRoaXMgZm9yIG5vbi1hbHBoYSBrZXlzXHJcbiAgICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMjIwMTk2L2hvdy10by1kZWNvZGUtY2hhcmFjdGVyLXByZXNzZWQtZnJvbS1qcXVlcnlzLWtleWRvd25zLWV2ZW50LWhhbmRsZXI/bHE9MVxyXG4gICAgICAgIGNoYXJQcmVzc2VkID0gU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT0gS0VZX0VOVEVSICYmIGV2ZW50Lndhc0NsaWNrICYmIHBvcyA8IHRoaXMuc3RhcnRQb3MpIHtcclxuICAgICAgLy8gcHV0IGNhcmV0IGJhY2sgaW4gcG9zaXRpb24gcHJpb3IgdG8gY29udGVudGVkaXRhYmxlIG1lbnUgY2xpY2tcclxuICAgICAgcG9zID0gdGhpcy5zdGFydE5vZGUubGVuZ3RoO1xyXG4gICAgICBzZXRDYXJldFBvc2l0aW9uKHRoaXMuc3RhcnROb2RlLCBwb3MsIHRoaXMuaWZyYW1lKTtcclxuICAgIH1cclxuICAgIC8vY29uc29sZS5sb2coXCJrZXlIYW5kbGVyXCIsIHRoaXMuc3RhcnRQb3MsIHBvcywgdmFsLCBjaGFyUHJlc3NlZCwgZXZlbnQpO1xyXG5cclxuICAgIGxldCBjb25maWcgPSB0aGlzLnRyaWdnZXJDaGFyc1tjaGFyUHJlc3NlZF07XHJcbiAgICBpZiAoY29uZmlnKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlQ29uZmlnID0gY29uZmlnO1xyXG4gICAgICB0aGlzLnN0YXJ0UG9zID0gZXZlbnQuaW5wdXRFdmVudCA/IHBvcyAtIDEgOiBwb3M7XHJcbiAgICAgIHRoaXMuc3RhcnROb2RlID0gKHRoaXMuaWZyYW1lID8gdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5nZXRTZWxlY3Rpb24oKSA6IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSkuYW5jaG9yTm9kZTtcclxuICAgICAgdGhpcy5zZWFyY2hpbmcgPSB0cnVlO1xyXG4gICAgICB0aGlzLnNlYXJjaFN0cmluZyA9IG51bGw7XHJcbiAgICAgIHRoaXMuc2hvd1NlYXJjaExpc3QobmF0aXZlRWxlbWVudCk7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VhcmNoTGlzdCgpO1xyXG5cclxuICAgICAgaWYgKGNvbmZpZy5yZXR1cm5UcmlnZ2VyKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hUZXJtLmVtaXQoY29uZmlnLnRyaWdnZXJDaGFyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGhpcy5zdGFydFBvcyA+PSAwICYmIHRoaXMuc2VhcmNoaW5nKSB7XHJcbiAgICAgIGlmIChwb3MgPD0gdGhpcy5zdGFydFBvcykge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoTGlzdC5oaWRkZW4gPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIGlnbm9yZSBzaGlmdCB3aGVuIHByZXNzZWQgYWxvbmUsIGJ1dCBub3Qgd2hlbiB1c2VkIHdpdGggYW5vdGhlciBrZXlcclxuICAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSAhPT0gS0VZX1NISUZUICYmXHJcbiAgICAgICAgIWV2ZW50Lm1ldGFLZXkgJiZcclxuICAgICAgICAhZXZlbnQuYWx0S2V5ICYmXHJcbiAgICAgICAgIWV2ZW50LmN0cmxLZXkgJiZcclxuICAgICAgICBwb3MgPiB0aGlzLnN0YXJ0UG9zXHJcbiAgICAgICkge1xyXG4gICAgICAgIGlmICghdGhpcy5hY3RpdmVDb25maWcuYWxsb3dTcGFjZSAmJiBldmVudC5rZXlDb2RlID09PSBLRVlfU1BBQ0UpIHtcclxuICAgICAgICAgIHRoaXMuc3RhcnRQb3MgPSAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gS0VZX0JBQ0tTUEFDRSAmJiBwb3MgPiAwKSB7XHJcbiAgICAgICAgICBwb3MtLTtcclxuICAgICAgICAgIGlmIChwb3MgPT0gdGhpcy5zdGFydFBvcykge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BTZWFyY2goKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5zZWFyY2hMaXN0LmhpZGRlbikge1xyXG4gICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IEtFWV9UQUIgfHwgZXZlbnQua2V5Q29kZSA9PT0gS0VZX0VOVEVSKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcFNlYXJjaCgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLnNlYXJjaExpc3QuaGlkZGVuKSB7XHJcbiAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gS0VZX1RBQiB8fCBldmVudC5rZXlDb2RlID09PSBLRVlfRU5URVIpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICAvLyBlbWl0IHRoZSBzZWxlY3RlZCBsaXN0IGl0ZW1cclxuICAgICAgICAgICAgdGhpcy5pdGVtU2VsZWN0ZWQuZW1pdCh0aGlzLnNlYXJjaExpc3QuYWN0aXZlSXRlbSk7XHJcbiAgICAgICAgICAgIC8vIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIGZvcm1hdCB0aGUgc2VsZWN0ZWQgaXRlbSBiZWZvcmUgaW5zZXJ0aW5nIHRoZSB0ZXh0XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmFjdGl2ZUNvbmZpZy5tZW50aW9uU2VsZWN0KHRoaXMuc2VhcmNoTGlzdC5hY3RpdmVJdGVtLCB0aGlzLmFjdGl2ZUNvbmZpZy50cmlnZ2VyQ2hhcik7XHJcbiAgICAgICAgICAgIC8vIHZhbHVlIGlzIGluc2VydGVkIHdpdGhvdXQgYSB0cmFpbGluZyBzcGFjZSBmb3IgY29uc2lzdGVuY3lcclxuICAgICAgICAgICAgLy8gYmV0d2VlbiBlbGVtZW50IHR5cGVzIChkaXYgYW5kIGlmcmFtZSBkbyBub3QgcHJlc2VydmUgdGhlIHNwYWNlKVxyXG4gICAgICAgICAgICBpbnNlcnRWYWx1ZShuYXRpdmVFbGVtZW50LCB0aGlzLnN0YXJ0UG9zLCBwb3MsIHRleHQsIHRoaXMuaWZyYW1lKTtcclxuICAgICAgICAgICAgLy8gZmlyZSBpbnB1dCBldmVudCBzbyBhbmd1bGFyIGJpbmRpbmdzIGFyZSB1cGRhdGVkXHJcbiAgICAgICAgICAgIGlmIChcImNyZWF0ZUV2ZW50XCIgaW4gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICBsZXQgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJIVE1MRXZlbnRzXCIpO1xyXG4gICAgICAgICAgICAgIGlmICh0aGlzLmlmcmFtZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYSAnY2hhbmdlJyBldmVudCBpcyByZXF1aXJlZCB0byB0cmlnZ2VyIHRpbnltY2UgdXBkYXRlc1xyXG4gICAgICAgICAgICAgICAgZXZ0LmluaXRFdmVudChcImNoYW5nZVwiLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZXZ0LmluaXRFdmVudChcImlucHV0XCIsIHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gdGhpcyBzZWVtcyBiYWNrd2FyZHMsIGJ1dCBmaXJlIHRoZSBldmVudCBmcm9tIHRoaXMgZWxlbWVudHMgbmF0aXZlRWxlbWVudCAobm90IHRoZVxyXG4gICAgICAgICAgICAgIC8vIG9uZSBwcm92aWRlZCB0aGF0IG1heSBiZSBpbiBhbiBpZnJhbWUsIGFzIGl0IHdvbid0IGJlIHByb3BvZ2F0ZSlcclxuICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuZGlzcGF0Y2hFdmVudChldnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRQb3MgPSAtMTtcclxuICAgICAgICAgICAgdGhpcy5zdG9wU2VhcmNoKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IEtFWV9FU0NBUEUpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BTZWFyY2goKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gS0VZX0RPV04pIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaExpc3QuYWN0aXZhdGVOZXh0SXRlbSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSBLRVlfVVApIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaExpc3QuYWN0aXZhdGVQcmV2aW91c0l0ZW0oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNoYXJQcmVzc2VkLmxlbmd0aCE9MSAmJiBldmVudC5rZXlDb2RlIT1LRVlfQkFDS1NQQUNFKSB7XHJcbiAgICAgICAgICB0aGlzLnN0b3BFdmVudChldmVudCk7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc2VhcmNoaW5nKSB7XHJcbiAgICAgICAgICBsZXQgbWVudGlvbiA9IHZhbC5zdWJzdHJpbmcodGhpcy5zdGFydFBvcyArIDEsIHBvcyk7XHJcbiAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSAhPT0gS0VZX0JBQ0tTUEFDRSAmJiAhZXZlbnQuaW5wdXRFdmVudCkge1xyXG4gICAgICAgICAgICBtZW50aW9uICs9IGNoYXJQcmVzc2VkO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5zZWFyY2hTdHJpbmcgPSBtZW50aW9uO1xyXG4gICAgICAgICAgaWYgKHRoaXMuYWN0aXZlQ29uZmlnLnJldHVyblRyaWdnZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgdHJpZ2dlckNoYXIgPSAodGhpcy5zZWFyY2hTdHJpbmcgfHwgZXZlbnQua2V5Q29kZSA9PT0gS0VZX0JBQ0tTUEFDRSkgPyB2YWwuc3Vic3RyaW5nKHRoaXMuc3RhcnRQb3MsIHRoaXMuc3RhcnRQb3MgKyAxKSA6ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaFRlcm0uZW1pdCh0cmlnZ2VyQ2hhciArIHRoaXMuc2VhcmNoU3RyaW5nKTtcclxuICAgICAgICAgIH0gXHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hUZXJtLmVtaXQodGhpcy5zZWFyY2hTdHJpbmcpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy51cGRhdGVTZWFyY2hMaXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBleHBvc2VkIGZvciBleHRlcm5hbCBjYWxscyB0byBvcGVuIHRoZSBtZW50aW9uIGxpc3QsIGUuZy4gYnkgY2xpY2tpbmcgYSBidXR0b25cclxuICBwdWJsaWMgc3RhcnRTZWFyY2godHJpZ2dlckNoYXI/OiBzdHJpbmcsIG5hdGl2ZUVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQgPSB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQpIHtcclxuICAgIHRyaWdnZXJDaGFyID0gdHJpZ2dlckNoYXIgfHwgdGhpcy5tZW50aW9uQ29uZmlnLnRyaWdnZXJDaGFyIHx8IHRoaXMuREVGQVVMVF9DT05GSUcudHJpZ2dlckNoYXI7XHJcbiAgICBjb25zdCBwb3MgPSBnZXRDYXJldFBvc2l0aW9uKG5hdGl2ZUVsZW1lbnQsIHRoaXMuaWZyYW1lKTtcclxuICAgIGluc2VydFZhbHVlKG5hdGl2ZUVsZW1lbnQsIHBvcywgcG9zLCB0cmlnZ2VyQ2hhciwgdGhpcy5pZnJhbWUpO1xyXG4gICAgdGhpcy5rZXlIYW5kbGVyKHsga2V5OiB0cmlnZ2VyQ2hhciwgaW5wdXRFdmVudDogdHJ1ZSB9LCBuYXRpdmVFbGVtZW50KTtcclxuICB9XHJcblxyXG4gIHN0b3BTZWFyY2goKSB7XHJcbiAgICBpZiAodGhpcy5zZWFyY2hMaXN0ICYmICF0aGlzLnNlYXJjaExpc3QuaGlkZGVuKSB7XHJcbiAgICAgIHRoaXMuc2VhcmNoTGlzdC5oaWRkZW4gPSB0cnVlO1xyXG4gICAgICB0aGlzLmNsb3NlZC5lbWl0KCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFjdGl2ZUNvbmZpZyA9IG51bGw7XHJcbiAgICB0aGlzLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlU2VhcmNoTGlzdCgpIHtcclxuICAgIGxldCBtYXRjaGVzOiBhbnlbXSA9IFtdO1xyXG4gICAgaWYgKHRoaXMuYWN0aXZlQ29uZmlnICYmIHRoaXMuYWN0aXZlQ29uZmlnLml0ZW1zKSB7XHJcbiAgICAgIGxldCBvYmplY3RzID0gdGhpcy5hY3RpdmVDb25maWcuaXRlbXM7XHJcbiAgICAgIC8vIGRpc2FibGluZyB0aGUgc2VhcmNoIHJlbGllcyBvbiB0aGUgYXN5bmMgb3BlcmF0aW9uIHRvIGRvIHRoZSBmaWx0ZXJpbmdcclxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZUNvbmZpZy5kaXNhYmxlU2VhcmNoICYmIHRoaXMuc2VhcmNoU3RyaW5nICYmIHRoaXMuYWN0aXZlQ29uZmlnLmxhYmVsS2V5KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlQ29uZmlnLm1lbnRpb25GaWx0ZXIpIHtcclxuICAgICAgICAgIG9iamVjdHMgPSB0aGlzLmFjdGl2ZUNvbmZpZy5tZW50aW9uRmlsdGVyKHRoaXMuc2VhcmNoU3RyaW5nLCBvYmplY3RzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgbWF0Y2hlcyA9IG9iamVjdHM7XHJcbiAgICAgIGlmICh0aGlzLmFjdGl2ZUNvbmZpZy5tYXhJdGVtcyA+IDApIHtcclxuICAgICAgICBtYXRjaGVzID0gbWF0Y2hlcy5zbGljZSgwLCB0aGlzLmFjdGl2ZUNvbmZpZy5tYXhJdGVtcyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHVwZGF0ZSB0aGUgc2VhcmNoIGxpc3RcclxuICAgIGlmICh0aGlzLnNlYXJjaExpc3QpIHtcclxuICAgICAgdGhpcy5zZWFyY2hMaXN0Lml0ZW1zID0gbWF0Y2hlcztcclxuICAgICAgdGhpcy5zZWFyY2hMaXN0LmhpZGRlbiA9IG1hdGNoZXMubGVuZ3RoID09IDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzaG93U2VhcmNoTGlzdChuYXRpdmVFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50KSB7XHJcbiAgICB0aGlzLm9wZW5lZC5lbWl0KCk7XHJcblxyXG4gICAgaWYgKHRoaXMuc2VhcmNoTGlzdCA9PSBudWxsKSB7XHJcbiAgICAgIGxldCBjb21wb25lbnRGYWN0b3J5ID0gdGhpcy5fY29tcG9uZW50UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoTWVudGlvbkxpc3RDb21wb25lbnQpO1xyXG4gICAgICBsZXQgY29tcG9uZW50UmVmID0gdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVDb21wb25lbnQoY29tcG9uZW50RmFjdG9yeSk7XHJcbiAgICAgIHRoaXMuc2VhcmNoTGlzdCA9IGNvbXBvbmVudFJlZi5pbnN0YW5jZTtcclxuICAgICAgdGhpcy5zZWFyY2hMaXN0Lml0ZW1UZW1wbGF0ZSA9IHRoaXMubWVudGlvbkxpc3RUZW1wbGF0ZTtcclxuICAgICAgY29tcG9uZW50UmVmLmluc3RhbmNlWydpdGVtQ2xpY2snXS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIG5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgICBsZXQgZmFrZUtleWRvd24gPSB7IGtleTogJ0VudGVyJywga2V5Q29kZTogS0VZX0VOVEVSLCB3YXNDbGljazogdHJ1ZSB9O1xyXG4gICAgICAgIHRoaXMua2V5SGFuZGxlcihmYWtlS2V5ZG93biwgbmF0aXZlRWxlbWVudCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zZWFyY2hMaXN0LmxhYmVsS2V5ID0gdGhpcy5hY3RpdmVDb25maWcubGFiZWxLZXk7XHJcbiAgICB0aGlzLnNlYXJjaExpc3QuZHJvcFVwID0gdGhpcy5hY3RpdmVDb25maWcuZHJvcFVwO1xyXG4gICAgdGhpcy5zZWFyY2hMaXN0LnN0eWxlT2ZmID0gdGhpcy5tZW50aW9uQ29uZmlnLmRpc2FibGVTdHlsZTtcclxuICAgIHRoaXMuc2VhcmNoTGlzdC5hY3RpdmVJbmRleCA9IDA7XHJcbiAgICB0aGlzLnNlYXJjaExpc3QucG9zaXRpb24obmF0aXZlRWxlbWVudCwgdGhpcy5pZnJhbWUpO1xyXG5cclxuICAgIHRoaXMuYWZ0ZXJQb3NpdGlvbmVkLmVtaXQobmF0aXZlRWxlbWVudCk7XHJcblxyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLnNlYXJjaExpc3QucmVzZXQoKSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==