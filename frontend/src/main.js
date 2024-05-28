import './style.css';
import './app.css';

import logo from './assets/images/logo-universal.png';
import {Export, Import} from '../wailsjs/go/main/App';

document.getElementById('logo').src = logo;


let textarea = document.querySelector("#content-input");
textarea.focus();

document.querySelector("#export-btn").addEventListener("click", () => {
    console.log(textarea.value);
    Export(textarea.value).then(() => {

    }).catch(() => {

    });
});

document.querySelector("#import-btn").addEventListener("click", () => {
    Import().then((content) => {
        textarea.value = content;
    }).catch(() => {

    });
});