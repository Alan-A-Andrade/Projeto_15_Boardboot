import connection from "../db.js";

export async function getCategories(req, res) {

  const { limit, offset, order, desc } = req.query

  let orderTreated = false

  if (order) {

    try {
      const tableName = await connection.query(`
    SELECT *
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME='categories'
    `)

      orderTreated = (tableName.rows.map(el => { return el.column_name }).includes(order))
    } catch { res.sendStatus(500) }
  }


  try {

    const categories = await connection.query(`
    SELECT * 
    FROM categories
    ${orderTreated ? `ORDER BY "${order}" ${desc ? 'DESC' : 'ASC'}` : ""}
    ${offset ? `OFFSET ${parseInt(offset)}` : ``}
    ${limit ? `LIMIT ${parseInt(limit)}` : ``}
    `)

    res.send(categories.rows);

  } catch {
    res.sendStatus(500)
  }
}

export async function postCategories(req, res) {

  const { name } = req.body

  try {

    await connection.query(`
    INSERT INTO 
    categories (name) 
    VALUES ($1)`, [name])

    res.sendStatus(201)

  } catch {

    res.sendStatus(500)

  }

}