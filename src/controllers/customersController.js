import connection from "../db.js";
import changeDate from "../utils/changeDate.js";


export async function getCustomers(req, res) {

  const { cpf } = req.query


  try {

    if (!cpf) {

      const customers = await connection.query(`
        SELECT * 
        FROM customers
        `)
      res.send(changeDate(customers.rows, 'birthday'));

    }

    else {

      const customers = await connection.query(`
        SELECT * 
        FROM customers 
        WHERE cpf
        LIKE $1
        `, [`${cpf}%`])

      res.send(changeDate(customers.rows, 'birthday'));
    }

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

  } catch (error) {

    console.log(error)
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