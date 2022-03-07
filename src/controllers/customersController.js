import connection from "../db.js";
import changeDate from "../utils/changeDate.js";


export async function getCustomers(req, res) {

  const { cpf, limit, offset, order, desc } = req.query

  let orderTreated = false

  if (order) {

    try {
      const tableName = await connection.query(`
    select *
    from INFORMATION_SCHEMA.COLUMNS
    where TABLE_NAME='customers'`)

      orderTreated = (tableName.rows.map(el => { return el.column_name }).includes(order))
    } catch { res.sendStatus(500) }
  }

  try {

    const customers = await connection.query(`
        SELECT customers.*,
        COUNT(rentals.id) "rentCount" 
        FROM customers 
        LEFT JOIN rentals ON customers.id=rentals."customerId" 
        ${cpf ? `WHERE cpf LIKE $1` : ""}
        GROUP BY customers.id
        ${orderTreated ? `ORDER BY "${order}" ${desc ? 'DESC' : 'ASC'}` : "ORDER BY id"}
        ${offset ? `OFFSET ${parseInt(offset)}` : ``}
        ${limit ? `LIMIT ${parseInt(limit)}` : ``}
        `, cpf ? [`${cpf}%`] : null)

    res.send(changeDate(customers.rows, 'birthday'));


  } catch {

    res.sendStatus(500)

  }

}

export async function getCustomerById(req, res) {

  const { id } = req.params

  try {

    const customer = await connection.query(`
        SELECT * 
        FROM customers
        WHERE id = $1
        `, [id])

    if (!customer.rows[0]) {

      return res.sendStatus(404)

    }
    res.send(changeDate(customer.rows, 'birthday')[0]);

  } catch {

    res.sendStatus(500)

  }
}

export async function postCustomer(req, res) {

  const { name, phone, cpf, birthday } = req.body

  try {

    await connection.query(`
    INSERT INTO 
    customers (name, phone, cpf, birthday) 
    VALUES ($1, $2, $3 ,$4)`, [name, phone, cpf, birthday])

    res.sendStatus(201)

  } catch {

    res.sendStatus(500)

  }

}

export async function updateCustomerById(req, res) {

  const { id } = req.params

  const { name, phone, cpf, birthday } = req.body


  try {

    const customer = await connection.query(`
        UPDATE customers 
        SET name = $2,
            phone = $3,
            cpf = $4,
            birthday = $5
        WHERE id = $1
        `, [id, name, phone, cpf, birthday])

    res.sendStatus(200);

  } catch {

    res.sendStatus(500)

  }
}