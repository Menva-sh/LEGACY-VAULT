// API Configuration
// Use environment variable if available, otherwise fallback to production
const API_URL = typeof process !== 'undefined' && process.env.VITE_API_URL
  ? process.env.VITE_API_URL
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://legacy-vault-backend-l50w.onrender.com');

console.log(`🔗 API URL: ${API_URL}`);

// Get token from localStorage
function getToken() {
  return localStorage.getItem('jwt_token');
}

// Set token in localStorage
function setToken(token) {
  localStorage.setItem('jwt_token', token);
}

// Remove token
function removeToken() {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user');
}

// API request helper
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies/credentials with every request
  };

  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      console.error(`API Error - Status: ${response.status}, Endpoint: ${endpoint}`);
      
      if (response.status === 401) {
        removeToken();
        window.location.href = 'index.html';
        throw new Error('Token expired - please login again');
      }

      // Try to parse as JSON, but handle HTML responses
      let errorMessage = 'API request failed';
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.error || error.message || 'API request failed';
      } else {
        const text = await response.text();
        console.error('Server response (HTML):', text.substring(0, 200));
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Parse response
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error('Unexpected response format:', text.substring(0, 200));
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}

// Authentication Functions

async function registerUser(email, password, firstName, lastName) {
  const response = await apiRequest('/auth/register', 'POST', {
    email,
    password,
    firstName,
    lastName,
  });
  
  if (response.token) {
    setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  return response;
}

async function loginUser(email, password) {
  const response = await apiRequest('/auth/login', 'POST', {
    email,
    password,
  });

  if (response.token) {
    setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  return response;
}

function logoutUser() {
  removeToken();
  window.location.href = '/';
}

function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Asset Functions

async function createAsset(assetName, assetType, description, filePath, fileSize, isEncrypted) {
  return apiRequest('/assets', 'POST', {
    assetName,
    assetType,
    description,
    filePath,
    fileSize,
    isEncrypted,
  });
}

async function getAssets() {
  return apiRequest('/assets');
}

async function getAsset(assetId) {
  return apiRequest(`/assets/${assetId}`);
}

async function updateAsset(assetId, assetName, description) {
  return apiRequest(`/assets/${assetId}`, 'PUT', {
    assetName,
    description,
  });
}

async function deleteAsset(assetId) {
  return apiRequest(`/assets/${assetId}`, 'DELETE');
}

// Executor Functions

async function addExecutor(executorEmail, executorName, permissions) {
  return apiRequest('/executors', 'POST', {
    executorEmail,
    executorName,
    permissions,
  });
}

async function getExecutors() {
  return apiRequest('/executors');
}

async function getExecutor(executorId) {
  return apiRequest(`/executors/${executorId}`);
}

async function updateExecutor(executorId, executorName, permissions, isActive) {
  return apiRequest(`/executors/${executorId}`, 'PUT', {
    executorName,
    permissions,
    isActive,
  });
}

async function setExecutorStatus(executorId, status) {
  return apiRequest(`/executors/${executorId}/status`, 'PATCH', {
    status,
  });
}

async function removeExecutor(executorId) {
  return apiRequest(`/executors/${executorId}`, 'DELETE');
}

// Will Functions

async function createWill(title, description, content, executorId) {
  return apiRequest('/wills', 'POST', {
    title,
    description,
    content,
    executorId,
  });
}

async function getWills() {
  return apiRequest('/wills');
}

async function getWill(willId) {
  return apiRequest(`/wills/${willId}`);
}

async function updateWill(willId, title, description, content) {
  return apiRequest(`/wills/${willId}`, 'PUT', {
    title,
    description,
    content,
  });
}

async function publishWill(willId, effectiveDate) {
  return apiRequest(`/wills/${willId}/publish`, 'PATCH', {
    effectiveDate,
  });
}

async function deleteWill(willId) {
  return apiRequest(`/wills/${willId}`, 'DELETE');
}

// Switch Functions

async function createSwitch(triggerType, triggerValue, actionType, description) {
  return apiRequest('/switches', 'POST', {
    triggerType,
    triggerValue,
    actionType,
    description,
  });
}

async function getSwitches() {
  return apiRequest('/switches');
}

async function getSwitch(switchId) {
  return apiRequest(`/switches/${switchId}`);
}

async function updateSwitch(switchId, triggerValue, actionType, description) {
  return apiRequest(`/switches/${switchId}`, 'PUT', {
    triggerValue,
    actionType,
    description,
  });
}

async function pingSwitch(switchId) {
  return apiRequest(`/switches/${switchId}/ping`, 'POST');
}

async function triggerSwitch(switchId) {
  return apiRequest(`/switches/${switchId}/trigger`, 'POST');
}

async function toggleSwitch(switchId, isActive) {
  return apiRequest(`/switches/${switchId}/toggle`, 'PATCH', {
    isActive,
  });
}

async function deleteSwitch(switchId) {
  return apiRequest(`/switches/${switchId}`, 'DELETE');
}

// UI Helpers

function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `
    <span>${message}</span>
    <button style="background:none; border:none; cursor:pointer; font-size:18px; color:inherit;">×</button>
  `;

  const mainContent = document.querySelector('.main-content') || document.body;
  mainContent.insertBefore(alertDiv, mainContent.firstChild);

  alertDiv.querySelector('button').addEventListener('click', () => {
    alertDiv.remove();
  });

  setTimeout(() => alertDiv.remove(), 5000);
}

function openModal(modalId) {
  document.getElementById(modalId)?.classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.remove('active');
}

function isLoggedIn() {
  return !!getToken();
}

function redirectToLogin() {
  if (!isLoggedIn()) {
    window.location.href = 'index.html';
  }
}
