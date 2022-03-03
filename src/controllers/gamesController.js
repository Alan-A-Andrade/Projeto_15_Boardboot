import connection from "../db.js";

export async function getGames(req, res) {

  const { name, limit, offset } = req.query

  try {

    if (!name) {

      const games = await connection.query(`
        SELECT * 
        FROM games
        ${offset ? `OFFSET ${parseInt(offset)}` : ``}
        ${limit ? `LIMIT ${parseInt(limit)}` : ``}
        `)
      res.send(games.rows);
    }

    else {
      const games = await connection.query(`
        SELECT * 
        FROM games 
        WHERE LOWER(name) 
        LIKE LOWER($1)
        ${offset ? `OFFSET ${parseInt(offset)}` : ``}
        ${limit ? `LIMIT ${parseInt(limit)}` : ``}
        `, [`${name}%`])

      res.send(games.rows);
    }

  } catch {

    res.sendStatus(500)

  }

}



export async function postGames(req, res) {

  const { name, image, stockTotal, categoryId, pricePerDay, } = req.body

  try {

    await connection.query(`
    INSERT INTO 
    games (name, image, "stockTotal", "categoryId", "pricePerDay") 
    VALUES ($1, $2, $3 ,$4 ,$5)`, [name, image, parseInt(stockTotal), parseInt(categoryId), parseInt(pricePerDay)])

    res.sendStatus(201)

  } catch (error) {

    console.log(error)
    res.sendStatus(500)

  }

}