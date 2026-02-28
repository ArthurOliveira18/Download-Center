const div = document.createElement("div")
const options_driver = document.getElementById("options-drivers")
const drivers = [
    {
        marca: "Daruma",
        modelos: [
            { nome: "DR800", link: "./driversDownloads/DARUMA_DR800_Driver_USB.zip" },
            { nome: "DR700", link: "./driversDownloads/Driver-Daruma-DR700.zip" }
        ]
    },
    {
        marca: "Epson",
        modelos: [
            { nome: "TM-T20", link: "./driversDownloads/driver-epson-tm-t20-tm-t20x.zip" },
            { nome: "TM-T20X", link: "./driversDownloads/driver-epson-tm-t20-tm-t20x.zip" }
        ]
    },
    {
        marca: "Bematech",
        modelos: [
            { nome: "Bematech 4200 TH", link: "./driversDownloads/BEMA_MP_4200_TH_32.zip" },
            { nome: "Bematech MP-2800 TH", link: "./driversDownloads/Bematech_MP-2800_TH_v1.3.zip" }
        ]
    },
    {
        marca: "Elgin",
        modelos: [
            { nome: "Elgin i9", link: "./driversDownloads/ELGIN_i9_e_i7_Driver_Spooler.zip" },
            { nome: "Elgin i8", link: "./driversDownloads/imgCard_2a2228fd-72b1-4b99-8b66-8177650aaef5_i8_Windows Driver_V7.17.rar" },
            { nome: "Elgin i7", link: "./driversDownloads/ELGIN_i9_e_i7_Driver_Spooler.zip" },
        ]
    },
    {
        marca: "Generico (POS-58/POS-80)",
        modelos: [
            { nome: "POS-58", link: "./driversDownloads/POS_58_Driver-11.3.0.0.zip" },
            { nome: "POS-80", link: "./driversDownloads/POS_58_Driver-11.3.0.0.zip" },
        ]
    }
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