const params = new URLSearchParams(window.location.search);
const formationId = params.get("id");

const titreFormation = document.getElementById("titreFormation");
const votesDirectory = document.getElementById("votes-directory");

const popupVoteDetails = document.getElementById("popupVoteDetails");
const closePopupVoteDetails = document.getElementById("closePopupVoteDetails");
const voteDetailsTitle = document.getElementById("voteDetailsTitle");
const voteDetailsStatus = document.getElementById("voteDetailsStatus");
const voteDetailsOpening = document.getElementById("voteDetailsOpening");
const voteDetailsEnd = document.getElementById("voteDetailsEnd");
const voteDetailsParticipation = document.getElementById("voteDetailsParticipation");
const votePresentList = document.getElementById("votePresentList");

const formations = (JSON.parse(localStorage.getItem("formations")) || []).map(
    normalizeFormation
);
const formation = formations.find(
    (item) => String(item.id) === String(formationId)
);

if (!formation) {
    titreFormation.textContent = "Formation introuvable";
    renderMissingFormationState();
} else {
    titreFormation.textContent = formation.nom;
    localStorage.setItem("formations", JSON.stringify(formations));
    renderVotes();
}

closePopupVoteDetails.addEventListener("click", () => {
    closeVoteDetailsPopup();
});

popupVoteDetails.addEventListener("click", (event) => {
    if (event.target === popupVoteDetails) {
        closeVoteDetailsPopup();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && popupVoteDetails.style.display === "block") {
        closeVoteDetailsPopup();
    }
});

function normalizeFormation(item) {
    const eleves = Array.isArray(item.eleves) ? item.eleves : [];
    const votes = Array.isArray(item.votes) ? item.votes : [];

    return {
        id: Number(item.id) || 0,
        nom: typeof item.nom === "string" ? item.nom : "",
        dateDebut: item.dateDebut || "",
        dateFin: item.dateFin || "",
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

function renderMissingFormationState() {
    votesDirectory.innerHTML = `
        <div class="vote-empty-state">
            <div>
                <p class="vote-empty-state-title">Formation introuvable</p>
                <p class="vote-empty-state-note">Retourne a la page des formations pour choisir une formation valide.</p>
            </div>
        </div>
    `;
}

function renderVotes() {
    const votes = [...formation.votes].sort((voteA, voteB) => {
        const timeA = new Date(
            `${voteA.dateOuverture}T${voteA.heureOuverture || "00:00"}:00`
        ).getTime();
        const timeB = new Date(
            `${voteB.dateOuverture}T${voteB.heureOuverture || "00:00"}:00`
        ).getTime();

        return timeB - timeA;
    });

    if (votes.length === 0) {
        votesDirectory.innerHTML = `
            <div class="vote-empty-state">
                <div>
                    <p class="vote-empty-state-title">Aucun vote pour cette formation</p>
                    <p class="vote-empty-state-note">Cree d'abord un vote depuis la carte de la formation.</p>
                </div>
            </div>
        `;
        return;
    }

    votesDirectory.innerHTML = "";
    votes.forEach((vote) => {
        votesDirectory.appendChild(createVoteCard(vote));
    });
}

function createVoteCard(vote) {
    const card = document.createElement("button");
    const status = getVoteStatus(
        vote.dateOuverture,
        vote.heureOuverture,
        vote.dateFin
    );
    const totalAttendu = vote.presentes.length;
    const totalActuel = vote.reponses.length;

    card.type = "button";
    card.className = `vote-card vote-status-${status}`;
    card.innerHTML = `
        <div class="vote-card-top">
            <span class="vote-card-title">Vote ${vote.id}</span>
            <span class="vote-card-status">${getVoteStatusLabel(status)}</span>
        </div>
        <p class="vote-card-meta">Ouverture : ${formatVoteOpening(
            vote.dateOuverture,
            vote.heureOuverture
        )}</p>
        <p class="vote-card-meta">Fin : ${formatDateFR(vote.dateFin)}</p>
        <p class="vote-card-meta">Presents : ${totalAttendu}</p>
        <p class="vote-card-progress">${totalActuel} vote(s) / ${totalAttendu} attendu(s)</p>
    `;

    card.addEventListener("click", () => {
        openVoteDetailsPopup(vote);
    });

    return card;
}

function openVoteDetailsPopup(vote) {
    const status = getVoteStatus(
        vote.dateOuverture,
        vote.heureOuverture,
        vote.dateFin
    );
    const presentes = getPresentesNames(vote);
    const totalActuel = vote.reponses.length;
    const totalAttendu = vote.presentes.length;

    voteDetailsTitle.textContent = `Vote ${vote.id}`;
    voteDetailsStatus.innerHTML = `
        <span class="vote-status-chip vote-status-${status}">
            ${getVoteStatusLabel(status)}
        </span>
    `;
    voteDetailsOpening.textContent = formatVoteOpening(
        vote.dateOuverture,
        vote.heureOuverture
    );
    voteDetailsEnd.textContent = formatDateFR(vote.dateFin);
    voteDetailsParticipation.textContent = `${totalActuel} vote(s) / ${totalAttendu} attendu(s)`;

    if (presentes.length === 0) {
        votePresentList.innerHTML = `
            <div class="vote-present-item">Aucun eleve present defini pour ce vote.</div>
        `;
    } else {
        votePresentList.innerHTML = presentes
            .map((nomComplet) => {
                return `<div class="vote-present-item">${nomComplet}</div>`;
            })
            .join("");
    }

    popupVoteDetails.style.display = "block";
}

function closeVoteDetailsPopup() {
    popupVoteDetails.style.display = "none";
    voteDetailsTitle.textContent = "Details du vote";
    voteDetailsStatus.textContent = "";
    voteDetailsOpening.textContent = "";
    voteDetailsEnd.textContent = "";
    voteDetailsParticipation.textContent = "";
    votePresentList.innerHTML = "";
}

function getPresentesNames(vote) {
    return vote.presentes.map((eleveId) => {
        const eleve = formation.eleves.find(
            (item) => Number(item.id) === Number(eleveId)
        );

        if (!eleve) {
            return `Eleve #${eleveId}`;
        }

        return `${eleve.prenom} ${eleve.nom}`;
    });
}

function formatDateFR(dateString) {
    if (!dateString) {
        return "";
    }

    const parts = dateString.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatHeure(heure) {
    return heure ? heure.slice(0, 5) : "";
}

function formatVoteOpening(dateOuverture, heureOuverture) {
    const date = formatDateFR(dateOuverture);
    const heure = formatHeure(heureOuverture);

    if (!heure) {
        return date;
    }

    return `${date} a ${heure}`;
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

function getVoteStatusLabel(status) {
    if (status === "ouvert") {
        return "Ouvert";
    }

    if (status === "termine") {
        return "Termine";
    }

    return "A venir";
}
