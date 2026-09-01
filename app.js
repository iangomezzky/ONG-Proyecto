document.addEventListener("DOMContentLoaded", () => {

    // ======================================================
    // MENÚ RESPONSIVE
    // ======================================================

    const menuButton = document.querySelector(".menu-toggle");
    const menu = document.querySelector("#main-menu");

    if (menuButton && menu) {

        menuButton.addEventListener("click", () => {

            const open =
                menuButton.getAttribute("aria-expanded") === "true";

            menuButton.setAttribute(
                "aria-expanded",
                String(!open)
            );

            menuButton.setAttribute(
                "aria-label",
                open ? "Abrir menú" : "Cerrar menú"
            );

            menu.classList.toggle("is-open", !open);
        });


        menu.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuButton.setAttribute(
                    "aria-label",
                    "Abrir menú"
                );

                menu.classList.remove("is-open");

            });

        });

    }


    // ======================================================
    // SALIDA RÁPIDA
    // ======================================================

    document
        .querySelectorAll("[data-safe-exit]")
        .forEach((button) => {

            button.addEventListener("click", () => {

                window.location.replace(
                    "https://www.google.com"
                );

            });

        });


    // ======================================================
    // MOSTRAR / OCULTAR CONTRASEÑA
    // ======================================================

    document
        .querySelectorAll("[data-password-toggle]")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const contenedor =
                    button.parentElement;

                const input =
                    contenedor.querySelector("input");

                if (!input) {
                    return;
                }

                const estaOculta =
                    input.type === "password";

                input.type =
                    estaOculta
                        ? "text"
                        : "password";


                button.textContent =
                    estaOculta
                        ? "Ocultar"
                        : "Ver";


                button.setAttribute(
                    "aria-label",
                    estaOculta
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                );

            });

        });


    // ======================================================
    // FORMULARIO DE ORIENTACIÓN
    // ======================================================

    const orientationForm =
        document.querySelector("#orientation-form");

    if (orientationForm) {

        orientationForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const status =
                    document.querySelector(
                        "#form-status"
                    );

                if (status) {

                    status.textContent =
                        "Esta es una demostración visual. Conectá este formulario a tu backend antes de utilizarlo con datos reales.";

                    status.classList.add(
                        "is-visible"
                    );

                }

            }
        );

    }


    // ======================================================
    // LOGIN DEMO
    // ======================================================

    document
        .querySelectorAll("[data-demo-form]")
        .forEach((form) => {

            form.addEventListener(
                "submit",
                (event) => {

                    event.preventDefault();

                    const status =
                        form.querySelector(
                            "[data-demo-status]"
                        );

                    if (status) {

                        status.textContent =
                            "Demo visual: conectá esta pantalla al sistema de autenticación para habilitar el ingreso.";

                        status.classList.add(
                            "is-visible"
                        );

                    }

                }
            );

        });


    // ======================================================
    // ANIMACIONES AL HACER SCROLL
    // ======================================================

    const revealItems =
        document.querySelectorAll(".reveal");


    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(

                (entries) => {

                    entries.forEach((entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "is-revealed"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },

                {
                    threshold: 0.08,
                    rootMargin:
                        "0px 0px -20px 0px"
                }

            );


        revealItems.forEach(
            (item) => {

                observer.observe(item);

            }
        );

    } else {

        revealItems.forEach(
            (item) => {

                item.classList.add(
                    "is-revealed"
                );

            }
        );

    }


    // ======================================================
    // SEGURIDAD EXTRA
    //
    // Si por algún motivo IntersectionObserver falla,
    // hacemos visibles los elementos igual.
    // ======================================================

    setTimeout(() => {

        document
            .querySelectorAll(".reveal")
            .forEach((item) => {

                if (
                    !item.classList.contains(
                        "is-revealed"
                    )
                ) {

                    item.classList.add(
                        "is-revealed"
                    );

                }

            });

    }, 800);


    // ======================================================
    // HEADER CON SCROLL
    // ======================================================

    const header =
        document.querySelector(".site-header");

    if (header) {

        const actualizarHeader = () => {

            header.classList.toggle(
                "header-scrolled",
                window.scrollY > 15
            );

        };

        actualizarHeader();

        window.addEventListener(
            "scroll",
            actualizarHeader,
            { passive: true }
        );

    }

});