// AI Assistant — online (OpenAI/Anthropic) or local (Ollama) chat
const Assistant = {
    mode: 'online',

    initialize() {
        // Restore API key from localStorage
        const savedKey = localStorage.getItem('assistant_api_key');
        if (savedKey) {
            const keyInput = document.getElementById('apiKey');
            if (keyInput) keyInput.value = savedKey;
        }

        // Mode selector
        document.querySelectorAll('.assistant-mode').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.assistant-mode').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;

                document.getElementById('configOnline').style.display = this.mode === 'online' ? '' : 'none';
                document.getElementById('configLocal').style.display = this.mode === 'local' ? '' : 'none';
            });
        });

        // Send button
        const sendBtn = document.getElementById('chatSend');
        const input = document.getElementById('chatInput');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this._handleSend());
        }
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this._handleSend();
                }
            });
        }

        // Save API key on change
        const apiKeyInput = document.getElementById('apiKey');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('change', () => {
                localStorage.setItem('assistant_api_key', apiKeyInput.value);
            });
        }
    },

    _handleSend() {
        const input = document.getElementById('chatInput');
        const text = (input.value || '').trim();
        if (!text) return;
        input.value = '';
        this._addBubble('user', text);
        this.sendMessage(text);
    },

    _addBubble(role, text) {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${role}`;
        bubble.textContent = text;
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
        return bubble;
    },

    _getSystemPrompt() {
        const data = DataStore.getData();
        const stats = {
            students: data.students.length,
            courses: data.courseResults.length,
            classifications: data.classifications.length,
            avgGPA: DataStore.calculateAverageGPA(),
            avgAttendance: DataStore.calculateAverageAttendance(),
            passRate: DataStore.calculatePassRate(),
            completionRate: DataStore.calculateCompletionRate(),
            programmes: DataStore.getProgrammes().join(', '),
            schools: DataStore.getSchools().join(', '),
            years: DataStore.getAcademicYears().join(', ')
        };

        return `You are an AI assistant for a Student Performance Analytics Dashboard. Help analyse the data.

Current data summary:
- Students: ${stats.students}
- Course results: ${stats.courses}
- Classifications: ${stats.classifications}
- Average GPA: ${stats.avgGPA} / 22
- Average attendance: ${stats.avgAttendance}%
- Overall pass rate: ${stats.passRate}%
- Completion rate: ${stats.completionRate}%
- Programmes: ${stats.programmes}
- Schools: ${stats.schools}
- Academic years: ${stats.years}

Provide concise, data-driven answers. Reference specific metrics when possible.`;
    },

    async sendMessage(text) {
        if (this.mode === 'online') {
            await this._sendOnline(text);
        } else {
            await this._sendLocal(text);
        }
    },

    async _sendOnline(text) {
        const apiKey = document.getElementById('apiKey')?.value;
        const model = document.getElementById('onlineModel')?.value || 'gpt-4o-mini';

        if (!apiKey) {
            this._addBubble('assistant', 'Please enter an API key to use the online assistant.');
            return;
        }

        const thinkingBubble = this._addBubble('assistant', 'Thinking...');

        try {
            const isAnthropic = model.startsWith('claude');
            let response;

            if (isAnthropic) {
                response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: JSON.stringify({
                        model: model,
                        max_tokens: 1024,
                        system: this._getSystemPrompt(),
                        messages: [{ role: 'user', content: text }]
                    })
                });
                const data = await response.json();
                if (data.error) throw new Error(data.error.message);
                thinkingBubble.textContent = data.content?.[0]?.text || 'No response received.';
            } else {
                response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: 'system', content: this._getSystemPrompt() },
                            { role: 'user', content: text }
                        ],
                        max_tokens: 1024
                    })
                });
                const data = await response.json();
                if (data.error) throw new Error(data.error.message);
                thinkingBubble.textContent = data.choices?.[0]?.message?.content || 'No response received.';
            }
        } catch (err) {
            thinkingBubble.textContent = `Error: ${err.message}`;
        }
    },

    async _sendLocal(text) {
        const ollamaUrl = document.getElementById('ollamaUrl')?.value || 'http://localhost:11434';
        const model = document.getElementById('localModel')?.value || 'llama3.2';

        const thinkingBubble = this._addBubble('assistant', 'Thinking...');

        try {
            const response = await fetch(`${ollamaUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    prompt: text,
                    system: this._getSystemPrompt(),
                    stream: false
                })
            });
            const data = await response.json();
            thinkingBubble.textContent = data.response || 'No response received.';
        } catch (err) {
            thinkingBubble.textContent = `Error: Could not connect to Ollama at ${ollamaUrl}. Is it running?`;
        }
    }
};
