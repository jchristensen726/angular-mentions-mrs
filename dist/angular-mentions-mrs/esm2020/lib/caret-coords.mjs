/* From: https://github.com/component/textarea-caret-position */
/* jshint browser: true */
// (function () {
// We'll copy the properties below into the mirror div.
// Note that some browsers, such as Firefox, do not concatenate properties
// into their shorthand (e.g. padding-top, padding-bottom etc. -> padding),
// so we have to list every single property explicitly.
var properties = [
    'direction',
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
    'tabSize',
    'MozTabSize'
];
var isBrowser = (typeof window !== 'undefined');
var isFirefox = (isBrowser && window['mozInnerScreenX'] != null);
export function getCaretCoordinates(element, position, options) {
    if (!isBrowser) {
        throw new Error('textarea-caret-position#getCaretCoordinates should only be called in a browser');
    }
    var debug = options && options.debug || false;
    if (debug) {
        var el = document.querySelector('#input-textarea-caret-position-mirror-div');
        if (el)
            el.parentNode.removeChild(el);
    }
    // The mirror div will replicate the textarea's style
    var div = document.createElement('div');
    div.id = 'input-textarea-caret-position-mirror-div';
    document.body.appendChild(div);
    var style = div.style;
    var computed = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle; // currentStyle for IE < 9
    var isInput = element.nodeName === 'INPUT';
    // Default textarea styles
    style.whiteSpace = 'pre-wrap';
    if (!isInput)
        style.wordWrap = 'break-word'; // only for textarea-s
    // Position off-screen
    style.position = 'absolute'; // required to return coordinates properly
    if (!debug)
        style.visibility = 'hidden'; // not 'display: none' because we want rendering
    // Transfer the element's properties to the div
    properties.forEach(function (prop) {
        if (isInput && prop === 'lineHeight') {
            // Special case for <input>s because text is rendered centered and line height may be != height
            if (computed.boxSizing === "border-box") {
                var height = parseInt(computed.height);
                var outerHeight = parseInt(computed.paddingTop) +
                    parseInt(computed.paddingBottom) +
                    parseInt(computed.borderTopWidth) +
                    parseInt(computed.borderBottomWidth);
                var targetHeight = outerHeight + parseInt(computed.lineHeight);
                if (height > targetHeight) {
                    style.lineHeight = height - outerHeight + "px";
                }
                else if (height === targetHeight) {
                    style.lineHeight = computed.lineHeight;
                }
                else {
                    style.lineHeight = '0';
                }
            }
            else {
                style.lineHeight = computed.height;
            }
        }
        else {
            style[prop] = computed[prop];
        }
    });
    if (isFirefox) {
        // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
        if (element.scrollHeight > parseInt(computed.height))
            style.overflowY = 'scroll';
    }
    else {
        style.overflow = 'hidden'; // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
    }
    div.textContent = element.value.substring(0, position);
    // The second special handling for input type="text" vs textarea:
    // spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
    if (isInput)
        div.textContent = div.textContent.replace(/\s/g, '\u00a0');
    var span = document.createElement('span');
    // Wrapping must be replicated *exactly*, including when a long word gets
    // onto the next line, with whitespace at the end of the line before (#7).
    // The  *only* reliable way to do that is to copy the *entire* rest of the
    // textarea's content into the <span> created at the caret position.
    // For inputs, just '.' would be enough, but no need to bother.
    span.textContent = element.value.substring(position) || '.'; // || because a completely empty faux span doesn't render at all
    div.appendChild(span);
    var coordinates = {
        top: span.offsetTop + parseInt(computed['borderTopWidth']),
        left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
        height: parseInt(computed['lineHeight'])
    };
    if (debug) {
        span.style.backgroundColor = '#aaa';
    }
    else {
        document.body.removeChild(div);
    }
    return coordinates;
}
// if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
//   module.exports = getCaretCoordinates;
// } else if(isBrowser) {
//   window.getCaretCoordinates = getCaretCoordinates;
// }
// }());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZXQtY29vcmRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1tZW50aW9ucy9zcmMvbGliL2NhcmV0LWNvb3Jkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxnRUFBZ0U7QUFDaEUsMEJBQTBCO0FBRTFCLGlCQUFpQjtBQUVmLHVEQUF1RDtBQUN2RCwwRUFBMEU7QUFDMUUsMkVBQTJFO0FBQzNFLHVEQUF1RDtBQUN2RCxJQUFJLFVBQVUsR0FBRztJQUNmLFdBQVc7SUFDWCxXQUFXO0lBQ1gsT0FBTztJQUNQLFFBQVE7SUFDUixXQUFXO0lBQ1gsV0FBVztJQUVYLGdCQUFnQjtJQUNoQixrQkFBa0I7SUFDbEIsbUJBQW1CO0lBQ25CLGlCQUFpQjtJQUNqQixhQUFhO0lBRWIsWUFBWTtJQUNaLGNBQWM7SUFDZCxlQUFlO0lBQ2YsYUFBYTtJQUViLHdEQUF3RDtJQUN4RCxXQUFXO0lBQ1gsYUFBYTtJQUNiLFlBQVk7SUFDWixhQUFhO0lBQ2IsVUFBVTtJQUNWLGdCQUFnQjtJQUNoQixZQUFZO0lBQ1osWUFBWTtJQUVaLFdBQVc7SUFDWCxlQUFlO0lBQ2YsWUFBWTtJQUNaLGdCQUFnQjtJQUVoQixlQUFlO0lBQ2YsYUFBYTtJQUViLFNBQVM7SUFDVCxZQUFZO0NBRWIsQ0FBQztBQUVGLElBQUksU0FBUyxHQUFHLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUM7QUFDaEQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7QUFFakUsTUFBTSxVQUFVLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTztJQUM1RCxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxnRkFBZ0YsQ0FBQyxDQUFDO0tBQ25HO0lBRUQsSUFBSSxLQUFLLEdBQUcsT0FBTyxJ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QUFDMUMseUJBQXlCO0FBQ3pCLHNEQUFzRDtBQUN0RCxJQUFJO0FBRUosUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qIEZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9jb21wb25lbnQvdGV4dGFyZWEtY2FyZXQtcG9zaXRpb24gKi9cclxuLyoganNoaW50IGJyb3dzZXI6IHRydWUgKi9cclxuXHJcbi8vIChmdW5jdGlvbiAoKSB7XHJcblxyXG4gIC8vIFdlJ2xsIGNvcHkgdGhlIHByb3BlcnRpZXMgYmVsb3cgaW50byB0aGUgbWlycm9yIGRpdi5cclxuICAvLyBOb3RlIHRoYXQgc29tZSBicm93c2Vycywgc3VjaCBhcyBGaXJlZm94LCBkbyBub3QgY29uY2F0ZW5hdGUgcHJvcGVydGllc1xyXG4gIC8vIGludG8gdGhlaXIgc2hvcnRoYW5kIChlLmcuIHBhZGRpbmctdG9wLCBwYWRkaW5nLWJvdHRvbSBldGMuIC0+IHBhZGRpbmcpLFxyXG4gIC8vIHNvIHdlIGhhdmUgdG8gbGlzdCBldmVyeSBzaW5nbGUgcHJvcGVydHkgZXhwbGljaXRseS5cclxuICB2YXIgcHJvcGVydGllcyA9IFtcclxuICAgICdkaXJlY3Rpb24nLCAgLy8gUlRMIHN1cHBvcnRcclxuICAgICdib3hTaXppbmcnLFxyXG4gICAgJ3dpZHRoJywgIC8vIG9uIENocm9tZSBhbmQgSUUsIGV4Y2x1ZGUgdGhlIHNjcm9sbGJhciwgc28gdGhlIG1pcnJvciBkaXYgd3JhcHMgZXhhY3RseSBhcyB0aGUgdGV4dGFyZWEgZG9lc1xyXG4gICAgJ2hlaWdodCcsXHJcbiAgICAnb3ZlcmZsb3dYJyxcclxuICAgICdvdmVyZmxvd1knLCAgLy8gY29weSB0aGUgc2Nyb2xsYmFyIGZvciBJRVxyXG5cclxuICAgICdib3JkZXJUb3BXaWR0aCcsXHJcbiAgICAnYm9yZGVyUmlnaHRXaWR0aCcsXHJcbiAgICAnYm9yZGVyQm90dG9tV2lkdGgnLFxyXG4gICAgJ2JvcmRlckxlZnRXaWR0aCcsXHJcbiAgICAnYm9yZGVyU3R5bGUnLFxyXG5cclxuICAgICdwYWRkaW5nVG9wJyxcclxuICAgICdwYWRkaW5nUmlnaHQnLFxyXG4gICAgJ3BhZGRpbmdCb3R0b20nLFxyXG4gICAgJ3BhZGRpbmdMZWZ0JyxcclxuXHJcbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvZm9udFxyXG4gICAgJ2ZvbnRTdHlsZScsXHJcbiAgICAnZm9udFZhcmlhbnQnLFxyXG4gICAgJ2ZvbnRXZWlnaHQnLFxyXG4gICAgJ2ZvbnRTdHJldGNoJyxcclxuICAgICdmb250U2l6ZScsXHJcbiAgICAnZm9udFNpemVBZGp1c3QnLFxyXG4gICAgJ2xpbmVIZWlnaHQnLFxyXG4gICAgJ2ZvbnRGYW1pbHknLFxyXG5cclxuICAgICd0ZXh0QWxpZ24nLFxyXG4gICAgJ3RleHRUcmFuc2Zvcm0nLFxyXG4gICAgJ3RleHRJbmRlbnQnLFxyXG4gICAgJ3RleHREZWNvcmF0aW9uJywgIC8vIG1pZ2h0IG5vdCBtYWtlIGEgZGlmZmVyZW5jZSwgYnV0IGJldHRlciBiZSBzYWZlXHJcblxyXG4gICAgJ2xldHRlclNwYWNpbmcnLFxyXG4gICAgJ3dvcmRTcGFjaW5nJyxcclxuXHJcbiAgICAndGFiU2l6ZScsXHJcbiAgICAnTW96VGFiU2l6ZSdcclxuXHJcbiAgXTtcclxuXHJcbiAgdmFyIGlzQnJvd3NlciA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyk7XHJcbiAgdmFyIGlzRmlyZWZveCA9IChpc0Jyb3dzZXIgJiYgd2luZG93Wydtb3pJbm5lclNjcmVlblgnXSAhPSBudWxsKTtcclxuXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGdldENhcmV0Q29vcmRpbmF0ZXMoZWxlbWVudCwgcG9zaXRpb24sIG9wdGlvbnMpIHtcclxuICAgIGlmICghaXNCcm93c2VyKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcigndGV4dGFyZWEtY2FyZXQtcG9zaXRpb24jZ2V0Q2FyZXRDb29yZGluYXRlcyBzaG91bGQgb25seSBiZSBjYWxsZWQgaW4gYSBicm93c2VyJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRlYnVnID0gb3B0aW9ucyAmJiBvcHRpb25zLmRlYnVnIHx8IGZhbHNlO1xyXG4gICAgaWYgKGRlYnVnKSB7XHJcbiAgICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbnB1dC10ZXh0YXJlYS1jYXJldC1wb3NpdGlvbi1taXJyb3ItZGl2Jyk7XHJcbiAgICAgIGlmIChlbCkgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhlIG1pcnJvciBkaXYgd2lsbCByZXBsaWNhdGUgdGhlIHRleHRhcmVhJ3Mgc3R5bGVcclxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGRpdi5pZCA9ICdpbnB1dC10ZXh0YXJlYS1jYXJldC1wb3NpdGlvbi1taXJyb3ItZGl2JztcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcclxuXHJcbiAgICB2YXIgc3R5bGUgPSBkaXYuc3R5bGU7XHJcbiAgICB2YXIgY29tcHV0ZWQgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSA/IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpIDogZWxlbWVudC5jdXJyZW50U3R5bGU7ICAvLyBjdXJyZW50U3R5bGUgZm9yIElFIDwgOVxyXG4gICAgdmFyIGlzSW5wdXQgPSBlbGVtZW50Lm5vZGVOYW1lID09PSAnSU5QVVQnO1xyXG5cclxuICAgIC8vIERlZmF1bHQgdGV4dGFyZWEgc3R5bGVzXHJcbiAgICBzdHlsZS53aGl0ZVNwYWNlID0gJ3ByZS13cmFwJztcclxuICAgIGlmICghaXNJbnB1dClcclxuICAgICAgc3R5bGUud29yZFdyYXAgPSAnYnJlYWstd29yZCc7ICAvLyBvbmx5IGZvciB0ZXh0YXJlYS1zXHJcblxyXG4gICAgLy8gUG9zaXRpb24gb2ZmLXNjcmVlblxyXG4gICAgc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnOyAgLy8gcmVxdWlyZWQgdG8gcmV0dXJuIGNvb3JkaW5hdGVzIHByb3Blcmx5XHJcbiAgICBpZiAoIWRlYnVnKVxyXG4gICAgICBzdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7ICAvLyBub3QgJ2Rpc3BsYXk6IG5vbmUnIGJlY2F1c2Ugd2Ugd2FudCByZW5kZXJpbmdcclxuXHJcbiAgICAvLyBUcmFuc2ZlciB0aGUgZWxlbWVudCdzIHByb3BlcnRpZXMgdG8gdGhlIGRpdlxyXG4gICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XHJcbiAgICAgIGlmIChpc0lucHV0ICYmIHByb3AgPT09ICdsaW5lSGVpZ2h0Jykge1xyXG4gICAgICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgPGlucHV0PnMgYmVjYXVzZSB0ZXh0IGlzIHJlbmRlcmVkIGNlbnRlcmVkIGFuZCBsaW5lIGhlaWdodCBtYXkgYmUgIT0gaGVpZ2h0XHJcbiAgICAgICAgaWYgKGNvbXB1dGVkLmJveFNpemluZyA9PT0gXCJib3JkZXItYm94XCIpIHtcclxuICAgICAgICAgIHZhciBoZWlnaHQgPSBwYXJzZUludChjb21wdXRlZC5oZWlnaHQpO1xyXG4gICAgICAgICAgdmFyIG91dGVySGVpZ2h0ID1cclxuICAgICAgICAgICAgcGFyc2VJbnQoY29tcHV0ZWQucGFkZGluZ1RvcCkgK1xyXG4gICAgICAgICAgICBwYXJzZUludChjb21wdXRlZC5wYWRkaW5nQm90dG9tKSArXHJcbiAgICAgICAgICAgIHBhcnNlSW50KGNvbXB1dGVkLmJvcmRlclRvcFdpZHRoKSArXHJcbiAgICAgICAgICAgIHBhcnNlSW50KGNvbXB1dGVkLmJvcmRlckJvdHRvbVdpZHRoKTtcclxuICAgICAgICAgIHZhciB0YXJnZXRIZWlnaHQgPSBvdXRlckhlaWdodCArIHBhcnNlSW50KGNvbXB1dGVkLmxpbmVIZWlnaHQpO1xyXG4gICAgICAgICAgaWYgKGhlaWdodCA+IHRhcmdldEhlaWdodCkge1xyXG4gICAgICAgICAgICBzdHlsZS5saW5lSGVpZ2h0ID0gaGVpZ2h0IC0gb3V0ZXJIZWlnaHQgKyBcInB4XCI7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGhlaWdodCA9PT0gdGFyZ2V0SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHN0eWxlLmxpbmVIZWlnaHQgPSBjb21wdXRlZC5saW5lSGVpZ2h0O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3R5bGUubGluZUhlaWdodCA9ICcwJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3R5bGUubGluZUhlaWdodCA9IGNvbXB1dGVkLmhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3R5bGVbcHJvcF0gPSBjb21wdXRlZFtwcm9wXTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGlzRmlyZWZveCkge1xyXG4gICAgICAvLyBGaXJlZm94IGxpZXMgYWJvdXQgdGhlIG92ZXJmbG93IHByb3BlcnR5IGZvciB0ZXh0YXJlYXM6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTk4NDI3NVxyXG4gICAgICBpZiAoZWxlbWVudC5zY3JvbGxIZWlnaHQgPiBwYXJzZUludChjb21wdXRlZC5oZWlnaHQpKVxyXG4gICAgICAgIHN0eWxlLm92ZXJmbG93WSA9ICdzY3JvbGwnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJzsgIC8vIGZvciBDaHJvbWUgdG8gbm90IHJlbmRlciBhIHNjcm9sbGJhcjsgSUUga2VlcHMgb3ZlcmZsb3dZID0gJ3Njcm9sbCdcclxuICAgIH1cclxuXHJcbiAgICBkaXYudGV4dENvbnRlbnQgPSBlbGVtZW50LnZhbHVlLnN1YnN0cmluZygwLCBwb3NpdGlvbik7XHJcbiAgICAvLyBUaGUgc2Vjb25kIHNwZWNpYWwgaGFuZGxpbmcgZm9yIGlucHV0IHR5cGU9XCJ0ZXh0XCIgdnMgdGV4dGFyZWE6XHJcbiAgICAvLyBzcGFjZXMgbmVlZCB0byBiZSByZXBsYWNlZCB3aXRoIG5vbi1icmVha2luZyBzcGFjZXMgLSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMzQwMjAzNS8xMjY5MDM3XHJcbiAgICBpZiAoaXNJbnB1dClcclxuICAgICAgZGl2LnRleHRDb250ZW50ID0gZGl2LnRleHRDb250ZW50LnJlcGxhY2UoL1xccy9nLCAnXFx1MDBhMCcpO1xyXG5cclxuICAgIHZhciBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgLy8gV3JhcHBpbmcgbXVzdCBiZSByZXBsaWNhdGVkICpleGFjdGx5KiwgaW5jbHVkaW5nIHdoZW4gYSBsb25nIHdvcmQgZ2V0c1xyXG4gICAgLy8gb250byB0aGUgbmV4dCBsaW5lLCB3aXRoIHdoaXRlc3BhY2UgYXQgdGhlIGVuZCBvZiB0aGUgbGluZSBiZWZvcmUgKCM3KS5cclxuICAgIC8vIFRoZSAgKm9ubHkqIHJlbGlhYmxlIHdheSB0byBkbyB0aGF0IGlzIHRvIGNvcHkgdGhlICplbnRpcmUqIHJlc3Qgb2YgdGhlXHJcbiAgICAvLyB0ZXh0YXJlYSdzIGNvbnRlbnQgaW50byB0aGUgPHNwYW4+IGNyZWF0ZWQgYXQgdGhlIGNhcmV0IHBvc2l0aW9uLlxyXG4gICAgLy8gRm9yIGlucHV0cywganVzdCAnLicgd291bGQgYmUgZW5vdWdoLCBidXQgbm8gbmVlZCB0byBib3RoZXIuXHJcbiAgICBzcGFuLnRleHRDb250ZW50ID0gZWxlbWVudC52YWx1ZS5zdWJzdHJpbmcocG9zaXRpb24pIHx8ICcuJzsgIC8vIHx8IGJlY2F1c2UgYSBjb21wbGV0ZWx5IGVtcHR5IGZhdXggc3BhbiBkb2Vzbid0IHJlbmRlciBhdCBhbGxcclxuICAgIGRpdi5hcHBlbmRDaGlsZChzcGFuKTtcclxuXHJcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSB7XHJcbiAgICAgIHRvcDogc3Bhbi5vZmZzZXRUb3AgKyBwYXJzZUludChjb21wdXRlZFsnYm9yZGVyVG9wV2lkdGgnXSksXHJcbiAgICAgIGxlZnQ6IHNwYW4ub2Zmc2V0TGVmdCArIHBhcnNlSW50KGNvbXB1dGVkWydib3JkZXJMZWZ0V2lkdGgnXSksXHJcbiAgICAgIGhlaWdodDogcGFyc2VJbnQoY29tcHV0ZWRbJ2xpbmVIZWlnaHQnXSlcclxuICAgIH07XHJcblxyXG4gICAgaWYgKGRlYnVnKSB7XHJcbiAgICAgIHNwYW4uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNhYWEnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkaXYpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb29yZGluYXRlcztcclxuICB9XHJcblxyXG4gIC8vIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPSAndW5kZWZpbmVkJykge1xyXG4gIC8vICAgbW9kdWxlLmV4cG9ydHMgPSBnZXRDYXJldENvb3JkaW5hdGVzO1xyXG4gIC8vIH0gZWxzZSBpZihpc0Jyb3dzZXIpIHtcclxuICAvLyAgIHdpbmRvdy5nZXRDYXJldENvb3JkaW5hdGVzID0gZ2V0Q2FyZXRDb29yZGluYXRlcztcclxuICAvLyB9XHJcblxyXG4gIC8vIH0oKSk7Il19