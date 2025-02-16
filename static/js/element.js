class SurveyComponent extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('survey-template').content;
    this.attachShadow({ mode: 'open' }).appendChild(template.cloneNode(true));
  }

  async connectedCallback() {
    this.uuid = this.getAttribute("uuid");
    if (!this.uuid) {
      console.error("UUID не найден");
      return;
    }
    this.loadSurvey();
  }

  loadSurvey() {
    fetch(`/api/1.0/survey/${this.uuid}`)
      .then(response => response.json())
      .then(data => {
        this.surveyData = data;
        this.currentQuestionIndex = -1;
        this.answers = {};
        this.renderIntro();
      })
      .catch(error => console.error("Ошибка загрузки опроса", error));
  }

  renderIntro() {
    this.shadowRoot.querySelector("#survey-title").textContent = this.surveyData.survey.name;
    this.shadowRoot.querySelector("#survey-description").textContent = this.surveyData.survey.description;
    this.shadowRoot.querySelector("#startButton").addEventListener("click", () => this.startSurvey());
  }

  startSurvey() {
    this.currentQuestionIndex = 0;
    this.shadowRoot.querySelector("#intro").classList.add("hidden");
    this.shadowRoot.querySelector("#questions").classList.remove("hidden");
    this.shadowRoot.querySelector("#navigation").classList.remove("hidden");
    this.shadowRoot.querySelector("#pagination").classList.remove("hidden");
    this.renderQuestion();
  }

  renderQuestion() {
    const slot = this.shadowRoot.querySelector("slot[name='questions']");
    slot.innerHTML = "";
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

    slot.appendChild(questionDiv);
    this.updatePagination();
    this.updateNavigation();
  }

  updatePagination() {
    const pagination = this.shadowRoot.querySelector("#pagination");
    pagination.innerHTML = "";

    this.surveyData.questions.forEach((_, index) => {
      const button = document.createElement("button");
      button.textContent = index + 1;
      button.classList.add("pagination-button");
      if (index === this.currentQuestionIndex) {
        button.classList.add("active");
      }
      button.addEventListener("click", () => {
        this.currentQuestionIndex = index;
        this.renderQuestion();
      });
      pagination.appendChild(button);
    });
  }

  updateNavigation() {
    const prevButton = this.shadowRoot.querySelector("#prevButton");
    const nextButton = this.shadowRoot.querySelector("#nextButton");
    const submitButton = this.shadowRoot.querySelector("#submitButton");

    prevButton.classList.toggle("hidden", this.currentQuestionIndex === 0);
    nextButton.classList.toggle("hidden", this.currentQuestionIndex >= this.surveyData.questions.length - 1);
    submitButton.classList.toggle("hidden", this.currentQuestionIndex < this.surveyData.questions.length - 1);

    prevButton.onclick = () => {
      this.currentQuestionIndex--;
      this.renderQuestion();
    };
    nextButton.onclick = () => {
      this.currentQuestionIndex++;
      this.renderQuestion();
    };
    submitButton.onclick = () => this.showConfirmation();
  }

  showConfirmation() {
    const slot = this.shadowRoot.querySelector("slot[name='questions']");
    slot.innerHTML = "";

    // Скрываем панель навигации
    const navigationContainer = this.shadowRoot.querySelector("#navigation-container");
    if (navigationContainer) {
        navigationContainer.style.display = "none";
    }

    const confirmationDiv = document.createElement("div");
    confirmationDiv.innerHTML = `
      <p><strong>Вы уверены, что хотите отправить ответы?</strong></p>
      <button id="confirmSubmit">Отправить</button>
      <button id="cancelSubmit">Назад</button>
    `;

    slot.appendChild(confirmationDiv);

    this.shadowRoot.querySelector("#confirmSubmit").addEventListener("click", () => this.submitSurvey());
    this.shadowRoot.querySelector("#cancelSubmit").addEventListener("click", () => this.cancelSubmit());
}

cancelSubmit() {
    // Показываем панель навигации обратно
    const navigationContainer = this.shadowRoot.querySelector("#navigation-container");
    if (navigationContainer) {
        navigationContainer.style.display = "flex";
    }

    this.renderQuestion();
}

  submitSurvey() {
    fetch(`/api/1.0/survey/${this.uuid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.answers)
    })
    .then(response => response.json())
    .then(result => {
      console.log("Результат отправки:", result);
      alert("Спасибо за участие в опросе!");
    })
    .catch(error => console.error("Ошибка отправки", error));
  }
}

customElements.define("survey-component", SurveyComponent);
