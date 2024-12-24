const socket = io();

// Handle Sign-Up Form Submission
document.getElementById('signUpForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const displayName = document.getElementById('displayName').value;

  if (username && password && displayName) {
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, displayName }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.href = '/login'; // Redirect to login page after successful sign-up
      } else {
        alert(data.message); // Show error message if username already exists
      }
    });
  }
});

// Handle Login Form Submission
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username && password) {
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('username', username);
        localStorage.setItem('displayName', data.displayName);
        window.location.href = '/chat'; // Redirect to chat page after successful login
      } else {
        alert(data.message); // Show error message if login fails
      }
    });
  }
});
