const formationCard = document.getElementById("formation-directory");

const buttonFormationCreate = document.getElementById("formationCreate");
const popupFormationCreate = document.getElementById("popupFormationCreate");
const buttonClosePopup = document.getElementById("closePopup");
const formFormationCreate = document.getElementById("formFormationCreate");
const buttonCreateFormation = document.getElementById("buttonCreateFormation");

const formCreateNom = document.getElementById("formCreateNom");
const formCreateDateDebut = document.getElementById("formCreateDateDebut");
const formCreateDateFin = document.getElementById("formCreateDateFin");

const savedFormations = JSON.parse(localStorage.getItem("formations"));
const savedCards = JSON.parse(localStorage.getItem("cards")) || [];

let cardList = savedFormations || savedCards || [];

cardList = cardList.map(function (formation) {
    return {
        ...formation,
        eleves: Array.isArray(formation.eleves) ? formation.eleves : [],
        votes: Array.isArray(formation.votes) ? formation.votes : []
    };
});

localStorage.setItem("formations", JSON.stringify(cardList));

let editMode = null;
let cardID = cardList.length > 0 ? Math.max(...cardList.map(c => Number(c.id))) : 0;

cardList.forEach(function (c) {
    createFormationCard(c.id, c.nom, c.dateDebut, c.dateFin);
});

buttonFormationCreate.addEventListener("click", () => {
    popupFormationCreate.style.display = "block";
    formCreateNom.focus();
    buttonCreateFormation.textContent = "Créer";
    editMode = null;
    formFormationCreate.reset();
});

buttonClosePopup.addEventListener("click", () => {
    popupFormationCreate.style.display = "none";
    formFormationCreate.reset();
    buttonCreateFormation.textContent = "Créer";
    editMode = null;
});

formFormationCreate.addEventListener("submit", (e) => {
    e.preventDefault();

    if (editMode === null) {
        cardID++;

        const cardObject = {
            id: cardID,
            nom: formCreateNom.value,
            dateDebut: formCreateDateDebut.value,
            dateFin: formCreateDateFin.value,
            eleves: [],
            votes: []
        };

        cardList.push(cardObject);
        saveFormations();

        createFormationCard(
            cardObject.id,
            cardObject.nom,
            cardObject.dateDebut,
            cardObject.dateFin
        );
    } else {
        const cardNameElement = editMode.querySelector(".card-name");
        const cardStartDateElement = editMode.querySelector(".card-start-date");
        const cardEndDateElement = editMode.querySelector(".card-end-date");

        cardNameElement.textContent = formCreateNom.value;
        cardStartDateElement.textContent = formatDateFR(formCreateDateDebut.value);
        cardEndDateElement.textContent = formatDateFR(formCreateDateFin.value);

        editMode.name = formCreateNom.value;
        editMode.startDate = formCreateDateDebut.value;
        editMode.endDate = formCreateDateFin.value;

        cardList.forEach(function (c) {
            if (c.id === Number(editMode.id)) {
                c.nom = formCreateNom.value;
                c.dateDebut = formCreateDateDebut.value;
                c.dateFin = formCreateDateFin.value;
            }
        });

        saveFormations();
    }

    popupFormationCreate.style.display = "none";
    formFormationCreate.reset();
    buttonCreateFormation.textContent = "Créer";
    editMode = null;
});

function saveFormations() {
    localStorage.setItem("formations", JSON.stringify(cardList));
}

function formatDateFR(dateString) {
    if (!dateString) return "";

    const morceaux = dateString.split("-");
    return `${morceaux[2]}/${morceaux[1]}/${morceaux[0]}`;
}

function createFormationCard(id, nom, dateDebut, dateFin) {
    const card = document.createElement("div");

    card.id = String(id);
    card.name = nom;
    card.startDate = dateDebut;
    card.endDate = dateFin;

    card.innerHTML = `
        <p class="card-name">${nom}</p>
        <p class="card-start-date">${formatDateFR(dateDebut)}</p>
        <p class="card-end-date">${formatDateFR(dateFin)}</p>

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
    `;

    card.querySelector(".btn-view").addEventListener("click", function () {
        window.location.href = `eleves.html?id=${encodeURIComponent(id)}`;
    });

    const buttonDeleteCard = card.querySelector(".btn-delete");
    const buttonModifyCard = card.querySelector(".btn-edit");

    buttonDeleteCard.addEventListener("click", () => {
        if (confirm("Voulez-vous vraiment supprimer cette formation ?")) {
            card.remove();

            cardList = cardList.filter(function (c) {
                return c.id !== Number(card.id);
            });

            saveFormations();
        }
    });

    buttonModifyCard.addEventListener("click", () => {
        buttonCreateFormation.textContent = "Modifier";
        popupFormationCreate.style.display = "block";
        formCreateNom.focus();

        editMode = card;

        formCreateNom.value = card.name;
        formCreateDateDebut.value = card.startDate;
        formCreateDateFin.value = card.endDate;
    });

    formationCard.appendChild(card);
}
