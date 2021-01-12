// Inspired from WPT:
// https://github.com/web-platform-tests/wpt/blob/master/shadow-dom/event-inside-shadow-tree.html

import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import Container from 'x/container';

function dispatchEventWithLog(target, event) {
    var log = [];
    for (var node = target; node; node = node.parentNode || node.host) {
        node.addEventListener(
            event.type,
            function (event) {
                log.push([this, event.target, event.composedPath()]);
            }.bind(node)
        );
    }
    target.dispatchEvent(event);
    return log;
}

function createTestElement(parentNode) {
    const elm = createElement('x-container', { is: Container });
    elm.setAttribute('data-id', 'x-container');
    parentNode.appendChild(elm);
    return extractDataIds(elm);
}

describe('event propagation', () => {
    describe('dispatched on native element', () => {
        let nodes;
        beforeEach(() => {
            nodes = createTestElement(document.body);
        });

        it('{bubbles: true, composed: true}', () => {
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const actualLogs = dispatchEventWithLog(nodes.button, event);

            const composedPath = [
                nodes.button,
                nodes.button_div,
                nodes['x-button'].shadowRoot,
                nodes['x-button'],
                nodes.container_slot,
                nodes.button_group_slot,
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            const expectedLogs = [
                [nodes.button, nodes.button, composedPath],
                [nodes.button_div, nodes.button, composedPath],
                [nodes['x-button'].shadowRoot, nodes.button, composedPath],
                [nodes['x-button'], nodes['x-button'], composedPath],
                [nodes.container_slot, nodes['x-button'], composedPath],
                [nodes['x-button-group'], nodes['x-button'], composedPath],
                [nodes.container_div, nodes['x-button'], composedPath],
                [nodes['x-container'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-container'], nodes['x-container'], composedPath],
                [document.body, nodes['x-container'], composedPath],
                [document.documentElement, nodes['x-container'], composedPath],
                [document, nodes['x-container'], composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: true, composed: false}', () => {
            const event = new CustomEvent('test', { bubbles: true, composed: false });
            const actualLogs = dispatchEventWithLog(nodes.button, event);

            const composedPath = [nodes.button, nodes.button_div, nodes['x-button'].shadowRoot];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes.button, nodes.button, composedPath],
                    [nodes.button_div, nodes.button, composedPath],
                    [nodes['x-button'].shadowRoot, nodes.button, composedPath],
                ];
            } else {
                expectedLogs = [
                    [nodes.button, nodes.button, composedPath],
                    [nodes.button_div, nodes.button, composedPath],
                    [nodes['x-button'].shadowRoot, nodes.button, composedPath],
                    [nodes.container_slot, null, composedPath],
                    [nodes.container_div, null, composedPath],
                    [document.body, null, composedPath],
                    [document.documentElement, null, composedPath],
                    [document, null, composedPath],
                ];
            }

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: true}', () => {
            const event = new CustomEvent('test', { bubbles: false, composed: true });
            const actualLogs = dispatchEventWithLog(nodes.button, event);

            const composedPath = [
                nodes.button,
                nodes.button_div,
                nodes['x-button'].shadowRoot,
                nodes['x-button'],
                nodes.container_slot,
                nodes.button_group_slot,
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes.button, nodes.button, composedPath],
                    [nodes['x-button'], nodes['x-button'], composedPath],
                    [nodes['x-container'], nodes['x-container'], composedPath],
                ];
            } else {
                expectedLogs = [[nodes.button, nodes.button, composedPath]];
            }

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: false}', () => {
            const event = new CustomEvent('test', { bubbles: false, composed: false });
            const actualLogs = dispatchEventWithLog(nodes.button, event);

            const composedPath = [nodes.button, nodes.button_div, nodes['x-button'].shadowRoot];
            const expectedLogs = [[nodes.button, nodes.button, composedPath]];

            expect(actualLogs).toEqual(expectedLogs);
        });
    });

    describe('dispatched on host', () => {
        let nodes;
        beforeEach(() => {
            nodes = createTestElement(document.body);
        });

        it('{bubbles: true, composed: true}', () => {
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const actualLogs = dispatchEventWithLog(nodes['x-button'], event);

            const composedPath = [
                nodes['x-button'],
                nodes.container_slot,
                nodes.button_group_slot,
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            const expectedLogs = [
                [nodes['x-button'], nodes['x-button'], composedPath],
                [nodes.container_slot, nodes['x-button'], composedPath],
                [nodes['x-button-group'], nodes['x-button'], composedPath],
                [nodes.container_div, nodes['x-button'], composedPath],
                [nodes['x-container'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-container'], nodes['x-container'], composedPath],
                [document.body, nodes['x-container'], composedPath],
                [document.documentElement, nodes['x-container'], composedPath],
                [document, nodes['x-container'], composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: true, composed: false}', () => {
            const event = new CustomEvent('test', { bubbles: true, composed: false });
            const actualLogs = dispatchEventWithLog(nodes['x-button'], event);

            const composedPath = [
                nodes['x-button'],
                nodes.container_slot,
                nodes.button_group_slot,
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
            ];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes['x-button'], nodes['x-button'], composedPath],
                    [nodes.container_slot, nodes['x-button'], composedPath],
                    [nodes['x-button-group'], nodes['x-button'], composedPath],
                    [nodes.container_div, nodes['x-button'], composedPath],
                    [nodes['x-container'].shadowRoot, nodes['x-button'], composedPath],
                ];
            } else {
                expectedLogs = [
                    [nodes['x-button'], nodes['x-button'], composedPath],
                    [nodes.container_slot, nodes['x-button'], composedPath],
                    [nodes['x-button-group'], nodes['x-button'], composedPath],
                    [nodes.container_div, nodes['x-button'], composedPath],
                    [nodes['x-container'].shadowRoot, nodes['x-button'], composedPath],
                    [document.body, null, composedPath],
                    [document.documentElement, null, composedPath],
                    [document, null, composedPath],
                ];
            }

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: true}', () => {
            const event = new CustomEvent('test', { bubbles: false, composed: true });
            const actualLogs = dispatchEventWithLog(nodes['x-button'], event);

            const composedPath = [
                nodes['x-button'],
                nodes.container_slot,
                nodes.button_group_slot,
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes['x-button'], nodes['x-button'], composedPath],
                    [nodes['x-container'], nodes['x-container'], composedPath],
                ];
            } else {
                expectedLogs = [[nodes['x-button'], nodes['x-button'], composedPath]];
            }

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: false}', () => {
            const event = new CustomEvent('test', { bubbles: false, composed: false });
            const actualLogs = dispatchEventWithLog(nodes['x-button'], event);

            const composedPath = [
                nodes['x-button'],
                nodes.container_slot,
                nodes.button_group_slot,
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
            ];
            const expectedLogs = [[nodes['x-button'], nodes['x-button'], composedPath]];

            expect(actualLogs).toEqual(expectedLogs);
        });
    });
});
