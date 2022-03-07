import connection from "../db.js";
import dayjs from "dayjs";

export async function getRentals(req, res) {

  const { customerId, gameId, limit, offset, order, desc, status, startDate } = req.query
  let orderTreated = false, statusTreated = false, statusQuery = '', startDateTreated = false;

  if (order) {

    try {
      const tableName = await connection.query(`
    select *
    from INFORMATION_SCHEMA.COLUMNS
    where TABLE_NAME='rentals'`)

      orderTreated = (tableName.rows.map(el => { return el.column_name }).includes(order))
    } catch {
      res.sendStatus(500)
    }
  }

  if (status) {
    switch (status) {
      case "open":
        statusTreated = true;
        statusQuery = 'WHERE "returnDate" is null'
        break;
      case "closed":
        statusTreated = true;
        statusQuery = 'WHERE "returnDate" is not null'
        break;
      default:
        statusTreated = false;
        statusQuery = ''
        break;
    }
  }

  if (startDate) {
    let regexDate = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/
    startDateTreated = regexDate.test(startDate)
  }

  try {
    const rentals = await connection.query(`
  SELECT rentals.*, 
  customers.id as "customer_Id", 
  customers.name as "customer_Name",
  games.id as "game_Id",
  games.name as "game_Name",
  categories.name as "game_CategoryName",
  categories.id as "game_CategoryId"
  FROM rentals
  JOIN customers ON customers.id=rentals."customerId"
  JOIN games ON games.id=rentals."gameId"
  JOIN categories ON categories.id=games."categoryId"
  ${customerId ? `WHERE customers.id = ${parseInt(customerId)}` : ""}
  ${gameId ? `WHERE games.id = ${parseInt(gameId)}` : ""}
  ${statusTreated ? statusQuery : ""}
  ${startDateTreated ? `WHERE "rentDate" >= CAST('${startDate}' AS DATE )` : ""}
  ${orderTreated ? `ORDER BY "${order}" ${desc ? 'DESC' : 'ASC'}` : ""}
  ${offset ? `OFFSET ${parseInt(offset)}` : ""}
  ${limit ? `LIMIT ${parseInt(limit)}` : ""}
  `)

    const rentalsFormat = rentals.rows.map((el) => {

      const {
        customer_Id,
        customer_Name,
        game_CategoryId,
        game_CategoryName,
        game_Id, game_Name,
        ...rest } = el

      const entry = {
        ...rest,
        rentDate: dayjs(el.rentDate).format('YYYY-MM-DD'),
        returnDate: el.returnDate && dayjs(el.returnDate).format('YYYY-MM-DD'),
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

      return entry
    })

    res.send(rentalsFormat)

  } catch {
    res.sendStatus(500)

  }

}

export async function postRentals(req, res) {

  const { customerId, gameId, daysRented } = req.body

  const rentDate = dayjs().format('YYYY-MM-DD')


  try {

    const pricePerDay = await connection.query(`
  SELECT games."pricePerDay"
  FROM games
  WHERE id = $1
  `, [gameId])


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

  } catch {

    res.sendStatus(500)

  }

}

export async function returnRental(req, res) {

  const { id } = req.params

  const returnDate = dayjs().format('YYYY-MM-DD')

  const delayDays = dayjs().diff(dayjs(req.locals.rentDate).add(parseInt(req.locals.daysRented), 'day'), 'day')

  const isDelayed = delayDays > 0

  const pricePerDay = parseInt(req.locals.originalPrice) / parseInt(req.locals.daysRented)

  const delayFee = isDelayed ? parseInt(delayDays) * pricePerDay : 0


  try {

    await connection.query(`
    UPDATE rentals
    SET "returnDate" = $1,
        "delayFee" = $2
    WHERE id = $3`,
      [returnDate, delayFee, id])

    res.sendStatus(200)

  } catch {

    res.sendStatus(500)
  }

}

export async function deleteRental(req, res) {

  const { id } = req.params

  try {


    await connection.query(`
    DELETE FROM rentals
    WHERE id = $1`,
      [id])

    res.sendStatus(200)

  } catch {
    res.sendStatus(500)
  }

}

export async function getRentalsMetrics(req, res) {

  const { startDate, endDate } = req.query
  const filterDateQuery = (startDate || endDate)

  let dateQueryString = ""

  if (!startDate && !endDate) {
    dateQueryString = ""
  }
  else if (startDate && !endDate) {
    dateQueryString = `WHERE "rentDate" >= CAST('${startDate}' AS DATE )`
  }
  else if (!startDate && endDate) {
    dateQueryString = `WHERE "rentDate" <= CAST('${endDate}' AS DATE )`
  }
  else {
    dateQueryString = `WHERE "rentDate" BETWEEN CAST('${startDate}' AS DATE) AND CAST('${endDate}' AS DATE )`
  }



  try {
    const sum = await connection.query(`
  SELECT
  SUM("originalPrice" + "delayFee") revenue,
  COUNT(id) rentals
  FROM rentals 
  ${dateQueryString}
  `)

    const metrics = {
      ...sum.rows[0],
      revenue: parseInt(sum.rows[0].revenue),
      rentals: parseInt(sum.rows[0].rentals),
      average: parseInt(sum.rows[0].revenue / sum.rows[0].rentals)
    }

    res.send(metrics)
  } catch {
    res.sendStatus(500)
  }
}