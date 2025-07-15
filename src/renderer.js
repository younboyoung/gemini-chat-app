const { ipcRenderer } = require('electron');

class GeminiChatApp {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.currentAssistantMessageDiv = null; // 현재 스트리밍 중인 어시스턴트 메시지 div
        this.fullResponse = ''; // 전체 응답을 저장할 변수
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

        // 메인 프로세스로부터 Gemini 응답 수신
        ipcRenderer.on('gemini-response', (event, data) => {
            this.handleGeminiResponse(data);
        });

        // 메인 프로세스로부터 에러 수신
        ipcRenderer.on('gemini-error', (event, errorMessage) => {
            this.showError(errorMessage);
            this.showLoading(false);
            this.sendBtn.disabled = false;
        });
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }

    sendMessage() {
        if (this.sendBtn.disabled) return;
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 사용자 메시지 추가
        this.addMessage('user', message);
        this.messageInput.value = '';
        this.autoResizeTextarea();

        // 로딩 표시 및 새 어시스턴트 메시지 준비
        this.showLoading(true);
        this.sendBtn.disabled = true;
        this.prepareForNewAssistantMessage();

        // 메인 프로세스로 메시지 전송
        ipcRenderer.send('send-to-gemini', message);
    }

    handleGeminiResponse(data) {
        this.showLoading(false);
        this.sendBtn.disabled = false;

        // 응답 데이터를 한 글자씩 점진적으로 표시
        this.fullResponse += data;
        if (this.currentAssistantMessageDiv) {
            const contentDiv = this.currentAssistantMessageDiv.querySelector('.message-content');
            contentDiv.textContent = this.fullResponse; // 전체 응답을 계속 업데이트
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    prepareForNewAssistantMessage() {
        // 이전 응답 스트리밍이 완료되었으므로, 새 메시지 div를 생성
        this.fullResponse = ''; // 새 응답을 위해 초기화
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = ''; // 처음에는 비어있음

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        this.chatMessages.appendChild(messageDiv);

        this.currentAssistantMessageDiv = messageDiv;

        // 스크롤을 맨 아래로
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
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
