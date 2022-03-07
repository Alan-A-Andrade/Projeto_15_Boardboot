import customersSchema from "../schemas/customersSchema.js";
import connection from "../db.js";


export async function validateNewClient(req, res, next) {

  const validation = customersSchema.validate(req.body);

  if (validation.error) {
    res.sendStatus(400)
    return
  };
  const { cpf } = req.body


  try {
    const check = await connection.query(`
  SELECT * 
  FROM customers
  WHERE cpf = $1
  `, [cpf])

    if (check.rowCount !== 0) {
      return res.sendStatus(409)
    }

    next();
  } catch {
    res.sendStatus(500)
  }

}

export async function validateUpdateClient(req, res, next) {

  const validation = customersSchema.validate(req.body);

  if (validation.error) {
    res.sendStatus(400)
    return
  };

  const { cpf } = req.body
  const { id } = req.params

  try {

    const checkUniqueCPF = await connection.query(`
    SELECT * 
    FROM customers
    WHERE cpf = $1
    `, [cpf])

    if (checkUniqueCPF.rows[0] && checkUniqueCPF.rows[0].id != id) {

      return res.sendStatus(409)
    }


    next();
  } catch {
    res.sendStatus(500)
  }

}
