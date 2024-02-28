// register.js

document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');

    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Create user
        const newUser = {
            name,
            email,
            password
        };

        // Send registration 
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Registration failed');
        })
        .then(data => {
            console.log(data); // Handle successful registration 
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle error
        });
    });
});
