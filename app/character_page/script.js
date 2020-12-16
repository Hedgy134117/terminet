interact('.draggable').draggable({
    // prevent dragging while editing, unless on mobile.
    ignoreFrom: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? null : '.textfield, input, button', 
    origin: 'parent',
    snap: { // snap to grid
        targets: [
            interact.createSnapGrid({x: 20, y: 20})
        ],
        relativePoints: [
            {x: 0, y: 0}
        ],
    },
    onmove: function(event) { // move when dragging to cursor pos
        const target = event.target;

        const dataX = target.getAttribute('data-x');
        const dataY = target.getAttribute('data-y');
        const initialX = parseFloat(dataX) || 0;
        const initialY = parseFloat(dataY) || 0;

        const deltaX = event.dx;
        const deltaY = event.dy;

        const newX = initialX + deltaX;
        const newY = initialY + deltaY;

        target
            .style
            .transform = `translate(${newX}px, ${newY}px)`;

        target.setAttribute('data-x', newX);
        target.setAttribute('data-y', newY);
    },
});
interact('.draggable').on('dragend', (event) => {
    let target = event.target;
    moveBox(target.getAttribute('data-boxid'), target.getAttribute('data-x'), target.getAttribute('data-y'));
});

// For calculator fields, add / subtract input value to the minimum number.
const calc = (e, add) => {
    let parent = e.target.parentElement;
    let val = parseInt(parent.querySelector('input').value);
    if (isNaN(val)) {
        return;
    }
    if (add) {
        parent.parentElement.querySelector('.textfield--number').innerText = parseInt(parent.parentElement.querySelector('.textfield--number').innerText) + val;
    }
    else {
        parent.parentElement.querySelector('.textfield--number').innerText = parseInt(parent.parentElement.querySelector('.textfield--number').innerText) - val;
    }
};

// Create a box based on the type
const addBox = (board, type, posX, posY, post, name, text, num, boxId) => {
    // Default arguments
    name = name || 'Name';
    if (!text) { // if text is not already given
        text = ['nameNumberInf', 'nameNumberRange'].includes(type) ? 0 : 'Text'; // set text to number, otherwise sample text
    }
    num = num || 0;
    post = post || false;
    boxId = boxId || null;
    
    // Create HTML box
    let box = document.createElement('div');
    box.classList.add('draggable', 'board__box');
    box.setAttribute('data-x', posX);
    box.setAttribute('data-y', posY);
    box.setAttribute('data-type', type);
    
    // Set the box id if given an id, otherwise wait for an id
    boxId != null ? box.setAttribute('data-boxId', boxId) : box.setAttribute('data-boxId', 'waiting');
    box.style = `transform: translate(${posX}px, ${posY}px)`;
    
    // Create the innerHTML for the box
    switch(type) {
        case 'name':
            box.innerHTML = `
                <div contenteditable="true" class="textfield textfield--bold textfield--name" data-field="name">${name}</div>
                <button class="box__delete">X</button>
            `;
            break;
        case 'nameNumber': 
            box.innerHTML = `
                <div contenteditable="true" class="textfield textfield--bold textfield--name" data-field="name">${name}</div>
                <div contenteditable="true" class="textfield textfield--text" data-field="text">${text}</div>
                <button class="box__delete">X</button>
            `;
            break;
        case 'nameNumberInf': 
            box.innerHTML = `
                <div contenteditable="true" class="textfield textfield--bold textfield--name" data-field="name">${name}</div>
                <div contenteditable="true" class="textfield textfield--number textfield--text" data-field="minNum">${text}</div>
                <div class="calculator">
                    <button class="calculator__subtract">-</button>
                    <input type="number">
                    <button class="calculator__add">+</button>
                </div>
                <button class="box__delete">X</button>
            `;
            break;
        case 'nameNumberRange': 
            box.innerHTML = `
                <div contenteditable="true" class="textfield textfield--bold textfield--name" data-field="name">${name}</div>
                <div class="textfield--double">
                    <div contenteditable="true" class="textfield textfield--number textfield--text" data-field="minNum">${text}</div>
                    <span>/</span>
                    <div contenteditable="true" class="textfield textfield--number-max" data-field="maxNum">${num}</div>
                </div>
                <div class="calculator">
                    <button class="calculator__subtract">-</button>
                    <input type="number">
                    <button class="calculator__add">+</button>
                </div>
                <button class="box__delete">X</button>
            `;
            break;
        case 'nameDice': 
            box.innerHTML = `
                <div contenteditable="true" class="textfield textfield--bold textfield--name" data-field="name">${name}</div>
                <div contenteditable="true" class="textfield textfield--text" data-field="text">${text}</div>
                <button class="box__delete">X</button>
            `;
            break;
        case 'nameShortDesc': 
            box.innerHTML = `
                <div contenteditable="true" class="textfield textfield--bold textfield--name" data-field="name">${name}</div>
                <div contenteditable="true" class="textfield textfield--large textfield--text" data-field="text">${text}</div>
                <button class="box__delete">X</button>
            `;
            break;
        case 'nameLongDesc': 
            box.innerHTML = `
                <div contenteditable="true" class="textfield textfield--bold textfield--name" data-field="name">${name}</div>
                <div contenteditable="true" class="textfield textfield--huge textfield--text" data-field="text">${text}</div>
                <button class="box__delete">X</button>
            `;
            break;
        case 'text':
            box.innerHTML = `
                <div contenteditable="true" class="textfield textfield--text" data-field="text">${text}</div>
                <button class="box__delete">X</button>
            `
    }
    
    // add extra elements
    let deleteButton = box.querySelector('.box__delete');
    let addButton = box.querySelector('.calculator__subtract');
    let subtractButton = box.querySelector('.calculator__add');
    
    // only add the event listener(s) if element exists
    deleteButton && deleteButton.addEventListener('click', e => {
        e.target.parentElement.remove()
        delBox(e.target.parentElement.getAttribute('data-boxid'));
    }); 
    addButton && addButton.addEventListener('click', e => calc(e, false));
    subtractButton && subtractButton.addEventListener('click', e => calc(e, true));
    
    // DB functionality with editing
    /* these must be functions in order for boxId to work properly,
       if it is a post request, must wait until the id is given to connect the database
       otherwise, we can just connect it right away.
    */
    const inputDBConnector = () => {
        let inputs = box.querySelectorAll('div[contenteditable=true]');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('focusout', (event) => {
                let target = event.target;
                let value = target.innerHTML;
                let field = target.getAttribute('data-field');
                editBox(boxId, field, value);
            });
        }
    };
    const calcDBConnector = () => {
        let calc = box.querySelector('.calculator');
        if (calc == null) {
            return;
        }
        calc = calc.children;
        let buttons = [calc[0], calc[2]];
        for (let i = 0; i < buttons.length; i++) {
            console.log(buttons[i]);
            buttons[i].addEventListener('click', event => {
                editBox(boxId, 'minNum', parseInt(box.querySelector('div[data-field=minNum]').innerText));
            });
        }
    }

    board.appendChild(box);
    
    // publish the box to the db if asked to
    if (post) {
        const fetchData = {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${username}:${password}`),
            },
            credentials: 'include',
            body: JSON.stringify({
                'name': type != 'text' ? name : '',
                'text': ['nameNumber', 'nameDice', 'nameShortDesc', 'nameLongDesc'].includes(type) ? text : '',
                'boxType': type,
                'positionX': posX,
                'positionY': posY,
                'longText': null,
                'minNum': ['nameNumberInf', 'nameNumberRange'].includes(type) ? text : null,
                'maxNum': type == 'nameNumberRange' ? num : null
            })
        };
        return fetch(`http://127.0.0.1:8000/net/${id}/characters/${characterId}/boxes/`, fetchData)
            .then(response => {
                error = !response.ok;
                return response.json();
            })
            .then(response => {
                if (error) {
                    alert('error with publishing character boxes');
                    return;
                }
                boxId = response['id'];
                box.setAttribute('data-boxid', boxId);
                inputDBConnector();
                calcDBConnector();
            });
    }
    else {
        inputDBConnector();
        calcDBConnector();
    }
};

// Edit a box's values
const editBox = (boxId, field, value) => {
    const fetchData = {
        method: 'PATCH',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
        },
        credentials: 'include',
        body: { } 
    };
    fetchData['body'][field] = value;
    fetchData['body'] = JSON.stringify(fetchData['body']);

    return fetch(`http://127.0.0.1:8000/net/${id}/characters/${characterId}/boxes/${boxId}/`, fetchData)
            .then(response => {
                error = !response.ok;
                return response.json();
            })
            .then(response => {
                if (error) {
                    alert('error with editing box value');
                    return;
                }
            });
}

// Change the box's position on the db
const moveBox = (boxId, posX, posY) => {
    const fetchData = {
        method: 'PATCH',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
        },
        credentials: 'include',
        body: JSON.stringify({
            'positionX': posX,
            'positionY': posY,
        })
    };
    return fetch(`http://127.0.0.1:8000/net/${id}/characters/${characterId}/boxes/${boxId}/`, fetchData)
        .then(response => {
            error = !response.ok;
            return response.json();
        })
        .then(response => {
            if (error) {
                alert('error with moving character boxes');
                return;
            }
        });
}

// Delete the box on the db
const delBox = (boxId) => {
    const fetchData = {
        method: 'DELETE',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
        },
        credentials: 'include',
    };
    return fetch(`http://127.0.0.1:8000/net/${id}/characters/${characterId}/boxes/${boxId}/`, fetchData)
        .then(response => {
            error = !response.ok;
        })
        .then(response => {
            if (error) {
                alert('error with deleting character box');
                return;
            }
        });
}

const board = document.querySelector('.board');
document.querySelector('.add__button--main').addEventListener('click', () => addBox(board, document.querySelector('#boxType').value, 25, 25, true));

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('owner');
const username = window.localStorage.getItem('tnet-username');
const password = window.localStorage.getItem('tnet-password');
const playerType = window.localStorage.getItem('tnet-playerType');

const name = urlParams.get('name');
let characterId = null;

const loadCharacter = () => {
    const fetchData = {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    return fetch(`http://127.0.0.1:8000/net/${id}/characters/`, fetchData)
        .then(response => {
            error = !response.ok;
            return response.json();
        })
        .then(response => {
            if (error) {
                alert('error with loading character');
                return;
            }
            for (i in response) {
                console.log(response[i]['name'], name);
                if (response[i]['name'] == name) {
                    characterId = response[i]['id'];
                    return;
                }
            }
        });
};

const loadBoxes = () => {
    const fetchData = {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    return fetch(`http://127.0.0.1:8000/net/${id}/characters/${characterId}/boxes/`, fetchData)
        .then(response => {
            error = !response.ok;
            return response.json();
        })
        .then(response => {
            if (error) {
                alert('error with loading character boxes');
                return;
            }
            for (i in response) {
                let box = response[i];
                let type = box['boxType'];
                let posX = box['positionX'];
                let posY = box['positionY'];
                let name = box['name'];
                let text = box['text'] || box['longText'] || box['minNum'];
                let num = box['maxNum'];
                let id = box['id'];
                addBox(board, type, posX, posY, false, name, text, num, id);
            }
        })
}

window.addEventListener('load', () => {
    loadCharacter().then(() => loadBoxes());
})