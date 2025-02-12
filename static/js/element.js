class SurveyComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
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
                    margin-top: 10px;
                }
                button:hover {
                    background-color: #0056b3;
                }
                input[type="radio"] {
                    margin-right: 5px;
                }
                .hidden {
                    display: none;
                }
                #navigation {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                }
                #prevButton {
                    margin-right: auto;
                }
                #nextButton {
                    margin-left: auto;
                }
                #confirmation {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 20px;
                    border: 1px solid #ddd;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    border-radius: 5px;
                    z-index: 1000;
                }
                #confirmation.hidden {
                    display: none;
                }
                #overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                }
                #overlay.hidden {
                    display: none;
                }
            </style>
            <div id="intro">
                <h3 id="survey-title">Опрос</h3>
                <p id="survey-description"></p>
                <button id="startButton">Начать</button>
            </div>
            <div id="questions" class="hidden"></div>
            <div id="navigation" class="hidden">
                <button id="prevButton" class="hidden">Назад</button>
                <button id="nextButton" class="hidden">Вперед</button>
                <button id="submitButton" class="hidden">Завершить</button>
            </div>
            <div id="overlay" class="hidden"></div>
            <div id="confirmation" class="hidden">
                <p>Вы уверены, что хотите отправить ответы?</p>
                <button id="confirmSubmit">Отправить</button>
                <button id="cancelSubmit">Назад</button>
            </div>
        `;
    }

    async connectedCallback() {
        this.uuid = this.getAttribute("uuid");
        if (!this.uuid) {
            console.error("UUID не найден");
            return;
        }
        await this.loadSurvey();
    }

    async loadSurvey() {
        try {
            const response = await fetch(`/api/1.0/survey/${this.uuid}`);
            const data = await response.json();
            this.surveyData = data;
            this.currentQuestionIndex = 0;
            this.answers = {};
            this.renderIntro();
        } catch (error) {
            console.error("Ошибка загрузки опроса", error);
        }
    }

    renderIntro() {
        this.shadowRoot.querySelector("#survey-title").textContent = this.surveyData.survey.name;
        this.shadowRoot.querySelector("#survey-description").textContent = this.surveyData.survey.description;
        this.shadowRoot.querySelector("#startButton").addEventListener("click", () => this.startSurvey());

        // Скрываем кнопку "Вперед" на этапе вступления
        this.shadowRoot.querySelector("#nextButton").style.display = "none";
    }

    startSurvey() {
        this.shadowRoot.querySelector("#intro").classList.add("hidden");
        this.shadowRoot.querySelector("#questions").classList.remove("hidden");
        this.shadowRoot.querySelector("#navigation").classList.remove("hidden");
        this.renderQuestion();
    }

    renderQuestion() {
        const questionsContainer = this.shadowRoot.querySelector("#questions");
        questionsContainer.innerHTML = "";
        
        const question = this.surveyData.questions[this.currentQuestionIndex];
        const questionDiv = document.createElement("div");
        questionDiv.innerHTML = `<p><strong>${question.name}</strong></p>`;
        
        question.answers.forEach(answer => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = question.uuid;
            input.value = answer.uuid;
            
            if (this.answers[question.uuid] === answer.uuid) {
                input.checked = true;
            }

            input.addEventListener("change", () => {
                this.answers[question.uuid] = input.value;
            });
            
            label.appendChild(input);
            label.appendChild(document.createTextNode(answer.name));
            questionDiv.appendChild(label);
            questionDiv.appendChild(document.createElement("br"));
        });
        
        questionsContainer.appendChild(questionDiv);
        this.updateNavigation();
    }

    updateNavigation() {
        const prevButton = this.shadowRoot.querySelector("#prevButton");
        const nextButton = this.shadowRoot.querySelector("#nextButton");
        const submitButton = this.shadowRoot.querySelector("#submitButton");
        
        prevButton.style.display = this.currentQuestionIndex > 0 ? "block" : "none";
        nextButton.style.display = this.currentQuestionIndex < this.surveyData.questions.length - 1 ? "block" : "none";
        submitButton.style.display = this.currentQuestionIndex === this.surveyData.questions.length - 1 ? "block" : "none";
        
        prevButton.onclick = () => {
            this.currentQuestionIndex--;
            this.renderQuestion();
        };
        nextButton.onclick = () => {
            this.currentQuestionIndex++;
            this.renderQuestion();
        };
        submitButton.onclick = () => this.submitSurvey();
    }

    async submitSurvey() {
        try {
            const response = await fetch(`/api/1.0/survey/${this.uuid}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.answers)
            });
            const result = await response.json();
            console.log("Результат отправки:", result);
            alert("Спасибо за участие в опросе!");
        } catch (error) {
            console.error("Ошибка отправки", error);
        }
    }
}

customElements.define("survey-component", SurveyComponent);