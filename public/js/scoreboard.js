const database = require('../../repositories/index');

const db = database.getConnection();

function generateTable() {
    console.log('hello there! scoreboard');
    db.then(conn => {
    conn.query('SELECT USERNAME, HIGHSCORE FROM USER ORDER BY HIGHSCORE LIMIT 10')
        .then(rows => {
            

                const tbl = document.createElement("table");
                const tblBody = document.createElement("tbody");
        
                for (let i = 0; i < rows.length; i++) {
                    const row = document.createElement("tr");
        
                    for (let j = 0; j < 2; j++) {

                    const cell = document.createElement("td");
                    const cellText = document.createTextNode(rows[i].USERNAME + " " + rows[i].HIGHSCORE);
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                    }
        
                    // add the row to the end of the table body
                    tblBody.appendChild(row);
                }
        
                // put the <tbody> in the <table>
                tbl.appendChild(tblBody);
                // appends <table> into <body>
                document.body.appendChild(tbl);
                // sets the border attribute of tbl to '2'
                tbl.setAttribute("border", "2");
        
        })
        .catch(error => {
            console.log(error);
            conn.end;
        })
    })
    .catch(error => {
    console.log(error);
    conn.end;
});}