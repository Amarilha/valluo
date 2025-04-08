class AIClient {
    constructor() {
        this.apis = [
            { name: 'deepseek', handler: this.callDeepSeek },
            { name: 'openai', handler: this.callOpenAI },
            { name: 'grok', handler: this.callGrok },
            { name: 'gemini', handler: this.callGemini }
        ];
        this.config = {};
    }

    async init() {
        try {
            const response = await fetch('/api/get-config.php');
            this.config = await response.json();
            console.log("Configurações carregadas");
        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
        }
    }

    async queryWithFallback(prompt) {
        for (const api of this.apis) {
            try {
                if (!this.config[api.name]) {
                    console.warn(`Chave para ${api.name} não configurada`);
                    continue;
                }

                console.log(`Tentando ${api.name}...`);
                const response = await api.handler.call(this, prompt);
                return { source: api.name, response };
            } catch (error) {
                console.error(`Erro na API ${api.name}:`, error);
                continue;
            }
        }
        throw new Error("Todas as APIs falharam");
    }

    // Implementações específicas de cada API
    async callDeepSeek(prompt) {
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.deepseek}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callOpenAI(prompt) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.openai}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }]
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callGrok(prompt) {
        const response = await fetch("https://api.xai.com/v1/chat/completions", { // URL hipotética, ajuste conforme a doc oficial
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.grok}` // Chave carregada do config
            },
            body: JSON.stringify({
                model: "grok-3", // Nome hipotético do modelo, ajuste conforme necessário
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7, // Mantendo consistência com DeepSeek
                max_tokens: 500 // Limite de tokens, ajuste conforme necessidade
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API Grok: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content; // Estrutura típica de resposta, ajuste se necessário
    }

    async callGemini(prompt) {
        // Implementação para Gemini API (ainda não fornecida)
        throw new Error("Gemini não implementado ainda");
    }
}

// Uso na aplicação
document.addEventListener('DOMContentLoaded', async () => {
    const aiClient = new AIClient();
    await aiClient.init();

    document.getElementById('send-btn').addEventListener('click', async () => {
        const prompt = document.getElementById('user-input').value;
        if (!prompt) return;

        try {
            const result = await aiClient.queryWithFallback(prompt);
            console.log(`Resposta de ${result.source}:`, result.response);
            // Exibir resposta na UI (ex.: atualizar um elemento HTML)
            document.getElementById('output').innerText = result.response;
        } catch (error) {
            console.error("Erro completo:", error);
            // Exibir erro na UI
            document.getElementById('output').innerText = "Erro: Todas as APIs falharam.";
        }
    });
});