const convertButton = document.querySelector(".convertbutton");
const currencySelectTo = document.querySelector(".currency-select");
const currencySelectFrom = document.querySelector(".currency-select-from");

const inputCurrencyValueElement = document.querySelector("#input-value");
const currencyValueToConvertElement = document.querySelector(".valor");
const currencyValueConvertedElement = document.querySelector(".valor2");

const currencyNameFromElement = document.getElementById("moeda-origem");
const currencyImageFromElement = document.getElementById("logo-origem");

const currencyNameToElement = document.getElementById("moeda-convertida");
const currencyImageToElement = document.getElementById("logo-convercao");

// VOCÊ PRECISA DESTE SELETOR PARA O INDICADOR DE CARREGAMENTO!
const loadingIndicatorElement = document.getElementById("loading-indicator");

// URL da API como uma constante para facilitar futuras alterações
const CURRENCY_API_URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL";

// --- Variáveis de Estado ---
let exchangeRates = {
    brl: 1,
    usd: 5.11, // Valor de fallback
    eur: 5.89, // Valor de fallback
    gbp: 6.90, // Valor de fallback
    btc: 328855.97 // Bitcoin geralmente precisa de outra API ou ser hardcoded
};

let currencyInfo = {
    brl: { name: "Real Brasileiro", img: "./assets/real.png" },
    usd: { name: "Dólar Americano", img: "./assets/dolar.png" },
    eur: { name: "Euro", img: "./assets/euro.png" },
    gbp: { name: "Libra Esterlina", img: "./assets/libra 1.png" },
    btc: { name: "Bitcoin", img: "./assets/bitcoin 1.png" }
};

// --- Funções Utilitárias ---

/**
 * @description Formata um valor numérico para o formato de moeda específico.
 * Lida com Bitcoin com mais casas decimais.
 * @param {number} value - O valor numérico a ser formatado.
 * @param {string} currencyCode - O código da moeda (ex: "brl", "usd").
 * @param {string} locale - O locale para formatação (ex: "pt-br", "en-US").
 * @returns {string} O valor formatado como string.
 */
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

/**
 * @description Exibe ou esconde o indicador de carregamento na interface.
 * @param {boolean} show - `true` para mostrar o indicador, `false` para esconder.
 */
const toggleLoadingIndicator = (show) => {
    if (loadingIndicatorElement) {
        loadingIndicatorElement.style.display = show ? "block" : "none";
    }
};

// --- Funções Principais de Lógica ---

/**
 * @description Busca as últimas taxas de câmbio da API e atualiza o objeto `exchangeRates`.
 * Inclui tratamento de erros e fallback para valores padrão em caso de falha da API.
 */
async function fetchExchangeRates() {
    toggleLoadingIndicator(true);
    try {
        const response = await fetch(CURRENCY_API_URL);

        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}. Detalhes: ${await response.text()}`);
        }

        const data = await response.json();

        let updatedAnyRate = false;

        if (data.USDBRL && data.USDBRL.bid) {
            exchangeRates.usd = parseFloat(data.USDBRL.bid);
            updatedAnyRate = true;
        }
        if (data.EURBRL && data.EURBRL.bid) {
            exchangeRates.eur = parseFloat(data.EURBRL.bid);
            updatedAnyRate = true;
        }
        if (data.GBPBRL && data.GBPBRL.bid) {
            exchangeRates.gbp = parseFloat(data.GBPBRL.bid);
            updatedAnyRate = true;
        }

        if (updatedAnyRate) {
            console.log("Taxas de câmbio atualizadas com sucesso:", exchangeRates);
        } else {
            console.warn("Nenhuma taxa de câmbio específica (USD, EUR, GBP) foi atualizada pela API. Verifique a estrutura dos dados.");
        }

    } catch (error) {
        console.error("Erro ao buscar taxas de câmbio da API:", error);
        console.warn("Usando taxas de câmbio padrão (hardcoded) devido ao erro.");
    } finally {
        toggleLoadingIndicator(false);
    }
}

/**
 * @description Realiza a conversão dos valores com base nas moedas selecionadas e nas taxas atuais.
 * Atualiza os elementos de exibição na interface do usuário.
 */
function convertValues() {
    const inputValue = parseFloat(inputCurrencyValueElement.value);

    if (isNaN(inputValue) || inputValue === null) {
        inputCurrencyValueElement.value = "0";
        currencyValueToConvertElement.innerHTML = formatCurrency(0, currencySelectFrom.value, "pt-br");
        currencyValueConvertedElement.innerHTML = formatCurrency(0, currencySelectTo.value, "pt-br");
        return;
    }

    const fromCurrencyCode = currencySelectFrom.value;
    const toCurrencyCode = currencySelectTo.value;

    const valueInBRL = inputValue * exchangeRates[fromCurrencyCode];
    const convertedValue = valueInBRL / exchangeRates[toCurrencyCode];

    currencyValueToConvertElement.innerHTML = formatCurrency(inputValue, fromCurrencyCode, "pt-br");

    let targetLocale = "pt-br";
    if (toCurrencyCode === "usd") targetLocale = "en-US";
    else if (toCurrencyCode === "eur") targetLocale = "de-DE";
    else if (toCurrencyCode === "gbp") targetLocale = "en-GB";

    currencyValueConvertedElement.innerHTML = formatCurrency(convertedValue, toCurrencyCode, targetLocale);
}

/**
 * @description Atualiza a exibição do nome e imagem de uma moeda na interface.
 * @param {HTMLSelectElement} selectElement - O elemento `<select>` (origem ou destino).
 * @param {HTMLElement} nameElement - O elemento HTML onde o nome da moeda será exibido.
 * @param {HTMLImageElement} imageElement - O elemento `<img>` onde a imagem da moeda será exibida.
 */
function updateCurrencyDisplay(selectElement, nameElement, imageElement) {
    const selectedCurrencyCode = selectElement.value;
    const { name, img } = currencyInfo[selectedCurrencyCode] || { name: "Desconhecido", img: "" };

    nameElement.innerHTML = name;
    imageElement.src = img;

    convertValues();
}

// --- Inicialização e Event Listeners ---

/**
 * @description Função principal de inicialização do aplicativo.
 * Garante que as taxas da API sejam carregadas antes de configurar os event listeners
 * e realizar a primeira atualização da interface.
 */
async function initializeApp() {
    await fetchExchangeRates();

    currencySelectFrom.addEventListener("change", () => updateCurrencyDisplay(
        currencySelectFrom,
        currencyNameFromElement,
        currencyImageFromElement
    ));
    currencySelectTo.addEventListener("change", () => updateCurrencyDisplay(
        currencySelectTo,
        currencyNameToElement,
        currencyImageToElement
    ));
    convertButton.addEventListener("click", convertValues);

    updateCurrencyDisplay(currencySelectFrom, currencyNameFromElement, currencyImageFromElement);
    updateCurrencyDisplay(currencySelectTo, currencyNameToElement, currencyImageToElement);
    convertValues();
}

// Garante que o script só execute após o DOM (Document Object Model) estar completamente carregado.
document.addEventListener("DOMContentLoaded", initializeApp);