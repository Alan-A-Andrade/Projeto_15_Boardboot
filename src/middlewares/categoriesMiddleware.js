import connection from "../db.js";

export async function validateNewCategory(req, res, next) {

  const { name } = req.body

  if (!name) {

    return res.sendStatus(400)
  }

  try {
    const check = await connection.query(`
  SELECT * 
  FROM categories
  WHERE name = $1
  `, [name])

    if (check.rowCount !== 0) {
      return res.sendStatus(409)
    }

    next();
  } catch {
    res.sendStatus(500)
  }
}