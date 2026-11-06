const GROQ_API_KEY = "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"; 

async function sendMessage() {
    const inputField = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const userText = inputField.value.trim();

    if (!userText) return;

    // Display User Message
    const userMsgDiv = document.createElement("div");
    userMsgDiv.className = "message user-message";
    userMsgDiv.innerText = userText;
    chatBox.appendChild(userMsgDiv);
    inputField.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // Display Loading / AI Response
    const aiMsgDiv = document.createElement("div");
    aiMsgDiv.className = "message ai-message";
    aiMsgDiv.innerText = "Phoenix is thinking...";
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
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: userText }]
            })
        });

        const data = await response.json();
        const reply = data.choices[0].message.content;
        aiMsgDiv.innerText = reply;
    } catch (error) {
        aiMsgDiv.innerText = "An error occurred while connecting to Groq.";
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}
