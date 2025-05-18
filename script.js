document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.getElementById('toggle-password');
    const segments = document.querySelectorAll('.segment');
    const feedback = document.getElementById('feedback');
    const strengthText = document.getElementById('strength-text');
    
    const criteriaElements = {
        length: document.getElementById('length'),
        uppercase: document.getElementById('uppercase'),
        lowercase: document.getElementById('lowercase'),
        number: document.getElementById('number'),
        special: document.getElementById('special')
    };

    // Toggle password visibility
    toggleButton.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
            toggleButton.setAttribute('aria-label', 'Hide password');
        } else {
            passwordInput.type = 'password';
            toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
            toggleButton.setAttribute('aria-label', 'Show password');
        }
    });

    // Check password strength on input
    passwordInput.addEventListener('input', function() {
        const password = this.value.trim();
        if (password === '') {
            resetStrengthMeter();
            return;
        }
        checkPasswordStrength(password);
    });

    function checkPasswordStrength(password) {
        // Check criteria
        const criteria = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };

        // Update visual criteria list
        updateCriteriaList(criteria);

        // Calculate strength score (0-5)
        const strengthScore = Object.values(criteria).filter(Boolean).length;

        // Update strength segments
        updateStrengthSegments(strengthScore);

        // Update feedback text
        updateFeedbackText(strengthScore, criteria, password);
    }

    function resetStrengthMeter() {
        // Reset all segments
        segments.forEach(segment => {
            segment.className = 'segment';
        });
        
        // Reset feedback
        feedback.className = 'feedback';
        feedback.innerHTML = '<i class="fas fa-info-circle"></i><span>Enter a password to see strength analysis</span>';
        
        // Reset strength text
        strengthText.textContent = 'Not rated';
        
        // Reset criteria
        Object.values(criteriaElements).forEach(element => {
            element.innerHTML = '<i class="fas fa-times-circle"></i> ' + element.textContent.substring(1);
        });
    }

    function updateCriteriaList(criteria) {
        Object.keys(criteria).forEach(key => {
            const element = criteriaElements[key];
            
            if (criteria[key]) {
                element.innerHTML = '<i class="fas fa-check-circle"></i> ' + element.textContent.substring(1);
            } else {
                element.innerHTML = '<i class="fas fa-times-circle"></i> ' + element.textContent.substring(1);
            }
        });
    }

    function updateStrengthSegments(score) {
        // Reset all segments first
        segments.forEach(segment => {
            segment.className = 'segment';
        });
        
        // Update active segments
        for (let i = 0; i < score; i++) {
            segments[i].className = `segment active-${score}`;
        }
        
        // Update strength text
        switch(score) {
            case 0:
            case 1:
                strengthText.textContent = 'Very Weak';
                break;
            case 2:
                strengthText.textContent = 'Weak';
                break;
            case 3:
                strengthText.textContent = 'Medium';
                break;
            case 4:
                strengthText.textContent = 'Strong';
                break;
            case 5:
                strengthText.textContent = 'Very Strong';
                break;
        }
        
        // Add pulse animation
        segments.forEach(segment => {
            segment.classList.remove('pulse');
            void segment.offsetWidth; // Force reflow
            segment.classList.add('pulse');
        });
    }

    function updateFeedbackText(score, criteria, password) {
        let message = '';
        let iconClass = '';
        
        // Remove all classes first
        feedback.className = 'feedback';
        
        switch (score) {
            case 0:
            case 1:
                iconClass = 'fa-exclamation-circle';
                feedback.classList.add('weak');
                message = 'Very weak password - Extremely vulnerable to attacks';
                break;
            case 2:
                iconClass = 'fa-exclamation-triangle';
                feedback.classList.add('weak');
                message = 'Weak password - Could be easily cracked';
                break;
            case 3:
                iconClass = 'fa-info-circle';
                feedback.classList.add('medium');
                message = 'Medium strength password - Provides basic security';
                break;
            case 4:
                iconClass = 'fa-shield-alt';
                feedback.classList.add('strong');
                message = 'Strong password - Good protection for most purposes';
                break;
            case 5:
                iconClass = 'fa-check-circle';
                feedback.classList.add('strong');
                message = 'Excellent password - Maximum security achieved!';
                break;
        }

        // Add specific suggestions if less than perfect
        if (score < 5) {
            message += '<br><span class="suggestions">Suggestions: ';
            
            const missing = [];
            if (!criteria.length) missing.push('increase length to 8+ characters');
            if (!criteria.uppercase) missing.push('add uppercase letter');
            if (!criteria.lowercase) missing.push('add lowercase letter');
            if (!criteria.number) missing.push('add number');
            if (!criteria.special) missing.push('add special character (!@#$%, etc.)');
            
            message += missing.join(', ') + '</span>';
        }
        
        // Check for common patterns and provide additional feedback
        const additionalFeedback = getAdditionalFeedback(password);
        if (additionalFeedback) {
            message += '<br><span class="warning">' + additionalFeedback + '</span>';
        }

        feedback.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
    }
    
    function getAdditionalFeedback(password) {
        // Check for common patterns that weaken passwords
        if (password.length < 4) return null;
        
        let warnings = [];
        
        // Check for repeated characters (e.g., 'aaa', '111')
        if (/(.)\1{2,}/.test(password)) {
            warnings.push('Avoid repeated characters (e.g., "aaa", "111")');
        }
        
        // Check for sequential characters (e.g., 'abc', '123')
        const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789'];
        for (const seq of sequences) {
            for (let i = 0; i < seq.length - 2; i++) {
                const fragment = seq.substring(i, i + 3);
                if (password.toLowerCase().includes(fragment)) {
                    warnings.push('Avoid sequential characters (e.g., "abc", "123")');
                    break;
                }
            }
            if (warnings.length > 0) break;
        }
        
        // Check for common words
        const commonWords = ['password', 'admin', '12345', 'qwerty', 'welcome'];
        for (const word of commonWords) {
            if (password.toLowerCase().includes(word)) {
                warnings.push('Avoid common words or patterns in your password');
                break;
            }
        }
        
        return warnings.length > 0 ? 'Warning: ' + warnings[0] : null;
    }
});