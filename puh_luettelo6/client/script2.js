(loadPage = () => {
  fetch("http://localhost:3000/items")
    .then((res) => res.json())
    .then((data) => {
      console.log("Data received from server:", data); // Tulostetaan data
      displayUser(data);
    });
})();

const userDisplay = document.querySelector(".table");

displayUser = (data) => {
  // Tyhjennetään olemassa oleva taulukon sisältö
  userDisplay.innerHTML = "";

  // Asetetaan taulukon otsikot
  userDisplay.innerHTML = `
    <thead>
    <tr>
      <th style="text-align: center;">Id</th>
      <th style="text-align: center;">Nimi</th>
      <th style="text-align: center;">Puhelin</th>
      <th style="text-align: center;">Muokkaa</th>
      <th style="text-align: center;">Poista</th>
    </tr>
    </thead>
    <tbody></tbody>
  `;
  displayRow(data);
};

displayRow = (data) => {
  const tbody = userDisplay.querySelector("tbody");
  data.forEach((user) => {
    tbody.innerHTML += `
      <tr>
          <td style="text-align: center;">${user.id}</td>
          <td style="text-align: center;">${user.nimi}</td>
          <td style="text-align: center;">
              <span id="phone_${user.id}">${user.puhelin}</span>
              <input type="text" id="edit_phone_${user.id}" value="${user.puhelin}" style="display:none; margin-top: 5px;">
          </td>
          <td style="text-align: center;">
              <button class="edit-btn" onclick="editRow(${user.id})">Muokkaa</button>
              <button class="save-btn" onclick="saveRow(${user.id})" style="display:none;" id="save_${user.id}">Tallenna</button>
          </td>
          <td style="text-align: center;">
              <input type="button" class="delete-btn" onClick="removeRow(${user.id})" value="x"/>
          </td>
      </tr>
    `;
  });
};

removeRow = async (id) => {
  console.log(id);
  // Yksinkertainen DELETE-pyyntö fetchillä
  let polku = "http://localhost:3000/items/" + id;
  await fetch(polku, { method: "DELETE" }).then(() =>
    console.log("Poisto onnistui")
  );
  window.location.reload(); // Ladataan ikkuna uudelleen
};

/**
 * Apufunktio datan POSTaamiseen JSONina fetchillä.
 *
 * @param {Object} options
 * @param {string} options.url - URL, johon data POSTataan
 * @param {Object} options.data - Lähetettävä dataobjekti
 * @return {Object} - Vastaus, joka saatiin URL:stä, johon data POSTattiin
 */
async function postFormDataAsJson({ url, data }) {
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Lomakkeen lähetyksen tapahtumankäsittelijä.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
 *
 * @param {SubmitEvent} event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const url = form.action;

  try {
    const formData = new FormData(form);
    const plainFormData = Object.fromEntries(formData.entries());

    // Haetaan olemassa olevat kohteet seuraavan ID:n määrittämiseksi
    const response = await fetch("http://localhost:3000/items");
    const existingItems = await response.json();
    const maxId = existingItems.reduce(
      (max, item) => (item.id > max ? item.id : max),
      0
    );
    const newId = maxId + 1;

    // Luodaan dataobjekti oikeassa järjestyksessä
    const data = {
      id: newId, // Luodaan peräkkäinen ID
      nimi: plainFormData.nimi,
      puhelin: plainFormData.puhelin,
    };

    const responseData = await postFormDataAsJson({ url, data });
    await loadPage(); // Päivitetään taulukkoon

    console.log({ responseData });
  } catch (error) {
    console.error(error);
  }
}

const exampleForm = document.getElementById("puhelintieto_lomake");
exampleForm.addEventListener("submit", handleFormSubmit);

function editRow(id) {
  document.getElementById(`phone_${id}`).style.display = "none";
  document.getElementById(`edit_phone_${id}`).style.display = "inline";
  document.getElementById(`save_${id}`).style.display = "inline";
}

async function saveRow(id) {
  let newPhone = document.getElementById(`edit_phone_${id}`).value;

  // Tarkistetaan, että uusi puhelinnumero sisältää vain numeroita
  if (!/^\d{2,3}-?\d+$/.test(newPhone)) {
    alert(
      "Puhelinnumero voi sisältää vain numeroita ja mahdollisesti yhden väliviivan."
    ); // Näytetään virheilmoitus
    return;
  }

  // Haetaan olemassa oleva kohde
  let polku = "http://localhost:3000/items/" + id;
  const response = await fetch(polku);
  if (!response.ok) {
    alert("Virhe haettaessa kohdetta."); // Näytetään virheilmoitus
    return;
  }
  const existingItem = await response.json();

  // Päivitetään vain puhelinnumero
  const updatedItem = {
    id: existingItem.id,
    nimi: existingItem.nimi,
    puhelin: newPhone,
  };

  const updateResponse = await fetch(polku, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedItem),
  });

  if (!updateResponse.ok) {
    alert("Virhe päivitettäessä kohdetta."); // Näytetään virheilmoitus
    return;
  }

  window.location.reload(); // Ladataan sivu uudelleen, jotta päivitys näkyy
}
