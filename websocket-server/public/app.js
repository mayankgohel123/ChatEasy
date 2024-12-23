// Initialize socket.io connection
const socket = io();

// Get elements
const messageInput = document.getElementById('messageInput');
const messageForm = document.getElementById('messageForm');
const chatBox = document.getElementById('chatBox');
const username = localStorage.getItem('username'); // Assume the username is stored in localStorage
const group = localStorage.getItem('group'); // Assume the group name is stored in localStorage

// Listen for form submission to send a message
messageForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent the form from reloading the page

  const message = messageInput.value;
  
  if (message.trim()) {
    // Emit the message to the server
    socket.emit('chat message', { group, username, message });
    
    // Clear the message input field
    messageInput.value = '';
  }
});

// Listen for incoming messages
socket.on('chat message', (data) => {
  displayMessage(data.sender, data.text, data.sender === username ? 'sent' : 'received');
});

// Listen for chat history (when the user joins the group)
socket.on('chat history', (messages) => {
  chatBox.innerHTML = ''; // Clear chat box before loading history

  messages.forEach((message) => {
    displayMessage(message.sender, message.text, message.sender === username ? 'sent' : 'received');
  });

  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom after loading history
});

// Display the message in the chat box
function displayMessage(sender, text, type) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', type);
  messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(messageElement);
}
