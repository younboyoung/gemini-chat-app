const { ipcRenderer } = require('electron');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiChatApp {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.chatHistory = [];
        this.initializeElements();
        this.setupEventListeners();
        this.initializeGemini();
    }

    initializeElements() {
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.chatMessages = document.getElementById('chat-messages');
        this.loading = document.getElementById('loading');
        this.minimizeBtn = document.getElementById('minimize-btn');
        this.closeBtn = document.getElementById('close-btn');
    }

    setupEventListeners() {
        // 전송 버튼 클릭
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // 엔터 키 처리
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 텍스트 입력 시 자동 리사이즈
        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });

        // 윈도우 제어
        this.minimizeBtn.addEventListener('click', () => {
            ipcRenderer.send('hide-window');
        });

        this.closeBtn.addEventListener('click', () => {
            ipcRenderer.send('close-app');
        });

        // ESC 키로 윈도우 숨기기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ipcRenderer.send('hide-window');
            }
        });
    }

    async initializeGemini() {
        try {
            const apiKey = await ipcRenderer.invoke('get-api-key');
            if (!apiKey) {
                this.showError('Gemini API 키가 설정되지 않았습니다.\n.env 파일에 GEMINI_API_KEY를 설정해주세요.');
                return;
            }

            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

            console.log('Gemini AI가 초기화되었습니다.');
        } catch (error) {
            console.error('Gemini AI 초기화 실패:', error);
            this.showError('Gemini AI 초기화에 실패했습니다.');
        }
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.model) return;

        // 사용자 메시지 추가
        this.addMessage('user', message);
        this.messageInput.value = '';
        this.autoResizeTextarea();

        // 로딩 표시
        this.showLoading(true);
        this.sendBtn.disabled = true;

        try {
            // Gemini API 호출
            const chat = this.model.startChat({
                history: this.chatHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                }
            });

            const result = await chat.sendMessage(message);
            const response = result.response;
            const text = response.text();

            // 응답 메시지 추가
            this.addMessage('assistant', text);

            // 채팅 히스토리 업데이트
            this.chatHistory.push(
                { role: 'user', parts: [{ text: message }] },
                { role: 'model', parts: [{ text: text }] }
            );

        } catch (error) {
            console.error('메시지 전송 실패:', error);
            this.addMessage('assistant', '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            this.showLoading(false);
            this.sendBtn.disabled = false;
            this.messageInput.focus();
        }
    }

    addMessage(role, content) {
        // 환영 메시지 제거
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        this.chatMessages.appendChild(messageDiv);

        // 스크롤을 맨 아래로
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showLoading(show) {
        if (show) {
            this.loading.classList.remove('hidden');
        } else {
            this.loading.classList.add('hidden');
        }
    }

    showError(message) {
        this.addMessage('assistant', `❌ ${message}`);
    }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    new GeminiChatApp();
});

// 포커스 처리
window.addEventListener('focus', () => {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.focus();
    }
});