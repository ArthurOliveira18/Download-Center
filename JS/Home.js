const div = document.createElement("div")
const options_driver = document.getElementById("options-drivers")

const drivers = [
    {
        marca: "Daruma",
        modelos: ["DR800", "DR700"]
    },
    {
        marca: "Epson",
        modelos: ["TM-T20", "TM-T20X"]
    },
    {
        marca: "Bematech",
        modelos: ["Bematech 4200 TH", "Bematech 4200 HS"]
    },
    {
        marca: "Elgin",
        modelos: ["Elgin i9", "Elgin i8", "Elgin i7"]
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
        textDrivers.textContent = modelsDrivers
        textDrivers.classList.add("text-drivers")

        cardDrivers.appendChild(textDrivers)
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