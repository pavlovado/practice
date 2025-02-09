class SurveyComponent extends HTMLElement {
    constructor() {
        super(); //инициализация родительского класса
        this.attachShadow({ mode: 'open' }); //теневой DOM
        //HTML-шаблон в теневой
        this.shadowRoot.innerHTML = ` 
            <style>
                :host {
                    display: block;
                    font-family: Arial, sans-serif;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    max-width: 400px;
                }
                h3 {
                    margin-top: 0;
                }
                button {
                    padding: 8px 12px;
                    border: none;
                    background-color: #007bff;
                    color: white;
                    cursor: pointer;
                    border-radius: 3px;
                }
                button:hover {
                    background-color: #0056b3;
                }
            </style>
            <h3>Опрос</h3>
            <slot></slot>
            <button id="startButton">Начать</button>
        `;

        this.startSurvey = this.startSurvey.bind(this); //фиксируем this внутри метода
    }
    
    connectedCallback() { //рендеринг при добавлении компонента 
        this.shadowRoot.querySelector('#startButton').addEventListener('click', this.startSurvey);
    }
    
    disconnectedCallback() { 
        this.shadowRoot.querySelector('#startButton').removeEventListener('click', this.startSurvey);
    }

    startSurvey() {
        alert('Опрос начат!');
    }

}

customElements.define('survey-component', SurveyComponent);
