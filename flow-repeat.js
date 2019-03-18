import {FBP} from './fbp.js';
import "./empty-fbp-node"

/**
 * `flow-repeat`
 *
 * Custom element to repeat Arrays
 *
 *
 * @summary Custom element to allow using FBPs template features in repeated template
 *
 * @polymer
 * @customElement
 * @demo demo/flow-bind.html
 * @mixes FBP
 */
class FlowRepeat extends FBP(HTMLElement) {

    constructor() {
        super();
        this.template;
        this._insertedItems = [];

    }


    injectItems(items) {
        if (!Array.isArray(items)) {
            console.error("Items is not an array ", items);
            return;
        }

        items.forEach((e, i, a) => {
            // build hidden elem
            let elem = document.createElement('empty-fbp-node');
            elem.attachShadow({mode: 'open'});
            elem.shadowRoot.appendChild(this.template.cloneNode(true));
            elem._appendFBP(elem.shadowRoot);

            let handle = {virtualElement: elem, children: [].slice.call(elem.shadowRoot.children)};

            // remove old entries
            if (this._insertedItems[i]) {
                this._insertedItems[i].children.map((attachedElem) => {
                    attachedElem.remove()
                })
            }
            this._insertedItems[i] = handle;

            this.parentNode.appendChild(elem.shadowRoot);

            // trigger wires
            elem._FBPTriggerWire(this._internalWire, {item: e, index: i});
            if (i === 0) {
                elem._FBPTriggerWire("--firstItem", e);
            }

            if (i === a.length-1) {
                elem._FBPTriggerWire("--lastItem", e);
            }

            elem._FBPTriggerWire("--item", e);
            elem._FBPTriggerWire("--index", i);
        });

        // remove entries in old array if items is smaller
        this._insertedItems.slice(items.length, this._insertedItems.length).map((handle) => {
            handle.children.map((attachedElem) => {
                attachedElem.remove()
            })
        })
    }

    connectedCallback() {
        this.style.display = "none";
        // Create a shadow root to the element.
        this.attachShadow({mode: 'open'});
        let t = this.querySelector('template');
        if (t.content.children.length > 0) {
            this.template = t.content;
        } else {
            this.template = t._templateInfo.content;
        }


        this._internalWire = this.getAttribute("internal-wire") || "--itemInjected";

    }

}

window.customElements.define('flow-repeat', FlowRepeat);