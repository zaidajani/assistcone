(function() {
  const currentScript = document.currentScript;
  const agentId = currentScript.getAttribute('data-agent-id');
  
  if (!agentId) {
    console.error('Assistcone Widget: data-agent-id attribute is required.');
    return;
  }

  const BASE_URL = 'http://localhost:3000'; // In production, this would be the actual domain

  // Inject Styles
  const style = document.createElement('style');
  style.innerHTML = `
    .assistcone-widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    .assistcone-launcher {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #5b13ec;
      box-shadow: 0 4px 14px rgba(91, 19, 236, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }
    
    .assistcone-launcher:hover {
      transform: scale(1.05);
    }
    
    .assistcone-launcher svg {
      width: 28px;
      height: 28px;
      color: white;
    }
    
    .assistcone-chat-window {
      display: none;
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 550px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      flex-direction: column;
    }
    
    .assistcone-chat-window.open {
      display: flex;
    }
    
    .assistcone-header {
      background: #5b13ec;
      padding: 16px 20px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .assistcone-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .assistcone-avatar {
      width: 36px;
      height: 36px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .assistcone-close {
      cursor: pointer;
      opacity: 0.8;
    }
    
    .assistcone-close:hover {
      opacity: 1;
    }
    
    .assistcone-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .assistcone-msg {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 20px;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .assistcone-msg.ai {
      background: #5b13ec;
      color: white;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    
    .assistcone-msg.user {
      background: white;
      border: 1px solid #e2e8f0;
      color: #1e293b;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    
    .assistcone-input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 12px;
    }
    
    .assistcone-input {
      flex: 1;
      border: none;
      background: #f1f5f9;
      padding: 12px 20px;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
    }
    
    .assistcone-input:focus {
      background: #e2e8f0;
    }
    
    .assistcone-send {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #5b13ec;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .assistcone-send:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }
    
    .assistcone-escalate-btn {
      text-align: center;
      padding: 8px 0;
      font-size: 13px;
      color: #64748b;
      cursor: pointer;
      background: white;
      border-top: 1px solid #f1f5f9;
    }
    
    .assistcone-escalate-btn:hover {
      color: #5b13ec;
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);

  // Setup DOM
  const container = document.createElement('div');
  container.className = 'assistcone-widget-container';

  const launcher = document.createElement('div');
  launcher.className = 'assistcone-launcher';
  launcher.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`;

  const chatWindow = document.createElement('div');
  chatWindow.className = 'assistcone-chat-window';
  
  chatWindow.innerHTML = `
    <div class="assistcone-header">
      <div class="assistcone-header-info">
        <div class="assistcone-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        </div>
        <div>
          <div style="font-weight: bold; font-size: 15px;">Support Agent</div>
          <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">🟢 Online</div>
        </div>
      </div>
      <div class="assistcone-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </div>
    </div>
    <div class="assistcone-messages" id="ac-messages">
       <div class="assistcone-msg ai">Hi there! How can I assist you today?</div>
    </div>
    <div class="assistcone-escalate-btn" id="ac-escalate">Talk to a human</div>
    <div class="assistcone-input-area">
      <input type="text" class="assistcone-input" id="ac-input" placeholder="Type your message..." />
      <button class="assistcone-send" id="ac-send">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
      </button>
    </div>
  `;

  container.appendChild(chatWindow);
  container.appendChild(launcher);
  document.body.appendChild(container);

  // Logic
  let isOpen = false;
  let currentConversationId = null;

  launcher.addEventListener('click', () => {
    isOpen = !isOpen;
    chatWindow.classList.toggle('open', isOpen);
    launcher.style.transform = isOpen ? 'scale(0)' : 'scale(1)';
  });

  const closeBtn = chatWindow.querySelector('.assistcone-close');
  closeBtn.addEventListener('click', () => {
    isOpen = false;
    chatWindow.classList.remove('open');
    setTimeout(() => {
      launcher.style.transform = 'scale(1)';
    }, 100);
  });

  const messagesContainer = document.getElementById('ac-messages');
  const inputEl = document.getElementById('ac-input');
  const sendBtn = document.getElementById('ac-send');
  const escalateBtn = document.getElementById('ac-escalate');

  function addMessage(text, role) {
    const msg = document.createElement('div');
    msg.className = \`assistcone-msg \${role}\`;
    msg.textContent = text;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    addMessage(text, 'user');
    sendBtn.disabled = true;

    // Simulate typing
    const typingId = 'typing-' + Date.now();
    const typingMsg = document.createElement('div');
    typingMsg.className = 'assistcone-msg ai';
    typingMsg.id = typingId;
    typingMsg.innerHTML = '<span style="opacity: 0.7;">typing...</span>';
    messagesContainer.appendChild(typingMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const res = await fetch(\`\${BASE_URL}/api/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          agentId: agentId,
          conversationId: currentConversationId,
          visitorId: 'visitor_' + Math.floor(Math.random() * 100000)
        })
      });

      const data = await res.json();
      document.getElementById(typingId).remove();

      if (data.error) {
        addMessage("Sorry, I'm experiencing technical difficulties right now.", 'ai');
      } else {
        currentConversationId = data.conversationId;
        addMessage(data.response, 'ai');
      }
    } catch (err) {
      document.getElementById(typingId).remove();
      addMessage("Network error. Please try again.", 'ai');
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  escalateBtn.addEventListener('click', async () => {
    if (!currentConversationId) {
      addMessage("Please start a conversation first before escalating.", 'ai');
      return;
    }

    escalateBtn.textContent = 'Escalating...';
    try {
      const res = await fetch(\`\${BASE_URL}/api/escalate\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversationId,
          agentId: agentId,
          userEmail: prompt('Please enter your email so support can reach you:')
        })
      });
      if (res.ok) {
        escalateBtn.textContent = 'Support Notified ✔';
        addMessage("Your request has been sent to our human support team. They will email you shortly.", 'ai');
      }
    } catch (err) {
      escalateBtn.textContent = 'Talk to a human';
    }
  });

})();
