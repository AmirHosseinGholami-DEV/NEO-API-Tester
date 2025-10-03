document.addEventListener('DOMContentLoaded', function() {
    // Example buttons
    const exampleBtns = document.querySelectorAll('.example-btn');
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            const method = this.getAttribute('data-method');
            const body = this.getAttribute('data-body') || '';
            
            document.getElementById('api-url').value = url;
            document.getElementById('http-method').value = method;
            document.getElementById('api-body').value = body;
            
            // Highlight the clicked example briefly
            this.classList.add('text-green-400');
            setTimeout(() => {
                this.classList.remove('text-green-400');
            }, 300);
        });
    });
    
    // Send request on Ctrl+Enter
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            sendRequest();
        }
    });
    
    // Send request button
    document.getElementById('send-request').addEventListener('click', sendRequest);
    
    // Copy response button
    document.getElementById('copy-response').addEventListener('click', function() {
        const response = document.getElementById('response-content').textContent;
        navigator.clipboard.writeText(response).then(() => {
            this.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
            `;
            setTimeout(() => {
                this.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                `;
            }, 2000);
        });
    });
    
    function sendRequest() {
        const url = document.getElementById('api-url').value.trim();
        const method = document.getElementById('http-method').value;
        const contentType = document.getElementById('content-type').value;
        const headers = document.getElementById('api-headers').value.trim();
        const body = document.getElementById('api-body').value.trim();
        
        if (!url) {
            alert('Please enter an API URL');
            return;
        }
        
        // Show loading state
        const sendBtn = document.getElementById('send-request');
        const sendText = document.getElementById('send-text');
        const loadingSpinner = document.getElementById('loading-spinner');
        
        sendText.textContent = 'Sending...';
        loadingSpinner.classList.remove('hidden');
        document.getElementById('status-led').textContent = 'PROCESSING';
        
        // Hide previous response
        document.getElementById('response-section').classList.add('hidden');
        
        // Start timer
        const startTime = performance.now();
        
        // Prepare headers
        let requestHeaders = {
            'Content-Type': contentType
        };
        
        try {
            if (headers) {
                const parsedHeaders = JSON.parse(headers);
                Object.assign(requestHeaders, parsedHeaders);
            }
        } catch (e) {
            alert('Invalid headers format. Must be valid JSON.');
            resetButton();
            return;
        }
        
        // Prepare body
        let requestBody = null;
        if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
            if (contentType === 'application/json') {
                try {
                    requestBody = JSON.parse(body);
                } catch (e) {
                    alert('Invalid JSON body');
                    resetButton();
                    return;
                }
            } else {
                requestBody = body;
            }
        }
        
        // Make the request
        fetch(url, {
            method: method,
            headers: requestHeaders,
            body: method === 'GET' ? null : (contentType === 'application/json' ? JSON.stringify(requestBody) : body)
        })
        .then(async response => {
            const endTime = performance.now();
            const responseTime = (endTime - startTime).toFixed(2);
            
            // Format response
            let responseData;
            try {
                responseData = await response.json();
                responseData = JSON.stringify(responseData, null, 2);
            } catch (e) {
                responseData = await response.text();
            }
            
            // Update UI
            document.getElementById('response-status').textContent = response.status;
            document.getElementById('response-status').className = `px-2 py-1 rounded text-xs font-bold ${
                response.status >= 200 && response.status < 300 ? 'bg-green-900/50 text-green-400' :
                response.status >= 400 && response.status < 500 ? 'bg-yellow-900/50 text-yellow-400' :
                'bg-red-900/50 text-red-400'
            }`;
            
            document.getElementById('response-time').textContent = `${responseTime} ms`;
            document.getElementById('response-content').textContent = responseData;
            document.getElementById('response-section').classList.remove('hidden');
            document.getElementById('status-led').textContent = 'COMPLETE';
            
            // Update history
            addToHistory(url, method, response.status, responseTime);
            
            resetButton();
        })
        .catch(error => {
            const endTime = performance.now();
            const responseTime = (endTime - startTime).toFixed(2);
            
            document.getElementById('response-status').textContent = 'Error';
            document.getElementById('response-status').className = 'px-2 py-1 rounded text-xs font-bold bg-red-900/50 text-red-400';
            document.getElementById('response-time').textContent = `${responseTime} ms`;
            document.getElementById('response-content').textContent = error.message;
            document.getElementById('response-section').classList.remove('hidden');
            document.getElementById('status-led').textContent = 'ERROR';
            
            resetButton();
        });
        
        function resetButton() {
            sendText.textContent = 'Send Request';
            loadingSpinner.classList.add('hidden');
            
            // Button pulse animation
            sendBtn.classList.add('pulse');
            setTimeout(() => {
                sendBtn.classList.remove('pulse');
            }, 3000);
        }
    }
    
    function addToHistory(url, method, status, time) {
        // In a real app, you would save this to localStorage or a backend
        console.log('Request saved to history:', { url, method, status, time });
    }
});