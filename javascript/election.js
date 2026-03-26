const params = new URLSearchParams(window.location.search);
const formationId =
    params.get("formationId") || params.get("id") || params.get("formation");
const voteId = params.get("voteId") || params.get("vote");
const eleveId = params.get("eleveId") || params.get("eleve");

const electionKicker = document.getElementById("electionKicker");
const electionTitle = document.getElementById("electionTitle");
const electionSubtitle = document.getElementById("electionSubtitle");
const electionStatusNote = document.getElementById("electionStatusNote");
const electionDirectory = document.getElementById("election-directory");
const electionVoteState = document.getElementById("electionVoteState");
const electionFeedback = document.getElementById("electionFeedback");
const submitElectionVote = document.getElementById("submitElectionVote");

const formations = (JSON.parse(localStorage.getItem("formations")) || []).map(
    normalizeFormation
);
const formation = formations.find(
    (item) => String(item.id) === String(formationId)
);
const vote = formation
    ? formation.votes.find((item) => String(item.id) === String(voteId))
    : null;

let selectedCandidateIds = [];
let lockedVote = false;

if (!formation || !vote) {
    renderUnavailableState(
        "Vote introuvable",
        "Le lien de vote est invalide ou le vote n'existe plus."
    );
} else {
    const status = getVoteStatus(
        vote.dateOuverture,
        vote.heureOuverture,
        vote.dateFin
    );
    const presentedStudents = getPresentedStudents(formation, vote);
    const existingResponse = getExistingResponse(vote, eleveId);

    localStorage.setItem("formations", JSON.stringify(formations));
    renderElectionHeader(formation, vote, status, presentedStudents.length);

    if (presentedStudents.length < 2) {
        renderUnavailableState(
            "Vote indisponible",
            "Il faut au moins 2 eleves presentes pour permettre le vote."
        );
    } else if (status !== "ouvert") {
        renderCandidateCards(presentedStudents, true);
        lockVoteState();
        setFeedback(
            status === "termine"
                ? "Ce vote est termine et n'est plus accessible."
                : "Ce vote n'est pas encore ouvert.",
            status === "termine" ? "error" : "info"
        );
    } else if (existingResponse) {
        renderCandidateCards(presentedStudents, true, existingResponse.choix || []);
        lockVoteState();
        setFeedback(
            `Ton vote a deja ete enregistre : ${formatChoiceNames(
                existingResponse.choix || [],
                formation
            )}.`,
            "success"
        );
    } else {
        renderCandidateCards(presentedStudents, false);
        updateVoteState();
    }
}

submitElectionVote.addEventListener("click", () => {
    if (!formation || !vote || lockedVote) {
        return;
    }

    if (selectedCandidateIds.length !== 2) {
        setFeedback("Tu dois selectionner exactement 2 personnes.", "error");
        return;
    }

    const existingResponse = getExistingResponse(vote, eleveId);
    if (existingResponse) {
        lockVoteState();
        setFeedback("Ton vote a deja ete enregistre.", "success");
        return;
    }

    vote.reponses = Array.isArray(vote.reponses) ? vote.reponses : [];
    vote.reponses.push({
        id: getNextResponseId(vote),
        eleveId: eleveId ? String(eleveId) : "",
        choix: [...selectedCandidateIds],
        dateEnvoi: new Date().toISOString()
    });

    localStorage.setItem("formations", JSON.stringify(formations));
    renderCandidateCards(
        getPresentedStudents(formation, vote),
        true,
        selectedCandidateIds
    );
    lockVoteState();
    setFeedback(
        `Vote enregistre avec succes pour ${formatChoiceNames(
            selectedCandidateIds,
            formation
        )}.`,
        "success"
    );
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
        votes: votes.map((currentVote, index) => normalizeVote(currentVote, index))
    };
}

function normalizeVote(currentVote, index) {
    const presentes = Array.isArray(currentVote.presentes)
        ? currentVote.presentes
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value))
        : [];

    return {
        id: Number(currentVote.id) || index + 1,
        dateOuverture: currentVote.dateOuverture || "",
        heureOuverture: currentVote.heureOuverture || "00:00",
        dateFin: currentVote.dateFin || currentVote.dateOuverture || "",
        presentes: presentes,
        reponses: Array.isArray(currentVote.reponses) ? currentVote.reponses : [],
        creeLe: currentVote.creeLe || ""
    };
}

function renderElectionHeader(currentFormation, currentVote, status, totalPresented) {
    electionKicker.textContent = `Formation ${currentFormation.nom}`;
    electionTitle.textContent = `Election du delegue - Vote ${currentVote.id}`;
    electionSubtitle.textContent = `Ouverture le ${formatVoteOpening(
        currentVote.dateOuverture,
        currentVote.heureOuverture
    )} • fin le ${formatDateFR(currentVote.dateFin)} • ${totalPresented} presentes`;

    electionStatusNote.className = `election-status-note ${getElectionStatusClass(
        status
    )}`;
    electionStatusNote.textContent = getElectionStatusMessage(status);
}

function renderUnavailableState(title, message) {
    electionKicker.textContent = "Election du delegue";
    electionTitle.textContent = title;
    electionSubtitle.textContent = "";
    electionStatusNote.textContent = message;
    electionDirectory.innerHTML = `
        <div class="vote-empty-state">
            <div>
                <p class="vote-empty-state-title">${title}</p>
                <p class="vote-empty-state-note">${message}</p>
            </div>
        </div>
    `;
    lockVoteState();
}

function renderCandidateCards(candidates, disabled, preselectedIds = []) {
    selectedCandidateIds = [...preselectedIds];
    electionDirectory.innerHTML = "";

    candidates.forEach((eleve) => {
        const card = document.createElement("button");
        const isSelected = selectedCandidateIds.includes(Number(eleve.id));

        card.type = "button";
        card.className = `election-candidate-card${isSelected ? " is-selected" : ""}`;
        card.disabled = disabled;
        card.innerHTML = `
            <span class="election-candidate-badge">${isSelected ? "OK" : "&nbsp;"}</span>
            <div class="election-candidate-frame" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                    <path d="M12 12a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"></path>
                    <path d="M6.5 19a5.5 5.5 0 0 1 11 0"></path>
                    <path d="M4 4h16v16H4z"></path>
                </svg>
            </div>
            <div class="election-candidate-name">
                <span class="election-candidate-prenom">${eleve.prenom}</span>
                <span class="election-candidate-nom">${eleve.nom}</span>
            </div>
            <p class="election-candidate-meta">${eleve.email}</p>
            <span class="election-candidate-action">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 4h11l5 5v11H4z"></path>
                    <path d="M15 4v5h5"></path>
                    <path d="M8 14h8"></path>
                    <path d="M8 18h5"></path>
                    <path d="m8.5 10 1.5 1.5 3-3"></path>
                </svg>
                <span>${isSelected ? "Selectionne" : "Choisir"}</span>
            </span>
        `;

        card.addEventListener("click", () => {
            toggleCandidate(Number(eleve.id));
        });

        electionDirectory.appendChild(card);
    });

    updateVoteState();
}

function toggleCandidate(candidateId) {
    if (lockedVote) {
        return;
    }

    if (selectedCandidateIds.includes(candidateId)) {
        selectedCandidateIds = selectedCandidateIds.filter((id) => id !== candidateId);
        renderCandidateCards(getPresentedStudents(formation, vote), false, selectedCandidateIds);
        setFeedback("Choix mis a jour.", "info");
        return;
    }

    if (selectedCandidateIds.length >= 2) {
        setFeedback("Tu dois garder exactement 2 personnes differentes.", "error");
        return;
    }

    selectedCandidateIds = [...selectedCandidateIds, candidateId];
    renderCandidateCards(getPresentedStudents(formation, vote), false, selectedCandidateIds);
    setFeedback(
        selectedCandidateIds.length === 2
            ? "Tes 2 choix sont prets. Tu peux maintenant voter."
            : "Premier choix enregistre. Choisis encore une personne.",
        "info"
    );
}

function updateVoteState() {
    electionVoteState.textContent = `${selectedCandidateIds.length} choix sur 2`;
    submitElectionVote.disabled = lockedVote || selectedCandidateIds.length !== 2;
}

function lockVoteState() {
    lockedVote = true;
    submitElectionVote.disabled = true;
    updateVoteState();
}

function setFeedback(message, type) {
    electionFeedback.textContent = message;
    electionFeedback.className = `election-feedback is-${type}`;
}

function getPresentedStudents(currentFormation, currentVote) {
    const allStudents = Array.isArray(currentFormation.eleves)
        ? currentFormation.eleves : [];

    const presentIds =
        Array.isArray(currentVote.presentes) && currentVote.presentes.length > 0
            ? currentVote.presentes
            : allStudents.map((eleve) => Number(eleve.id));

    return presentIds
        .map((eleveId) => {
            return allStudents.find((eleve) => Number(eleve.id) === Number(eleveId));
        })
        .filter(Boolean); // .filter(Boolean) permet d'écarter les json vides
}

function getExistingResponse(currentVote, currentEleveId) {
    if (!currentEleveId) {
        return null;
    }

    return (currentVote.reponses || []).find(
        (response) => String(response.eleveId) === String(currentEleveId)
    );
}

function getNextResponseId(currentVote) {
    const responses = Array.isArray(currentVote.reponses) ? currentVote.reponses : [];

    if (responses.length === 0) {
        return 1;
    }

    return (
        Math.max(...responses.map((response) => Number(response.id) || 0)) + 1
    );
}

function formatChoiceNames(choiceIds, currentFormation) {
    return choiceIds
        .map((choiceId) => {
            const eleve = (currentFormation.eleves || []).find(
                (item) => Number(item.id) === Number(choiceId)
            );

            if (!eleve) {
                return `Eleve #${choiceId}`;
            }

            return `${eleve.prenom} ${eleve.nom}`;
        })
        .join(" et ");
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

function getElectionStatusClass(status) {
    if (status === "ouvert") {
        return "election-status-open";
    }

    if (status === "termine") {
        return "election-status-ended";
    }

    return "election-status-upcoming";
}

function getElectionStatusMessage(status) {
    if (status === "ouvert") {
        return "Le vote est actuellement ouvert.";
    }

    if (status === "termine") {
        return "Le vote est termine et n'est plus accessible.";
    }

    return "Le vote n'est pas encore ouvert.";
}
