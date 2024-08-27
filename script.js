document.addEventListener('DOMContentLoaded', () => {
    Papa.parse('plan.csv', {
        download: true,
        header: true,
        complete: function(results) {
            processData(results.data);
        }
    });
});

function githubPage() {
    window.location.href = "github.com/NathParty/Nathparty.github.io"
}

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
        if (/^M\./.test(sectionName)) {
            sectionElement.innerHTML = `<h2>Partie "<i>M&eacute;tairie${sectionName.slice(2)}</i>"</h2>`;
        } else {
            sectionElement.innerHTML = `<h2>Partie "<i>${sectionName}</i>"</h2>`;
        }

        for (const [houseName, rooms] of Object.entries(houses)) {
            const houseElement = document.createElement('div');

			const nbRooms = Object.keys(rooms).length

            houseElement.className = 'house';
            if (houseName == "Camping") {
                houseElement.innerHTML = `<h3>R&eacute;partition en bungalows</h3>`;
            } else {
                houseElement.innerHTML = `<h3 class="housename">Maison "${houseName}"</h3>`;
            }

            const carousel = document.createElement('div');
			carousel.style.display = "flex";

			if (nbRooms > 2) {
				carousel.className = 'owl-carousel';
			} else {
				carousel.className = 'non-owl';
				carousel.style.marginLeft = "10px";
				carousel.style.marginRight = "10px";
			}
            carousel.id = houseName;

            for (const [roomNumber, guests] of Object.entries(rooms)) {
                const roomElement = document.createElement('div');
                roomElement.className = 'room';

				if (nbRooms < 3) {
					roomElement.style.margin = "10px";
				}

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
                        const carpetElement = document.createElement('div');
                        carpetElement.className = 'bed-nocarpet';

                        const bedElement = createBedElement(guest, 'double');
                        carpetElement.appendChild(bedElement);


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

                        bedsElement.appendChild(carpetElement);
                    } else {
                        const carpetElement = document.createElement('div');
                        carpetElement.className = 'bed-nocarpet';

                        const bedElement = createBedElement(guest, 'double');
                        carpetElement.appendChild(bedElement);

                        bedsElement.appendChild(carpetElement);
                    }

                    index++;
                }

				if (nbRooms < 3) {
					roomElement.style.width = "50%";
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
}
