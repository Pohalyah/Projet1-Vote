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

function formatDateFR(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
}

function createFormationCard() {
    const card = document.createElement("div");
    card.innerHTML = `
    <p>${formCreateNom.value}</p>
    <p>${formatDateFR(formCreateDateDebut.value)}</p>
    <p>${formatDateFR(formCreateDateFin.value)}</p>

    <div class="card-buttons">
        <button class="btn-view" type="button" aria-label="Voir">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"></path>
                <circle cx="12" cy="12" r="2.5"></circle>
            </svg>
        </button>

        <button class="btn-edit" type="button" aria-label="Modifier">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 21h4l11-11-4-4L3 17v4Z"></path>
                <path d="M14 6l4 4"></path>
            </svg>
        </button>

        <button class="btn-delete" type="button" aria-label="Supprimer">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12"></path>
                <path d="M18 6L6 18"></path>
            </svg>
        </button>
    </div>
    `
    formationCard.appendChild(card);
    return card;
}