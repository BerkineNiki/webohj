(() => {
  fetch("http://localhost:3000/items")
    .then((res) => res.json())
    .then((data) => {
      displayUser(data);
    });
})();

const userDisplay = document.querySelector(".table");

displayUser = (data) => {
  // Clear existing table content
  userDisplay.innerHTML = "";

  // Set table headers
  userDisplay.innerHTML = `
    <thead>
    <tr>
      <th>Id</th>
      <th>Nimi</th>
      <th>Puhelin</th>
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
        <td>${user.id}</td>
        <td>${user.nimi}</td>
        <td>${user.puhelin}</td>
      </tr>
    `;
  });
};
