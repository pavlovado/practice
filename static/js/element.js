customElements.define("my-element", class extends HTMLElement {
    connectedCallback() {
        console.log(this.getAttribute("uuid"));
    }
});
