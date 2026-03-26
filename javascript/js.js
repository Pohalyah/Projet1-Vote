const formationDirectory = document.getElementById("formation-directory");

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

const formCreateNom = document.getElementById("formCreateNom");
const formCreateDateDebut = document.getElementById("formCreateDateDebut");
const formCreateDateFin = document.getElementById("formCreateDateFin");

const formVoteDateOuverture = document.getElementById("formVoteDateOuverture");
const formVoteHeureOuverture = document.getElementById("formVoteHeureOuverture");
const formVoteDateFin = document.getElementById("formVoteDateFin");

const savedFormations = JSON.parse(localStorage.getItem("formations"));
const savedCards = JSON.parse(localStorage.getItem("cards")) || [];

let cardList = (savedFormations || savedCards || []).map(normalizeFormation);
let editFormationId = null;
let voteFormationId = null;
let cardID =
    cardList.length > 0
        ? Math.max(...cardList.map((formation) => Number(formation.id) || 0))
        : 0;

saveFormations();
renderFormationCards();

buttonFormationCreate.addEventListener("click", () => {
    editFormationId = null;
    buttonCreateFormation.textContent = "Creer";
    formFormationCreate.reset();
    popupFormationCreate.style.display = "block";
    formCreateNom.focus();
});

buttonClosePopup.addEventListener("click", () => {
    closeFormationPopup();
});

popupFormationCreate.addEventListener("click", (event) => {
    if (event.target === popupFormationCreate) {
        closeFormationPopup();
    }
});

closePopupVote.addEventListener("click", () => {
    closeVotePopup();
});

popupVoteCreate.addEventListener("click", (event) => {
    if (event.target === popupVoteCreate) {
        closeVotePopup();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }

    if (popupVoteCreate.style.display === "block") {
        closeVotePopup();
    }

    if (popupFormationCreate.style.display === "block") {
        closeFormationPopup();
    }
});

formFormationCreate.addEventListener("submit", (event) => {
    event.preventDefault();

    const nom = formCreateNom.value.trim();
    const dateDebut = formCreateDateDebut.value;
    const dateFin = formCreateDateFin.value;

    if (dateFin < dateDebut) {
        alert("La date de fin doit etre posterieure ou egale a la date de debut.");
        return;
    }

    if (editFormationId === null) {
        cardID += 1;

        cardList.push(
            normalizeFormation({
                id: cardID,
                nom: nom,
                dateDebut: dateDebut,
                dateFin: dateFin,
                eleves: [],
                votes: []
            })
        );
    } else {
        const formation = cardList.find(
            (item) => Number(item.id) === Number(editFormationId)
        );

        if (!formation) {
            alert("Formation introuvable.");
            closeFormationPopup();
            return;
        }

        formation.nom = nom;
        formation.dateDebut = dateDebut;
        formation.dateFin = dateFin;
    }

    saveFormations();
    renderFormationCards();
    closeFormationPopup();
});

formVoteCreate.addEventListener("submit", (event) => {
    event.preventDefault();

    const formation = cardList.find(
        (item) => String(item.id) === String(voteFormationId)
    );

    if (!formation) {
        alert("Formation introuvable.");
        closeVotePopup();
        return;
    }

    const dateOuverture = formVoteDateOuverture.value;
    const heureOuverture = formVoteHeureOuverture.value;
    const dateFin = formVoteDateFin.value;
    let presentes = Array.from(
        votePresentsList.querySelectorAll('input[type="checkbox"]:checked')
    ).map((input) => Number(input.value));

    if (presentes.length === 0) {
        presentes = (formation.eleves || []).map((eleve) => Number(eleve.id));
    }

    if (presentes.length < 2) {
        alert("Selectionne au moins 2 eleves presents pour creer le vote.");
        return;
    }

    if (dateFin < dateOuverture) {
        alert("La date de fin doit etre posterieure ou egale a la date d'ouverture.");
        return;
    }

    formation.votes = Array.isArray(formation.votes) ? formation.votes : [];

    formation.votes.push(
        normalizeVote(
            {
                id: getNextVoteId(formation),
                dateOuverture: dateOuverture,
                heureOuverture: heureOuverture,
                dateFin: dateFin,
                presentes: presentes,
                reponses: [],
                creeLe: new Date().toISOString()
            },
            formation.votes.length
        )
    );

    saveFormations();
    closeVotePopup();
    alert("Vote cree avec succes pour cette formation.");
});

function normalizeFormation(formation) {
    const eleves = Array.isArray(formation.eleves) ? formation.eleves : [];
    const votes = Array.isArray(formation.votes) ? formation.votes : [];

    return {
        id: Number(formation.id) || 0,
        nom: typeof formation.nom === "string" ? formation.nom : "",
        dateDebut: formation.dateDebut || "",
        dateFin: formation.dateFin || "",
        eleves: eleves,
        votes: votes.map((vote, index) => normalizeVote(vote, index))
    };
}

function normalizeVote(vote, index) {
    const presentes = Array.isArray(vote.presentes)
        ? vote.presentes
              .map((value) => Number(value))
              .filter((value) => Number.isFinite(value))
        : [];

    return {
        id: Number(vote.id) || index + 1,
        dateOuverture: vote.dateOuverture || "",
        heureOuverture: vote.heureOuverture || "00:00",
        dateFin: vote.dateFin || vote.dateOuverture || "",
        presentes: presentes,
        reponses: Array.isArray(vote.reponses) ? vote.reponses : [],
        creeLe: vote.creeLe || "",
        statut: getVoteStatus(
            vote.dateOuverture || "",
            vote.heureOuverture || "00:00",
            vote.dateFin || vote.dateOuverture || ""
        )
    };
}

function saveFormations() {
    cardList = cardList.map(normalizeFormation);
    localStorage.setItem("formations", JSON.stringify(cardList));
}

function closeFormationPopup() {
    popupFormationCreate.style.display = "none";
    formFormationCreate.reset();
    buttonCreateFormation.textContent = "Creer";
    editFormationId = null;
}

function closeVotePopup() {
    popupVoteCreate.style.display = "none";
    formVoteCreate.reset();
    votePresentsList.innerHTML = "";
    voteFormationName.textContent = "";
    voteFormationId = null;
}

function renderFormationCards() {
    const renderedCards = formationDirectory.querySelectorAll(".formation-card");
    renderedCards.forEach((card) => {
        card.remove();
    });

    cardList.forEach((formation) => {
        formationDirectory.appendChild(createFormationCard(formation));
    });
}

function formatDateFR(dateString) {
    if (!dateString) {
        return "";
    }

    const parts = dateString.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
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

function getVoteStatus(dateOuverture, heureOuverture, dateFin) {
    if (!dateOuverture || !dateFin) {
        return "a_venir";
    }

    const openingTime = heureOuverture || "00:00";
    const now = new Date();
    const start = new Date(`${dateOuverture}T${openingTime}:00`);
    const end = new Date(`${dateFin}T23:59:59.999`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return "a_venir";
    }

    if (now < start) {
        return "a_venir";
    }

    if (now > end) {
        return "termine";
    }

    return "ouvert";
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
        votePresentsList.innerHTML =
            '<p class="vote-empty">Aucun eleve dans cette formation.</p>';
        return;
    }

    votePresentsList.innerHTML = eleves
        .map((eleve) => {
            return `
                <label class="vote-checkbox">
                    <input type="checkbox" value="${eleve.id}" checked>
                    <span>${eleve.prenom} ${eleve.nom} - ${eleve.email}</span>
                </label>
            `;
        })
        .join("");
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

function createFormationCard(formation) {
    const card = document.createElement("div");

    card.id = String(formation.id);
    card.classList.add("formation-card");
    card.innerHTML = `
        <div class="formation-card-body">
            <p class="card-name">${formation.nom}</p>
            <p class="card-start-date">${formatDateFR(formation.dateDebut)}</p>
            <p class="card-end-date">${formatDateFR(formation.dateFin)}</p>
        </div>

        <div class="card-buttons">
            <button class="btn-view" type="button" aria-label="Voir les eleves">
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

            <button class="btn-votes-page" type="button" aria-label="Voir les votes">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 7.5s3.5-4 10-4 10 4 10 4-3.5 4-10 4-10-4-10-4Z"></path>
                    <circle cx="12" cy="7.5" r="1.6"></circle>
                    <path d="M6 14h12v6H6z"></path>
                    <path d="M9 17h6"></path>
                    <path d="M10.5 12.5v1.5"></path>
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

    applyFormationCardStatus(card, formation.dateDebut, formation.dateFin);

    card.querySelector(".btn-view").addEventListener("click", () => {
        window.location.href = `eleves.html?id=${encodeURIComponent(formation.id)}`;
    });

    card.querySelector(".btn-votes-page").addEventListener("click", () => {
        window.location.href = `votes.html?id=${encodeURIComponent(formation.id)}`;
    });

    card.querySelector(".btn-vote").addEventListener("click", () => {
        openVotePopup(formation);
    });

    card.querySelector(".btn-delete").addEventListener("click", () => {
        if (!confirm("Voulez-vous vraiment supprimer cette formation ?")) {
            return;
        }

        cardList = cardList.filter(
            (item) => Number(item.id) !== Number(formation.id)
        );
        saveFormations();
        renderFormationCards();
    });

    card.querySelector(".btn-edit").addEventListener("click", () => {
        editFormationId = formation.id;
        buttonCreateFormation.textContent = "Modifier";
        formCreateNom.value = formation.nom;
        formCreateDateDebut.value = formation.dateDebut;
        formCreateDateFin.value = formation.dateFin;
        popupFormationCreate.style.display = "block";
        formCreateNom.focus();
    });

    return card;
}
