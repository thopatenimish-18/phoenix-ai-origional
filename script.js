const GROQ_API_KEY = "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"; 

function checkEnter(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

function sendPreset(text) {
    document.getElementById("user-input").value = text;
    sendMessage();
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
