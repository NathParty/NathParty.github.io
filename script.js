document.addEventListener('DOMContentLoaded', () => {
    Papa.parse('plan.csv', {
        download: true,
        header: true,
        complete: function(results) {
            processData(results.data);
        }
    });
});

function processData(data) {
    const sections = {
        "M. Basse": {},
        "M. Haute": {},
        "Camping": {}
    };

    data.forEach(guest => {
        if (!sections[guest.Section]) return;

        if (!sections[guest.Section][guest.Lieu]) {
            sections[guest.Section][guest.Lieu] = {};
        }

        if (!sections[guest.Section][guest.Lieu][guest.Chambre]) {
            sections[guest.Section][guest.Lieu][guest.Chambre] = [];
        }

        sections[guest.Section][guest.Lieu][guest.Chambre].push(guest);
    });

    renderSections(sections);
}

// ... (previous JavaScript remains the same) ...

function createBedElement(guest, bedType = 'single') {
    const bedElement = document.createElement('div');
    bedElement.className = `bed ${bedType}`;

    const nameElement = document.createElement('span');
    nameElement.className = `bed-name ${guest.Cat.toLowerCase()}`;

    if (guest.Nom !== "-") {
        nameElement.textContent = guest.Nom;
    }

    bedElement.appendChild(nameElement);

    const bedTypeElement = document.createElement('span');
    bedTypeElement.className = 'bed-type';
    bedTypeElement.textContent = guest.Lit;
    bedElement.appendChild(bedTypeElement);

    return bedElement;
}

function renderSections(sections) {
    const container = document.getElementById('sections');

    for (const [sectionName, houses] of Object.entries(sections)) {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'section';
        sectionElement.innerHTML = `<h2>Partie ${sectionName}</h2>`;

        for (const [houseName, rooms] of Object.entries(houses)) {
            const houseElement = document.createElement('div');
            houseElement.className = 'house';
            if (houseName == "Camping") {
                houseElement.innerHTML = `<h3>R&eacute;partition en bungalows</h3>`;
            } else {
                houseElement.innerHTML = `<h3 class="housename">Maison "${houseName}"</h3>`;
            }

            const carousel = document.createElement('div');
            carousel.className = 'owl-carousel';
            carousel.id = houseName;

            for (const [roomNumber, guests] of Object.entries(rooms)) {
                const roomElement = document.createElement('div');
                roomElement.className = 'room';
                if (/^\d$/.test(roomNumber)) {
                    roomElement.innerHTML = `<h4>Chambre "${roomNumber}"</h4>`;
                } else {
                    roomElement.innerHTML = `<h4>${roomNumber}</h4>`;
                }

                const bedsElement = document.createElement('div');
                bedsElement.className = 'beds';

                let index = 0;
                while (index < guests.length) {
                    const guest = guests[index];
                    const nextGuest = index + 1 < guests.length ? guests[index + 1] : null;

                    if (guest.Lit === "Double lits-simples") {
                        const carpetElement = document.createElement('div');
                        carpetElement.className = 'bed-carpet';

                        const bed1 = createBedElement(guest);
                        carpetElement.appendChild(bed1);

                        if (nextGuest && nextGuest.Lit === "Double lits-simples") {
                            const bed2 = createBedElement(nextGuest);
                            carpetElement.appendChild(bed2);

                            if (guest.Cat === "Couple" && nextGuest.Cat === "Couple") {
                                const heartElement = document.createElement('span');
                                heartElement.className = 'couple-heart';
                                heartElement.textContent = '❤';
                                carpetElement.appendChild(heartElement);
                            }

                            index++; // Skip the next guest as we've already included them
                        }

                        bedsElement.appendChild(carpetElement);
                    } else if (guest.Lit === "Lit double" || guest.Lit === "Canapé-lit") {
                        const bedElement = createBedElement(guest, 'double');

                        if (nextGuest && nextGuest.Lit === guest.Lit) {
                            if (guest.Nom !== "-" && nextGuest.Nom !== "-") {
                                bedElement.querySelector('.bed-name').textContent = `${guest.Nom} & ${nextGuest.Nom}`;
                            } else if (guest.Nom !== "-") {
                                bedElement.querySelector('.bed-name').textContent = guest.Nom;
                            } else if (nextGuest.Nom !== "-") {
                                bedElement.querySelector('.bed-name').textContent = nextGuest.Nom;
                            }

                            if (guest.Cat === "Couple" && nextGuest.Cat === "Couple") {
                                bedElement.classList.add('couple');
                                const heartElement = document.createElement('span');
                                heartElement.className = 'couple-heart';
                                heartElement.textContent = '❤';
                                bedElement.appendChild(heartElement);
                            }

                            index++; // Skip the next guest as we've already included them
                        }

                        bedsElement.appendChild(bedElement);
                    } else {
                        const bedElement = createBedElement(guest);
                        bedsElement.appendChild(bedElement);
                    }

                    index++;
                }

                roomElement.appendChild(bedsElement);
                carousel.appendChild(roomElement);
            }

            houseElement.appendChild(carousel);
            sectionElement.appendChild(houseElement);
        }

        container.appendChild(sectionElement);
    }

    let owl = $('.owl-carousel');
    owl.owlCarousel({
        loop: false,
        margin: 20,
        nav: true,
        stagePadding: 20,
        autoplay: true,
        autoplayTimeout: 2000,
        autoplayHoverPause: true,
        loop: true,
        responsive: {
            0: {
                items: 1
            },
            200: {
                items: 2
            },
        }
    });
    // Add mousewheel functionality
    // document.querySelectorAll('.owl-carousel').forEach(carousel => {
    //     let wheelTimeout;
    //     let length = 0;
    //     const maxLen = 100;

    //     carousel.addEventListener('wheel', function(e) {
    //         const owlCarousel = $(this).data('owl.carousel');
    //         const isAtBeginning = owlCarousel.current() === 0;
    //         const isAtEnd = owlCarousel.current() === owlCarousel.maximum();

    //         // If scrolling right at the end or left at the beginning, allow default page scroll
    //         if ((e.deltaY > 0 && isAtEnd) || (e.deltaY < 0 && isAtBeginning)) {
    //             return; // Allow default page scrolling
    //         }

    //         e.preventDefault();

    //         clearTimeout(wheelTimeout);

    //         wheelTimeout = setTimeout(() => {
    //             if (e.deltaY > 0 && length > maxLen) {
    //                 owlCarousel.next();
    //                 length = 0;
    //             } else if (length < -maxLen) {
    //                 owlCarousel.prev();
    //                 length = 0;
    //             } else {
    //                 length += e.deltaY;
    //             }
    //         }, 0); // Adjust this value to control the scrolling speed
    //     }, { passive: false });
    // });
}

function owlize(elt) {
    // Add touch swipe functionality
    elt.on('mousewheel', '.owl-stage', function (e) {
        if (e.deltaY>0) {
            owl.trigger('next.owl');
        } else {
            owl.trigger('prev.owl');
        }
        e.preventDefault();
    });
}
