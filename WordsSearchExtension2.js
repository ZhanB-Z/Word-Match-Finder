// ==UserScript==
// @name         AvitoDatasetShortcuts
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Highlights sets of words from custom wordLibraries
// @author       Zhan
// @match        https://en.wikipedia.org/*
// @grant        GM_addStyle
// ==/UserScript==


const LIBRARY_PREFIX = 'myApp_';

const defaultLibraries = {
    dict: 'Main library',
    priceDict: 'Price library',
    serviceDict: "Service library",
    chatDict: "Confirm free library"
};

function initializeDefaultLibraries() {
    for (const libName in defaultLibraries) {
        if (!localStorage.getItem(LIBRARY_PREFIX + libName)) {
            window[libName] = [];
            saveWordsToLocalStorage(libName);
            console.log(libName);
        }
    }
}

function loadWordsFromLocalStorage() {
    for (let key in localStorage) {
        if (key.startsWith(LIBRARY_PREFIX)) {
            try {
                let libraryName = key.substring(LIBRARY_PREFIX.length);
                window[libraryName] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                console.error("Error when loading library:", e);
            }
        }
    }
};

loadWordsFromLocalStorage();
initializeDefaultLibraries();

function saveWordsToLocalStorage(library) {
    localStorage.setItem(LIBRARY_PREFIX + library, JSON.stringify(window[library]));
}




(function() {
    'use strict';

    var customStyle = `
        button#activationButton {
            position: fixed;
            right: 50px;
            top: 50px;
            z-index: 1000;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 15px;
            font-family: Arial, sans-serif;
            cursor: pointer;
        }

        button#activationButton:active {
            background-color: #45a049;
            transform: scale(0.95);
        }

        div#popup {
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: #f9f9f9;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            font-family: Arial, sans-serif;
            position: fixed;
            right: 20px;
            top: 20px;
            background-color: white;
            padding: 20px;
            border: 1px solid black;
            z-index: 1001;
            width: 300px;
            height: 500px;
            overflow-y: auto;
        }

        button#closePopup {
           position: absolute;
    top: 10px;
    right: 10px;
    background-color: #f1f1f1; /* Светлый фон для кружочка */
    color: #333; /* Цвет "X" */
    border: 1px solid #ccc; /* Граница кружочка */
    border-radius: 50%; /* Делает кнопку круглой */
    font-size: 16px;
    width: 24px; /* Ширина кнопки */
    height: 24px; /* Высота кнопки */
    line-height: 22px; /* Центрирование "X" по вертикали */
    text-align: center; /* Центрирование "X" по горизонтали */
    cursor: pointer;
    padding: 0; /* Убрать внутренние отступы */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
         }

         button#closePopup:hover {
            color: #ff0000;
            background-color: #e0e0e0;
            }
            `
    GM_addStyle(customStyle)

    // Creating drop down list 
    var select = document.createElement('select'); //dropdownlist
    select.style.maxWidth = '100%'; 
    select.style.overflowY = 'auto';
    select.style.marginBottom = '20px';

     for (let key in window) {
        if (key.startsWith(LIBRARY_PREFIX) && Array.isArray(window[key])) {
            var option = document.createElement('option');
            option.value = key;
            option.text = key.substring(LIBRARY_PREFIX.length);
            select.appendChild(option);
        }
    };

    //text area for new library
    var newLibrary = document.createElement('input'); 
    newLibrary.type = 'text';
    newLibrary.placeholder = 'Name the new library';
    newLibrary.style.width = '100%';
    newLibrary.style.marginBottom = '10px';

    var createLibraryButton = document.createElement('button');
    createLibraryButton.textContent = 'Create a library';
    createLibraryButton.style.marginBottom = '10px';

    Object.entries(defaultLibraries).forEach(([key, value]) => {
        var option = document.createElement('option');
        option.value = key;
        option.text = value;
        select.appendChild(option);
    });


    function deleteLibrary(library) {
        if (window.confirm(`You sure you wanna do it with ${library}?`)) {
            localStorage.removeItem(LIBRARY_PREFIX + library);
            delete window[library];
            updateDropdown();
        }
    }

    function updateDropdown() {
        select.innerHTML = "";
        for (let key in localStorage) {
            if (key.startsWith(LIBRARY_PREFIX)) {
                console.log(key)
                let libName = key.substring(LIBRARY_PREFIX.length);
                var option = document.createElement('option');
                option.value = libName;
                option.text = defaultLibraries[libName] || libName;
                select.appendChild(option);
            }
        }
    }


    var deleteLibraryButton = document.createElement('button');
    deleteLibraryButton.textContent = "Delete library";
    deleteLibraryButton.style.marginTop = "10px";

    deleteLibraryButton.addEventListener('click', function() {
        var selectedLibrary = select.value;
        if (selectedLibrary) {
            deleteLibrary(selectedLibrary)
        }
    });

    //Popup activation button
    function createActivationButton() {
        var button = document.createElement('button');
        button.textContent = 'Expand';
        button.id = 'activationButton';
        button.addEventListener('click', function() {
            popup.style.display = 'flex';
        });

        document.body.appendChild(button);
    }

    //сам попап
    var popup = document.createElement('div');
    popup.id = 'popup';


    //и его содержимое
    popup.innerHTML = `
        <p>Choose library</p>
        <textarea id="textArea" placeholder="Add new words" style="width: 100%; height: 30%; margin-bottom: 10px;"></textarea>
        <textarea id="libraryWordsArea" style="width: 100%; height: 60%; margin-bottom: 10px;"></textarea>
        <button id="addButton" class="popup-button">Add word</button>
        <button id="clearAllButton" class="popup-button">Clear library</button>
        <button id="closePopup" class="close-button">&times;</button>
    `;


    popup.insertBefore(newLibrary, popup.firstChild);
    popup.insertBefore(createLibraryButton, popup.firstChild);
    popup.insertBefore(select, popup.firstChild);


    document.body.appendChild(popup);
    popup.appendChild(deleteLibraryButton);

    // Применение стилей к кнопкам внутри попапа
    var buttons = popup.querySelectorAll('.popup-button');
    buttons.forEach(btn => {
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.padding = '10px 15px';
        btn.style.width = 'calc(100% - 30px)';
        btn.style.marginTop = '10px';
        btn.style.cursor = 'pointer';
    });

    //The area that will show which words are in the selected library
    select.addEventListener('change', function () {
        updateLibraryWordsArea() })

    function updateLibraryWordsArea() {
        var selectedLibrary = select.value; 
        var words = JSON.parse(localStorage.getItem(LIBRARY_PREFIX + selectedLibrary));

        if (Array.isArray(words)) {
            // Обновляем содержимое textarea словами из выбранной библиотеки
            document.getElementById("libraryWordsArea").value = words.join();
        } else {
            console.error("the chosen library doesn't contain and array");
            document.getElementById("libraryWordsArea").value = '';
        }
    };

    //Close the popup button functionality
    popup.querySelector('#closePopup').addEventListener('click', function() {
        popup.style.display = 'none';
    });

    //Add button logic
    popup.querySelector('#addButton').addEventListener('click', function() {
        var selectedLibrary = select.value;
        if(!window.selectedLibrary) {
            window.selectedLibrary = [];
        }
        var textInput = popup.querySelector('#textArea').value;
        window[selectedLibrary] = window[selectedLibrary].concat(textInput.split('\n').filter(word => word.trim() !== ''));
        saveWordsToLocalStorage(selectedLibrary);
        var newWord = popup.querySelector('#textArea').value
        console.log(`Success!New word is added: ${newWord}`)
        //console.log(window[selectedLibrary]) 
        popup.querySelector('#textArea').value = '';
        updateLibraryWordsArea()
    });

    //Logic of the clearAll Button
    popup.querySelector('#clearAllButton').addEventListener('click', function() {
        var selectedLibrary = select.value;
        localStorage.setItem(LIBRARY_PREFIX + selectedLibrary, JSON.stringify([]));
        console.log(`Local storage library contains following words: ${localStorage(LIBRARY_PREFIX + selectedLibrary)}`);
        //saveWordsToLocalStorage(window[selectedLibrary]);
        popup.querySelector('#textArea').value = '';
        popup.querySelector('#libraryWordsArea').value = '';
        //updateLibraryWordsArea();
    });

    //Add library button
    createLibraryButton.addEventListener('click', function() {
        var newLibraryName = newLibrary.value.trim();

        //Checking for empty name
        if (!newLibraryName) {
            alert("Введите название библиотеки");
            return;
        };
         // Checking if there are no duplicates
        if (localStorage.getItem(LIBRARY_PREFIX + newLibraryName)) {
            alert("Библиотека с таким именем уже существует");
            return;
        updateLibraryWordsArea(); //why this thing is not happening here? 
        };

        window[newLibraryName] = []; //creating new library
        var newOption = document.createElement('option');
        newOption.value = newLibraryName;
        newOption.text = newLibraryName;
        select.appendChild(newOption); 

        saveWordsToLocalStorage(newLibraryName);
        newLibrary.value = '';

    });

    var checkPageButton = document.createElement('button');
    checkPageButton.textContent = "Find matches";
    checkPageButton.style.marginTop = '10px';

    checkPageButton.addEventListener('click', function () {
        var selectedLibrary = select.value;
        var libraryWords = [];
        var words = JSON.parse(localStorage.getItem(LIBRARY_PREFIX + selectedLibrary));
        console.log(typeof words)

        if (Array.isArray(words)) {
            console.log("All is good, we start highlighting")
            highlightWords(words, document.body)
        } else {
            console.error("Данные выбранной библиотеки не являются массивом");
        }
    });
    popup.appendChild(checkPageButton)

    createActivationButton();
    updateDropdown();

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlightWords(library, container) {
        //console.log("Starting search ...")
        console.log(library)
        if (!library || !library.length || !container) return;

        //console.log("library is present. search text is available.")
        const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let nodesToProcess = [];

        while (node = walk.nextNode()) {
            nodesToProcess.push(node);
        }

        nodesToProcess.forEach(node => {
            //console.log(node)
            let text = node.nodeValue;
            library.forEach(word => {
                const regex = new RegExp(escapeRegExp(word), 'gi');
                //console.log(`Word "${word}" found. Performing highlight.`);
                text = text.replace(regex, matched => `<mark>${matched}</mark>`);
            });
            if (text !== node.nodeValue) {
                const span = document.createElement('span');
                span.innerHTML = text;
                node.parentNode.replaceChild(span, node);
            }

        });
    }

    const content = document.querySelector("#mw-content-text");
    //const testLibrary = [];
    //highlightWords(testLibrary, content);
})();
