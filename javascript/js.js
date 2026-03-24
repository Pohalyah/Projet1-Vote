const formationCard = document.getElementById("formation-directory");

const buttonFormationCreate = document.getElementById("formationCreate");
const popupFormationCreate = document.getElementById("popupFormationCreate")
const buttonClosePopup = document.getElementById("closePopup");
const formFormationCreate = document.getElementById("formFormationCreate");
const buttonCreateFormation = document.getElementById("buttonCreateFormation")

const formCreateNom = document.getElementById("formCreateNom")
const formCreateDateDebut = document.getElementById("formCreateDateDebut")
const formCreateDateFin = document.getElementById("formCreateDateFin")

let cardList = JSON.parse(localStorage.getItem("cards")) || [];

let editMode = null;

cardList.forEach(function (card) {
    createPostit(postit.titre, postit.texte, postit.colonne);
});

buttonFormationCreate.addEventListener("click", () => {

    popupFormationCreate.style.display = "block";
    formCreateNom.focus();
    buttonCreateFormation.textContent = "Créer"
})

buttonClosePopup.addEventListener("click", () => {
    popupFormationCreate.style.display = "none";
})

formFormationCreate.addEventListener("submit", (e) => {
    e.preventDefault();
    if (editMode === null) {
        createFormationCard();
        popupFormationCreate.style.display = "none";
        formFormationCreate.reset();
    } else if (editMode !== null) {

        const cardNameElement = editMode.querySelector(".card-name");
        const cardStartDateElement = editMode.querySelector(".card-start-date");
        const cardEndDateElement = editMode.querySelector(".card-end-date");

        cardNameElement.textContent = formCreateNom.value;
        cardStartDateElement.textContent = formatDateFR(formCreateDateDebut.value);
        cardEndDateElement.textContent = formatDateFR(formCreateDateFin.value);

        popupFormationCreate.style.display = "none";
        formFormationCreate.reset();

        editMode = null;
    }

});

function formatDateFR(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
}

let cardID = 0;

function createFormationCard() {

    cardID++

    const card = document.createElement("div");

    card.id = cardID;

    let cardName = formCreateNom.value
    let cardStartDate = formCreateDateDebut.value
    let cardEndDate = formCreateDateFin.value

    card.name = cardName;
    card.startDate = cardStartDate;
    card.endDate = cardEndDate;

    card.innerHTML = `
    <p class=card-name>${formCreateNom.value}</p>
    <p class=card-start-date>${formatDateFR(formCreateDateDebut.value)}</p>
    <p class=card-end-date>${formatDateFR(formCreateDateFin.value)}</p>

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

    const buttonDeleteCard = card.querySelector(".btn-delete");

    buttonDeleteCard.addEventListener("click", () => {
        if (confirm("Voulez-vous vraiment supprimer cette formation ?")) {
            card.remove();
            localStorage.setItem("cards", JSON.stringify(cardList));
        }
    })

    const buttonModifyCard = card.querySelector(".btn-edit")

    buttonModifyCard.addEventListener("click", () => {
        buttonCreateFormation.textContent = "Modifier"
        popupFormationCreate.style.display = "block";
        formCreateNom.focus();

        editMode = card;

        formCreateNom.value = card.name
        formCreateDateDebut.value = card.startDate
        formCreateDateFin.value = card.endDate

        localStorage.setItem("cards", JSON.stringify(cardList));

    })

    formationCard.appendChild(card);



    localStorage.setItem("cards", JSON.stringify(cardList));
    return card;
}

