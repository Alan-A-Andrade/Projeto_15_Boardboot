import gameSchema from "../schemas/gameSchema.js";
import connection from "../db.js";


export default async function validateAddGameMiddleware(req, res, next) {

  const validation = gameSchema.validate(req.body);

  if (validation.error) {
    res.sendStatus(400)
    return
  };

  const { name, stockTotal, pricePerDay } = req.body

  if (parseInt(stockTotal) <= 0 || parseInt(pricePerDay) <= 0) {
    res.sendStatus(400)
    return
  }

  try {
    const check = await connection.query(`
  SELECT * 
  FROM games
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