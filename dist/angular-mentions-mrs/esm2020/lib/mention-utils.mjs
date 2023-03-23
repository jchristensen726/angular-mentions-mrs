<<<<<<< HEAD
// DOM element manipulation functions...
//
function setValue(el, value) {
    //console.log("setValue", el.nodeName, "["+value+"]");
    if (isInputOrTextAreaElement(el)) {
        el.value = value;
    }
    else {
        el.textContent = value;
    }
}
export function getValue(el) {
    return isInputOrTextAreaElement(el) ? el.value : el.textContent;
}
export function insertValue(el, start, end, text, iframe, noRecursion = false) {
    //console.log("insertValue", el.nodeName, start, end, "["+text+"]", el);
    if (isTextElement(el)) {
        let val = getValue(el);
        setValue(el, val.substring(0, start) + text + val.substring(end, val.length));
        setCaretPosition(el, start + text.length, iframe);
    }
    else if (!noRecursion) {
        let selObj = getWindowSelection(iframe);
        if (selObj && selObj.rangeCount > 0) {
            var selRange = selObj.getRangeAt(0);
            var position = selRange.startOffset;
            var anchorNode = selObj.anchorNode;
            // if (text.endsWith(' ')) {
            //   text = text.substring(0, text.length-1) + '\xA0';
            // }
            insertValue(anchorNode, position - (end - start), position, text, iframe, true);
        }
    }
}
export function isInputOrTextAreaElement(el) {
    return el != null && (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA');
}
;
export function isTextElement(el) {
    return el != null && (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA' || el.nodeName == '#text');
}
;
export function setCaretPosition(el, pos, iframe = null) {
    //console.log("setCaretPosition", pos, el, iframe==null);
    if (isInputOrTextAreaElement(el) && el.selectionStart) {
        el.focus();
        el.setSelectionRange(pos, pos);
    }
    else {
        let range = getDocument(iframe).createRange();
        range.setStart(el, pos);
        range.collapse(true);
        let sel = getWindowSelection(iframe);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}
export function getCaretPosition(el, iframe = null) {
    //console.log("getCaretPosition", el);
    if (isInputOrTextAreaElement(el)) {
        var val = el.value;
        return val.slice(0, el.selectionStart).length;
    }
    else {
        var selObj = getWindowSelection(iframe); //window.getSelection();
        if (selObj.rangeCount > 0) {
            var selRange = selObj.getRangeAt(0);
            var preCaretRange = selRange.cloneRange();
            preCaretRange.selectNodeContents(el);
            preCaretRange.setEnd(selRange.endContainer, selRange.endOffset);
            var position = preCaretRange.toString().length;
            return position;
        }
    }
}
// Based on ment.io functions...
//
function getDocument(iframe) {
    if (!iframe) {
        return document;
    }
    else {
        return iframe.contentWindow.document;
    }
}
function getWindowSelection(iframe) {
    if (!iframe) {
        return window.getSelection();
    }
    else {
        return iframe.contentWindow.getSelection();
    }
}
export function getContentEditableCaretCoords(ctx) {
    let markerTextChar = '\ufeff';
    let markerId = 'sel_' + new Date().getTime() + '_' + Math.random().toString().substr(2);
    let doc = getDocument(ctx ? ctx.iframe : null);
    let sel = getWindowSelection(ctx ? ctx.iframe : null);
    let prevRange = sel.getRangeAt(0);
    // create new range and set postion using prevRange
    let range = doc.createRange();
    range.setStart(sel.anchorNode, prevRange.startOffset);
    range.setEnd(sel.anchorNode, prevRange.startOffset);
    range.collapse(false);
    // Create the marker element containing a single invisible character
    // using DOM methods and insert it at the position in the range
    let markerEl = doc.createElement('span');
    markerEl.id = markerId;
    markerEl.appendChild(doc.createTextNode(markerTextChar));
    range.insertNode(markerEl);
    sel.removeAllRanges();
    sel.addRange(prevRange);
    let coordinates = {
        left: 0,
        top: markerEl.offsetHeight
    };
    localToRelativeCoordinates(ctx, markerEl, coordinates);
    markerEl.parentNode.removeChild(markerEl);
    return coordinates;
}
function localToRelativeCoordinates(ctx, element, coordinates) {
    let obj = element;
    let iframe = ctx ? ctx.iframe : null;
    while (obj) {
        if (ctx.parent != null && ctx.parent == obj) {
            break;
        }
        coordinates.left += obj.offsetLeft + obj.clientLeft;
        coordinates.top += obj.offsetTop + obj.clientTop;
        obj = obj.offsetParent;
        if (!obj && iframe) {
            obj = iframe;
            iframe = null;
        }
    }
    obj = element;
    iframe = ctx ? ctx.iframe : null;
    while (obj !== getDocument(null).body && obj != null) {
        if (ctx.parent != null && ctx.parent == obj) {
            break;
        }
        if (obj.scrollTop && obj.scrollTop > 0) {
            coordinates.top -= obj.scrollTop;
        }
        if (obj.scrollLeft && obj.scrollLeft > 0) {
            coordinates.left -= obj.scrollLeft;
        }
        obj = obj.parentNode;
        if (!obj && iframe) {
            obj = iframe;
            iframe = null;
        }
    }
}
=======
// DOM element manipulation functions...
//
function setValue(el, value) {
    //console.log("setValue", el.nodeName, "["+value+"]");
    if (isInputOrTextAreaElement(el)) {
        el.value = value;
    }
    else {
        el.textContent = value;
    }
}
export function getValue(el) {
    return isInputOrTextAreaElement(el) ? el.value : el.textContent;
}
export function insertValue(el, start, end, text, iframe, noRecursion = false) {
    //console.log("insertValue", el.nodeName, start, end, "["+text+"]", el);
    if (isTextElement(el)) {
        let val = getValue(el);
        setValue(el, val.substring(0, start) + text + val.substring(end, val.length));
        setCaretPosition(el, start + text.length, iframe);
    }
    else if (!noRecursion) {
        let selObj = getWindowSelection(iframe);
        if (selObj && selObj.rangeCount > 0) {
            var selRange = selObj.getRangeAt(0);
            var position = selRange.startOffset;
            var anchorNode = selObj.anchorNode;
            // if (text.endsWith(' ')) {
            //   text = text.substring(0, text.length-1) + '\xA0';
            // }
            insertValue(anchorNode, position - (end - start), position, text, iframe, true);
        }
    }
}
export function isInputOrTextAreaElement(el) {
    return el != null && (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA');
}
;
export function isTextElement(el) {
    return el != null && (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA' || el.nodeName == '#text');
}
;
export function setCaretPosition(el, pos, iframe = null) {
    //console.log("setCaretPosition", pos, el, iframe==null);
    if (isInputOrTextAreaElement(el) && el.selectionStart) {
        el.focus();
        el.setSelectionRange(pos, pos);
    }
    else {
        let range = getDocument(iframe).createRange();
        range.setStart(el, pos);
        range.collapse(true);
        let sel = getWindowSelection(iframe);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}
export function getCaretPosition(el, iframe = null) {
    //console.log("getCaretPosition", el);
    if (isInputOrTextAreaElement(el)) {
        var val = el.value;
        return val.slice(0, el.selectionStart).length;
    }
    else {
        var selObj = getWindowSelection(iframe); //window.getSelection();
        if (selObj.rangeCount > 0) {
            var selRange = selObj.getRangeAt(0);
            var preCaretRange = selRange.cloneRange();
            preCaretRange.selectNodeContents(el);
            preCaretRange.setEnd(selRange.endContainer, selRange.endOffset);
            var position = preCaretRange.toString().length;
            return position;
        }
    }
}
// Based on ment.io functions...
//
function getDocument(iframe) {
    if (!iframe) {
        return document;
    }
    else {
        return iframe.contentWindow.document;
    }
}
function getWindowSelection(iframe) {
    if (!iframe) {
        return window.getSelection();
    }
    else {
        return iframe.contentWindow.getSelection();
    }
}
export function getContentEditableCaretCoords(ctx) {
    let markerTextChar = '\ufeff';
    let markerId = 'sel_' + new Date().getTime() + '_' + Math.random().toString().substr(2);
    let doc = getDocument(ctx ? ctx.iframe : null);
    let sel = getWindowSelection(ctx ? ctx.iframe : null);
    let prevRange = sel.getRangeAt(0);
    // create new range and set postion using prevRange
    let range = doc.createRange();
    range.setStart(sel.anchorNode, prevRange.startOffset);
    range.setEnd(sel.anchorNode, prevRange.startOffset);
    range.collapse(false);
    // Create the marker element containing a single invisible character
    // using DOM methods and insert it at the position in the range
    let markerEl = doc.createElement('span');
    markerEl.id = markerId;
    markerEl.appendChild(doc.createTextNode(markerTextChar));
    range.insertNode(markerEl);
    sel.removeAllRanges();
    sel.addRange(prevRange);
    let coordinates = {
        left: 0,
        top: markerEl.offsetHeight
    };
    localToRelativeCoordinates(ctx, markerEl, coordinates);
    markerEl.parentNode.removeChild(markerEl);
    return coordinates;
}
function localToRelativeCoordinates(ctx, element, coordinates) {
    let obj = element;
    let iframe = ctx ? ctx.iframe : null;
    while (obj) {
        if (ctx.parent != null && ctx.parent == obj) {
            break;
        }
        coordinates.left += obj.offsetLeft + obj.clientLeft;
        coordinates.top += obj.offsetTop + obj.clientTop;
        obj = obj.offsetParent;
        if (!obj && iframe) {
            obj = iframe;
            iframe = null;
        }
    }
    obj = element;
    iframe = ctx ? ctx.iframe : null;
    while (obj !== getDocument(null).body && obj != null) {
        if (ctx.parent != null && ctx.parent == obj) {
            break;
        }
        if (obj.scrollTop && obj.scrollTop > 0) {
            coordinates.top -= obj.scrollTop;
        }
        if (obj.scrollLeft && obj.scrollLeft > 0) {
            coordinates.left -= obj.scrollLeft;
        }
        obj = obj.parentNode;
        if (!obj && iframe) {
            obj = iframe;
            iframe = null;
        }
    }
}
>>>>>>> 4b11fe9 (dist)
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbi11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItbWVudGlvbnMvc3JjL2xpYi9tZW50aW9uLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdDQUF3QztBQUN4QyxFQUFFO0FBRUYsU0FBUyxRQUFRLENBQUMsRUFBb0IsRUFBRSxLQUFVO0lBQ2hELHNEQUFzRDtJQUN0RCxJQUFJLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ2hDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0tBQ2xCO1NBQ0k7UUFDSCxFQUFFLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztLQUN4QjtBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUFDLEVBQW9CO0lBQzNDLE9BQU8sd0JBQXdCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7QUFDbEUsQ0FBQztBQUVELE1BQU0sVUFBVSxXQUFXLENBQ3pCLEVBQW9CLEVBQ3BCLEtBQWEsRUFDYixHQUFXLEVBQ1gsSUFBWSxFQUNaLE1BQXlCLEVBQ3pCLGNBQXVCLEtBQUs7SUFFNUIsd0VBQXdFO0lBQ3hFLElBQUksYUFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3JCLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QixRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM5RSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENB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RyxHQUFnQixHQUFHLENBQUMsVUFBVSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxHQUFHLElBQUksTUFBTSxFQUFFO1lBQ2xCLEdBQUcsR0FBRyxNQUFNLENBQUM7WUFDYixNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQ2Y7S0FDRjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBET00gZWxlbWVudCBtYW5pcHVsYXRpb24gZnVuY3Rpb25zLi4uXHJcbi8vXHJcblxyXG5mdW5jdGlvbiBzZXRWYWx1ZShlbDogSFRNTElucHV0RWxlbWVudCwgdmFsdWU6IGFueSkge1xyXG4gIC8vY29uc29sZS5sb2coXCJzZXRWYWx1ZVwiLCBlbC5ub2RlTmFtZSwgXCJbXCIrdmFsdWUrXCJdXCIpO1xyXG4gIGlmIChpc0lucHV0T3JUZXh0QXJlYUVsZW1lbnQoZWwpKSB7XHJcbiAgICBlbC52YWx1ZSA9IHZhbHVlO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGVsLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFsdWUoZWw6IEhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICByZXR1cm4gaXNJbnB1dE9yVGV4dEFyZWFFbGVtZW50KGVsKSA/IGVsLnZhbHVlIDogZWwudGV4dENvbnRlbnQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRWYWx1ZShcclxuICBlbDogSFRNTElucHV0RWxlbWVudCxcclxuICBzdGFydDogbnVtYmVyLFxyXG4gIGVuZDogbnVtYmVyLFxyXG4gIHRleHQ6IHN0cmluZyxcclxuICBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50LFxyXG4gIG5vUmVjdXJzaW9uOiBib29sZWFuID0gZmFsc2VcclxuKSB7XHJcbiAgLy9jb25zb2xlLmxvZyhcImluc2VydFZhbHVlXCIsIGVsLm5vZGVOYW1lLCBzdGFydCwgZW5kLCBcIltcIit0ZXh0K1wiXVwiLCBlbCk7XHJcbiAgaWYgKGlzVGV4dEVsZW1lbnQoZWwpKSB7XHJcbiAgICBsZXQgdmFsID0gZ2V0VmFsdWUoZWwpO1xyXG4gICAgc2V0VmFsdWUoZWwsIHZhbC5zdWJzdHJpbmcoMCwgc3RhcnQpICsgdGV4dCArIHZhbC5zdWJzdHJpbmcoZW5kLCB2YWwubGVuZ3RoKSk7XHJcbiAgICBzZXRDYXJldFBvc2l0aW9uKGVsLCBzdGFydCArIHRleHQubGVuZ3RoLCBpZnJhbWUpO1xyXG4gIH1cclxuICBlbHNlIGlmICghbm9SZWN1cnNpb24pIHtcclxuICAgIGxldCBzZWxPYmo6IFNlbGVjdGlvbiA9IGdldFdpbmRvd1NlbGVjdGlvbihpZnJhbWUpO1xyXG4gICAgaWYgKHNlbE9iaiAmJiBzZWxPYmoucmFuZ2VDb3VudCA+IDApIHtcclxuICAgICAgdmFyIHNlbFJhbmdlID0gc2VsT2JqLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9IHNlbFJhbmdlLnN0YXJ0T2Zmc2V0O1xyXG4gICAgICB2YXIgYW5jaG9yTm9kZSA9IHNlbE9iai5hbmNob3JOb2RlO1xyXG4gICAgICAvLyBpZiAodGV4dC5lbmRzV2l0aCgnICcpKSB7XHJcbiAgICAgIC8vICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIHRleHQubGVuZ3RoLTEpICsgJ1xceEEwJztcclxuICAgICAgLy8gfVxyXG4gICAgICBpbnNlcnRWYWx1ZSg8SFRNTElucHV0RWxlbWVudD5hbmNob3JOb2RlLCBwb3NpdGlvbiAtIChlbmQgLSBzdGFydCksIHBvc2l0aW9uLCB0ZXh0LCBpZnJhbWUsIHRydWUpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5wdXRPclRleHRBcmVhRWxlbWVudChlbDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcclxuICByZXR1cm4gZWwgIT0gbnVsbCAmJiAoZWwubm9kZU5hbWUgPT0gJ0lOUFVUJyB8fCBlbC5ub2RlTmFtZSA9PSAnVEVYVEFSRUEnKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1RleHRFbGVtZW50KGVsOiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBlbCAhPSBudWxsICYmIChlbC5ub2RlTmFtZSA9PSAnSU5QVVQnIHx8IGVsLm5vZGVOYW1lID09ICdURVhUQVJFQScgfHwgZWwubm9kZU5hbWUgPT0gJyN0ZXh0Jyk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2FyZXRQb3NpdGlvbihlbDogSFRNTElucHV0RWxlbWVudCwgcG9zOiBudW1iZXIsIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgPSBudWxsKSB7XHJcbiAgLy9jb25zb2xlLmxvZyhcInNldENhcmV0UG9zaXRpb25cIiwgcG9zLCBlbCwgaWZyYW1lPT1udWxsKTtcclxuICBpZiAoaXNJbnB1dE9yVGV4dEFyZWFFbGVtZW50KGVsKSAmJiBlbC5zZWxlY3Rpb25TdGFydCkge1xyXG4gICAgZWwuZm9jdXMoKTtcclxuICAgIGVsLnNldFNlbGVjdGlvblJhbmdlKHBvcywgcG9zKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBsZXQgcmFuZ2UgPSBnZXREb2N1bWVudChpZnJhbWUpLmNyZWF0ZVJhbmdlKCk7XHJcbiAgICByYW5nZS5zZXRTdGFydChlbCwgcG9zKTtcclxuICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpO1xyXG4gICAgbGV0IHNlbCA9IGdldFdpbmRvd1NlbGVjdGlvbihpZnJhbWUpO1xyXG4gICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgc2VsLmFkZFJhbmdlKHJhbmdlKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDYXJldFBvc2l0aW9uKGVsOiBIVE1MSW5wdXRFbGVtZW50LCBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50ID0gbnVsbCkge1xyXG4gIC8vY29uc29sZS5sb2coXCJnZXRDYXJldFBvc2l0aW9uXCIsIGVsKTtcclxuICBpZiAoaXNJbnB1dE9yVGV4dEFyZWFFbGVtZW50KGVsKSkge1xyXG4gICAgdmFyIHZhbCA9IGVsLnZhbHVlO1xyXG4gICAgcmV0dXJuIHZhbC5zbGljZSgwLCBlbC5zZWxlY3Rpb25TdGFydCkubGVuZ3RoO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHZhciBzZWxPYmogPSBnZXRXaW5kb3dTZWxlY3Rpb24oaWZyYW1lKTsgLy93aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgICBpZiAoc2VsT2JqLnJhbmdlQ291bnQgPiAwKSB7XHJcbiAgICAgIHZhciBzZWxSYW5nZSA9IHNlbE9iai5nZXRSYW5nZUF0KDApO1xyXG4gICAgICB2YXIgcHJlQ2FyZXRSYW5nZSA9IHNlbFJhbmdlLmNsb25lUmFuZ2UoKTtcclxuICAgICAgcHJlQ2FyZXRSYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWwpO1xyXG4gICAgICBwcmVDYXJldFJhbmdlLnNldEVuZChzZWxSYW5nZS5lbmRDb250YWluZXIsIHNlbFJhbmdlLmVuZE9mZnNldCk7XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9IHByZUNhcmV0UmFuZ2UudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIEJhc2VkIG9uIG1lbnQuaW8gZnVuY3Rpb25zLi4uXHJcbi8vXHJcblxyXG5mdW5jdGlvbiBnZXREb2N1bWVudChpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KSB7XHJcbiAgaWYgKCFpZnJhbWUpIHtcclxuICAgIHJldHVybiBkb2N1bWVudDtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0V2luZG93U2VsZWN0aW9uKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiBTZWxlY3Rpb24ge1xyXG4gIGlmICghaWZyYW1lKSB7XHJcbiAgICByZXR1cm4gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGVudEVkaXRhYmxlQ2FyZXRDb29yZHMoY3R4OiB7IGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQsIHBhcmVudD86IEVsZW1lbnQgfSkge1xyXG4gIGxldCBtYXJrZXJUZXh0Q2hhciA9ICdcXHVmZWZmJztcclxuICBsZXQgbWFya2VySWQgPSAnc2VsXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSArICdfJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKS5zdWJzdHIoMik7XHJcbiAgbGV0IGRvYyA9IGdldERvY3VtZW50KGN0eCA/IGN0eC5pZnJhbWUgOiBudWxsKTtcclxuICBsZXQgc2VsID0gZ2V0V2luZG93U2VsZWN0aW9uKGN0eCA/IGN0eC5pZnJhbWUgOiBudWxsKTtcclxuICBsZXQgcHJldlJhbmdlID0gc2VsLmdldFJhbmdlQXQoMCk7XHJcblxyXG4gIC8vIGNyZWF0ZSBuZXcgcmFuZ2UgYW5kIHNldCBwb3N0aW9uIHVzaW5nIHByZXZSYW5nZVxyXG4gIGxldCByYW5nZSA9IGRvYy5jcmVhdGVSYW5nZSgpO1xyXG4gIHJhbmdlLnNldFN0YXJ0KHNlbC5hbmNob3JOb2RlLCBwcmV2UmFuZ2Uuc3RhcnRPZmZzZXQpO1xyXG4gIHJhbmdlLnNldEVuZChzZWwuYW5jaG9yTm9kZSwgcHJldlJhbmdlLnN0YXJ0T2Zmc2V0KTtcclxuICByYW5nZS5jb2xsYXBzZShmYWxzZSk7XHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgbWFya2VyIGVsZW1lbnQgY29udGFpbmluZyBhIHNpbmdsZSBpbnZpc2libGUgY2hhcmFjdGVyXHJcbiAgLy8gdXNpbmcgRE9NIG1ldGhvZHMgYW5kIGluc2VydCBpdCBhdCB0aGUgcG9zaXRpb24gaW4gdGhlIHJhbmdlXHJcbiAgbGV0IG1hcmtlckVsID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICBtYXJrZXJFbC5pZCA9IG1hcmtlcklkO1xyXG4gIG1hcmtlckVsLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShtYXJrZXJUZXh0Q2hhcikpO1xyXG4gIHJhbmdlLmluc2VydE5vZGUobWFya2VyRWwpO1xyXG4gIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICBzZWwuYWRkUmFuZ2UocHJldlJhbmdlKTtcclxuXHJcbiAgbGV0IGNvb3JkaW5hdGVzID0ge1xyXG4gICAgbGVmdDogMCxcclxuICAgIHRvcDogbWFya2VyRWwub2Zmc2V0SGVpZ2h0XHJcbiAgfTtcclxuXHJcbiAgbG9jYWxUb1JlbGF0aXZlQ29vcmRpbmF0ZXMoY3R4LCBtYXJrZXJFbCwgY29vcmRpbmF0ZXMpO1xyXG5cclxuICBtYXJrZXJFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG1hcmtlckVsKTtcclxuICByZXR1cm4gY29vcmRpbmF0ZXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvY2FsVG9SZWxhdGl2ZUNvb3JkaW5hdGVzKFxyXG4gIGN0eDogeyBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50LCBwYXJlbnQ/OiBFbGVtZW50IH0sXHJcbiAgZWxlbWVudDogRWxlbWVudCxcclxuICBjb29yZGluYXRlczogeyB0b3A6IG51bWJlcjsgbGVmdDogbnVtYmVyIH1cclxuKSB7XHJcbiAgbGV0IG9iaiA9IDxIVE1MRWxlbWVudD5lbGVtZW50O1xyXG4gIGxldCBpZnJhbWUgPSBjdHggPyBjdHguaWZyYW1lIDogbnVsbDtcclxuICB3aGlsZSAob2JqKSB7XHJcbiAgICBpZiAoY3R4LnBhcmVudCAhPSBudWxsICYmIGN0eC5wYXJlbnQgPT0gb2JqKSB7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgY29vcmRpbmF0ZXMubGVmdCArPSBvYmoub2Zmc2V0TGVmdCArIG9iai5jbGllbnRMZWZ0O1xyXG4gICAgY29vcmRpbmF0ZXMudG9wICs9IG9iai5vZmZzZXRUb3AgKyBvYmouY2xpZW50VG9wO1xyXG4gICAgb2JqID0gPEhUTUxFbGVtZW50Pm9iai5vZmZzZXRQYXJlbnQ7XHJcbiAgICBpZiAoIW9iaiAmJiBpZnJhbWUpIHtcclxuICAgICAgb2JqID0gaWZyYW1lO1xyXG4gICAgICBpZnJhbWUgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuICBvYmogPSA8SFRNTEVsZW1lbnQ+ZWxlbWVudDtcclxuICBpZnJhbWUgPSBjdHggPyBjdHguaWZyYW1lIDogbnVsbDtcclxuICB3aGlsZSAob2JqICE9PSBnZXREb2N1bWVudChudWxsKS5ib2R5ICYmIG9iaiAhPSBudWxsKSB7XHJcbiAgICBpZiAoY3R4LnBhcmVudCAhPSBudWxsICYmIGN0eC5wYXJlbnQgPT0gb2JqKSB7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaWYgKG9iai5zY3JvbGxUb3AgJiYgb2JqLnNjcm9sbFRvcCA+IDApIHtcclxuICAgICAgY29vcmRpbmF0ZXMudG9wIC09IG9iai5zY3JvbGxUb3A7XHJcbiAgICB9XHJcbiAgICBpZiAob2JqLnNjcm9sbExlZnQgJiYgb2JqLnNjcm9sbExlZnQgPiAwKSB7XHJcbiAgICAgIGNvb3JkaW5hdGVzLmxlZnQgLT0gb2JqLnNjcm9sbExlZnQ7XHJcbiAgICB9XHJcbiAgICBvYmogPSA8SFRNTEVsZW1lbnQ+b2JqLnBhcmVudE5vZGU7XHJcbiAgICBpZiAoIW9iaiAmJiBpZnJhbWUpIHtcclxuICAgICAgb2JqID0gaWZyYW1lO1xyXG4gICAgICBpZnJhbWUgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=