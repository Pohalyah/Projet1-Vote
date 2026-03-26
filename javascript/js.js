const formationCard = document.getElementById("formation-directory");

const buttonFormationCreate = document.getElementById("formationCreate");
const popupFormationCreate = document.getElementById("popupFormationCreate");
const buttonClosePopup = document.getElementById("closePopup");
const formFormationCreate = document.getElementById("formFormationCreate");
const buttonCreateFormation = document.getElementById("buttonCreateFormation");
const popupVoteCreate = document.getElementById("popupVoteCreate");
const closePopupVote = document.getElementById("closePopupVote");
const formVoteCreate = document.getElementById("formVoteCreate");
const voteFormationName = document.getElementById("voteFormationName");
const votePresentsList = document.getElementById("votePresentsList");
const buttonCreateVote = document.getElementById("buttonCreateVote");

const formCreateNom = document.getElementById("formCreateNom");
const formCreateDateDebut = document.getElementById("formCreateDateDebut");
const formCreateDateFin = document.getElementById("formCreateDateFin");
const formVoteDateOuverture = document.getElementById("formVoteDateOuverture");
const formVoteHeureOuverture = document.getElementById("formVoteHeureOuverture");
const formVoteDateFin = document.getElementById("formVoteDateFin");

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
let voteFormationId = null;
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

popupFormationCreate.addEventListener("click", (e) => {
    if (e.target !== popupFormationCreate) {
        return;
    }

    popupFormationCreate.style.display = "none";
    formFormationCreate.reset();
    buttonCreateFormation.textContent = "Créer";
    editMode = null;
});

document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || popupFormationCreate.style.display !== "block") {
        return;
    }

    popupFormationCreate.style.display = "none";
    formFormationCreate.reset();
    buttonCreateFormation.textContent = "Créer";
    editMode = null;
});

closePopupVote.addEventListener("click", () => {
    closeVotePopup();
});

popupVoteCreate.addEventListener("click", (e) => {
    if (e.target !== popupVoteCreate) {
        return;
    }

    closeVotePopup();
});

document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || popupVoteCreate.style.display !== "block") {
        return;
    }

    closeVotePopup();
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
        applyFormationCardStatus(editMode, formCreateDateDebut.value, formCreateDateFin.value);

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

formVoteCreate.addEventListener("submit", (e) => {
    e.preventDefault();

    const formation = cardList.find((item) => String(item.id) === String(voteFormationId));

    if (!formation) {
        alert("Formation introuvable.");
        closeVotePopup();
        return;
    }

    const dateOuverture = formVoteDateOuverture.value;
    const heureOuverture = formVoteHeureOuverture.value;
    const dateFin = formVoteDateFin.value;
    const presentes = Array.from(
        votePresentsList.querySelectorAll('input[type="checkbox"]:checked')
    ).map((input) => Number(input.value));

    if (presentes.length < 2) {
        alert("Selectionne au moins 2 eleves presents pour creer le vote.");
        return;
    }

    if (dateFin < dateOuverture) {
        alert("La date de fin doit etre posterieure ou egale a la date d'ouverture.");
        return;
    }

    formation.votes = Array.isArray(formation.votes) ? formation.votes : [];

    const vote = {
        id: getNextVoteId(formation),
        dateOuverture: dateOuverture,
        heureOuverture: heureOuverture,
        dateFin: dateFin,
        presentes: presentes
    };

    formation.votes.push(vote);
    saveFormations();
    closeVotePopup();
    alert("Vote cree avec succes pour cette formation.");
});

function saveFormations() {
    localStorage.setItem("formations", JSON.stringify(cardList));
}

function formatDateFR(dateString) {
    if (!dateString) return "";

    const morceaux = dateString.split("-");
    return `${morceaux[2]}/${morceaux[1]}/${morceaux[0]}`;
}

function formatHeure(heure) {
    return heure ? heure.slice(0, 5) : "";
}

function getTodayISO() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getCurrentTimeHHMM() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

function getFormationStatus(dateDebut, dateFin) {
    if (!dateDebut || !dateFin) {
        return "status-pending";
    }

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const start = new Date(`${dateDebut}T00:00:00`);
    const end = new Date(`${dateFin}T23:59:59.999`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return "status-pending";
    }

    if (today < start) {
        return "status-pending";
    }

    if (today > end) {
        return "status-ended";
    }

    return "status-current";
}

function applyFormationCardStatus(card, dateDebut, dateFin) {
    const status = getFormationStatus(dateDebut, dateFin);

    card.classList.remove("status-pending", "status-current", "status-ended");
    card.classList.add("formation-card", status);

    const voteButton = card.querySelector(".btn-vote");
    if (voteButton) {
        const isActive = status === "status-current";
        voteButton.disabled = !isActive;
        voteButton.title = isActive
            ? "Creer un vote pour cette formation"
            : "Le vote est disponible uniquement pendant la periode active de la formation";
    }
}

function getNextVoteId(formation) {
    const votes = Array.isArray(formation.votes) ? formation.votes : [];

    if (votes.length === 0) {
        return 1;
    }

    return Math.max(...votes.map((vote) => Number(vote.id) || 0)) + 1;
}

function renderVotePresents(formation) {
    const eleves = Array.isArray(formation.eleves) ? formation.eleves : [];

    if (eleves.length === 0) {
        votePresentsList.innerHTML = `<p class="vote-empty">Aucun eleve dans cette formation.</p>`;
        return;
    }

    votePresentsList.innerHTML = eleves.map((eleve) => `
        <label class="vote-checkbox">
            <input type="checkbox" value="${eleve.id}" checked>
            <span>${eleve.prenom} ${eleve.nom} - ${eleve.email}</span>
        </label>
    `).join("");
}

function openVotePopup(formation) {
    if (!formation) {
        return;
    }

    if (!Array.isArray(formation.eleves) || formation.eleves.length < 2) {
        alert("Il faut au moins 2 eleves dans la formation pour creer un vote.");
        return;
    }

    voteFormationId = formation.id;
    voteFormationName.textContent = `Formation : ${formation.nom}`;
    formVoteCreate.reset();
    formVoteDateOuverture.value = getTodayISO();
    formVoteHeureOuverture.value = getCurrentTimeHHMM();
    formVoteDateFin.value = getTodayISO();
    renderVotePresents(formation);
    popupVoteCreate.style.display = "block";
    formVoteDateOuverture.focus();
}

function closeVotePopup() {
    popupVoteCreate.style.display = "none";
    formVoteCreate.reset();
    votePresentsList.innerHTML = "";
    voteFormationName.textContent = "";
    voteFormationId = null;
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

            <button class="btn-vote" type="button" aria-label="Creer un vote">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 4h11l5 5v11H4z"></path>
                    <path d="M15 4v5h5"></path>
                    <path d="M8 14h8"></path>
                    <path d="M8 18h5"></path>
                    <path d="m8.5 10 1.5 1.5 3-3"></path>
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

    applyFormationCardStatus(card, dateDebut, dateFin);

    card.querySelector(".btn-view").addEventListener("click", function () {
        window.location.href = `eleves.html?id=${encodeURIComponent(id)}`;
    });

    const buttonVoteCard = card.querySelector(".btn-vote");
    const buttonDeleteCard = card.querySelector(".btn-delete");
    const buttonModifyCard = card.querySelector(".btn-edit");

    buttonVoteCard.addEventListener("click", () => {
        const formation = cardList.find((item) => item.id === Number(card.id));
        openVotePopup(formation);
    });

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
