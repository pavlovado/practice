from flask import Flask, request, jsonify, send_from_directory
import json
import os

app = Flask(__name__)

# Отдаём index.html из текущей папки
@app.route('/')
def main():
    return send_from_directory(os.getcwd(), 'index.html')

# Отдаём файлы по запросу
@app.route('/<filename>')
def serve_file(filename):
    return send_from_directory(os.getcwd(), filename)

# Отдаём вопросы
@app.route('/questions.json')
def get_questions():
    with open('questions.json', 'r', encoding='utf-8') as file:
        questions = json.load(file)
    return jsonify(questions)

# Принимаем ответы
@app.route('/submit', methods=['POST'])
def submit_answers():
    data = request.get_json()  # Получаем данные в формате JSON
    print("Ответы получены:", data)  # Выводим в консоль
    return jsonify({"message": "Ответы успешно сохранены"}), 200

if __name__ == '__main__':
    app.run(host='localhost', port=8000, debug=True)
