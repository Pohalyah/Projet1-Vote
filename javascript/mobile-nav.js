(function () {
    const menuToggle = document.querySelector(".topbar-menu-toggle");
    const mobileNav = document.getElementById("mobileNav");

    if (!menuToggle || !mobileNav) {
        return;
    }

    function closeMenu() {
        mobileNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
    }

    function toggleMenu(event) {
        event.preventDefault();
        event.stopPropagation();

        const isOpen = mobileNav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    }

    menuToggle.addEventListener("click", toggleMenu);

    mobileNav.addEventListener("click", function (event) {
        if (event.target.closest(".mobile-nav-link")) {
            closeMenu();
        }
    });

    document.addEventListener("click", function (event) {
        if (!mobileNav.classList.contains("is-open")) {
            return;
        }

        if (mobileNav.contains(event.target) || menuToggle.contains(event.target)) {
            return;
        }

        closeMenu();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 760) {
            closeMenu();
        }
    });
})();
