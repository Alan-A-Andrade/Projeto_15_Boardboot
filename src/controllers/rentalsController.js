import connection from "../db.js";
import dayjs from "dayjs";

export async function postRentals(req, res) {

  const { customerId, gameId, daysRented } = req.body

  const rentDate = dayjs().format('YYYY-MM-DD')

  const pricePerDay = await connection.query(`
  SELECT games."pricePerDay"
  FROM games
  WHERE id = $1
  `, [gameId])

  try {

    await connection.query(`
    INSERT INTO 
    rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") 
    VALUES ($1, $2, $3 ,$4, $5, $6, $7)`,
      [customerId,
        gameId,
        rentDate,
        daysRented,
        null,
        pricePerDay.rows[0].pricePerDay * daysRented,
        null,
      ])

    res.sendStatus(201)

  } catch (error) {

    console.log(error)
    res.sendStatus(500)

  }

}

export async function getRentals(req, res) {

  const rentals = await connection.query(`
  SELECT rentals.*, 
  customers.id as "customer_Id", 
  customers.name as "customer_Name",
  games.id as "game_Id",
  games.name as "game_Name",
  categories.name as "game_CategoryName",
  categories.id as "game_CategoryId"
  FROM rentals
  JOIN customers ON
  customers.id=rentals."customerId"
  JOIN games ON
  games.id=rentals."gameId"
  JOIN categories ON
  categories.id=games."categoryId"
  `)

  const rentalsFormat = rentals.rows.map((el) => {
    const entry = {
      ...el,
      customer: {
        id: el.customer_Id,
        name: el.customer_Name
      },
      game: {
        id: el.game_Id,
        name: el.game_Name,
        categoryId: el.game_CategoryId,
        categoryName: el.game_CategoryName
      }
    }

    delete entry.customer_Id
    delete entry.customer_Name
    delete entry.game_CategoryId
    delete entry.game_CategoryName
    delete entry.game_Id
    delete entry.game_Name

    return entry
  })

  res.send(rentalsFormat)

}