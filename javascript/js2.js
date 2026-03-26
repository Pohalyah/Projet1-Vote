const params = new URLSearchParams(window.location.search);
const idFormation = params.get("id");

const formations = JSON.parse(localStorage.getItem("formations")) || [];
const formation = formations.find(f => String(f.id) === String(idFormation));

const titre = document.getElementById("titreFormation");
const titreLabel = document.getElementById("titreFormationLabel");
const eleveDirectory = document.getElementById("eleve-directory");

const popupEleveCreate = document.getElementById("popupEleveCreate");
const closePopupEleve = document.getElementById("closePopupEleve");
const formEleveCreate = document.getElementById("formEleveCreate");

const formEleveNom = document.getElementById("formEleveNom");
const formElevePrenom = document.getElementById("formElevePrenom");
const formEleveEmail = document.getElementById("formEleveEmail");

let editEleveId = null;
const buttonCreateEleve = document.getElementById("buttonCreateEleve");

if (!formation) {
    if (titreLabel) {
        titreLabel.hidden = true;
    }

    titre.textContent = "Formation introuvable";
} else {
    formation.eleves = Array.isArray(formation.eleves) ? formation.eleves : [];
    formation.votes = Array.isArray(formation.votes) ? formation.votes : [];

    localStorage.setItem("formations", JSON.stringify(formations));

    if (titreLabel) {
        titreLabel.hidden = false;
    }

    titre.textContent = formation.nom;
    renderEleves();
}

closePopupEleve.addEventListener("click", () => {
    closeElevePopup();
});

popupEleveCreate.addEventListener("click", (e) => {
    if (e.target !== popupEleveCreate) {
        return;
    }

    closeElevePopup();
});

document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || popupEleveCreate.style.display !== "block") {
        return;
    }

    closeElevePopup();
});

formEleveCreate.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!formation) return;

    const nom = formEleveNom.value.trim();
    const prenom = formElevePrenom.value.trim();
    const email = formEleveEmail.value.trim().toLowerCase();

    if (emailDejaUtilise(email)) {
        alert("Cet email est déjà utilisé pour un élève de cette formation.");
        formEleveEmail.focus();
        return;
    }

    if (editEleveId === null) {
        const nouvelEleve = {
            id: getNextEleveId(),
            nom: nom,
            prenom: prenom,
            email: email
        };

        formation.eleves.push(nouvelEleve);
    } else {
        const eleveAModifier = formation.eleves.find(
            eleve => String(eleve.id) === String(editEleveId)
        );

        if (eleveAModifier) {
            eleveAModifier.nom = nom;
            eleveAModifier.prenom = prenom;
            eleveAModifier.email = email;
        }
    }

    localStorage.setItem("formations", JSON.stringify(formations));

    closeElevePopup();
    renderEleves();
});


function renderEleves() {
    eleveDirectory.innerHTML = "";

    createAddEleveCard();

    const eleves = formation.eleves || [];
    eleves.forEach(createEleveCard);
}

function createAddEleveCard() {
    const card = document.createElement("div");
    card.className = "add-card";

    card.innerHTML = `
        <p class="card-name">Ajouter un élève</p>
        <div class="add-icon">+</div>
    `;

    card.addEventListener("click", () => {
        editEleveId = null;
        buttonCreateEleve.textContent = "Créer";
        popupEleveCreate.style.display = "block";
        formEleveCreate.reset();
        formEleveNom.focus();
    });


    eleveDirectory.appendChild(card);

}

function createEleveCard(eleve) {
    const card = document.createElement("div");
    card.className = "eleve-card";

    card.innerHTML = `
        <div class="eleve-card-actions">
            <button class="btn-edit-eleve" type="button" aria-label="Modifier l'élève">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 21h4l11-11-4-4L3 17v4Z"></path>
                    <path d="M14 6l4 4"></path>
                </svg>
            </button>
            <button class="btn-delete-eleve" type="button" aria-label="Supprimer l'élève">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12"></path>
                    <path d="M18 6L6 18"></path>
                </svg>
            </button>
        </div>
        <p class="card-name">${eleve.nom}</p>
        <p class="card-firstname">${eleve.prenom}</p>
        <p class="card-subtitle">${eleve.email}</p>
    `;

    const buttonEditEleve = card.querySelector(".btn-edit-eleve");
    const buttonDeleteEleve = card.querySelector(".btn-delete-eleve");

    buttonEditEleve.addEventListener("click", () => {
        editEleveId = eleve.id;
        buttonCreateEleve.textContent = "Modifier";

        formEleveNom.value = eleve.nom;
        formElevePrenom.value = eleve.prenom;
        formEleveEmail.value = eleve.email;

        popupEleveCreate.style.display = "block";
        formEleveNom.focus();
    });

    buttonDeleteEleve.addEventListener("click", () => {
        const confirmation = confirm(`Voulez-vous vraiment supprimer ${eleve.nom} ${eleve.prenom} ?`);

        if (!confirmation) {
            return;
        }

        formation.eleves = formation.eleves.filter(item => item.id !== eleve.id);
        localStorage.setItem("formations", JSON.stringify(formations));
        renderEleves();
    });

    eleveDirectory.appendChild(card);
}

function getNextEleveId() {
    const eleves = formation.eleves || [];

    if (eleves.length === 0) {
        return 1;
    }

    const maxId = Math.max(...eleves.map(eleve => Number(eleve.id)));
    return maxId + 1;
}

function closeElevePopup() {
    popupEleveCreate.style.display = "none";
    formEleveCreate.reset();
    editEleveId = null;
    buttonCreateEleve.textContent = "Créer";
}

function emailDejaUtilise(email) {
    const emailNormalise = email.trim().toLowerCase();

    return formation.eleves.some(eleve =>
        eleve.email.trim().toLowerCase() === emailNormalise &&
        String(eleve.id) !== String(editEleveId)
    );
}

