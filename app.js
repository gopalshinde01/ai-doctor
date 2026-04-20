document.addEventListener('DOMContentLoaded', () => {
    // ---- Auth Logic ----
    if (!localStorage.getItem('loggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedIn');
            window.location.href = 'login.html';
        });
    }

    // ---- Symptom Checker Logic ----
    const symptomInput = document.getElementById('symptom-input');
    const addSymptomBtn = document.getElementById('add-symptom-btn');
    const symptomsList = document.getElementById('symptoms-list');
    const predictBtn = document.getElementById('predict-btn');
    const predictionResult = document.getElementById('prediction-result');
    
    let symptoms = [];

    const addSymptom = () => {
        const value = symptomInput.value.trim();
        if (value && !symptoms.includes(value.toLowerCase())) {
            symptoms.push(value.toLowerCase());
            renderSymptoms();
            symptomInput.value = '';
        }
    };

    addSymptomBtn.addEventListener('click', addSymptom);
    symptomInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addSymptom();
    });

    window.removeSymptom = (symptom) => {
        symptoms = symptoms.filter(s => s !== symptom);
        renderSymptoms();
    };

    const renderSymptoms = () => {
        symptomsList.innerHTML = '';
        symptoms.forEach(sym => {
            const tag = document.createElement('div');
            tag.className = 'symptom-tag';
            tag.innerHTML = `
                ${sym}
                <i class="fa-solid fa-xmark" onclick="removeSymptom('${sym}')"></i>
            `;
            symptomsList.appendChild(tag);
        });
    };

    predictBtn.addEventListener('click', async () => {
        if (symptoms.length === 0) {
            alert('Please add at least one symptom.');
            return;
        }

        const originalText = predictBtn.innerHTML;
        predictBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
        predictBtn.disabled = true;

        try {
            const response = await fetch('http://127.0.0.1:5000/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ symptoms })
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                document.getElementById('res-disease').textContent = data.disease;
                document.getElementById('res-recommendation').textContent = data.recommendation;
                
                const remediesList = document.getElementById('res-remedies');
                remediesList.innerHTML = '';
                data.remedies.forEach(rem => {
                    const li = document.createElement('li');
                    li.textContent = rem;
                    remediesList.appendChild(li);
                });

                document.querySelector('.confidence-badge').textContent = `${data.confidence} Match`;
                
                predictionResult.classList.remove('hidden');
            } else {
                alert(data.message || 'Error making prediction');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to the backend server. Make sure Python Flask is running.');
        } finally {
            predictBtn.innerHTML = originalText;
            predictBtn.disabled = false;
        }
    });

    // ---- Chat Logic ----
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatMessages = document.getElementById('chat-messages');

    const appendMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        const avatar = sender === 'ai' ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';
        
        msgDiv.innerHTML = `
            <div class="avatar">${avatar}</div>
            <div class="bubble">${text}</div>
        `;
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const sendMessage = async () => {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        chatInput.value = '';

        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai';
        typingDiv.id = typingId;
        typingDiv.innerHTML = `
            <div class="avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="bubble"><i class="fa-solid fa-ellipsis fa-bounce"></i></div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('http://127.0.0.1:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            
            document.getElementById(typingId).remove();
            
            if (data.status === 'success') {
                appendMessage(data.message, 'ai');
            } else {
                appendMessage("I'm having trouble connecting to my knowledge base right now.", 'ai');
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById(typingId).remove();
            appendMessage("Connection error. Please check if the backend server is running on port 5000.", 'ai');
        }
    };

    sendChatBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
