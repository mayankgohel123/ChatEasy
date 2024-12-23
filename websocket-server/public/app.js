const socket = io();
let currentGroup = null;

// Join group
document.getElementById('joinGroupButton').addEventListener('click', () => {
  const username = document.getElementById('usernameInput').value.trim();
  const group = document.getElementById('groupInput').value.trim();

  if (username && group) {
    currentGroup = group;
    socket.emit('join group', { username, group });

    // Hide login screen and show chat screen
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('chatScreen').style.display = 'flex';
    document.getElementById('groupTitle').textContent = `Group: ${group}`;
  }
});

// Send message
document.getElementById('sendButton').addEventListener('click', () => {
  const message = document.getElementById('messageInput').value.trim();
  const username = document.getElementById('usernameInput').value.trim();

  if (message) {
    // Emit the message to the server
    socket.emit('chat message', { group: currentGroup, username, message });

    document.getElementById('messageInput').value = ''; // Clear message input
  }
});

// Receive chat messages
socket.on('chat message', ({ sender, text }) => {
  displayMessage(sender, text, 'received');
});

// Load previous chat history when joining a group
socket.on('chat history', (messages) => {
  const chatBox = document.getElementById('chatBox');
  chatBox.innerHTML = ''; // Clear chat box before loading history
  
  messages.forEach((message) => {
    displayMessage(message.sender, message.text, message.sender === 'You' ? 'sent' : 'received');
  });
  
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom after loading history
});

// Helper function to display messages
function displayMessage(sender, text, type) {
  const chatBox = document.getElementById('chatBox');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', type);
  messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

// Leave group
document.getElementById('leaveGroupButton').addEventListener('click', () => {
  location.reload(); // Reload the page when leaving the group
});
