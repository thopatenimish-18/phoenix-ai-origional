const GROQ_API_KEY = "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"; 

let currentChatId = Date.now().toString();

window.onload = function() {
    loadChatHistoryList();
    loadActiveChat(currentChatId);
};

function checkEnter(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

function sendPreset(text) {
    document.getElementById("user-input").value = text;
    sendMessage();
}

function startNewChat() {
    currentChatId = Date.now().toString();
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = `
        <div class="message ai-message">
            <div class="avatar">🔥</div>
            <div class="content">Started a new chat! How can I help you with your next topic?</div>
        </div>
    `;
    saveCurrentChat([]);
    loadChatHistoryList();
}

function loadChatHistoryList() {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";
    
    const keys = Object.keys(localStorage).filter(k => k.startsWith("phoenix_chat_"));
    keys.sort().reverse(); // Show newest first

    keys.forEach(key => {
        const chatId = key.replace("phoenix_chat_", "");
        const chatData = JSON.parse(localStorage.getItem(key));
        if (chatData && chatData.length > 0) {
            const firstMsg = chatData[0].text;
            const btn = document.createElement("button");
            btn.className = "history-item";
            btn.innerText = firstMsg;
            btn.onclick = () => {
                currentChatId = chatId;
                renderChat(chatData);
            };
            historyList.appendChild(btn);
        }
    });
}

function renderChat(messages) {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";
    
    if (messages.length === 0) {
        chatBox.innerHTML = `
            <div class="message ai-message">
                <div class="avatar">🔥</div>
                <div class="content">Hello! I'm Phoenix. How can I help you master your studies or build your projects today?</div>
            </div>
        `;
        return;
    }

    messages.forEach(msg => {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`;
        msgDiv.innerHTML = `
            <div class="avatar">${msg.role === 'user' ? '👤' : '🔥'}</div>
            <div class="content">${escapeHtml(msg.text)}</div>
        `;
        chatBox.appendChild(msgDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

function saveCurrentChat(messages) {
    localStorage.setItem(`phoenix_chat_${currentChatId}`, JSON.stringify(messages));
    loadChatHistoryList();
}

function getStoredMessages() {
    const data = localStorage.getItem(`phoenix_chat_${currentChatId}`);
    return data ? JSON.parse(data) : [];
}

async function sendMessage() {
    const inputField = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const userText = inputField.value.trim();

    if (!userText) return;

    // Display User Message
    const userMsgDiv = document.createElement("div");
    userMsgDiv.className = "message user-message";
    userMsgDiv.innerHTML = `
        <div class="avatar">👤</div>
        <div class="content">${escapeHtml(userText)}</div>
    `;
    chatBox.appendChild(userMsgDiv);
    inputField.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // Save to local storage array
    let messages = getStoredMessages();
    messages.push({ role: 'user', text: userText });
    saveCurrentChat(messages);

    // Display Loading AI Message
    const aiMsgDiv = document.createElement("div");
    aiMsgDiv.className = "message ai-message";
    aiMsgDiv.innerHTML = `
        <div class="avatar">🔥</div>
        <div class="content">Phoenix is thinking...</div>
    `;
    chatBox.appendChild(aiMsgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [{ role: "user", content: userText }]
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            const reply = data.choices[0].message.content;
            aiMsgDiv.querySelector(".content").innerText = reply;
            messages.push({ role: 'ai', text: reply });
            saveCurrentChat(messages);
        } else if (data.error) {
            aiMsgDiv.querySelector(".content").innerText = "Groq Error: " + data.error.message;
        } else {
            aiMsgDiv.querySelector(".content").innerText = "Received an unexpected response format.";
        }
    } catch (error) {
        aiMsgDiv.querySelector(".content").innerText = "Network connection error.";
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
