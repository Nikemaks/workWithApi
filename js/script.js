(function () {
    /*
    * Secondary functions
    * */
    function ajax(params) {
        var xhr = new XMLHttpRequest();
        var url = params.url || '';
        var body = params.body || '';
        var success = params.success;
        var error = params.error;

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(body);
        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200 && typeof success === 'function') {
                success(xhr.response);
            } else if (xhr.readyState === 4 && xhr.status !== 200 && typeof error === 'function') {
                error(xhr.response);
            }
        };
        xhr.onerror = error || null;
    }

    /*
    * Validation
    * */
    function checkRegExp(pattern, message, value) {
        return pattern.test(value) ? true : message;
    }

    function checkRepeatedPassword(message) {
        var password = document.getElementById('password').value;
        var password2 = document.getElementById('password2').value;

        return password === password2 ? true : message;
    }

    var validationForPassword = checkRegExp.bind(null,
        /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\!\@\#\$\%\^\&\*\-])/,
        'Required at least one number (0-9), uppercase and lowercase letters (a-Z) and at least one special character (!@#$%^&*-)');

    var validations = {
        firstName: [
            checkRegExp.bind(null, /^[A-Zа-я]{2,}$/i, 'Field may contain only letters and not be less than 2 letters'),
            checkRegExp.bind(null, /^[A-Zа-я]{2,64}$/i, 'Field may contain only letters and not be more than 64 letters'),
        ],
        lastName: [
            checkRegExp.bind(null, /^[A-Zа-я]{2,}$/i, 'Field may contain only letters and not be less than 2 letters'),
            checkRegExp.bind(null, /^[A-Zа-я]{2,64}$/i, 'Field may contain only letters and not be more than 64 letters'),
        ],
        email: [
            checkRegExp.bind(null,
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please enter valid email'),
        ],
        phone: [
            checkRegExp.bind(null, /^[0-9]{8}$/, 'Field may contain only 8 digits'),
        ],
        password: [validationForPassword],
        password2: [
            validationForPassword,
            checkRepeatedPassword.bind(null, 'Must be to equal to password')
        ],

        zip: [
            checkRegExp.bind(null, /^[0-9]{5}$/, 'Field must include 5 digits and only consist of numeric values'),
        ]
    };

    function validateField(element) {
        var fieldValidation = validations[element.id];
        var result = {valid: true, element: element, message: ''};

        if (fieldValidation) {
            for (var i = 0, len = fieldValidation.length; i < len; i++) {
                var validationFunction = fieldValidation[i];
                var answer = validationFunction(element.value);
                if (typeof answer === 'string') {
                    result.valid = false;
                    result.message = answer;
                    break;
                }
            }
        }

        return result;
    }

    /*
    * Other function
    * */
    function toggleError(element, message) {
        var errorMessageElement = element.nextElementSibling && element.nextElementSibling.classList.contains('field-error')
            ? element.nextElementSibling
            : null;

        errorMessageElement && message && (errorMessageElement.innerHTML = message);
        errorMessageElement && !message && (errorMessageElement.innerHTML = '');
    }

    function formOnchange(e) {
        if (e.target.dataset && e.target.dataset.validation !== undefined) {
            toggleError(e.target, validateField(e.target).message);
        }
    }

    function formGoNextStep() {
        var fieldsActive = document.querySelectorAll('.step_active .field');
        var isValidForm = validateForm(fieldsActive);

        if (!isValidForm.length) {
            toggleForm();
        }
    }

    function toggleForm() {
        var steps = document.querySelector('.steps').children;
        var controls = document.querySelector('.controls').children;
        for (step of steps) {
            step.classList.toggle('step_active')
        }

        for (control of controls) {
            control.classList.toggle('control_hide')
        }
    }

    function validateForm(fieldsActive) {
        var resultValidate = [];
        for (field of fieldsActive) {
            var validateItem = validateField(field);
            resultValidate.push(validateItem);
            toggleError(validateItem.element, validateItem.message);
        }

        return resultValidate.filter(function (item) {
            return !item.valid
        });
    }

    function submit(e) {
        e.preventDefault();
        formGoNextStep();
        resetAllForm();
    }

    function checkStatus(event) {
        if (event.target.value.length === 5) {
            getStatus(event.target.value);
        } else {
            changeCityAndStates(null, null, true)
        }
    }

    function getStatus(zip) {
        var params = {
            url: './api/geoStatus.php',
            body: 'zip=' + zip,
            success: cbSuccess
        };
        ajax(params)
    }

    function cbSuccess(response) {
        switch (response) {
            case 'allowed':
                getData();
                break;
            case 'blocked':
                blockedCb(response);
                break;
        }
    }

    function getData() {
        var zip = document.getElementById('zip').value;
        var params = {
            url: './api/geoData.php',
            body: 'zip=' + zip,
            success: cbSuccessData
        };
        ajax(params)
    }

    function cbSuccessData(resp) {
        var response = JSON.parse(resp);
        changeCityAndStates(response.state, response.city, false);
    }

    function blockedCb() {
        alert('zip is blocked!');
        resetActiveForm();
    }

    function resetActiveForm() {
        var fieldsActive = document.querySelectorAll('.step_active .field');
        for (field of fieldsActive) {
            field.value = '';
        }
    }

    function resetAllForm() {
        var fieldsActive = document.querySelectorAll('.field');
        for (field of fieldsActive) {
            field.value = '';
        }
    }

    function changeCityAndStates(state, city, isDisabled) {
        var stateField = document.getElementById('state');
        var cityField = document.getElementById('city');

        if (isDisabled) {
            stateField.setAttribute('disabled', 'disabled');
            cityField.setAttribute('disabled', 'disabled');
            stateField.value = '';
            cityField.value = '';
        } else {
            stateField.removeAttribute('disabled');
            cityField.removeAttribute('disabled');
            stateField.value = state;
            cityField.value = city;
        }
    }

    /*
    * Listeners
    * */
    document.getElementById('mainForm').addEventListener('change', formOnchange);
    document.getElementById('zip').addEventListener('input', checkStatus);
    document.querySelector('.control_next').addEventListener('click', formGoNextStep);
    document.querySelector('.control_prev').addEventListener('click', toggleForm);
    document.querySelector('.control_submit').addEventListener('click', submit);
})();
