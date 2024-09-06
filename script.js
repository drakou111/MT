const translations = {
    en: {
        pageTitle: "Measurement Converter",
        ingredientHeader: "Ingredient",
        currentAmountHeader: "Current Amount",
        currentMeasurementHeader: "Current Measurement",
        desiredAmountHeader: "Desired Amount",
        desiredMeasurementHeader: "Desired Measurement",
        lockHeader: "Lock",
        addRowButton: "Add Ingredient",
        removeRowButton: "Remove Ingredient",
        calculateButton: "Calculate",
        ingredientPlaceholder: "Ingredient Name",
        amountPlaceholder: "Amount",
        desiredAmountPlaceholder: "Desired Amount",
        measurementOptions: `
            <optgroup label="Mass">
                <option value="mg">Milligram (mg)</option>
                <option value="g">Gram (g)</option>
                <option value="oz">Ounce (oz)</option>
                <option value="lb">Pound (lb)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="t">Tonne (t)</option>
            </optgroup>
            <optgroup label="Volume">
                <option value="ml">Milliliter (ml)</option>
                <option value="tsp">Teaspoon (tsp)</option>
                <option value="tbsp">Tablespoon (tbsp)</option>
                <option value="fl oz">Fluid Ounce (fl oz)</option>
                <option value="cup">Cup (cup)</option>
                <option value="pint">Pint (pint)</option>
                <option value="qt">Quart (qt)</option>
                <option value="l">Liter (l)</option>
                <option value="gal">Gallon (gal)</option>
            </optgroup>
            <optgroup label="Other">
                <option value="u">Unit (u)</option>
            </optgroup>
        `,
        noRowSelected: "No row was selected.",
        mismatchError: "Cannot convert from",
        minimumRowsError: "At least one row is required.",
        convertRecipe: "Convert Recipe",
    },
    fr: {
        pageTitle: "Convertisseur de mesures",
        ingredientHeader: "Ingrédient",
        currentAmountHeader: "Quantité actuelle",
        currentMeasurementHeader: "Unité actuelle",
        desiredAmountHeader: "Quantité souhaitée",
        desiredMeasurementHeader: "Unité souhaitée",
        lockHeader: "Sélection",
        addRowButton: "Ajouter un ingrédient",
        removeRowButton: "Supprimer un ingrédient",
        calculateButton: "Calculer",
        ingredientPlaceholder: "Nom de l'ingrédient",
        amountPlaceholder: "Quantité",
        desiredAmountPlaceholder: "Quantité souhaitée",
        measurementOptions: `
            <optgroup label="Masse">
                <option value="mg">Milligramme (mg)</option>
                <option value="g">Gramme (g)</option>
                <option value="oz">Once (oz)</option>
                <option value="lb">Livre (lb)</option>
                <option value="kg">Kilogramme (kg)</option>
                <option value="t">Tonne (t)</option>
            </optgroup>
            <optgroup label="Volume">
                <option value="ml">Millilitre (ml)</option>
                <option value="tsp">Cuillère à café (tsp)</option>
                <option value="tbsp">Cuillère à soupe (tbsp)</option>
                <option value="fl oz">Once fluide (fl oz)</option>
                <option value="cup">Tasse (cup)</option>
                <option value="pint">Pinte (pint)</option>
                <option value="qt">Quart (qt)</option>
                <option value="l">Litre (l)</option>
                <option value="gal">Gallon (gal)</option>
            </optgroup>
            <optgroup label="Autre">
                <option value="u">Unité (u)</option>
            </optgroup>
        `,
        noRowSelected: "Aucune ligne n'a été sélectionnée.",
        mismatchError: "Impossible de convertir de",
        minimumRowsError: "Au moins une ligne est requise.",
        convertRecipe: "Convertir la recette",
    }
};

let currentLanguage = 'en';

function detectLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    if (userLang.startsWith('fr')) {
        currentLanguage = 'fr';
    } else if (userLang.startsWith('en')) {
        currentLanguage = 'en';
    }
    applyTranslations();
}

function applyTranslations() {
    const lang = translations[currentLanguage];

    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (lang[key]) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = lang[key];
            } else {
                el.innerText = lang[key];
            }
        }
    });

    // Update the select box
    const select = document.getElementById('languageSelector');
    select.value = currentLanguage;

    // Update the measurement select box in all rows
    const selects = document.querySelectorAll('#conversionTable select');
    selects.forEach(select => {
        select.innerHTML = lang.measurementOptions;
    });

    // Update placeholders in all rows
    const inputs = document.querySelectorAll(`#conversionTable input[name="ingredient"]`);
    inputs.forEach(input => input.placeholder = lang.ingredientPlaceholder);

    const amountInputs = document.querySelectorAll(`#conversionTable input[name="currentAmount"]`);
    amountInputs.forEach(input => input.placeholder = lang.amountPlaceholder);

    const desiredAmountInputs = document.querySelectorAll(`#conversionTable input[name="desiredAmount"]`);
    desiredAmountInputs.forEach(input => input.placeholder = lang.desiredAmountPlaceholder);
}

function switchLanguage(lang) {
    if (lang === 'en' || lang === 'fr') {
        currentLanguage = lang;
        applyTranslations();
    }
}

function updateTableFromJSON(json) {
    const lang = translations[currentLanguage];
    const table = document.getElementById("conversionTable").getElementsByTagName("tbody")[0];
    
    // Clear existing table rows (except header)
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }

    let formattedJson = JSON.parse(json);

    // Iterate through the JSON ingredients and add new rows
    for (const [key, { ingredient, amount, measurement }] of Object.entries(formattedJson.ingredients)) {
        const newRow = table.insertRow();
        
        // Add cells with appropriate input elements
        const ingredientCell = newRow.insertCell(0);
        const currentAmountCell = newRow.insertCell(1);
        const currentMeasurementCell = newRow.insertCell(2);
        const desiredAmountCell = newRow.insertCell(3);
        const desiredMeasurementCell = newRow.insertCell(4);
        const lockCell = newRow.insertCell(5);

        // Ingredient input field
        ingredientCell.innerHTML = `<input type="text" name="ingredient" value="${ingredient}" readonly>`;

        // Current amount input field
        currentAmountCell.innerHTML = `<input type="number" name="currentAmount" value="${amount}">`;

        // Current measurement select box
        currentMeasurementCell.innerHTML = `<select name="currentMeasurement" onchange="syncDesiredMeasurement(this)">
            ${generateMeasurementOptions(measurement)}
        </select>`;

        // Desired amount input field
        desiredAmountCell.innerHTML = `<input type="number" name="desiredAmount" placeholder="${lang.desiredAmountPlaceholder}">`;

        // Desired measurement select box
        desiredMeasurementCell.innerHTML = `<select name="desiredMeasurement">${generateMeasurementOptions(measurement)}</select>`;

        // Lock (radio button) for desired amount
        lockCell.innerHTML = '<input type="radio" name="lock">';
    }
}

// Function to generate measurement options
function generateMeasurementOptions(selectedValue) {
    const measurements = {
        'ml': 'Milliliter (ml)', 'g': 'Gram (g)', 'u': 'Unit (u)', 
        'oz': 'Ounce (oz)', 'lb': 'Pound (lb)', 'kg': 'Kilogram (kg)', 
        't': 'Tonne (t)', 'tsp': 'Teaspoon (tsp)', 'tbsp': 'Tablespoon (tbsp)', 
        'fl oz': 'Fluid Ounce (fl oz)', 'cup': 'Cup (cup)', 'pint': 'Pint (pint)', 
        'qt': 'Quart (qt)', 'l': 'Liter (l)', 'gal': 'Gallon (gal)'
    };
    return Object.entries(measurements).map(([value, label]) => 
        `<option value="${value}" ${value === selectedValue ? 'selected' : ''}>${label}</option>`
    ).join('');
}

async function convertRecipe() {
    // Replace with your actual function for getting JSON from the ChatGPT API
    const json = await getRecipeJsonFromChatGPT();
    
    // Update the table with the JSON data
    updateTableFromJSON(json);
}

async function getRecipeJsonFromChatGPT() {
    const recipe = document.getElementById('recipeInput').value;

    if (!recipe.trim()) {
        alert('Please enter a recipe.');
        return;
    }

    try {
        const response = await fetch(`/.netlify/functions/get-data?recipe=${encodeURIComponent(recipe)}`, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const jsonOutput = data.choices[0].message.content.trim();
        const parsedJson = JSON.parse(jsonOutput);

        // Handle the parsed JSON here (e.g., update the table)
        console.log(parsedJson);

        // Optionally, you can update the UI with the parsed JSON data
        updateTableWithJson(parsedJson);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your recipe.');
    }
}

const massMeasurements = {
    'mg': 0.001,      // 1 mg = 0.001 g
    'g': 1,           // base unit
    'oz': 28.3495,    // 1 oz = 28.3495 g
    'lb': 453.592,    // 1 lb = 453.592 g
    'kg': 1000,       // 1 kg = 1000 g
    't': 1000000,     // 1 t = 1000000 g
};

const volumeMeasurements = {
    'ml': 1,          // base unit
    'tsp': 4.92892,   // 1 tsp = 4.92892 ml
    'tbsp': 14.7868,  // 1 tbsp = 14.7868 ml
    'fl oz': 29.5735, // 1 fl oz = 29.5735 ml
    'cup': 240,       // 1 cup = 240 ml
    'pint': 473.176,  // 1 pint = 473.176 ml
    'qt': 946.353,    // 1 qt = 946.353 ml
    'l': 1000,        // 1 l = 1000 ml
    'gal': 3785.41,   // 1 gal = 3785.41 ml
};

// Function to create a new row in the table
function addRow() {
    const lang = translations[currentLanguage];
    const table = document.getElementById("conversionTable").getElementsByTagName("tbody")[0];
    const newRow = table.insertRow();
    const rowIndex = newRow.rowIndex;

    // Add cells with appropriate input elements
    const ingredientCell = newRow.insertCell(0);
    const currentAmountCell = newRow.insertCell(1);
    const currentMeasurementCell = newRow.insertCell(2);
    const desiredAmountCell = newRow.insertCell(3);
    const desiredMeasurementCell = newRow.insertCell(4);
    const lockCell = newRow.insertCell(5);

    // Ingredient input field
    ingredientCell.innerHTML = `<input type="text" name="ingredient" placeholder="${lang.ingredientPlaceholder}">`;

    // Current amount input field
    currentAmountCell.innerHTML = `<input type="number" name="currentAmount" placeholder="${lang.amountPlaceholder}">`;

    // Current measurement select box
    currentMeasurementCell.innerHTML = `<select name="currentMeasurement" onchange="syncDesiredMeasurement(this)">
        ${lang.measurementOptions}
    </select>`;

    // Desired amount input field
    desiredAmountCell.innerHTML = `<input type="number" name="desiredAmount" placeholder="${lang.desiredAmountPlaceholder}">`;

    // Desired measurement select box
    desiredMeasurementCell.innerHTML = `<select name="desiredMeasurement">${lang.measurementOptions}</select>`;

    // Lock (radio button) for desired amount
    lockCell.innerHTML = '<input type="radio" name="lock">';

    updateRadioButtons();
}

// Function to synchronize the desired measurement with the current measurement
function syncDesiredMeasurement(selectElement) {
    const row = selectElement.closest('tr'); // Find the closest row
    const desiredMeasurementSelect = row.querySelector('select[name="desiredMeasurement"]'); // Find the corresponding desired measurement select

    if (desiredMeasurementSelect) {
        desiredMeasurementSelect.value = selectElement.value; // Set the desired measurement to the same value as the current measurement
    }
}

// Function to remove the last row from the table
function removeRow() {
    const lang = translations[currentLanguage];
    const table = document.getElementById("conversionTable").getElementsByTagName("tbody")[0];

    // Ensure that at least one row remains
    if (table.rows.length > 1) {
        table.deleteRow(-1);
    } else {
        alert(lang.minimumRowsError);
    }

    updateRadioButtons();
}

function updateRadioButtons() {
    // After removal, check if any radio button is selected
    const radios = document.querySelectorAll('input[name="lock"]');
    let selectedRadio = false;

    // Check if any radio button is currently selected
    radios.forEach(radio => {
        if (radio.checked) {
            selectedRadio = true;
        }
    });

    // If no radio button is selected, select the first one
    if (!selectedRadio && radios.length > 0) {
        radios[0].checked = true;
    }
}

// Function to fetch the necessary data and log it
function calculate() {
    const lang = translations[currentLanguage];
    const tableRows = document.getElementById("conversionTable").getElementsByTagName("tbody")[0].rows;
    let lockRowIndex = -1;
    let ratio = 0;

    // Loop through each row and fetch the data
    for (let i = 0; i < tableRows.length; i++) {
        const ingredient = tableRows[i].cells[0].getElementsByTagName("input")[0].value || "N/A";
        const currentAmount = tableRows[i].cells[1].getElementsByTagName("input")[0].value || 0;
        const currentMeasurement = tableRows[i].cells[2].getElementsByTagName("select")[0].value || "unit";
        const desiredAmount = tableRows[i].cells[3].getElementsByTagName("input")[0].value || 0;
        const desiredMeasurement = tableRows[i].cells[4].getElementsByTagName("select")[0].value || "unit";
        const isLocked = tableRows[i].cells[5].getElementsByTagName("input")[0].checked || false;

        // Check if the current and desired measurements are both valid in terms of mass or volume
        const isMass = currentMeasurement in massMeasurements && desiredMeasurement in massMeasurements;
        const isVolume = currentMeasurement in volumeMeasurements && desiredMeasurement in volumeMeasurements;
        const isSame = currentMeasurement == desiredMeasurement;

        if (!isMass && !isVolume && !isSame) {
            alert(`${lang.mismatchError} '${currentMeasurement}' -> '${desiredMeasurement}' (${ingredient}).`);
            return;
        }

        if (isLocked) {
            lockRowIndex = i;

            let currentFactor = 1;
            let desiredFactor = 1;
            if (isMass) {
                currentFactor = massMeasurements[currentMeasurement];
                desiredFactor = massMeasurements[desiredMeasurement];
            } else if (isVolume) {
                currentFactor = volumeMeasurements[currentMeasurement];
                desiredFactor = volumeMeasurements[desiredMeasurement];
            }

            ratio = (desiredAmount * currentFactor) / (currentAmount * desiredFactor);
        }
    }

    if (lockRowIndex == -1) {
        alert(lang.noRowSelected);
        return;
    }

    // Apply the ratio to all other rows to calculate the new desired amounts
    for (let i = 0; i < tableRows.length; i++) {
        const currentAmount = parseFloat(tableRows[i].cells[1].getElementsByTagName("input")[0].value) || 0;
        const currentMeasurement = tableRows[i].cells[2].getElementsByTagName("select")[0].value || "unit";
        const desiredMeasurement = tableRows[i].cells[4].getElementsByTagName("select")[0].value || "unit";

        let conversionFactor = 1;

        // Check if mass or volume and apply conversion factor
        if (currentMeasurement in massMeasurements && desiredMeasurement in massMeasurements) {
            conversionFactor = massMeasurements[currentMeasurement] / massMeasurements[desiredMeasurement];
        } else if (currentMeasurement in volumeMeasurements && desiredMeasurement in volumeMeasurements) {
            conversionFactor = volumeMeasurements[currentMeasurement] / volumeMeasurements[desiredMeasurement];
        }

        // Calculate the new desired amount
        const newDesiredAmount = currentAmount * ratio * conversionFactor;

        // Set the new desired amount in the corresponding input box
        tableRows[i].cells[3].getElementsByTagName("input")[0].value = newDesiredAmount.toFixed(2);
    }
}

// Function to initialize the table with a default row
function initializeTable() {
    addRow();
}

function initialize() {
    initializeTable();
    detectLanguage();
    applyTranslations();
}

// Event listener for page load
window.onload = initialize;
