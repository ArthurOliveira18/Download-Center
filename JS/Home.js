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
    },
   



];


// forEach para percorrer os drivers e aparecer na tela automatizado.
drivers.forEach(driver => {

    // Essa div card drivers vai ser a div que vai armazenar todos os cards de drivers de impressoras
    const driversDiv = document.createElement("div")
    driversDiv.classList.add("drivers-div")

    let titleDrivers = document.createElement("h1")
    titleDrivers.textContent = driver.marca
    titleDrivers.classList.add("title-drivers")

    driversDiv.appendChild(titleDrivers)


    // forEach para percorrer os modelos do objeto driver e cada elemento do array modelo, vai criar uma div com um modelo diferente
    driver.modelos.forEach(modelsDrivers => {

        const cardDrivers = document.createElement("div")
        cardDrivers.classList.add("card-drivers")

        let textDrivers = document.createElement("p")

        textDrivers.textContent = modelsDrivers

        textDrivers.classList.add("text-drivers")

        cardDrivers.appendChild(textDrivers)

        driversDiv.appendChild(cardDrivers)

    });



    options_driver.appendChild(driversDiv)



});





