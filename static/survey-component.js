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
                    margin-top: 10px; /* Расстояние между кнопками */
                }
                button:hover {
                    background-color: #0056b3;
                }
                input {
                    display: block;
                    margin-top: 10px;
                    padding: 5px;
                    width: calc(100% - 12px);
                }
                /* Только для кнопок вариантов с несколькими ответами */
                .option-button {
                    margin-left: 10px; 
                    margin-right: 10px; 
                }
            </style>
            <h3>Опрос</h3>
            <div id="questions"></div>
            <button id="startButton">Начать</button>
        `;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.answers = {}; // Хранение ответов
        this.completed = false; // Флаг завершения
        this.startSurvey = this.startSurvey.bind(this);
        this.loadQuestions();
    }

    async loadQuestions() {
        try {
            const response = await fetch('/questions.json'); // Загружаем JSON
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
            this.questions = await response.json();
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
        }
    }

    connectedCallback() {
        this.shadowRoot.querySelector('#startButton').addEventListener('click', this.startSurvey);
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector('#startButton').removeEventListener('click', this.startSurvey);
    }

    startSurvey() {
        // Скрываем кнопку "Начать" сразу, как только начинается опрос
        this.shadowRoot.querySelector('#startButton').style.display = 'none';

        if (this.completed) {
            this.showCompletionMessage();
            return;
        }
        if (this.questions.length > 0) {
            this.showQuestion();
        } else {
            alert('Вопросы не загружены!');
        }
    }

    showQuestion() {
        const container = this.shadowRoot.querySelector('#questions');
        container.innerHTML = '';
        
        if (this.currentQuestionIndex < this.questions.length) {
            const question = this.questions[this.currentQuestionIndex];
            const questionElement = document.createElement('p');
            questionElement.textContent = question.text;
            container.appendChild(questionElement);

            if (question.type === 'multiple-choice') {
                question.options.forEach(option => {
                    const button = document.createElement('button');
                    button.textContent = option;
                    button.classList.add('option-button'); 
                    button.addEventListener('click', () => this.saveAnswer(question.id, option));
                    container.appendChild(button);
                });
            } else if (question.type === 'text') {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = 'Введите ваш ответ';
                container.appendChild(input);
                
                const submitButton = document.createElement('button');
                submitButton.textContent = 'Ответить';
                submitButton.addEventListener('click', () => this.saveAnswer(question.id, input.value));
                container.appendChild(submitButton);
            }
        } else {
            this.submitAnswers();
        }
    }

    saveAnswer(questionId, answer) {
        this.answers[questionId] = answer;
        this.currentQuestionIndex++;
        this.showQuestion();
    }

    async submitAnswers() {
        try {
            const response = await fetch('/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.answers)
            });
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
            
            this.completed = true;
            this.showCompletionMessage();
        } catch (error) {
            console.error('Ошибка отправки ответов:', error);
        }
    }

    showCompletionMessage() {
        const container = this.shadowRoot.querySelector('#questions');
        container.innerHTML = '<p>Спасибо! Ответы отправлены.</p>';
        this.shadowRoot.querySelector('#startButton').style.display = 'none';
    }
}

customElements.define('survey-component', SurveyComponent);
