const formationCard = document.getElementById("formation-directory");

const buttonFormationCreate = document.getElementById("formationCreate");
const popupFormationCreate = document.getElementById("popupFormationCreate")
const buttonClosePopup = document.getElementById("closePopup");
const formFormationCreate = document.getElementById("formFormationCreate");
const buttonCreateFormation = document.getElementById("buttonCreateFormation")

const formCreateNom = document.getElementById("formCreateNom")
const formCreateDateDebut = document.getElementById("formCreateDateDebut")
const formCreateDateFin = document.getElementById("formCreateDateFin")

buttonFormationCreate.addEventListener("click", () => {
    popupFormationCreate.style.display = "block";
})

buttonClosePopup.addEventListener("click", () => {
    popupFormationCreate.style.display = "none";
})

formFormationCreate.addEventListener("submit", (e) => {
    e.preventDefault();
    createFormationCard();
    popupFormationCreate.style.display = "none";
});

function createFormationCard() {
    const card = document.createElement("div");
    card.innerHTML = `
    <p>${formCreateNom.value}</p>
    <p>${formCreateDateDebut.value}</p>
    <p>${formCreateDateFin.value}</p>
    `
    formationCard.appendChild(card);
    return card;
}