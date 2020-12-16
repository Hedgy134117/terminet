const login = async (username, password, errorField) => {
    let responseData = null;
    const fetchData = {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
        },
        credentials: 'include',
    };
    fetch('https://hedgy1.pythonanywhere.com/auth/login/', fetchData)
        .then(response => response.json())
        .then(data => responseData = data)
        .catch(error => responseData = error)
        .then(() => {
            // 'detail' key only shows up when incorrect user / pass
            if ('detail' in responseData) {
                console.log(responseData['detail']);
                errorField.innerText = responseData['detail'];
            }
            // if it's not there, successful login.
            else {
                console.log(responseData);
                window.localStorage.setItem('tnet-username', username);
                window.localStorage.setItem('tnet-password', password);
                window.localStorage.setItem('tnet-playerType', responseData['playerType']);
                window.localStorage.setItem('tnet-id', responseData['id']);
                window.location.href = '../homepage/index.html'
            }
        });
}

const register = async (username, password, playerType, errorField) => {
    let responseData = null;
    const fetchData = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'username': username,
            'password': password,
            'playerType': playerType,
        })
    };
    fetch('https://hedgy1.pythonanywhere.com/auth/users/', fetchData)
        .then(response => {
            error = !response.ok;
            return response.json();
        })
        .then(response => {
            // there's an error
            if (error) {
                // reset the error field
                errorField.innerText = '';
                // go through each error and put them in the html
                for (let field in response) {
                    errorField.innerText += `${response[field][0].slice(0, -1)},`
                }
                // remove the extra comma at the end
                errorField.innerText = errorField.innerText.slice(0, -1);
                return;
            }
            // no errors, log the user in.
            login(username, password, null);
        });
}

document.querySelectorAll('#login').forEach(element => {
    element.addEventListener('click', event => {
        let parent = event.target.parentElement;
        let user = parent.querySelector('.auth-user').value;
        let pass = parent.querySelector('.auth-pass').value;
        let errorField = parent.querySelector('.auth-form__error');
        login(user, pass, errorField);
    });
});

document.querySelectorAll('#register').forEach(element => {
    element.addEventListener('click', event => {
        let parent = event.target.parentElement;
        let user = parent.querySelector('.auth-user').value;
        let pass = parent.querySelector('.auth-pass').value;
        let authType = parent.querySelector('.auth-type').value;
        let errorField = parent.querySelector('.auth-form__error');
        register(user, pass, authType, errorField);
    });
});