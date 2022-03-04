import connection from "../db.js";

export async function getGames(req, res) {

  const { name, limit, order, offset, desc } = req.query
  let orderTreated = false

  if (order) {

    try {
      const tableName = await connection.query(`
    select *
    from INFORMATION_SCHEMA.COLUMNS
    where TABLE_NAME='games'`)

      orderTreated = (tableName.rows.map(el => { return el.column_name }).includes(order))
    } catch { res.sendStatus(500) }
  }

  try {

    if (!name) {

      const games = await connection.query(`
        SELECT * 
        FROM games
        ${offset ? `OFFSET ${parseInt(offset)}` : ""}
        ${limit ? `LIMIT ${parseInt(limit)}` : ""}
        ${orderTreated ? `ORDER BY "${order}" ${desc ? 'DESC' : 'ASC'}` : ""}
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
        ${orderTreated ? `ORDER BY "${order}" ${desc ? 'DESC' : 'ASC'}` : ""}
        `, [`${name}%`])

      res.send(games.rows);
    }

  } catch (error) {
    console.log(error)
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