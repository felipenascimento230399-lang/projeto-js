const convertButton = document.querySelector(" .convertbutton")
const currencySelectTo = document.querySelector(".currency-select")
const currencySelectFrom = document.querySelector(".currency-select-from");

const inputCurrencyValueElement = document.querySelector("#input-value");
const currencyValueToConvertElement = document.querySelector(".valor"); 
const currencyValueConvertedElement = document.querySelector(".valor2"); 

const currencyNameFromElement = document.getElementById("moeda-origem");
const currencyImageFromElement = document.getElementById("logo-origem");

const currencyNameToElement = document.getElementById("moeda-convertida");
const currencyImageToElement = document.getElementById("logo-convercao");


const exchangeRates = {
    brl: 1,
    usd: 5.11,
    eur: 5.89,
    gbp: 6.90,
    btc: 328855.97
};

const currencyInfo = {
    brl: { name: "Real Brasileiro", img: "./assets/real.png" },
    usd: { name: "Dólar Americano", img: "./assets/dolar.png" },
    eur: { name: "Euro", img: "./assets/euro.png" },
    gbp: { name: "Libra Esterlina", img: "./assets/libra 1.png" },
    btc: { name: "Bitcoin", img: "./assets/bitcoin 1.png" }
};

const formatCurrency = (value, currencyCode, locale = "pt-br") => {
    
    if (currencyCode === "btc") {
        return new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
        }).format(value);
    }
    
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode.toUpperCase()
    }).format(value);
};

function convertValues() {
    // Usamos parseFloat para garantir que o valor do input seja um número
    const inputValue = parseFloat(inputCurrencyValueElement.value);

    // Se o input estiver vazio ou não for um número, definimos como 0 para evitar erros
    if (isNaN(inputValue) || inputValue === null) {
        inputCurrencyValueElement.value = "0";
        // Podemos exibir 0 nas moedas para não bugar
        currencyValueToConvertElement.innerHTML = formatCurrency(0, currencySelectFrom.value, "pt-br");
        currencyValueConvertedElement.innerHTML = formatCurrency(0, currencySelectTo.value, "pt-br");
        return; // Sai da função para não processar um valor inválido
    }

    const fromCurrencyCode = currencySelectFrom.value; // Código da moeda de origem (ex: 'brl')
    const toCurrencyCode = currencySelectTo.value;     // Código da moeda de destino (ex: 'usd')

    // 1. Converter o valor de entrada para BRL (moeda base)
    // Ex: Se input é 10 USD, e 1 USD = 5.11 BRL, então valueInBRL = 10 * 5.11 = 51.1 BRL
    const valueInBRL = inputValue * exchangeRates[fromCurrencyCode];

    // 2. Converter o valor em BRL para a moeda de destino
    // Ex: Se valueInBRL é 51.1 BRL, e 1 EUR = 5.89 BRL, então convertedValue = 51.1 / 5.89 = 8.67 EUR
    const convertedValue = valueInBRL / exchangeRates[toCurrencyCode];

    // Exibir o valor de origem formatado
    currencyValueToConvertElement.innerHTML = formatCurrency(inputValue, fromCurrencyCode, "pt-br");

    // Exibir o valor convertido formatado
    // Definimos o locale específico para algumas moedas para melhor formatação
    let targetLocale = "pt-br"; // Locale padrão
    if (toCurrencyCode === "usd") targetLocale = "en-US";
    else if (toCurrencyCode === "eur") targetLocale = "de-DE";
    else if (toCurrencyCode === "gbp") targetLocale = "en-GB";

    currencyValueConvertedElement.innerHTML = formatCurrency(convertedValue, toCurrencyCode, targetLocale);
}
function updateSourceCurrencyDisplay() { // <-- ESTA FUNÇÃO ESTAVA FALTANDO!
    const selectedCurrencyCode = currencySelectFrom.value;
    const info = currencyInfo[selectedCurrencyCode];

    if (info) {
        currencyNameFromElement.innerHTML = info.name;
        currencyImageFromElement.src = info.img;
    }
    convertValues(); // Recalcula os valores sempre que a moeda de origem muda
}
// Função para atualizar o display da moeda de DESTINO (nome e imagem)
function updateTargetCurrencyDisplay() {
    const selectedCurrencyCode = currencySelectTo.value;
    const info = currencyInfo[selectedCurrencyCode];

    if (info) {
        currencyNameToElement.innerHTML = info.name;
        currencyImageToElement.src = info.img;
    }
    convertValues(); // Recalcula os valores sempre que a moeda de destino muda
}

// Adição de Event Listeners
currencySelectFrom.addEventListener("change", updateSourceCurrencyDisplay); // NOVO: Evento para o select de origem
currencySelectTo.addEventListener("change", updateTargetCurrencyDisplay);  // Seu evento existente (renomeado)
convertButton.addEventListener("click", convertValues);

// Chama as funções uma vez ao carregar a página para definir o estado inicial
document.addEventListener("DOMContentLoaded", () => {
    updateSourceCurrencyDisplay();
    updateTargetCurrencyDisplay();
    convertValues();
})