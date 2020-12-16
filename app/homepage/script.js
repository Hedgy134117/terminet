const id = window.localStorage.getItem('tnet-id');
const username = window.localStorage.getItem('tnet-username')
const password = window.localStorage.getItem('tnet-password');
const playerType = window.localStorage.getItem('tnet-playerType');

const loadDms = () => {
    const fetchData = {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
    }
    fetch(`https://hedgy1.pythonanywhere.com/auth/users/`, fetchData)
        .then(response => {
            error = !response.ok;
            return response.json();
        })
        .then(response => {
            if (error) {
                alert('error with loading dms');
                return;
            }
            for (i in response) {
                let user = response[i];
                if (user['playerType'] == 'dm') {
                    document.querySelector('#dms').innerHTML += `<option value="${response[i]['id']}">${response[i]['username']}</option>`;
                }
            }
        })
}

const loadCharacters = () => {
    const fetchData = {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    fetch(`https://hedgy1.pythonanywhere.com/net/${id}/characters/`, fetchData)
        .then(response => {
            error = !response.ok;
            return response.json();
        })
        .then(response => {
            if (error) {
                alert('error with loading characters');
                return;
            }
            for (i in response) {
                addCharacter(response[i]['name'], id, false, null);
            }
        });
}

const loadCampaginCharacters = () => {
    const fetchData = {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    fetch(`https://hedgy1.pythonanywhere.com/net/${id}/campaignCharacters/`, fetchData)
        .then(response => {
            error = !response.ok;
            return response.json();
        })
        .then(response => {
            if (error) {
                alert('error with loading characters');
                return;
            }
            for (i in response) {
                addCampaignCharacter(response[i]['name'], response[i]['owner']);
            }
        });
}

const addCharacter = (name, owner, post, dm) => {
    if (name == '') {
        window.alert('Character must have a name.');
        return;
    }
    let list = document.querySelector('.list__list');
    // Prevent making duplicate characters
    for (let i = 0; i < list.children.length; i++) {
        if (list.children[i].children[0].innerText == name) {
            window.alert(`${name} already exists!`);
            return;
        } 
    }
    list.innerHTML += `<p><a href="../character_page/index.html?name=${name}&owner=${owner}">${name}</a></p>`;

    if (post) {
        postCharacter(name, dm);
    }
}

const addCampaignCharacter = (name, owner) => {
    let list = document.querySelectorAll('.list__list')[1];
    list.innerHTML += `<p><a href="../character_page/index.html?name=${name}&owner=${owner}">${name}</a></p>`;
}

const postCharacter = (name, dm) => {
    const fetchData = {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
        },
        credentials: 'include',
        body: JSON.stringify({
            'name': name,
            'dm': dm,
        })
    };
    console.log(fetchData.body);
    fetch(`https://hedgy1.pythonanywhere.com/net/${id}/characters/`, fetchData)
        .then(response => {
            error = !response.ok;
            return response.json();
        })
        .then(response => {
            if (error) {
                alert('error with publishing character');
                return;
            }
        });
}

document.querySelector('.add__button').addEventListener('click', () => {
    addCharacter(document.querySelector('.add__name').value, id, true, document.querySelector('#dms').value);
    document.querySelector('.add__name').value = '';
});

window.addEventListener('load', () => {
    loadDms();
    loadCharacters();
    if (playerType == 'dm') {
        loadCampaginCharacters();
    }
});