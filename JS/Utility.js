const div = document.createElement("div")
const options_driver = document.getElementById("options-drivers")
const drivers = [
    {
        marca: "Bematech",
        modelos: [
            { nome: "Bematech Utility", link: "../utilityDownloads/DARUMA DR800 Driver USB.zip" },
        ]
    }, 
    {
        marca: "Elgin",
        modelos: [
            { nome: "Elgin Utility", link: "../utilityDownloads/DARUMA DR800 Driver USB.zip" },
        ]
    },

];

// ============================
// Loop principal
// ============================
drivers.forEach(driver => {

    // ============================
    // Card principal do driver
    // ============================
    const driversDiv = document.createElement("div")
    driversDiv.classList.add("drivers-div")


    // ============================
    // Header do card
    // ============================
    const headerDiv = document.createElement("div")
    headerDiv.classList.add("header-div-driver")

    const titleDrivers = document.createElement("h1")
    titleDrivers.textContent = driver.marca
    titleDrivers.classList.add("title-drivers")

    const expandIcon = document.createElement("span")
    expandIcon.classList.add("material-symbols-outlined")
    expandIcon.classList.add("expand-icon")
    expandIcon.textContent = "arrow_drop_down"

    headerDiv.appendChild(titleDrivers)
    headerDiv.appendChild(expandIcon)

    driversDiv.appendChild(headerDiv)


    // ============================
    // Container dos modelos
    // ============================
    const modelsContainer = document.createElement("div")
    modelsContainer.classList.add("models-container")


    // ============================
    // Loop dos modelos
    // ============================
    driver.modelos.forEach(modelsDrivers => {

        const cardDrivers = document.createElement("div")
        cardDrivers.classList.add("card-drivers")

        const textDrivers = document.createElement("p")

        // 
        textDrivers.textContent = modelsDrivers.nome
        textDrivers.classList.add("text-drivers")

        // Div para armazenar os buttons, seja ele o de download e o de tutorial
        const buttonsDriversDiv = document.createElement("div")
        buttonsDriversDiv.classList.add("buttons-drivers-div")

        let buttonDriverDownload = document.createElement("button")
        buttonDriverDownload.classList.add("button-driver-download")

        let buttonTutorial = document.createElement("button")
        buttonTutorial.classList.add("button-tutorial")

        buttonDriverDownload.textContent = "Baixar Driver"
        buttonTutorial.textContent = "Tutorial de Instalação"

        buttonDriverDownload.addEventListener("click", function () {
            window.open(modelsDrivers.link)
        })


        buttonsDriversDiv.appendChild(buttonDriverDownload)
        buttonsDriversDiv.appendChild(buttonTutorial)




        cardDrivers.appendChild(textDrivers)
        cardDrivers.appendChild(buttonsDriversDiv)
        modelsContainer.appendChild(cardDrivers)
    })


    driversDiv.appendChild(modelsContainer)


    headerDiv.addEventListener("click", function () {

        const isOpen = modelsContainer.classList.contains("active");

        // Fecha todos
        document.querySelectorAll(".models-container").forEach(item => {
            item.classList.remove("active");
        });

        document.querySelectorAll(".expand-icon").forEach(icon => {
            icon.classList.remove("rotate");
        });

        // Se não estava aberto, abre
        if (!isOpen) {
            modelsContainer.classList.add("active");
            expandIcon.classList.add("rotate");
        }

    });

    options_driver.appendChild(driversDiv)
})


const searchInput = document.getElementById("search-driver")

searchInput.addEventListener("input", function () {

    const valueInput = searchInput.value.toLowerCase()

    const cards = document.querySelectorAll(".drivers-div")

    cards.forEach(card => {

        const cardValue = card.querySelector(".title-drivers").textContent.toLowerCase()

        if (cardValue.includes(valueInput)) {
            card.classList.remove("hidden")
        } else {
            card.classList.add("hidden")
        }

    });
})