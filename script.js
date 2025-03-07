document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const modelSelect = document.getElementById('modelSelect');

    function showCopiedTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'copied-tooltip';
        tooltip.textContent = 'Copied to clipboard!';
        document.body.appendChild(tooltip);
        setTimeout(() => tooltip.remove(), 1500);
    }

    function createMessageElement(message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const textSpan = document.createElement('span');
        textSpan.textContent = message;
        messageDiv.appendChild(textSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-button';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(message);
            showCopiedTooltip();
        };
        actionsDiv.appendChild(copyBtn);

        // Edit button (only for user messages)
        if (isUser) {
            const editBtn = document.createElement('button');
            editBtn.className = 'action-button';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.onclick = () => {
                userInput.value = message;
                userInput.focus();
            };
            actionsDiv.appendChild(editBtn);
        }

        messageDiv.appendChild(actionsDiv);
        return messageDiv;
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        chatMessages.appendChild(createMessageElement(message, true));
        userInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const selectedModel = modelSelect.value;

        try {
            let response;
            
            if (selectedModel === 'qwen') {
                response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${config.OPENROUTER_API_KEY}`,
                        "HTTP-Referer": config.SITE_URL,
                        "X-Title": config.SITE_NAME,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "qwen/qwq-32b:free",
                        "messages": [{ "role": "user", "content": message }]
                    })
                });
            } else if (selectedModel === 'deepseek') {
                response = await fetch("https://api.deepseek.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${config.DEEPSEEK_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "messages": [{ "role": "user", "content": message }]
                    })
                });
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content;
            chatMessages.appendChild(createMessageElement(botResponse, false));
            chatMessages.scrollTop = chatMessages.scrollHeight;

        } catch (error) {
            console.error('Error:', error);
            chatMessages.appendChild(createMessageElement('Error: Could not get response from the model.', false));
        }
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});