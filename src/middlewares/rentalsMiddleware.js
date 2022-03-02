import connection from "../db.js";
import rentalSchema from "../schemas/rentalsSchema.js";

export default async function validateRental(req, res, next) {

  const validation = rentalSchema.validate(req.body);

  if (validation.error) {
    res.sendStatus(400)
    return
  };

  const { customerId, gameId, daysRented } = req.body

  if (parseInt(daysRented) <= 0) {
    res.sendStatus(400)
    return
  }

  try {
    const checkGame = await connection.query(`
  SELECT * 
  FROM games
  WHERE id = $1
  `, [gameId])

    if (checkGame.rowCount === 0) {
      console.log("checkgame")
      return res.sendStatus(400)
    }

    const checkCustomer = await connection.query(`
    SELECT * 
    FROM customers
    WHERE id = $1
    `, [customerId])

    if (checkCustomer.rowCount === 0) {
      console.log("checkcustumer")

      return res.sendStatus(400)
    }

    next();
  } catch {
    res.sendStatus(500)
  }

}