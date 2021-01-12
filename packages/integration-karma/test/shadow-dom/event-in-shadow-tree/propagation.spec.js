import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import PropagationElement from 'x/propagationElement';

function dispatchEventWithLog(target, event) {
    var log = [];

    for (let node = target; node; node = node.parentNode || node.host) {
        node.addEventListener(event.type, () =>
            log.push(node.tagName || `host-${node.host?.tagName}`)
        );
    }

    target.dispatchEvent(event);
    return log;
}

function createShadowTree(parentNode) {
    const elm = createElement('x-shadow-tree', { is: PropagationElement });
    elm.setAttribute('data-id', 'x-shadow-tree');
    parentNode.appendChild(elm);

    return extractDataIds(elm);
}

describe('Event Propagation in slots', () => {
    let nodes;
    beforeEach(() => {
        nodes = createShadowTree(document.body);
    });

    it('tesst', () => {
        const spy = jasmine.createSpy();
        nodes['x-button-group'].shadowRoot.addEventListener('customevent', spy);
        dispatchEventWithLog(nodes['x-button'], new CustomEvent('customevent', { bubbles: true }));
        expect(spy).toHaveBeenCalled();
    });
});
