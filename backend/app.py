from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    symptoms = data.get('symptoms', [])
    # Mock prediction logic based on keywords
    if not symptoms:
        return jsonify({"status": "error", "message": "No symptoms provided."}), 400
        
    symptoms_text = " ".join(symptoms).lower()
    
    # Simple mocked rule-based predictions
    if "fever" in symptoms_text and "cough" in symptoms_text:
        disease = "Viral Infection"
        confidence = "89%"
        recommendation = "Rest, stay hydrated, and monitor temperature."
        remedies = ["Warm fluids", "Honey and ginger", "Rest"]
    elif "headache" in symptoms_text and "nausea" in symptoms_text:
        disease = "Migraine"
        confidence = "92%"
        recommendation = "Rest in a quiet, dark room."
        remedies = ["Cold compress on forehead", "Stay hydrated", "Avoid bright lights"]
    elif "stomach" in symptoms_text or "pain" in symptoms_text:
        disease = "Gastroenteritis"
        confidence = "75%"
        recommendation = "Eat bland foods, stay hydrated with electrolytes."
        remedies = ["BRAT diet (Bananas, Rice, Applesauce, Toast)", "Peppermint tea"]
    else:
        disease = "Common Cold or Fatigue"
        confidence = "80%"
        recommendation = "Rest, drink fluids, and avoid cold places."
        remedies = ["Ginger tea", "Warm salt water gargle", "Adequate sleep"]
        
    return jsonify({
        "status": "success",
        "disease": disease,
        "confidence": confidence,
        "recommendation": recommendation,
        "remedies": remedies
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '').lower()
    
    # NLP / Intent logic mocked
    response = "I'm AI Doctor Pro. How can I assist you with your health today?"
    if "headache" in message:
        response = "Headaches can be caused by stress, dehydration, or lack of sleep. Have you been drinking enough water?"
    elif "fever" in message:
        response = "A fever is usually a sign that your body is fighting an infection. Please take your temperature and let me know if it's over 103°F (39.4°C)."
    elif "how are you" in message:
        response = "I am an AI, so I don't have feelings, but I'm operating at 100% capacity to help you!"
    elif "hello" in message or "hi" in message:
        response = "Hello! Welcome to AI Doctor Pro. You can tell me your symptoms or ask a health-related question."
    elif "emergency" in message:
        response = "If this is a medical emergency, please call your local emergency services immediately (e.g., 911) or visit the nearest hospital."
        
    return jsonify({
        "status": "success",
        "message": response
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
