function generateTable() {
  console.log("hello there! scoreboard");
  fetch("/scoreboard")
    .then((response) => response.json())
    .then((rows) => {
      const tbl = document.createElement("table");
      const tblBody = document.createElement("tbody");

      for (let i = 0; i < rows.length; i++) {
        const row = document.createElement("tr");

        for (let j = 0; j < 2; j++) {
          const cell = document.createElement("td");
          const cellText = document.createTextNode(
            rows[i].USERNAME + " " + rows[i].HIGHSCORE
          );
          cell.appendChild(cellText);
          row.appendChild(cell);
        }

        tblBody.appendChild(row);
      }

      tbl.appendChild(tblBody);
      document.body.appendChild(tbl);
      tbl.setAttribute("border", "2");
    })
    .catch((error) => {
      console.log(error);
    });
}

generateTable();
